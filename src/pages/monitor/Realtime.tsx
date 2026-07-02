import { useState } from "react";
import { motion } from "framer-motion";
import { Droplets, Flame, Thermometer, Wind, type LucideIcon } from "lucide-react";
import { useLiveData } from "@/contexts/LiveDataContext";
import { PageHead } from "@/components/PageHead";
import { ConnBadge } from "@/components/dashboard/ConnBadge";
import { LiveChart } from "@/components/dashboard/LiveChart";
import { RealtimeChart } from "@/components/dashboard/RealtimeChart";
import { OfflineState } from "@/components/dashboard/OfflineState";
import { cn } from "@/lib/utils";

const WINDOWS = [
  { label: "1 นาที", sec: 60 },
  { label: "5 นาที", sec: 300 },
  { label: "10 นาที", sec: 600 },
] as const;

export default function Realtime() {
  const { latest, liveBuffer, minuteHistory, status } = useLiveData();
  const [winSec, setWinSec] = useState<number>(300);
  const online = status === "live";

  const points = liveBuffer.slice(-winSec);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <PageHead
        title={
          <>
            กราฟ<span className="text-gradient">เรียลไทม์</span>
          </>
        }
        subtitle="อัปเดตทุก 1 วินาที จากค่าที่กำลังวัดอยู่ตอนนี้"
        right={<ConnBadge status={status} />}
      />

      {!latest ? (
        <OfflineState status={status} />
      ) : (
        <div className="space-y-6">
          {/* current values */}
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <NowChip icon={Wind} label="NH₃" value={`${latest.nh3.toFixed(2)} ppm`} cls="text-meat" />
            <NowChip icon={Flame} label="H₂S" value={`${latest.h2s.toFixed(2)} ppm`} cls="text-warn" />
            <NowChip icon={Thermometer} label="อุณหภูมิ" value={`${latest.temperature.toFixed(1)} °C`} cls="text-safe" />
            <NowChip icon={Droplets} label="ความชื้น" value={`${latest.humidity.toFixed(0)} %`} cls="text-sky-400" />
          </div>

          {/* window selector */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
              {WINDOWS.map((w) => (
                <button
                  key={w.sec}
                  onClick={() => setWinSec(w.sec)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
                    winSec === w.sec
                      ? "bg-white/[0.1] text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {w.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              เก็บแล้ว {liveBuffer.length.toLocaleString()} จุด · จุดละ 1 วินาที
            </p>
          </div>

          {points.length < 3 ? (
            <div className="grid min-h-[30vh] place-items-center rounded-2xl border border-white/10 bg-white/[0.02] text-center">
              <div>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }}
                  className="mx-auto block h-8 w-8 rounded-full border-2 border-transparent border-t-safe"
                />
                <p className="mt-3 text-sm text-muted-foreground">
                  กำลังเริ่มเก็บข้อมูลวิต่อวิ… (กราฟจะปรากฏในไม่กี่วินาที)
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <LiveChart
                title="ก๊าซจากการเน่าเสีย"
                subtitle="NH₃ & H₂S (ppm) — วิต่อวิ"
                points={points}
                unit="ppm"
                live={online}
                series={[
                  { key: "nh3", label: "NH₃", color: "#ef4444" },
                  { key: "h2s", label: "H₂S", color: "#f59e0b" },
                ]}
              />
              <LiveChart
                title="อุณหภูมิ"
                subtitle="Temperature (°C) — วิต่อวิ"
                points={points}
                unit="°C"
                live={online}
                series={[{ key: "temperature", label: "Temperature", color: "#22c55e" }]}
              />
            </div>
          )}

          {/* minute log from the board */}
          {minuteHistory.length >= 2 && (
            <section className="space-y-3">
              <h2 className="px-1 text-sm font-semibold text-muted-foreground">
                ประวัติรายนาที (บันทึกจากบอร์ด)
              </h2>
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <RealtimeChart
                  title="ก๊าซ · รายนาที"
                  subtitle="NH₃ & H₂S Level (ppm)"
                  history={minuteHistory}
                  unit="ppm"
                  live={online}
                  series={[
                    { key: "nh3", label: "NH₃", color: "#ef4444" },
                    { key: "h2s", label: "H₂S", color: "#f59e0b" },
                  ]}
                />
                <RealtimeChart
                  title="อุณหภูมิ · รายนาที"
                  subtitle="Temperature History (°C)"
                  history={minuteHistory}
                  unit="°C"
                  live={online}
                  series={[{ key: "temperature", label: "Temperature", color: "#22c55e" }]}
                />
              </div>
            </section>
          )}

          <p className="px-1 text-xs text-muted-foreground">
            หมายเหตุ: บอร์ดส่งค่าใหม่ทุก ~2 วินาที (เฟิร์มแวร์ล่าสุด) — หากยังใช้เฟิร์มแวร์เดิม
            ค่าจะเปลี่ยนทุก 1 นาที แต่กราฟยังเลื่อนทุกวินาที
          </p>
        </div>
      )}
    </motion.div>
  );
}

function NowChip({
  icon: Icon,
  label,
  value,
  cls,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  cls: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <Icon className={cn("h-5 w-5 shrink-0", cls)} />
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-base font-bold tabular-nums leading-tight">{value}</p>
      </div>
    </div>
  );
}
