import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BellRing, X } from "lucide-react";
import type { QualityLevel, QualityVerdict } from "@/lib/analysis";
import { cn } from "@/lib/utils";

const TONE: Record<QualityLevel, string> = {
  fresh: "border-safe/30 bg-safe/10 text-safe",
  warning: "border-warn/30 bg-warn/10 text-warn",
  spoiled: "border-meat/30 bg-meat/10 text-meat",
};

/**
 * Fires a transient toast whenever the verdict *level* changes — e.g. when the
 * sample crosses from Fresh into Warning. Mirrors the "User Notification" step
 * of the pipeline.
 */
export function StatusToast({ verdict }: { verdict: QualityVerdict | null }) {
  const [active, setActive] = useState<QualityVerdict | null>(null);
  const prev = useRef<QualityLevel | null>(null);
  const timer = useRef<number>();

  useEffect(() => {
    if (!verdict) return;
    if (prev.current !== null && prev.current !== verdict.level) {
      setActive(verdict);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setActive(null), 6000);
    }
    prev.current = verdict.level;
    return () => window.clearTimeout(timer.current);
  }, [verdict]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 sm:bottom-8">
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className={cn(
              "pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl border glass-strong px-4 py-3 shadow-2xl",
              TONE[active.level]
            )}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-current/20 text-xl">
              {active.emoji}
            </span>
            <div className="flex-1">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide">
                <BellRing className="h-3.5 w-3.5" /> แจ้งเตือนสถานะ · {active.labelEn}
              </p>
              <p className="text-sm text-foreground/90">{active.message}</p>
            </div>
            <button
              onClick={() => setActive(null)}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-white/10 hover:text-foreground"
              aria-label="ปิด"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
