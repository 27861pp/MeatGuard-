import { motion } from "framer-motion";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { QualityLevel, TrendResult } from "@/lib/analysis";
import { cn } from "@/lib/utils";

const OUTLOOK: Record<QualityLevel, { text: string; ring: string; chip: string; bg: string }> = {
  fresh: {
    text: "text-safe",
    ring: "border-safe/30",
    chip: "bg-safe/10 text-safe border-safe/30",
    bg: "from-safe/10",
  },
  warning: {
    text: "text-warn",
    ring: "border-warn/30",
    chip: "bg-warn/10 text-warn border-warn/30",
    bg: "from-warn/10",
  },
  spoiled: {
    text: "text-meat",
    ring: "border-meat/30",
    chip: "bg-meat/10 text-meat border-meat/30",
    bg: "from-meat/10",
  },
};

export function TrendCard({ trend }: { trend: TrendResult }) {
  const t = OUTLOOK[trend.outlook];
  const Icon =
    trend.direction === "worsening"
      ? TrendingUp
      : trend.direction === "improving"
        ? TrendingDown
        : Minus;

  return (
    <Card className={cn("relative overflow-hidden border glass", t.ring)}>
      <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent", t.bg)} />
      <div className="relative flex h-full flex-col p-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <TrendingUp className="h-4 w-4" /> แนวโน้มความสด
        </div>

        <div className="mt-4 flex items-center gap-4">
          <motion.span
            key={trend.direction}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "grid h-14 w-14 shrink-0 place-items-center rounded-2xl border",
              t.chip
            )}
          >
            <Icon className="h-7 w-7" />
          </motion.span>

          <div className="min-w-0">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-bold",
                t.chip
              )}
            >
              แนวโน้ม: {trend.label}
            </span>
            <p className="mt-1.5 text-sm font-medium text-foreground/90">
              {trend.headline}
            </p>
          </div>
        </div>

        <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm leading-relaxed text-muted-foreground">
          {trend.advice}
        </p>
      </div>
    </Card>
  );
}
