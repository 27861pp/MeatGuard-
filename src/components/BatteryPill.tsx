import {
  BatteryCharging,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
} from "lucide-react";
import { useBattery } from "@/hooks/useBattery";
import { cn } from "@/lib/utils";

/**
 * Compact battery indicator (device battery via the Battery Status API).
 * Renders nothing where the API is unavailable (e.g. desktop Firefox / iOS).
 */
export function BatteryPill({ className }: { className?: string }) {
  const { supported, level, charging } = useBattery();
  if (!supported || level === null) return null;

  const low = level <= 20 && !charging;
  const Icon = charging
    ? BatteryCharging
    : level <= 20
      ? BatteryLow
      : level <= 55
        ? BatteryMedium
        : BatteryFull;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold tabular-nums",
        low
          ? "border-meat/30 bg-meat/10 text-meat"
          : charging
            ? "border-safe/30 bg-safe/10 text-safe"
            : "border-white/10 bg-white/[0.04] text-foreground",
        className
      )}
      title={charging ? "กำลังชาร์จ" : "แบตเตอรี่อุปกรณ์"}
    >
      <Icon className="h-4 w-4" />
      {level}%
    </span>
  );
}
