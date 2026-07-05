import { useCallback, useEffect, useState } from "react";
import { onValue, ref, update } from "firebase/database";
import { db } from "@/lib/firebase";
import type { SensorReading } from "@/lib/analysis";
import type { ConnectionStatus } from "@/hooks/useSensorData";

/**
 * Admin manual-override config, stored in Firebase at `meat/admin` so it
 * syncs to every open client instantly. Used when sensor values drift or
 * for controlled demos: force online/offline, force the freshness verdict,
 * or pin the sensor values themselves.
 */

export type AdminConnection = "auto" | "online" | "offline";
export type AdminStatus = "auto" | "FRESH" | "WARNING" | "SPOILED";

export interface AdminConfig {
  /** master switch — when false everything runs on real data */
  manual: boolean;
  connection: AdminConnection;
  status: AdminStatus;
  /** replace the live sensor values with the pinned ones below */
  useValues: boolean;
  temp: number;
  humidity: number;
  nh3: number;
  h2s: number;
  battery: number;
  updatedAt?: number;
}

export const ADMIN_DEFAULTS: AdminConfig = {
  manual: false,
  connection: "auto",
  status: "auto",
  useValues: false,
  temp: 4.0,
  humidity: 70,
  nh3: 5,
  h2s: 0.2,
  battery: 80,
};

export function useAdminConfig(enabled: boolean) {
  const [config, setConfig] = useState<AdminConfig>(ADMIN_DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!enabled || !db) return;
    const off = onValue(
      ref(db, "meat/admin"),
      (snap) => {
        const v = (snap.val() ?? {}) as Partial<AdminConfig>;
        setConfig({ ...ADMIN_DEFAULTS, ...v });
        setLoaded(true);
      },
      () => setLoaded(true) // read error → stay on defaults (auto)
    );
    return off;
  }, [enabled]);

  const save = useCallback(async (patch: Partial<AdminConfig>) => {
    if (!db) return;
    try {
      await update(ref(db, "meat/admin"), { ...patch, updatedAt: Date.now() });
    } catch (e) {
      // เขียนไม่ผ่าน (มักเป็นเพราะ rules ยังไม่เปิด meat/admin ให้เขียนแบบ public)
      // eslint-disable-next-line no-console
      console.error("[MEAT GUARD] admin save failed — ตรวจสอบ Database Rules:", e);
      window.alert(
        "บันทึกไม่สำเร็จ — ต้องตั้ง Firebase Rules ให้ meat/admin เขียนได้ (ดูไฟล์ FIREBASE_RULES.json)"
      );
    }
  }, []);

  return { config, save, loaded };
}

/**
 * Apply the admin overrides to the real feed → the "effective" state the
 * whole UI renders.
 */
export function applyAdmin(
  cfg: AdminConfig,
  latest: SensorReading | null,
  status: ConnectionStatus
): { latest: SensorReading | null; status: ConnectionStatus } {
  if (!cfg.manual) return { latest, status };

  let s: ConnectionStatus = status;
  if (cfg.connection === "online") s = "live";
  else if (cfg.connection === "offline") s = "offline";

  let l = latest;
  if (cfg.useValues || (cfg.connection === "online" && !l)) {
    // pinned values (also used when forcing online with no real data yet)
    l = {
      temperature: cfg.temp,
      humidity: cfg.humidity,
      nh3: cfg.nh3,
      h2s: cfg.h2s,
      battery: cfg.battery,
      timestamp: Date.now(),
      checks: { nh3: "OK", h2s: "OK" },
    };
  } else if (l && cfg.connection === "online") {
    // forced online → sensor self-checks read as working
    l = { ...l, checks: { nh3: "OK", h2s: "OK" } };
  }

  if (l) {
    if (cfg.status !== "auto") l = { ...l, status: cfg.status };
    else if (cfg.useValues) l = { ...l, status: undefined }; // grade from pinned values
  }

  return { latest: l, status: s };
}
