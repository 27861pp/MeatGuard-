import { motion } from "framer-motion";
import { WifiOff } from "lucide-react";
import type { ConnectionStatus } from "@/hooks/useSensorData";

/** Shown when there is no live data at all (connecting or board offline). */
export function OfflineState({ status }: { status: ConnectionStatus }) {
  const connecting = status === "connecting";
  return (
    <div className="grid min-h-[46vh] place-items-center rounded-3xl border border-white/10 bg-white/[0.02] p-8 text-center">
      <div className="max-w-md">
        <span
          className={`mx-auto grid h-16 w-16 place-items-center rounded-2xl border ${
            connecting
              ? "border-white/10 text-muted-foreground"
              : "border-meat/25 bg-meat/10 text-meat"
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
          {connecting ? "Waiting for ESP32... (กำลังเชื่อมต่อ)" : "No Live Data (บอร์ดออฟไลน์)"}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {connecting
            ? "กำลังเชื่อมต่อกับบอร์ดเพื่อรอรับข้อมูลชุดใหม่แบบเรียลไทม์..."
            : "ไม่พบข้อมูลเรียลไทม์จากกล่องเซ็นเซอร์ — กรุณาตรวจสอบว่ากล่องเซ็นเซอร์เปิดอยู่, เชื่อมต่อ WiFi ปกติ และกำลังส่งข้อมูล"}
        </p>
      </div>
    </div>
  );
}
