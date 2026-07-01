import { useEffect, useRef, useState } from "react";
import { onValue, ref } from "firebase/database";
import { DEMO_MODE, db } from "@/lib/firebase";
import type { SensorReading } from "@/lib/analysis";
import {
  initialSimState,
  nextSimState,
  seedHistory,
  stateToReading,
  type SimState,
} from "@/lib/mockSensor";

const MAX_HISTORY = 30;
const DEMO_INTERVAL_MS = 3000;

export type ConnectionStatus =
  | "live" // real data flowing from Firebase
  | "waiting" // connected, but no sensor data yet → showing simulation
  | "demo" // no Firebase configured → local simulation
  | "connecting"
  | "offline";

interface SensorState {
  latest: SensorReading | null;
  history: SensorReading[];
  status: ConnectionStatus;
}

/**
 * Coerce arbitrary Firebase payloads into a clean SensorReading.
 *
 * Field names are matched leniently so the app works with whatever the
 * ESP32 / device writes — e.g. the real database uses `temp` (not
 * `temperature`). We accept common aliases for every metric.
 */
function normalize(raw: unknown, fallbackTs: number): SensorReading | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const num = (v: unknown, d = 0) => {
    const n = typeof v === "string" ? parseFloat(v) : (v as number);
    return Number.isFinite(n) ? n : d;
  };
  // first defined alias wins
  const pick = (...keys: string[]) => {
    for (const k of keys) if (o[k] !== undefined && o[k] !== null) return o[k];
    return undefined;
  };
  const statusRaw = pick("status", "Status", "verdict");
  return {
    temperature: num(pick("temperature", "temp", "Temperature", "TEMP", "t")),
    humidity: num(pick("humidity", "hum", "Humidity", "HUM", "h")),
    nh3: num(pick("nh3", "NH3", "ammonia", "Ammonia")),
    h2s: num(pick("h2s", "H2S", "sulfide", "Sulfide")),
    timestamp: num(pick("timestamp", "time", "ts"), fallbackTs),
    status: typeof statusRaw === "string" ? statusRaw : undefined,
  };
}

/**
 * Subscribes to `meat/latest` (+ `meat/history`) in Firebase, or runs the
 * local simulator in DEMO MODE. Returns the freshest reading plus a rolling
 * window for the charts.
 */
export function useSensorData(): SensorState {
  const [latest, setLatest] = useState<SensorReading | null>(null);
  const [history, setHistory] = useState<SensorReading[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>(
    DEMO_MODE ? "demo" : "connecting"
  );
  const simRef = useRef<SimState>(initialSimState());

  useEffect(() => {
    const runSimulator = (initialStatus: ConnectionStatus) => {
      const now = Date.now();
      const seeded = seedHistory(MAX_HISTORY, now);
      setHistory(seeded);
      setLatest(seeded[seeded.length - 1]);
      setStatus(initialStatus);
      return window.setInterval(() => {
        simRef.current = nextSimState(simRef.current);
        const reading = stateToReading(simRef.current, Date.now());
        setLatest(reading);
        setHistory((h) => [...h, reading].slice(-MAX_HISTORY));
      }, DEMO_INTERVAL_MS);
    };

    // ── DEMO MODE: no Firebase configured → pure local feed ───────────
    if (DEMO_MODE || !db) {
      const id = runSimulator("demo");
      return () => window.clearInterval(id);
    }

    // ── LIVE MODE: Firebase Realtime Database ─────────────────────────
    // If the DB has no sensor data yet (e.g. ESP32 not connected), we keep
    // a simulation running so the dashboard never shows dead zeros, and
    // switch to real data automatically the moment it arrives.
    const latestRef = ref(db, "meat/latest");
    const historyRef = ref(db, "meat/history");
    let simId: number | undefined;
    let gotLive = false;

    const stopSim = () => {
      if (simId !== undefined) {
        window.clearInterval(simId);
        simId = undefined;
      }
    };
    // Start (or keep) the simulator and reflect the given status. Used whenever
    // there is no real signal yet: empty DB, all-zero data, or a read error
    // (e.g. security rules not applied) — so the dashboard never stalls.
    const ensureSim = (st: ConnectionStatus) => {
      if (gotLive) return;
      setStatus(st);
      if (simId === undefined) simId = runSimulator(st);
    };

    const offLatest = onValue(
      latestRef,
      (snap) => {
        const reading = snap.exists() ? normalize(snap.val(), Date.now()) : null;
        const hasSignal =
          reading !== null &&
          (reading.temperature !== 0 ||
            reading.humidity !== 0 ||
            reading.nh3 !== 0 ||
            reading.h2s !== 0);

        // Accept the first non-zero reading as "live"; once live, keep taking
        // every subsequent reading from the device (even a momentary 0).
        if (reading && (hasSignal || gotLive)) {
          gotLive = true;
          stopSim();
          setLatest(reading);
          setStatus("live");
          // The chart is driven by meat/history (with reconstructed wall-clock
          // times). Keep at least one point until that snapshot arrives.
          setHistory((h) => (h.length ? h : [reading]));
        } else {
          // connected but empty / all-zero → simulate while we wait
          ensureSim("waiting");
        }
      },
      () => {
        // read error (offline / rules not applied) → keep a usable feed
        ensureSim("offline");
      }
    );

    const offHistory = onValue(historyRef, (snap) => {
      if (!gotLive) return; // ignore history until we have a real live signal
      const val = snap.val();
      if (!val || typeof val !== "object") return;

      // Device history has a `minute` counter but no wall-clock timestamp, so
      // reconstruct real times: newest point = now, each earlier one 1 min back.
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
      const now = Date.now();
      const rows = parsed.map((x) => ({
        ...x.reading,
        timestamp: now - (maxMinute - x.minute) * 60_000,
      }));
      setHistory(rows);
    });

    return () => {
      stopSim();
      offLatest();
      offHistory();
    };
  }, []);

  return { latest, history, status };
}
