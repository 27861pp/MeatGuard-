import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  ChefHat,
  ChevronRight,
  Cpu,
  Droplets,
  Flame,
  LineChart,
  Refrigerator,
  ShieldCheck,
  Thermometer,
  Utensils,
  WifiOff,
  Wind,
  type LucideIcon,
} from "lucide-react";
import { useLiveData } from "@/contexts/LiveDataContext";
import { useClock } from "@/hooks/useClock";
import {
  analyzeReading,
  analyzeTrend,
  averageReadings,
} from "@/lib/analysis";
import { PageHead } from "@/components/PageHead";
import { ConnBadge } from "@/components/dashboard/ConnBadge";
import { DeviceBattery } from "@/components/dashboard/DeviceBattery";
import { AnalysisResult } from "@/components/dashboard/AnalysisResult";
import { TrendCard } from "@/components/dashboard/TrendCard";
import { StatusToast } from "@/components/dashboard/StatusToast";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { OfflineState } from "@/components/dashboard/OfflineState";
import { cn } from "@/lib/utils";

const AVG_WINDOW_MS = 5 * 60_000;

const MONITOR_LINKS = [
  { to: "/sensors", icon: Thermometer, label: "เซ็นเซอร์", sub: "สถานะการทำงาน", accent: "text-safe" },
  { to: "/realtime", icon: LineChart, label: "กราฟเรียลไทม์", sub: "วินาทีต่อวินาที", accent: "text-sky-400" },
  { to: "/analysis", icon: Activity, label: "ผลวิเคราะห์", sub: "วิเคราะห์ 10 นาที", accent: "text-violet-400" },
] as const;

const KNOWLEDGE_LINKS = [
  { to: "/safety", icon: ShieldCheck, label: "ความปลอดภัย", accent: "text-violet-400" },
  { to: "/how-it-works", icon: Cpu, label: "หลักการทำงาน", accent: "text-sky-400" },
  { to: "/storage", icon: Refrigerator, label: "การเก็บรักษา", accent: "text-cyan-400" },
  { to: "/consumption", icon: ChefHat, label: "คำแนะนำบริโภค", accent: "text-rose-400" },
  { to: "/recipes", icon: Utensils, label: "เมนู · วิดีโอ", accent: "text-amber-400" },
] as const;

export default function Overview() {
  const { latest, minuteHistory, status, lastUpdate } = useLiveData();
  const clock = useClock();
  const online = status === "live";

  // Verdict from the 5-minute average of the board's minute log.
  const avgReading = useMemo(() => {
    if (!latest) return null;
    const anchor = minuteHistory.length
      ? minuteHistory[minuteHistory.length - 1].timestamp
      : latest.timestamp;
    const win = minuteHistory.filter((r) => r.timestamp >= anchor - AVG_WINDOW_MS);
    return averageReadings(win.length ? win : [latest]) ?? latest;
  }, [latest, minuteHistory]);

  const verdict = useMemo(
    () => (avgReading ? analyzeReading(avgReading) : null),
    [avgReading]
  );
  const trend = useMemo(
    () =>
      verdict && minuteHistory.length >= 3 ? analyzeTrend(minuteHistory, verdict) : null,
    [minuteHistory, verdict]
  );

  const sensorUp = (check?: string) =>
    online && (check === undefined || check.trim().toUpperCase() === "OK");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <PageHead
        title={
          <>
            Meat Guard <span className="text-gradient">Monitor</span>
          </>
        }
        subtitle={
          <>
            ภาพรวม · ข้อมูลจริงจากกล่อง ESP32
            {lastUpdate > 0 && (
              <> · อัปเดตล่าสุด {new Date(lastUpdate).toLocaleTimeString("th-TH")}</>
            )}
          </>
        }
        right={
          <>
            <ConnBadge status={status} />
            <DeviceBattery percent={latest?.battery} online={online} />
            <span className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold tabular-nums text-muted-foreground sm:inline">
              {clock.time}
            </span>
          </>
        }
      />

      {/* board-quiet banner */}
      {!online && latest && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-meat/25 bg-meat/[0.06] p-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-meat/30 bg-meat/10 text-meat">
            <WifiOff className="h-4 w-4" />
          </span>
          <div className="text-sm">
            <p className="font-semibold text-meat">บอร์ด ESP32 ออฟไลน์</p>
            <p className="text-muted-foreground">
              ไม่พบข้อมูลใหม่ — ค่าที่แสดงเป็นข้อมูลล่าสุดก่อนขาดการเชื่อมต่อ
            </p>
          </div>
        </div>
      )}

      {!latest || !verdict ? (
        status === "connecting" ? (
          <DashboardSkeleton />
        ) : (
          <OfflineState status={status} />
        )
      ) : (
        <div className="space-y-6">
          {/* verdict + trend */}
          <section className="space-y-2">
            <p className="px-1 text-xs text-muted-foreground">
              ผลวิเคราะห์จากค่าเฉลี่ย 5 นาทีล่าสุด · กดปุ่ม “ผลวิเคราะห์” เพื่อวิเคราะห์แบบเต็ม 10 นาที
            </p>
            <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
              <AnalysisResult verdict={verdict} />
              {trend && <TrendCard trend={trend} />}
            </div>
          </section>

          {/* mini sensor strip → /sensors */}
          <section>
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold text-muted-foreground">ค่าปัจจุบัน</h2>
              <Link
                to="/sensors"
                className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                ดูหน้าเซ็นเซอร์ <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              <MiniStat icon={Thermometer} label="อุณหภูมิ" value={`${latest.temperature.toFixed(1)}°C`} up={sensorUp()} />
              <MiniStat icon={Droplets} label="ความชื้น" value={`${latest.humidity.toFixed(0)}%`} up={sensorUp()} />
              <MiniStat icon={Wind} label="NH₃" value={`${latest.nh3.toFixed(2)} ppm`} up={sensorUp(latest.checks?.nh3)} />
              <MiniStat icon={Flame} label="H₂S" value={`${latest.h2s.toFixed(2)} ppm`} up={sensorUp(latest.checks?.h2s)} />
            </div>
          </section>

          {/* monitor quick links */}
          <section>
            <h2 className="mb-3 px-1 text-sm font-semibold text-muted-foreground">เครื่องมือ</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {MONITOR_LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="group flex items-center gap-3 rounded-2xl glass p-4 transition-all hover:-translate-y-0.5 hover:bg-white/[0.07]"
                >
                  <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04]", l.accent)}>
                    <l.icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold">{l.label}</span>
                    <span className="block text-xs text-muted-foreground">{l.sub}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </section>

          {/* knowledge quick links */}
          <section>
            <h2 className="mb-3 px-1 text-sm font-semibold text-muted-foreground">ความรู้</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {KNOWLEDGE_LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="flex flex-col items-start gap-3 rounded-2xl glass p-4 transition-all hover:-translate-y-0.5 hover:bg-white/[0.07]"
                >
                  <span className={cn("grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04]", l.accent)}>
                    <l.icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-bold leading-tight">{l.label}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      )}

      <StatusToast verdict={online ? verdict : null} />
    </motion.div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  up,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  up: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="flex items-center justify-between">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className={cn("h-2 w-2 rounded-full", up ? "bg-safe" : "bg-meat")} />
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">{label}</p>
      <p className={cn("text-lg font-bold tabular-nums leading-tight", !up && "opacity-50")}>{value}</p>
    </div>
  );
}
