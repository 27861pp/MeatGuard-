import { motion } from "framer-motion";
import { Cpu, Droplets, Flame, Thermometer, Wind } from "lucide-react";
import { useLiveData } from "@/contexts/LiveDataContext";
import {
  humidityStatus,
  metricStatus,
  SENSOR_RANGE,
  sensorWarning,
  sensorWorking,
} from "@/lib/analysis";
import { PageHead } from "@/components/PageHead";
import { Card } from "@/components/ui/card";
import { ConnBadge } from "@/components/dashboard/ConnBadge";
import { DeviceBattery } from "@/components/dashboard/DeviceBattery";
import { SensorCard } from "@/components/dashboard/SensorCard";
import { OfflineState } from "@/components/dashboard/OfflineState";
import { cn } from "@/lib/utils";

const frac = (v: number, key: keyof typeof SENSOR_RANGE) => {
  const { min, max } = SENSOR_RANGE[key];
  return (v - min) / (max - min);
};

const isOff = (check?: string) => (check ?? "").trim().toUpperCase() === "OFF";

export default function Sensors() {
  const { latest, status, lastUpdate } = useLiveData();
  const online = status === "live";

  // มีค่าเข้ามา = ออนไลน์ (เขียว) · "OFF"/"RAW=0!"/บอร์ดเงียบ = ออฟไลน์ (แดง)
  const sensorUp = (check?: string) => sensorWorking(online, check);

  const boardOfflineNote = "บอร์ดออฟไลน์";
  const h2sNote = isOff(latest?.checks?.h2s)
    ? "ยังไม่ได้เชื่อมต่อ (MQ-136)"
    : boardOfflineNote;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <PageHead
        title={
          <>
            เซ็นเซอร์ <span className="text-gradient">Sensors</span>
          </>
        }
        subtitle="สถานะการทำงานของเซ็นเซอร์แต่ละตัวในกล่องวัดความสด"
        right={<ConnBadge status={status} />}
      />

      {!latest ? (
        <OfflineState status={status} />
      ) : (
        <div className="space-y-6">
          {/* board card */}
          <Card className="glass">
            <div className="flex flex-wrap items-center gap-4 p-5">
              <span
                className={cn(
                  "grid h-12 w-12 shrink-0 place-items-center rounded-xl border",
                  online
                    ? "border-safe/30 bg-safe/10 text-safe"
                    : "border-meat/30 bg-meat/10 text-meat"
                )}
              >
                <Cpu className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">กล่องวัดความสด (ESP32)</p>
                <p className="text-xs text-muted-foreground">
                  {online ? "เชื่อมต่อ WiFi และส่งข้อมูลปกติ" : "ขาดการเชื่อมต่อ — ตรวจสอบไฟและ WiFi ของกล่อง"}
                  {lastUpdate > 0 && (
                    <> · ข้อมูลล่าสุด {new Date(lastUpdate).toLocaleTimeString("th-TH")}</>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <DeviceBattery percent={latest.battery} online={online} />
                <ConnBadge status={status} compact />
              </div>
            </div>
          </Card>

          {/* sensor cards */}
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
              warnNote={sensorWarning(latest.checks?.nh3) ?? undefined}
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
              warnNote={sensorWarning(latest.checks?.h2s) ?? undefined}
            />
          </div>

          <p className="px-1 text-xs text-muted-foreground">
            🟢 = เซ็นเซอร์ทำงานปกติ · 🔴 = ไม่ทำงานหรือขาดการเชื่อมต่อ (อ่านจากระบบตรวจสอบตัวเองของบอร์ด)
          </p>
        </div>
      )}
    </motion.div>
  );
}
