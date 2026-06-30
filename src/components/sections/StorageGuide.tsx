import { Refrigerator, Snowflake, UtensilsCrossed } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/Reveal";

const guides = [
  {
    icon: Refrigerator,
    title: "Fresh Meat",
    titleTh: "เนื้อสด",
    temp: "0 – 4°C",
    accent: "text-safe",
    bar: "from-safe to-emerald-300",
    items: [
      "เก็บในอุณหภูมิ 0–4°C ในส่วนที่เย็นที่สุดของตู้เย็น",
      "หลีกเลี่ยงการปนเปื้อนข้าม วางในภาชนะปิดหรือถาดรอง",
      "บริโภคภายใน 2–3 วันเพื่อความสดสูงสุด",
    ],
  },
  {
    icon: Snowflake,
    title: "Frozen Meat",
    titleTh: "เนื้อแช่แข็ง",
    temp: "-18°C",
    accent: "text-sky-400",
    bar: "from-sky-400 to-cyan-300",
    items: [
      "แช่แข็งที่ -18°C หรือต่ำกว่าเพื่อหยุดการเติบโตของแบคทีเรีย",
      "ใช้บรรจุภัณฑ์ปิดสนิท ป้องกัน Freezer Burn",
      "ละลายในตู้เย็น ไม่ละลายที่อุณหภูมิห้อง",
    ],
  },
  {
    icon: UtensilsCrossed,
    title: "Before Cooking",
    titleTh: "ก่อนปรุงอาหาร",
    temp: "Hygiene",
    accent: "text-meat",
    bar: "from-meat to-rose-400",
    items: [
      "ล้างมือให้สะอาดทั้งก่อนและหลังสัมผัสเนื้อดิบ",
      "แยกเขียงและมีดสำหรับเนื้อดิบกับอาหารพร้อมทาน",
      "ปรุงให้สุกทั่วถึงตามอุณหภูมิที่ปลอดภัย",
    ],
  },
];

export function StorageGuide() {
  return (
    <section id="storage" className="relative scroll-mt-24 py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          eyebrow="Meat Storage Guide"
          title={<>การเก็บรักษา<span className="text-gradient">เนื้อสัตว์</span></>}
          subtitle="แนวทางการจัดเก็บที่ถูกต้องในแต่ละขั้นตอน เพื่อยืดอายุและความปลอดภัย"
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {guides.map((g, i) => (
            <Reveal key={g.title} delay={i * 0.1}>
              <div className="relative h-full overflow-hidden rounded-2xl glass p-7">
                {/* big temp watermark */}
                <span className="pointer-events-none absolute -right-2 -top-3 text-6xl font-black text-white/[0.04]">
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="flex items-center gap-4">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.04]">
                    <g.icon className={`h-7 w-7 ${g.accent}`} />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold">{g.title}</h3>
                    <p className="text-sm text-muted-foreground">{g.titleTh}</p>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <span className={`text-2xl font-extrabold ${g.accent}`}>{g.temp}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div className={`h-full w-full rounded-full bg-gradient-to-r ${g.bar}`} />
                  </div>
                </div>

                <ul className="mt-6 space-y-3">
                  {g.items.map((item) => (
                    <li key={item} className="flex gap-3 text-sm text-muted-foreground">
                      <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current ${g.accent}`} />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
