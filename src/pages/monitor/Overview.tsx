import { useEffect, useMemo } from "react";
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
  RotateCcw,
  ShieldCheck,
  Thermometer,
  Utensils,
  Wind,
  type LucideIcon,
} from "lucide-react";
import { useLiveData } from "@/contexts/LiveDataContext";
import { useClock } from "@/hooks/useClock";
import { analyzeLatestTrend, analyzeReading, sensorWorking } from "@/lib/analysis";
import { mgDebug } from "@/lib/debug";
import { PageHead } from "@/components/PageHead";
import { ConnBadge } from "@/components/dashboard/ConnBadge";
import { DeviceBattery } from "@/components/dashboard/DeviceBattery";
import { AnalysisResult } from "@/components/dashboard/AnalysisResult";
import { TrendCard } from "@/components/dashboard/TrendCard";
import { StatusToast } from "@/components/dashboard/StatusToast";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { OfflineState } from "@/components/dashboard/OfflineState";
import { cn } from "@/lib/utils";

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
  const { latest, status, lastUpdate, resetData } = useLiveData();
  const clock = useClock();
  const online = status === "live";

  // ── REAL-TIME ONLY ──────────────────────────────────────────────
  // ผลวิเคราะห์ + แนวโน้ม คำนวณจาก "packet ล่าสุดจาก ESP32 เพียงชุดเดียว"
  // ไม่เฉลี่ยกับข้อมูลเก่า / ไม่ใช้ cache / ไม่ใช้ history
  // (latest เป็น null เมื่อบอร์ดออฟไลน์ → แสดงหน้า "รอ ESP32" แทน)
  const verdict = useMemo(
    () => (latest ? analyzeReading(latest) : null),
    [latest]
  );
  const trend = useMemo(
    () => (latest && verdict ? analyzeLatestTrend(latest, verdict) : null),
    [latest, verdict]
  );

  // Debug (ข้อ 9): พิมพ์ packet + timestamp + ค่าเซ็นเซอร์ + ผลวิเคราะห์ + สถานะ
  // ที่มาจากชุดข้อมูลเดียวกัน → ตรวจสอบความสอดคล้องได้
  useEffect(() => {
    if (!latest || !verdict) return;
    mgDebug("packet → analysis", {
      ts: new Date(latest.timestamp).toISOString(),
      temp: latest.temperature,
      humidity: latest.humidity,
      nh3: latest.nh3,
      h2s: latest.h2s,
      deviceStatus: latest.status ?? "(none)",
      verdict: verdict.labelEn,
      score: verdict.score,
      trend: trend?.label,
      direction: trend?.direction,
      conn: status,
    });
  }, [latest, verdict, trend, status]);

  // มีค่าเข้ามา = ออนไลน์ · "OFF"/"RAW=0!"/บอร์ดเงียบ = ออฟไลน์
  const sensorUp = (check?: string) => sensorWorking(online, check);

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
            <button
              onClick={resetData}
              title="ล้างค่าที่แสดง (ค่าจะกลับมาเมื่อบอร์ดส่งข้อมูลใหม่)"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-meat/30 hover:bg-meat/10 hover:text-meat"
            >
              <RotateCcw className="h-3.5 w-3.5" /> ล้างค่า
            </button>
          </>
        }
      />

      {!latest || !verdict ? (
        status === "connecting" ? (
          <DashboardSkeleton />
        ) : (
          <OfflineState status={status} />
        )
      ) : (
        <div className="space-y-6">
          {/* verdict + trend — real-time จาก packet ล่าสุด */}
          <section className="space-y-2">
            <p className="flex items-center gap-1.5 px-1 text-xs text-muted-foreground">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-safe opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-safe" />
              </span>
              วิเคราะห์แบบเรียลไทม์จากค่าล่าสุดของ ESP32 · อัปเดตทันทีทุกครั้งที่บอร์ดส่งข้อมูล
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
