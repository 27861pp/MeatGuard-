import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Cpu, Droplets, Flame, Menu, Thermometer, Wind, X } from "lucide-react";
import { useSensorData } from "@/hooks/useSensorData";
import { useClock } from "@/hooks/useClock";
import {
  analyzeReading,
  humidityStatus,
  metricStatus,
  SENSOR_RANGE,
} from "@/lib/analysis";
import { BatteryPill } from "@/components/BatteryPill";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { SensorCard } from "@/components/dashboard/SensorCard";
import { RealtimeChart } from "@/components/dashboard/RealtimeChart";
import { AnalysisResult } from "@/components/dashboard/AnalysisResult";
import { StatusToast } from "@/components/dashboard/StatusToast";

const frac = (v: number, key: keyof typeof SENSOR_RANGE) => {
  const { min, max } = SENSOR_RANGE[key];
  return (v - min) / (max - min);
};

export default function Dashboard() {
  const { latest, history, status } = useSensorData();
  const [drawer, setDrawer] = useState(false);
  const clock = useClock();

  const verdict = useMemo(() => (latest ? analyzeReading(latest) : null), [latest]);

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
                  ข้อมูลเซ็นเซอร์แบบ Real-Time
                  {latest && (
                    <> · อัปเดตล่าสุด{" "}
                      {new Date(latest.timestamp).toLocaleTimeString("th-TH")}
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* live clock + device battery */}
            <div className="flex items-center gap-2">
              <span className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold tabular-nums text-muted-foreground sm:inline">
                {clock.time}
              </span>
              <BatteryPill />
            </div>
          </header>

          {(status === "waiting" || status === "demo") && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-warn/25 bg-warn/[0.06] p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-warn/30 bg-warn/10 text-warn">
                <Cpu className="h-4 w-4" />
              </span>
              <div className="text-sm">
                <p className="font-semibold text-warn">
                  {status === "waiting" ? "ยังไม่มีข้อมูลจากเซ็นเซอร์จริง" : "โหมดสาธิต (Demo)"}
                </p>
                <p className="text-muted-foreground">
                  {status === "waiting"
                    ? "เชื่อมต่อ Firebase สำเร็จ แต่ยังไม่พบข้อมูลใน meat/latest — กำลังแสดงข้อมูลจำลอง ระบบจะสลับเป็นค่าจริงอัตโนมัติเมื่อ ESP32 เริ่มส่งข้อมูล"
                    : "ยังไม่ได้ตั้งค่า Firebase — กำลังแสดงข้อมูลจำลองเพื่อสาธิตการทำงาน"}
                </p>
              </div>
            </div>
          )}

          {!latest || !verdict ? (
            <DashboardSkeleton />
          ) : (
            <div className="space-y-6">
              {/* analysis verdict */}
              <section id="analysis" className="scroll-mt-20">
                <AnalysisResult verdict={verdict} />
              </section>

              {/* sensor cards */}
              <section id="sensors" className="scroll-mt-20">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  <SensorCard
                    icon={Thermometer}
                    sublabel="Temperature"
                    label="อุณหภูมิ"
                    value={latest.temperature}
                    unit="°C"
                    fraction={frac(latest.temperature, "temperature")}
                    status={metricStatus("temperature", latest.temperature)}
                  />
                  <SensorCard
                    icon={Droplets}
                    sublabel="Humidity"
                    label="ความชื้น"
                    value={latest.humidity}
                    unit="%"
                    decimals={0}
                    fraction={frac(latest.humidity, "humidity")}
                    status={humidityStatus(latest.humidity)}
                  />
                  <SensorCard
                    icon={Wind}
                    sublabel="NH₃ Ammonia"
                    label="แอมโมเนีย"
                    value={latest.nh3}
                    unit="ppm"
                    fraction={frac(latest.nh3, "nh3")}
                    status={metricStatus("nh3", latest.nh3)}
                  />
                  <SensorCard
                    icon={Flame}
                    sublabel="H₂S Sulfide"
                    label="ไฮโดรเจนซัลไฟด์"
                    value={latest.h2s}
                    unit="ppm"
                    decimals={2}
                    fraction={frac(latest.h2s, "h2s")}
                    status={metricStatus("h2s", latest.h2s)}
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
                  series={[{ key: "temperature", label: "Temperature", color: "#22c55e" }]}
                />
              </section>
            </div>
          )}
        </div>
      </div>

      <StatusToast verdict={verdict} />
    </div>
  );
}
