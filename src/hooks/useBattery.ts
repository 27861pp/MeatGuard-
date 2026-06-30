import { useEffect, useState } from "react";

interface BatteryState {
  supported: boolean;
  /** 0–100 */
  level: number | null;
  charging: boolean;
}

interface BatteryManager extends EventTarget {
  level: number;
  charging: boolean;
}

type NavigatorWithBattery = Navigator & {
  getBattery?: () => Promise<BatteryManager>;
};

/**
 * Reads the device battery via the Battery Status API (Chromium/Android).
 * Gracefully reports `supported: false` where the API is unavailable
 * (e.g. Firefox, iOS Safari) so the UI can hide the indicator.
 */
export function useBattery(): BatteryState {
  const [state, setState] = useState<BatteryState>({
    supported: typeof (navigator as NavigatorWithBattery).getBattery === "function",
    level: null,
    charging: false,
  });

  useEffect(() => {
    const nav = navigator as NavigatorWithBattery;
    if (typeof nav.getBattery !== "function") return;

    let battery: BatteryManager | null = null;
    const update = () => {
      if (!battery) return;
      setState({
        supported: true,
        level: Math.round(battery.level * 100),
        charging: battery.charging,
      });
    };

    nav.getBattery().then((b) => {
      battery = b;
      update();
      b.addEventListener("levelchange", update);
      b.addEventListener("chargingchange", update);
    });

    return () => {
      if (!battery) return;
      battery.removeEventListener("levelchange", update);
      battery.removeEventListener("chargingchange", update);
    };
  }, []);

  return state;
}
