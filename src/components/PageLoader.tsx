import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

/**
 * Full-viewport branded loader shown during route/auth transitions.
 * Uses a radar-style scan ring around the MEAT GUARD shield.
 */
export function PageLoader({ label = "กำลังโหลด MEAT GUARD…" }: { label?: string }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6">
      <div className="relative grid h-24 w-24 place-items-center">
        {/* rotating scan ring */}
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-meat border-r-meat/40"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }}
        />
        <motion.span
          className="absolute inset-2 rounded-full border-2 border-transparent border-b-safe border-l-safe/40"
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
        />
        <motion.div
          className="grid h-14 w-14 place-items-center rounded-2xl glass-strong"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
        >
          <ShieldCheck className="h-7 w-7 text-meat" />
        </motion.div>
      </div>

      <div className="flex flex-col items-center gap-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="mt-1 h-1 w-40 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full w-1/2 rounded-full bg-gradient-to-r from-meat to-safe"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  );
}
