import { AlertTriangle, Bug, ShieldCheck, Thermometer } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/Reveal";

const cards = [
  {
    icon: ShieldCheck,
    title: "ความเสี่ยงจากเนื้อสัตว์เสีย",
    desc: "เนื้อสัตว์ที่เสื่อมคุณภาพอาจก่อให้เกิดอาหารเป็นพิษ คลื่นไส้ และปัญหาทางเดินอาหาร แม้มองด้วยตาเปล่าจะดูปกติ",
    accent: "from-meat/20 to-transparent",
    iconCls: "text-meat",
  },
  {
    icon: Bug,
    title: "เชื้อแบคทีเรีย",
    desc: "Salmonella, E. coli และ Listeria เติบโตได้รวดเร็วในเนื้อสัตว์ดิบ โดยเฉพาะในอุณหภูมิที่ไม่เหมาะสม",
    accent: "from-violet-500/20 to-transparent",
    iconCls: "text-violet-400",
  },
  {
    icon: Thermometer,
    title: "อุณหภูมิที่เหมาะสม",
    desc: "ช่วง 4–60°C คือ “Danger Zone” ที่แบคทีเรียเพิ่มจำนวนเร็วที่สุด ควรเก็บเนื้อสดที่ 0–4°C เสมอ",
    accent: "from-sky-500/20 to-transparent",
    iconCls: "text-sky-400",
  },
  {
    icon: AlertTriangle,
    title: "วิธีตรวจสอบเบื้องต้น",
    desc: "สังเกตสี กลิ่น และความเหนียว แต่ประสาทสัมผัสอาจไม่เพียงพอ — เซ็นเซอร์ช่วยตรวจจับได้ก่อนที่จะสังเกตเห็น",
    accent: "from-safe/20 to-transparent",
    iconCls: "text-safe",
  },
];

export function FoodSafety() {
  return (
    <section id="safety" className="relative scroll-mt-24 py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          eyebrow="Food Safety"
          title={<>ความปลอดภัย<span className="text-gradient">ด้านอาหาร</span></>}
          subtitle="รู้จักความเสี่ยงและปัจจัยสำคัญ เพื่อการจัดการเนื้อสัตว์อย่างปลอดภัย"
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.08}>
              <article className="group relative h-full overflow-hidden rounded-2xl glass p-6 transition-all duration-300 hover:-translate-y-1.5">
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${c.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                />
                <div className="relative">
                  <span className="grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-white/[0.04]">
                    <c.icon className={`h-6 w-6 ${c.iconCls}`} />
                  </span>
                  <h3 className="mt-5 text-base font-bold">{c.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
