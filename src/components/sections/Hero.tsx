import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, ArrowRight, PlayCircle, Radio, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SensorOrb } from "@/components/sections/SensorOrb";

const stats = [
  { value: "4", label: "เซ็นเซอร์ตรวจวัด" },
  { value: "<3s", label: "อัปเดต Real-Time" },
  { value: "3", label: "ระดับความปลอดภัย" },
];

export function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-24">
      {/* ambient grid + glow */}
      <div className="pointer-events-none absolute inset-0 grid-bg [mask-image:radial-gradient(60%_60%_at_50%_30%,black,transparent)]" />

      <div className="container relative grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        {/* ── copy ── */}
        <div>
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-semibold backdrop-blur"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-safe opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-safe" />
            </span>
            Smart Food Safety System · IoT × AI
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-6 text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
          >
            MEAT <span className="text-gradient">GUARD</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
          >
            ระบบอัจฉริยะตรวจสอบ<span className="text-foreground">คุณภาพเนื้อสัตว์</span>แบบ
            Real-Time ตรวจจับก๊าซจากการเสื่อมคุณภาพ วิเคราะห์ความสด
            และเพิ่มความปลอดภัยก่อนบริโภค
          </motion.p>

          <motion.ul
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mt-6 flex flex-col gap-2.5 text-sm text-muted-foreground"
          >
            {[
              { icon: Radio, t: "ตรวจจับก๊าซ NH₃ / H₂S จากการเน่าเสีย" },
              { icon: Activity, t: "วิเคราะห์ความสดและอุณหภูมิแบบต่อเนื่อง" },
              { icon: ShieldCheck, t: "แจ้งเตือนระดับความปลอดภัยก่อนบริโภค" },
            ].map(({ icon: Icon, t }) => (
              <li key={t} className="flex items-center gap-3">
                <span className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-safe">
                  <Icon className="h-4 w-4" />
                </span>
                {t}
              </li>
            ))}
          </motion.ul>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Button size="lg" onClick={() => navigate("/dashboard")}>
              เริ่มตรวจสอบ <ArrowRight />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() =>
                document.querySelector("#how")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <PlayCircle /> ดูระบบทำงาน
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.32 }}
            className="mt-10 flex max-w-md divide-x divide-white/10 rounded-2xl glass"
          >
            {stats.map((s) => (
              <div key={s.label} className="flex-1 px-5 py-4 text-center">
                <div className="text-2xl font-extrabold text-foreground">{s.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── 3D-style sensor visual ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-md"
        >
          <SensorOrb />
        </motion.div>
      </div>
    </section>
  );
}
