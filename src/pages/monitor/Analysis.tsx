import { useEffect, useMemo, useReducer, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Droplets,
  Flame,
  Play,
  RotateCcw,
  Square,
  Thermometer,
  Timer,
  Wind,
  type LucideIcon,
} from "lucide-react";
import { useLiveData } from "@/contexts/LiveDataContext";
import {
  analyzeReading,
  analyzeTrend,
  averageReadings,
  type SensorReading,
} from "@/lib/analysis";
import { PageHead } from "@/components/PageHead";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConnBadge } from "@/components/dashboard/ConnBadge";
import { AnalysisResult } from "@/components/dashboard/AnalysisResult";
import { TrendCard } from "@/components/dashboard/TrendCard";
import { LiveChart } from "@/components/dashboard/LiveChart";
import { cn } from "@/lib/utils";

const DURATION_MS = 10 * 60_000; // เก็บข้อมูล 10 นาที
const MIN_POINTS = 60; // ต้องมีอย่างน้อย ~1 นาทีของข้อมูลจริง
const START_KEY = "mg.analysis.start";
const RESULT_KEY = "mg.analysis.result";

interface StoredResult {
  completedAt: number;
  points: number;
  avg: SensorReading;
  minuteAvgs: SensorReading[];
}

function readStart(): number | null {
  const v = Number(localStorage.getItem(START_KEY));
  return Number.isFinite(v) && v > 0 ? v : null;
}

function readResult(): StoredResult | null {
  try {
    const raw = localStorage.getItem(RESULT_KEY);
    if (!raw) return null;
    const r = JSON.parse(raw) as StoredResult;
    return r && r.avg ? r : null;
  } catch {
    return null;
  }
}

/** Bucket per-second points into per-minute averages (for the trend engine). */
function downsampleToMinutes(pts: SensorReading[]): SensorReading[] {
  const buckets = new Map<number, SensorReading[]>();
  for (const p of pts) {
    const m = Math.floor(p.timestamp / 60_000);
    const arr = buckets.get(m);
    if (arr) arr.push(p);
    else buckets.set(m, [p]);
  }
  return [...buckets.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, arr]) => averageReadings(arr)!)
    .filter(Boolean);
}

const fmtElapsed = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

export default function Analysis() {
  const { latest, liveBuffer, status } = useLiveData();
  const online = status === "live";

  const [startTs, setStartTs] = useState<number | null>(readStart);
  const [result, setResult] = useState<StoredResult | null>(readResult);
  const [, tick] = useReducer((x: number) => x + 1, 0);

  // re-render every second while running (progress / clock)
  useEffect(() => {
    if (!startTs) return;
    const id = window.setInterval(() => tick(), 1000);
    return () => window.clearInterval(id);
  }, [startTs]);

  const collected = useMemo(
    () => (startTs ? liveBuffer.filter((p) => p.timestamp >= startTs) : []),
    [liveBuffer, startTs]
  );
  const elapsed = startTs ? Date.now() - startTs : 0;
  const progress = Math.min(1, elapsed / DURATION_MS);
  const timeDone = elapsed >= DURATION_MS;

  // auto-finalize when the 10 minutes are up and we have enough real points
  useEffect(() => {
    if (!startTs || !timeDone || collected.length < MIN_POINTS) return;
    const avg = averageReadings(collected);
    if (!avg) return;
    const res: StoredResult = {
      completedAt: Date.now(),
      points: collected.length,
      avg,
      minuteAvgs: downsampleToMinutes(collected),
    };
    setResult(res);
    localStorage.setItem(RESULT_KEY, JSON.stringify(res));
    setStartTs(null);
    localStorage.removeItem(START_KEY);
  }, [startTs, timeDone, collected]);

  const start = () => {
    setResult(null);
    localStorage.removeItem(RESULT_KEY);
    const t = Date.now();
    setStartTs(t);
    localStorage.setItem(START_KEY, String(t));
  };

  const cancel = () => {
    setStartTs(null);
    localStorage.removeItem(START_KEY);
  };

  const clearResult = () => {
    setResult(null);
    localStorage.removeItem(RESULT_KEY);
  };

  const verdict = useMemo(
    () => (result ? analyzeReading(result.avg) : null),
    [result]
  );
  const trend = useMemo(
    () =>
      result && verdict && result.minuteAvgs.length >= 3
        ? analyzeTrend(result.minuteAvgs, verdict)
        : null,
    [result, verdict]
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <PageHead
        title={
          <>
            ผล<span className="text-gradient">วิเคราะห์</span>
          </>
        }
        subtitle="เก็บค่าจากกราฟเรียลไทม์ต่อเนื่อง 10 นาที แล้วประเมินระดับความสดของเนื้อ"
        right={<ConnBadge status={status} />}
      />

      {/* ── done: show the verdict ── */}
      {result && verdict ? (
        <div className="space-y-6">
          <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
            <AnalysisResult verdict={verdict} />
            {trend && <TrendCard trend={trend} />}
          </div>

          <Card className="glass p-5">
            <p className="mb-3 text-sm font-semibold">ค่าเฉลี่ยตลอดการวิเคราะห์</p>
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              <AvgStat icon={Wind} label="NH₃" value={`${result.avg.nh3.toFixed(2)} ppm`} />
              <AvgStat icon={Flame} label="H₂S" value={`${result.avg.h2s.toFixed(2)} ppm`} />
              <AvgStat icon={Thermometer} label="อุณหภูมิ" value={`${result.avg.temperature.toFixed(1)} °C`} />
              <AvgStat icon={Droplets} label="ความชื้น" value={`${result.avg.humidity.toFixed(0)} %`} />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              จากข้อมูล {result.points.toLocaleString()} จุด · เสร็จเมื่อ{" "}
              {new Date(result.completedAt).toLocaleTimeString("th-TH")} น.
            </p>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button onClick={start} disabled={!online}>
              <RotateCcw /> วิเคราะห์ใหม่
            </Button>
            <Button variant="outline" onClick={clearResult}>
              ล้างผล
            </Button>
          </div>
          {!online && (
            <p className="text-xs text-warn">
              ต้องรอบอร์ดกลับมา ONLINE ก่อนจึงจะเริ่มวิเคราะห์ใหม่ได้
            </p>
          )}
        </div>
      ) : startTs ? (
        /* ── running: progress ── */
        <div className="space-y-6">
          <Card className="glass-strong">
            <div className="grid gap-6 p-6 sm:grid-cols-[auto_1fr] sm:items-center">
              <ProgressRing progress={progress} />
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  <Activity className="h-4 w-4" /> กำลังวิเคราะห์…
                </div>
                <p className="mt-2 text-3xl font-black tabular-nums">
                  {fmtElapsed(elapsed)} <span className="text-lg font-bold text-muted-foreground">/ 10:00 นาที</span>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  เก็บข้อมูลแล้ว {collected.length.toLocaleString()} จุด (จุดละ 1 วินาที)
                </p>

                {!online && (
                  <p className="mt-3 flex items-center gap-2 rounded-xl border border-warn/25 bg-warn/[0.06] p-3 text-sm text-warn">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    บอร์ดออฟไลน์ — การเก็บข้อมูลหยุดชั่วคราว จะเก็บต่อเมื่อกลับมา ONLINE
                  </p>
                )}
                {timeDone && collected.length < MIN_POINTS && (
                  <p className="mt-3 flex items-center gap-2 rounded-xl border border-warn/25 bg-warn/[0.06] p-3 text-sm text-warn">
                    <Timer className="h-4 w-4 shrink-0" />
                    ครบเวลาแล้วแต่ข้อมูลยังไม่พอ ({collected.length}/{MIN_POINTS} จุด) —
                    กำลังรอข้อมูลเพิ่มจากบอร์ด
                  </p>
                )}

                <div className="mt-4 flex gap-3">
                  <Button variant="outline" onClick={cancel}>
                    <Square /> ยกเลิก
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {collected.length >= 3 && (
            <LiveChart
              title="ค่าที่กำลังเก็บ"
              subtitle="NH₃ & H₂S (ppm) ตั้งแต่เริ่มวิเคราะห์"
              points={collected.slice(-600)}
              unit="ppm"
              live={online}
              series={[
                { key: "nh3", label: "NH₃", color: "#ef4444" },
                { key: "h2s", label: "H₂S", color: "#f59e0b" },
              ]}
            />
          )}
        </div>
      ) : (
        /* ── idle: explain + start ── */
        <div className="space-y-6">
          <Card className="glass-strong">
            <div className="grid place-items-center gap-5 p-8 text-center sm:p-12">
              <span className="grid h-16 w-16 place-items-center rounded-2xl border border-violet-400/30 bg-violet-400/10 text-violet-400">
                <Activity className="h-8 w-8" />
              </span>
              <div>
                <h2 className="text-xl font-extrabold">วิเคราะห์ความสดแบบเต็มรูปแบบ</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                  ระบบจะเก็บค่าจากกราฟเรียลไทม์ต่อเนื่อง <span className="font-semibold text-foreground">10 นาที</span>{" "}
                  แล้วนำค่าเฉลี่ยมาประเมินระดับความสดของเนื้อ:
                  🟢 สด · 🟡 ควรระวัง · 🔴 เน่า พร้อมแนวโน้ม
                </p>
              </div>
              <Button size="lg" onClick={start} disabled={!online}>
                <Play /> เริ่มวิเคราะห์ (10 นาที)
              </Button>
              {!online && (
                <p className="text-xs text-warn">
                  ต้องมีบอร์ด ONLINE ก่อนจึงจะเริ่มวิเคราะห์ได้ — ตรวจสอบกล่องเซ็นเซอร์
                </p>
              )}
            </div>
          </Card>

          {latest && (
            <p className="px-1 text-xs text-muted-foreground">
              เคล็ดลับ: วางเนื้อในกล่องให้เรียบร้อยก่อนกดเริ่ม เพื่อให้ค่าเฉลี่ย 10 นาทีนิ่งที่สุด
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}

function ProgressRing({ progress }: { progress: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const pct = Math.round(progress * 100);
  return (
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
          className="stroke-violet-400"
          strokeDasharray={circ}
          animate={{ strokeDashoffset: circ - progress * circ }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-extrabold tabular-nums text-violet-400">{pct}%</span>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Analyzing
        </span>
      </div>
    </div>
  );
}

function AvgStat({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className={cn("rounded-xl border border-white/10 bg-white/[0.03] p-3")}>
      <Icon className="h-4 w-4 text-muted-foreground" />
      <p className="mt-2 text-[11px] text-muted-foreground">{label}</p>
      <p className="text-lg font-bold tabular-nums leading-tight">{value}</p>
    </div>
  );
}
