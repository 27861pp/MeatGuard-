import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Droplets,
  Flame,
  Menu,
  Thermometer,
  WifiOff,
  Wind,
  X,
} from "lucide-react";
import { useSensorData } from "@/hooks/useSensorData";
import { useClock } from "@/hooks/useClock";
import {
  analyzeReading,
  analyzeTrend,
  averageReadings,
  humidityStatus,
  metricStatus,
  SENSOR_RANGE,
} from "@/lib/analysis";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DeviceBattery } from "@/components/dashboard/DeviceBattery";
import { SensorCard } from "@/components/dashboard/SensorCard";
import { RealtimeChart } from "@/components/dashboard/RealtimeChart";
import { AnalysisResult } from "@/components/dashboard/AnalysisResult";
import { TrendCard } from "@/components/dashboard/TrendCard";
import { StatusToast } from "@/components/dashboard/StatusToast";

const AVG_WINDOW_MS = 5 * 60_000; // verdict is based on the last 5 minutes

const frac = (v: number, key: keyof typeof SENSOR_RANGE) => {
  const { min, max } = SENSOR_RANGE[key];
  return (v - min) / (max - min);
};

const isOff = (check?: string) => (check ?? "").trim().toUpperCase() === "OFF";

export default function Dashboard() {
  const { latest, history, status, lastUpdate } = useSensorData();
  const [drawer, setDrawer] = useState(false);
  const clock = useClock();

  const online = status === "live";

  // Verdict from the 5-minute average (smoother than a single spiky reading).
  const avgReading = useMemo(() => {
    if (!latest) return null;
    const cutoff = latest.timestamp - AVG_WINDOW_MS;
    const win = history.filter((r) => r.timestamp >= cutoff);
    return averageReadings(win.length ? win : [latest]) ?? latest;
  }, [latest, history]);

  const verdict = useMemo(
    () => (avgReading ? analyzeReading(avgReading) : null),
    [avgReading]
  );
  const trend = useMemo(
    () => (verdict && history.length >= 3 ? analyzeTrend(history, verdict) : null),
    [history, verdict]
  );

  // Per-sensor health: green only when the board is live AND its self-check is OK.
  const sensorUp = (check?: string) =>
    online && (check === undefined || check.trim().toUpperCase() === "OK");

  const boardOfflineNote = "บอร์ดออฟไลน์";
  const h2sNote = isOff(latest?.checks?.h2s)
    ? "ยังไม่ได้เชื่อมต่อ (MQ-136)"
    : boardOfflineNote;

  return (
    <div className="relative min-h-screen pt-16 lg:pt-0">
      <div className="lg:grid lg:grid-cols-[280px_1fr]">
        {/* ── desktop sidebar ── */}
        <aside className="sticky top-0 hidden h-screen border-r border-white/10 bg-background/40 backdrop-blur-xl lg:block">
          <DashboardSidebar status={status} />
        </aside>

        {/* ── mobile drawer ── */}
        <AnimatePresence>
          {drawer && (
            <>
              <motion.div
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDrawer(false)}
              />
              <motion.aside
                className="fixed inset-y-0 left-0 z-50 w-72 border-r border-white/10 bg-background lg:hidden"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 320, damping: 32 }}
              >
                <button
                  onClick={() => setDrawer(false)}
                  className="absolute right-3 top-4 grid h-9 w-9 place-items-center rounded-lg glass"
                  aria-label="ปิดเมนู"
                >
                  <X className="h-4 w-4" />
                </button>
                <DashboardSidebar status={status} onNavigate={() => setDrawer(false)} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ── main ── */}
        <div className="min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {/* header */}
          <header id="overview" className="mb-6 flex items-center justify-between gap-4 scroll-mt-20">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDrawer(true)}
                className="grid h-10 w-10 place-items-center rounded-xl glass lg:hidden"
                aria-label="เปิดเมนู"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                  Meat Guard <span className="text-gradient">Monitor</span>
                </h1>
                <p className="text-sm text-muted-foreground">
                  ข้อมูลจริงจากกล่อง ESP32
                  {lastUpdate > 0 && (
                    <> · อัปเดตล่าสุด {new Date(lastUpdate).toLocaleTimeString("th-TH")}</>
                  )}
                </p>
              </div>
            </div>

            {/* online/offline · box battery · clock */}
            <div className="flex items-center gap-2">
              <ConnBadge status={status} />
              <DeviceBattery percent={latest?.battery} online={online} />
              <span className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold tabular-nums text-muted-foreground sm:inline">
                {clock.time}
              </span>
            </div>
          </header>

          {/* offline banner (we have data, but the board has gone quiet) */}
          {!online && latest && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-meat/25 bg-meat/[0.06] p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-meat/30 bg-meat/10 text-meat">
                <WifiOff className="h-4 w-4" />
              </span>
              <div className="text-sm">
                <p className="font-semibold text-meat">บอร์ด ESP32 ออฟไลน์</p>
                <p className="text-muted-foreground">
                  ไม่พบข้อมูลใหม่ (ล่าสุด{" "}
                  {lastUpdate > 0 ? new Date(lastUpdate).toLocaleTimeString("th-TH") : "—"}) —
                  ค่าที่แสดงเป็นข้อมูลล่าสุด ตรวจสอบว่ากล่องเปิดอยู่และเชื่อมต่อ WiFi
                </p>
              </div>
            </div>
          )}

          {!latest || !verdict ? (
            <OfflineState status={status} />
          ) : (
            <div className="space-y-6">
              {/* analysis verdict (5-min average) + trend outlook */}
              <section id="analysis" className="scroll-mt-20 space-y-2">
                <p className="px-1 text-xs text-muted-foreground">
                  ผลวิเคราะห์จากค่าเฉลี่ย 5 นาทีล่าสุด
                </p>
                <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
                  <AnalysisResult verdict={verdict} />
                  {trend && <TrendCard trend={trend} />}
                </div>
              </section>

              {/* sensor cards */}
              <section id="sensors" className="scroll-mt-20">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  <SensorCard
                    icon={Thermometer}
                    sublabel="Temperature"
                    label="อุณหภูมิ (DHT22)"
                    value={latest.temperature}
                    unit="°C"
                    fraction={frac(latest.temperature, "temperature")}
                    status={metricStatus("temperature", latest.temperature)}
                    online={sensorUp()}
                    offlineNote={boardOfflineNote}
                  />
                  <SensorCard
                    icon={Droplets}
                    sublabel="Humidity"
                    label="ความชื้น (DHT22)"
                    value={latest.humidity}
                    unit="%"
                    decimals={0}
                    fraction={frac(latest.humidity, "humidity")}
                    status={humidityStatus(latest.humidity)}
                    online={sensorUp()}
                    offlineNote={boardOfflineNote}
                  />
                  <SensorCard
                    icon={Wind}
                    sublabel="NH₃ Ammonia"
                    label="แอมโมเนีย (MQ-135)"
                    value={latest.nh3}
                    unit="ppm"
                    fraction={frac(latest.nh3, "nh3")}
                    status={metricStatus("nh3", latest.nh3)}
                    online={sensorUp(latest.checks?.nh3)}
                    offlineNote={boardOfflineNote}
                  />
                  <SensorCard
                    icon={Flame}
                    sublabel="H₂S Sulfide"
                    label="ไฮโดรเจนซัลไฟด์ (MQ-136)"
                    value={latest.h2s}
                    unit="ppm"
                    decimals={2}
                    fraction={frac(latest.h2s, "h2s")}
                    status={metricStatus("h2s", latest.h2s)}
                    online={sensorUp(latest.checks?.h2s)}
                    offlineNote={h2sNote}
                  />
                </div>
              </section>

              {/* charts */}
              <section id="charts" className="grid scroll-mt-20 grid-cols-1 gap-5 lg:grid-cols-2">
                <RealtimeChart
                  title="ระดับก๊าซจากการเน่าเสีย"
                  subtitle="NH₃ & H₂S Level (ppm)"
                  history={history}
                  unit="ppm"
                  live={online}
                  series={[
                    { key: "nh3", label: "NH₃", color: "#ef4444" },
                    { key: "h2s", label: "H₂S", color: "#f59e0b" },
                  ]}
                />
                <RealtimeChart
                  title="ประวัติอุณหภูมิ"
                  subtitle="Temperature History (°C)"
                  history={history}
                  unit="°C"
                  live={online}
                  series={[{ key: "temperature", label: "Temperature", color: "#22c55e" }]}
                />
              </section>
            </div>
          )}
        </div>
      </div>

      <StatusToast verdict={online ? verdict : null} />
    </div>
  );
}

/** ONLINE / OFFLINE / connecting pill for the header. */
function ConnBadge({ status }: { status: "live" | "offline" | "connecting" }) {
  const map = {
    live: { label: "ONLINE", cls: "border-safe/30 bg-safe/10 text-safe", dot: "bg-safe" },
    connecting: {
      label: "เชื่อมต่อ…",
      cls: "border-white/10 bg-white/[0.04] text-muted-foreground",
      dot: "bg-muted-foreground",
    },
    offline: { label: "OFFLINE", cls: "border-meat/30 bg-meat/10 text-meat", dot: "bg-meat" },
  }[status];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${map.cls}`}>
      <span className="relative flex h-2 w-2">
        {status === "live" && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-safe opacity-75" />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${map.dot}`} />
      </span>
      {map.label}
    </span>
  );
}

/** Shown when there is no live data at all (connecting or board offline). */
function OfflineState({ status }: { status: "live" | "offline" | "connecting" }) {
  const connecting = status === "connecting";
  return (
    <div className="grid min-h-[46vh] place-items-center rounded-3xl border border-white/10 bg-white/[0.02] p-8 text-center">
      <div className="max-w-md">
        <span
          className={`mx-auto grid h-16 w-16 place-items-center rounded-2xl border ${
            connecting ? "border-white/10 text-muted-foreground" : "border-meat/25 bg-meat/10 text-meat"
          }`}
        >
          {connecting ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }}
              className="h-7 w-7 rounded-full border-2 border-transparent border-t-current"
            />
          ) : (
            <WifiOff className="h-7 w-7" />
          )}
        </span>
        <h2 className="mt-5 text-xl font-extrabold">
          {connecting ? "กำลังเชื่อมต่อกับบอร์ด…" : "บอร์ด ESP32 ออฟไลน์"}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {connecting
            ? "กำลังรอข้อมูลจากกล่องวัดความสด"
            : "ยังไม่พบข้อมูลใน meat/latest — ตรวจสอบว่ากล่องเปิดอยู่, ต่อ WiFi และเฟิร์มแวร์กำลังส่งข้อมูล แล้วหน้านี้จะแสดงค่าจริงอัตโนมัติ"}
        </p>
      </div>
    </div>
  );
}
