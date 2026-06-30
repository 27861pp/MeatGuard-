import { motion } from "framer-motion";
import { Droplets, Flame, Thermometer, Wind } from "lucide-react";

/**
 * Premium "scanner chamber" hero visual — a glass dome over a meat sample
 * with an animated radar sweep and floating live sensor chips. Pure
 * CSS/SVG/Framer Motion (no heavy 3D dependency) so it stays fast on mobile.
 */
const chips = [
  { icon: Thermometer, label: "2.4°C", cls: "text-safe", pos: "-left-4 top-10" },
  { icon: Droplets, label: "68%", cls: "text-sky-400", pos: "-right-5 top-24" },
  { icon: Wind, label: "NH₃ 2.4", cls: "text-safe", pos: "-left-6 bottom-24" },
  { icon: Flame, label: "H₂S 0.1", cls: "text-amber-400", pos: "-right-3 bottom-10" },
];

export function SensorOrb() {
  return (
    <div className="relative aspect-square">
      {/* outer glow */}
      <div className="absolute inset-6 rounded-full bg-meat/20 blur-3xl" />
      <div className="absolute inset-12 rounded-full bg-safe/10 blur-3xl" />

      {/* rotating radar rings */}
      <motion.div
        className="absolute inset-0 rounded-full border border-white/10"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 28, ease: "linear" }}
      >
        <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-meat shadow-glow-meat" />
      </motion.div>
      <motion.div
        className="absolute inset-8 rounded-full border border-dashed border-white/10"
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 22, ease: "linear" }}
      >
        <span className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-safe shadow-glow-safe" />
      </motion.div>

      {/* glass dome */}
      <div className="absolute inset-[14%] grid place-items-center overflow-hidden rounded-full glass-strong">
        {/* radar sweep */}
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, hsl(var(--safe)/0.28) 40deg, transparent 80deg)",
          }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
        />
        {/* meat sample */}
        <motion.div
          className="relative grid h-1/2 w-1/2 place-items-center"
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        >
          <svg viewBox="0 0 120 120" className="h-full w-full drop-shadow-[0_10px_30px_hsl(var(--meat)/0.45)]">
            <defs>
              <radialGradient id="meat-fill" cx="40%" cy="35%" r="75%">
                <stop offset="0%" stopColor="#ff7a85" />
                <stop offset="55%" stopColor="#e23b4e" />
                <stop offset="100%" stopColor="#9c1f31" />
              </radialGradient>
            </defs>
            {/* steak-ish blob */}
            <path
              d="M30 40 C30 18 70 10 92 26 C112 40 110 78 88 92 C66 106 30 96 24 72 C20 56 30 56 30 40 Z"
              fill="url(#meat-fill)"
            />
            {/* fat marbling */}
            <path d="M52 36 C62 44 58 60 70 70" stroke="#ffd9d0" strokeOpacity="0.7" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M40 58 C50 62 56 70 54 82" stroke="#ffd9d0" strokeOpacity="0.55" strokeWidth="3" fill="none" strokeLinecap="round" />
            <circle cx="60" cy="58" r="30" fill="white" fillOpacity="0.05" />
          </svg>
        </motion.div>

        {/* grid floor reflection */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 grid-bg opacity-40 [mask-image:linear-gradient(to_top,black,transparent)]" />
      </div>

      {/* floating sensor chips */}
      {chips.map((c, i) => (
        <motion.div
          key={c.label}
          className={`absolute ${c.pos} flex items-center gap-2 rounded-xl glass px-3 py-2 text-sm font-semibold`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1, y: [0, i % 2 ? 6 : -6, 0] }}
          transition={{
            opacity: { delay: 0.5 + i * 0.12, duration: 0.4 },
            scale: { delay: 0.5 + i * 0.12, duration: 0.4 },
            y: { repeat: Infinity, duration: 4 + i, ease: "easeInOut" },
          }}
        >
          <c.icon className={`h-4 w-4 ${c.cls}`} />
          <span>{c.label}</span>
        </motion.div>
      ))}
    </div>
  );
}
