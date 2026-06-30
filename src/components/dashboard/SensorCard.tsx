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
}

const STATUS = {
  good: {
    text: "text-safe",
    bar: "from-safe to-emerald-300",
    chip: "bg-safe/10 text-safe border-safe/30",
    glow: "group-hover:shadow-glow-safe",
    label: "ปกติ",
  },
  warn: {
    text: "text-warn",
    bar: "from-warn to-amber-300",
    chip: "bg-warn/10 text-warn border-warn/30",
    glow: "group-hover:shadow-[0_0_40px_-6px_hsl(38_92%_50%/0.5)]",
    label: "เฝ้าระวัง",
  },
  bad: {
    text: "text-meat",
    bar: "from-meat to-rose-400",
    chip: "bg-meat/10 text-meat border-meat/30",
    glow: "group-hover:shadow-glow-meat",
    label: "เกินกำหนด",
  },
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
}: SensorCardProps) {
  const s = STATUS[status];
  const pct = Math.max(2, Math.min(100, fraction * 100));

  return (
    <Card className={cn("group glass overflow-hidden transition-all duration-300 hover:-translate-y-1", s.glow)}>
      <div className="p-5">
        <div className="flex items-start justify-between">
          <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.04]">
            <Icon className={cn("h-5 w-5", s.text)} />
          </span>
          <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold", s.chip)}>
            <span className={cn("h-1.5 w-1.5 rounded-full bg-current", status !== "good" && "animate-pulse")} />
            {s.label}
          </span>
        </div>

        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{sublabel}</p>
          <p className="text-sm font-semibold text-foreground/80">{label}</p>
        </div>

        <div className="mt-2 flex items-end gap-1.5">
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
            className={cn("h-full rounded-full bg-gradient-to-r", s.bar)}
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>
    </Card>
  );
}
