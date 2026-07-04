import { useEffect, useRef, useState } from "react";
import { onValue, ref } from "firebase/database";
import { db } from "@/lib/firebase";
import type { SensorReading } from "@/lib/analysis";

const MAX_HISTORY = 30;
const STALE_SLOW_MS = 90_000; // firmware sending 1/min → offline after 90s
const STALE_FAST_MS = 25_000; // firmware sending meat/live (~2s) → offline after 25s
const CONNECT_TIMEOUT_MS = 8_000;
const MINUTE_MS = 60_000;

/**
 * Board connectivity — real data only, no demo/simulation:
 *   connecting → waiting for the first snapshot
 *   live       → ESP32 is sending fresh data
 *   offline    → no data, read error, or data has gone stale
 */
export type ConnectionStatus = "live" | "offline" | "connecting";

interface SensorState {
  latest: SensorReading | null;
  history: SensorReading[];
  status: ConnectionStatus;
  /** epoch ms of the last real reading (0 if none yet) */
  lastUpdate: number;
}

/**
 * Coerce the ESP32 payload into a clean SensorReading. Field names are matched
 * leniently (the device uses `temp`, `chk135`, `chk136`, …).
 */
function normalize(raw: unknown, fallbackTs: number): SensorReading | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const num = (v: unknown, d = 0) => {
    const n = typeof v === "string" ? parseFloat(v) : (v as number);
    return Number.isFinite(n) ? n : d;
  };
  const pick = (...keys: string[]) => {
    for (const k of keys) if (o[k] !== undefined && o[k] !== null) return o[k];
    return undefined;
  };
  const asStr = (v: unknown) => (typeof v === "string" ? v : undefined);

  const statusRaw = pick("status", "Status", "verdict");
  const batt = pick("battery", "batt", "bat", "batteryPct", "battPct");

  return {
    temperature: num(pick("temperature", "temp", "Temperature", "TEMP", "t")),
    humidity: num(pick("humidity", "hum", "Humidity", "HUM", "h")),
    nh3: num(pick("nh3", "NH3", "ammonia", "Ammonia")),
    h2s: num(pick("h2s", "H2S", "sulfide", "Sulfide")),
    timestamp: num(pick("timestamp", "ts", "time"), fallbackTs),
    status: asStr(statusRaw),
    checks: {
      nh3: asStr(pick("chk135", "chkNh3", "nh3Check")),
      h2s: asStr(pick("chk136", "chkH2s", "h2sCheck")),
    },
    battery: batt !== undefined ? num(batt) : undefined,
  };
}

/**
 * Subscribes to the board's Firebase nodes:
 *   meat/live    — fast feed (~2s) for the second-by-second chart (new firmware)
 *   meat/latest  — 1-minute snapshot (also the fallback when meat/live absent)
 *   meat/history — 1-minute log for the minute charts / 5-min verdict
 *
 * No demo fallback — when the ESP32 isn't sending, status becomes "offline".
 */
export function useSensorData(enabled = true): SensorState {
  const [latest, setLatest] = useState<SensorReading | null>(null);
  const [history, setHistory] = useState<SensorReading[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [lastUpdate, setLastUpdate] = useState(0);
  const lastRef = useRef(0);
  const liveNodeRef = useRef(0); // last time meat/live delivered (0 = never)

  useEffect(() => {
    if (!enabled) {
      setLatest(null);
      setHistory([]);
      setStatus("connecting");
      setLastUpdate(0);
      lastRef.current = 0;
      liveNodeRef.current = 0;
      return;
    }
    if (!db) {
      setStatus("offline");
      return;
    }

    const markFresh = (reading: SensorReading) => {
      const now = Date.now();
      lastRef.current = now;
      setLastUpdate(now);
      setLatest(reading);
      setStatus("live");
    };

    // Firebase delivers the CURRENT snapshot immediately on subscribe — even
    // if the board stopped sending long ago. Old data must not read as
    // "online", so a snapshot only counts as fresh when:
    //   - it carries a device server-timestamp (`ts`) that is recent, or
    //   - it is a CHANGE observed after subscribing (the board just wrote it).
    const isInitial = { live: true, latest: true };

    const deviceTs = (raw: unknown): number | null => {
      if (raw && typeof raw === "object") {
        const t = (raw as Record<string, unknown>).ts;
        // sanity: epoch ms after 2020
        if (typeof t === "number" && t > 1_577_836_800_000) return t;
      }
      return null;
    };

    // ── fast feed (new firmware) ─────────────────────────────────────
    const offLive = onValue(
      ref(db, "meat/live"),
      (snap) => {
        const wasInitial = isInitial.live;
        isInitial.live = false;
        const raw = snap.exists() ? snap.val() : null;
        const reading = raw ? normalize(raw, Date.now()) : null;
        if (!reading) return;

        const ts = deviceTs(raw);
        const fresh =
          ts !== null ? Date.now() - ts < STALE_FAST_MS : !wasInitial;

        setLatest(reading); // always show the newest data we have
        if (fresh) {
          liveNodeRef.current = Date.now();
          markFresh(reading);
        }
      },
      () => {
        /* node may not exist yet on old firmware — ignore */
      }
    );

    // ── 1-minute snapshot (fallback + heartbeat on old firmware) ─────
    const offLatest = onValue(
      ref(db, "meat/latest"),
      (snap) => {
        const wasInitial = isInitial.latest;
        isInitial.latest = false;
        const raw = snap.exists() ? snap.val() : null;
        const reading = raw ? normalize(raw, Date.now()) : null;
        if (!reading) return;

        // If the fast feed is flowing, it owns `latest`.
        if (Date.now() - liveNodeRef.current < 15_000) {
          lastRef.current = Date.now();
          setLastUpdate(lastRef.current);
          return;
        }

        const ts = deviceTs(raw);
        const fresh =
          ts !== null ? Date.now() - ts < STALE_SLOW_MS : !wasInitial;

        setLatest(reading); // show last-known values even when stale
        if (fresh) markFresh(reading);
      },
      () => setStatus("offline")
    );

    // ── minute history for charts / verdict ──────────────────────────
    const offHistory = onValue(ref(db, "meat/history"), (snap) => {
      const val = snap.val();
      if (!val || typeof val !== "object") return;

      // Device history has a `minute` counter but no wall-clock time, so
      // reconstruct real times anchored to the last reading (1 min apart).
      const parsed = Object.entries(val as Record<string, unknown>)
        .map(([key, raw]) => {
          const reading = normalize(raw, Date.now());
          if (!reading) return null;
          const o = raw as Record<string, unknown>;
          const minute =
            typeof o.minute === "number" ? o.minute : parseInt(key, 10);
          return { reading, minute: Number.isFinite(minute) ? minute : 0 };
        })
        .filter((x): x is { reading: SensorReading; minute: number } => x !== null)
        .sort((a, b) => a.minute - b.minute)
        .slice(-MAX_HISTORY);

      if (!parsed.length) return;
      const maxMinute = parsed[parsed.length - 1].minute;
      const anchor = lastRef.current || Date.now();
      setHistory(
        parsed.map((x) => ({
          ...x.reading,
          timestamp: anchor - (maxMinute - x.minute) * MINUTE_MS,
        }))
      );
    });

    // Watchdog: staleness threshold adapts to which feed we've seen.
    const watchdog = window.setInterval(() => {
      if (!lastRef.current) return;
      const staleMs = liveNodeRef.current ? STALE_FAST_MS : STALE_SLOW_MS;
      if (Date.now() - lastRef.current > staleMs) setStatus("offline");
    }, 5000);

    // If nothing ever arrives, don't hang on "connecting".
    const connectTimeout = window.setTimeout(() => {
      setStatus((s) => (s === "connecting" ? "offline" : s));
    }, CONNECT_TIMEOUT_MS);

    return () => {
      offLive();
      offLatest();
      offHistory();
      window.clearInterval(watchdog);
      window.clearTimeout(connectTimeout);
    };
  }, [enabled]);

  return { latest, history, status, lastUpdate };
}
