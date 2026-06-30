import { motion } from "framer-motion";
import { BellRing, Brain, Cpu, Radar } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/Reveal";

const steps = [
  {
    icon: Radar,
    no: "01",
    title: "Sensor Detection",
    desc: "เซ็นเซอร์ตรวจจับค่าสภาพแวดล้อมและก๊าซจากการเสื่อมคุณภาพแบบต่อเนื่อง",
    tags: ["Temperature", "Humidity", "NH₃ Ammonia", "H₂S Sulfide"],
    accent: "text-meat",
  },
  {
    icon: Cpu,
    no: "02",
    title: "Data Processing",
    desc: "ส่งข้อมูลผ่านเครือข่าย IoT ขึ้นสู่คลาวด์ และประมวลผลค่าความสดแบบเรียลไทม์",
    tags: ["IoT Uplink", "Firebase RTDB", "Edge Filtering"],
    accent: "text-sky-400",
  },
  {
    icon: Brain,
    no: "03",
    title: "Smart Analysis",
    desc: "วิเคราะห์ระดับความปลอดภัย และจำแนกคุณภาพออกเป็น 3 ระดับโดยอัตโนมัติ",
    tags: ["Fresh", "Warning", "Spoiled"],
    accent: "text-violet-400",
  },
  {
    icon: BellRing,
    no: "04",
    title: "User Notification",
    desc: "แจ้งเตือนผู้ใช้งานทันทีเมื่อพบความเสี่ยง พร้อมคำแนะนำการบริโภคที่เหมาะสม",
    tags: ["Real-Time Alert", "Consumption Tips"],
    accent: "text-safe",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative scroll-mt-24 py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          eyebrow="How MEAT GUARD Works"
          title={<>หลักการทำงานของ<span className="text-gradient">นวัตกรรม</span></>}
          subtitle="จากเซ็นเซอร์สู่คำแนะนำการบริโภค ใน 4 ขั้นตอนอัตโนมัติ"
        />

        <div className="relative mt-16">
          {/* connecting line (desktop) */}
          <div className="absolute left-0 right-0 top-[3.25rem] hidden h-px bg-gradient-to-r from-transparent via-white/15 to-transparent lg:block" />

          <div className="grid gap-6 lg:grid-cols-4">
            {steps.map((s, i) => (
              <Reveal key={s.no} delay={i * 0.1}>
                <div className="group relative h-full rounded-2xl glass p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow-meat">
                  <div className="mb-5 flex items-center justify-between">
                    <span className="relative grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.04]">
                      <s.icon className={`h-6 w-6 ${s.accent}`} />
                      <motion.span
                        className="absolute inset-0 rounded-2xl border border-white/10"
                        animate={{ scale: [1, 1.25], opacity: [0.5, 0] }}
                        transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                      />
                    </span>
                    <span className="text-3xl font-black text-white/10">{s.no}</span>
                  </div>
                  <h3 className="text-lg font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {s.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[11px] font-medium text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
