import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { MetricStatus } from "@/lib/analysis";

interface SensorCardProps {
  icon: LucideIcon;
  label: string;
  sublabel: string;
  value: number;
  unit: string;
  /** for the progress bar: current fraction 0..1 */
  fraction: number;
  status: MetricStatus;
  decimals?: number;
  /** is this sensor connected & working right now? (green vs red light) */
  online: boolean;
  /** shown under the value when offline, e.g. "ยังไม่ได้เชื่อมต่อ" */
  offlineNote?: string;
  /** self-check warning while still online, e.g. "Rs LOW!" */
  warnNote?: string;
}

const STATUS = {
  good: { text: "text-safe", bar: "from-safe to-emerald-300", glow: "group-hover:shadow-glow-safe" },
  warn: { text: "text-warn", bar: "from-warn to-amber-300", glow: "group-hover:shadow-[0_0_40px_-6px_hsl(38_92%_50%/0.5)]" },
  bad: { text: "text-meat", bar: "from-meat to-rose-400", glow: "group-hover:shadow-glow-meat" },
} as const;

export function SensorCard({
  icon: Icon,
  label,
  sublabel,
  value,
  unit,
  fraction,
  status,
  decimals = 1,
  online,
  offlineNote,
  warnNote,
}: SensorCardProps) {
  const s = STATUS[status];
  const pct = Math.max(2, Math.min(100, fraction * 100));

  return (
    <Card className={cn("group glass overflow-hidden transition-all duration-300 hover:-translate-y-1", online && s.glow)}>
      <div className="p-5">
        <div className="flex items-start justify-between">
          <span
            className={cn(
              "relative grid h-11 w-11 place-items-center rounded-xl border bg-white/[0.04]",
              online ? "border-white/10" : "border-meat/25"
            )}
          >
            <Icon className={cn("h-5 w-5", online ? s.text : "text-muted-foreground")} />
            {/* working light */}
            <span
              className={cn(
                "absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-card",
                online ? "bg-safe" : "bg-meat"
              )}
            >
              {online && (
                <span className="absolute inset-0 animate-ping rounded-full bg-safe" />
              )}
            </span>
          </span>

          {/* working status chip */}
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
              online
                ? "border-safe/30 bg-safe/10 text-safe"
                : "border-meat/30 bg-meat/10 text-meat"
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {online ? "ทำงาน" : "ขาดการเชื่อมต่อ"}
          </span>
        </div>

        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{sublabel}</p>
          <p className="text-sm font-semibold text-foreground/80">{label}</p>
        </div>

        <div className={cn("mt-2 flex items-end gap-1.5", !online && "opacity-45")}>
          <motion.span
            key={value}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="text-3xl font-extrabold tabular-nums"
          >
            {value.toFixed(decimals)}
          </motion.span>
          <span className="mb-1 text-sm font-medium text-muted-foreground">{unit}</span>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className={cn("h-full rounded-full bg-gradient-to-r", online ? s.bar : "from-meat/40 to-meat/20")}
            initial={false}
            animate={{ width: `${online ? pct : 100}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>

        {!online && offlineNote && (
          <p className="mt-2 text-[11px] font-medium text-meat/80">{offlineNote}</p>
        )}
        {online && warnNote && (
          <p className="mt-2 text-[11px] font-medium text-warn/90">
            ⚠ self-check: {warnNote} (ค่ายังเข้ามา — ควรตรวจการคาลิเบรต)
          </p>
        )}
      </div>
    </Card>
  );
}
