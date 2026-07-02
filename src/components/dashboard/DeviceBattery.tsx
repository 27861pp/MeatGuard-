import {
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  BatteryWarning,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Lithium battery of the sensor box (value sent by the ESP32 as
 * meat/latest.battery). Renders nothing until the firmware reports it.
 */
export function DeviceBattery({
  percent,
  online,
}: {
  percent?: number;
  online: boolean;
}) {
  if (percent === undefined || Number.isNaN(percent)) return null;

  const p = Math.max(0, Math.min(100, Math.round(percent)));
  const low = p <= 20;
  const Icon = p <= 10 ? BatteryWarning : p <= 30 ? BatteryLow : p <= 60 ? BatteryMedium : BatteryFull;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold tabular-nums",
        !online
          ? "border-white/10 bg-white/[0.03] text-muted-foreground"
          : low
            ? "border-meat/30 bg-meat/10 text-meat"
            : "border-white/10 bg-white/[0.04] text-foreground"
      )}
      title="แบตเตอรี่กล่องเซ็นเซอร์ (ESP32)"
    >
      <Icon className="h-4 w-4" />
      {p}%
    </span>
  );
}
