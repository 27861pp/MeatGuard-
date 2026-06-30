import { motion } from "framer-motion";
import { Brain, Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { QualityVerdict } from "@/lib/analysis";
import { cn } from "@/lib/utils";

const THEME = {
  fresh: {
    text: "text-safe",
    ring: "stroke-safe",
    border: "border-safe/30",
    glow: "shadow-glow-safe",
    bg: "from-safe/10",
  },
  warning: {
    text: "text-warn",
    ring: "stroke-warn",
    border: "border-warn/30",
    glow: "shadow-[0_0_50px_-10px_hsl(38_92%_50%/0.6)]",
    bg: "from-warn/10",
  },
  spoiled: {
    text: "text-meat",
    ring: "stroke-meat",
    border: "border-meat/30",
    glow: "shadow-glow-meat",
    bg: "from-meat/10",
  },
} as const;

export function AnalysisResult({ verdict }: { verdict: QualityVerdict }) {
  const t = THEME[verdict.level];
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (verdict.score / 100) * circ;

  return (
    <Card className={cn("relative overflow-hidden border glass-strong", t.border, t.glow)}>
      <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent", t.bg)} />
      <div className="relative grid gap-6 p-6 sm:grid-cols-[auto_1fr] sm:items-center">
        {/* score gauge */}
        <div className="relative mx-auto grid h-36 w-36 place-items-center">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
            <motion.circle
              cx="60"
              cy="60"
              r={r}
              fill="none"
              strokeWidth="9"
              strokeLinecap="round"
              className={t.ring}
              strokeDasharray={circ}
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: circ - dash }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-4xl">{verdict.emoji}</span>
            <span className={cn("mt-0.5 text-xl font-extrabold tabular-nums", t.text)}>
              {verdict.score}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Score</span>
          </div>
        </div>

        {/* verdict copy */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <Brain className="h-4 w-4" /> Smart Analysis Result
          </div>

          <motion.h3
            key={verdict.level}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("mt-2 text-3xl font-black", t.text)}
          >
            {verdict.labelEn}
            <span className="ml-2 text-xl font-bold text-foreground/80">· {verdict.label}</span>
          </motion.h3>

          <p className="mt-1 text-base font-medium text-foreground/90">{verdict.message}</p>

          <div className={cn("mt-4 flex items-start gap-2.5 rounded-xl border p-3 text-sm", t.border)}>
            <Lightbulb className={cn("mt-0.5 h-4 w-4 shrink-0", t.text)} />
            <p className="leading-relaxed text-muted-foreground">{verdict.advice}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
