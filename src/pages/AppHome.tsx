import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BatteryCharging,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  BookOpen,
  ChevronRight,
  Droplets,
  Flame,
  Gauge,
  LayoutDashboard,
  LogOut,
  Refrigerator,
  Thermometer,
  Utensils,
  Wind,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { useClock } from "@/hooks/useClock";
import { useBattery } from "@/hooks/useBattery";
import { useSensorData } from "@/hooks/useSensorData";
import { analyzeReading, type QualityLevel } from "@/lib/analysis";
import { cn } from "@/lib/utils";

const VERDICT_THEME: Record<QualityLevel, { text: string; ring: string; chip: string }> = {
  fresh: { text: "text-safe", ring: "border-safe/40", chip: "bg-safe/10 text-safe border-safe/30" },
  warning: { text: "text-warn", ring: "border-warn/40", chip: "bg-warn/10 text-warn border-warn/30" },
  spoiled: { text: "text-meat", ring: "border-meat/40", chip: "bg-meat/10 text-meat border-meat/30" },
};

const SHORTCUTS = [
  { label: "เมนูแนะนำ", sub: "ไก่ · หมู · วัว", icon: Utensils, to: "/recipes", accent: "text-amber-400" },
  { label: "ความปลอดภัย", sub: "Food Safety", icon: BookOpen, to: "/#safety", accent: "text-violet-400" },
  { label: "คำแนะนำบริโภค", sub: "Consumption", icon: Flame, to: "/#consumption", accent: "text-rose-400" },
  { label: "การเก็บรักษา", sub: "Storage", icon: Refrigerator, to: "/#storage", accent: "text-sky-400" },
] as const;

export default function AppHome() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { hm, seconds, date } = useClock();
  const battery = useBattery();
  const { latest, status } = useSensorData();

  const verdict = useMemo(() => (latest ? analyzeReading(latest) : null), [latest]);
  const firstName = (user?.displayName || user?.email || "ผู้ใช้งาน").split(" ")[0];
  const initial = firstName.charAt(0).toUpperCase();

  const BatteryIcon = battery.charging
    ? BatteryCharging
    : (battery.level ?? 100) <= 20
      ? BatteryLow
      : (battery.level ?? 100) <= 55
        ? BatteryMedium
        : BatteryFull;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="min-h-screen pb-24"
    >
      {/* ── phone-style status bar ── */}
      <div className="sticky top-0 z-40 border-b border-white/10 bg-background/70 backdrop-blur-xl">
        <div className="container flex items-center justify-between py-2.5 text-sm">
          <span className="font-semibold tabular-nums">
            {hm}
            <span className="ml-0.5 text-xs text-muted-foreground">:{seconds}</span>
          </span>
          <Logo size={26} withWordmark={false} />
          <span className="flex items-center gap-1.5 font-medium tabular-nums">
            {battery.supported && battery.level !== null ? (
              <>
                <span className={cn(battery.level <= 20 && !battery.charging && "text-meat")}>
                  {battery.level}%
                </span>
                <BatteryIcon
                  className={cn(
                    "h-5 w-5",
                    battery.charging ? "text-safe" : battery.level <= 20 ? "text-meat" : "text-foreground"
                  )}
                />
              </>
            ) : (
              <BatteryFull className="h-5 w-5 text-muted-foreground" />
            )}
          </span>
        </div>
      </div>

      <div className="container space-y-6 pt-6">
        {/* ── greeting ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={firstName}
              referrerPolicy="no-referrer"
              className="h-14 w-14 rounded-2xl object-cover ring-2 ring-white/10"
            />
          ) : (
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-meat to-safe text-xl font-bold text-white">
              {initial}
            </span>
          )}
          <div>
            <p className="text-sm text-muted-foreground">{date}</p>
            <h1 className="text-2xl font-extrabold leading-tight">
              สวัสดี, {firstName} 👋
            </h1>
          </div>
        </motion.div>

        {/* ── big clock + verdict hero ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative overflow-hidden rounded-3xl glass-strong p-6"
        >
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-25 [mask-image:radial-gradient(70%_70%_at_50%_0%,black,transparent)]" />
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-meat/15 blur-3xl" />
          <div className="relative flex flex-col items-center text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              MEAT GUARD
            </span>
            <div className="mt-1 text-6xl font-black tabular-nums tracking-tight sm:text-7xl">
              {hm}
              <span className="ml-1 align-top text-xl text-muted-foreground">:{seconds}</span>
            </div>
            {verdict && (
              <span
                className={cn(
                  "mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-bold",
                  VERDICT_THEME[verdict.level].chip
                )}
              >
                {verdict.emoji} สถานะล่าสุด · {verdict.labelEn}
              </span>
            )}
          </div>
        </motion.div>

        {/* ── dashboard summary card (tap → dashboard) ── */}
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => navigate("/dashboard")}
          className={cn(
            "group block w-full overflow-hidden rounded-3xl border bg-card/40 p-5 text-left backdrop-blur-xl transition-all hover:-translate-y-0.5",
            verdict ? VERDICT_THEME[verdict.level].ring : "border-white/10"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Gauge className="h-4 w-4" /> Monitor Dashboard
            </div>
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  status === "live" ? "bg-safe" : status === "offline" ? "bg-meat" : "bg-warn"
                )}
              />
              {status === "live"
                ? "Live"
                : status === "waiting"
                  ? "รอเซ็นเซอร์"
                  : status === "demo"
                    ? "Demo"
                    : status === "offline"
                      ? "ออฟไลน์"
                      : "เชื่อมต่อ…"}
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniStat icon={Thermometer} label="อุณหภูมิ" value={latest ? `${latest.temperature.toFixed(1)}°C` : "—"} />
            <MiniStat icon={Droplets} label="ความชื้น" value={latest ? `${latest.humidity.toFixed(0)}%` : "—"} />
            <MiniStat icon={Wind} label="NH₃" value={latest ? `${latest.nh3.toFixed(1)}` : "—"} unit="ppm" />
            <MiniStat icon={Flame} label="H₂S" value={latest ? `${latest.h2s.toFixed(2)}` : "—"} unit="ppm" />
          </div>
        </motion.button>

        {/* ── shortcut grid ── */}
        <div>
          <h2 className="mb-3 px-1 text-sm font-semibold text-muted-foreground">ทางลัด</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {/* dashboard primary tile */}
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.12 }}
              onClick={() => navigate("/dashboard")}
              className="col-span-2 flex items-center gap-3 rounded-2xl bg-gradient-to-br from-meat/20 to-transparent p-4 text-left ring-1 ring-meat/30 transition-all hover:-translate-y-1 sm:col-span-1 sm:flex-col sm:items-start"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/[0.06] text-meat">
                <LayoutDashboard className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold">แดชบอร์ด</p>
                <p className="text-xs text-muted-foreground">Real-Time Monitor</p>
              </div>
            </motion.button>

            {SHORTCUTS.map((s, i) => (
              <motion.button
                key={s.to}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.14 + i * 0.04 }}
                onClick={() => navigate(s.to)}
                className="flex flex-col items-start gap-3 rounded-2xl glass p-4 text-left transition-all hover:-translate-y-1 hover:bg-white/[0.07]"
              >
                <span className={cn("grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.04]", s.accent)}>
                  <s.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.sub}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── logout ── */}
        <button
          onClick={() => logout()}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 py-3.5 text-sm font-medium text-muted-foreground transition-colors hover:border-meat/30 hover:bg-meat/10 hover:text-meat"
        >
          <LogOut className="h-4 w-4" /> ออกจากระบบ
        </button>
      </div>
    </motion.div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  unit,
}: {
  icon: typeof Thermometer;
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <p className="mt-2 text-[11px] text-muted-foreground">{label}</p>
      <p className="text-lg font-bold tabular-nums leading-tight">
        {value}
        {unit && value !== "—" && <span className="ml-0.5 text-xs font-normal text-muted-foreground">{unit}</span>}
      </p>
    </div>
  );
}
