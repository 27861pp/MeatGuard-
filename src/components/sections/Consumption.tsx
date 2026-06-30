import { CheckCircle2, ChefHat, Flame, XCircle, AlertTriangle } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/Reveal";

const levels = [
  {
    key: "fresh",
    emoji: "🟢",
    title: "Fresh",
    titleTh: "สด",
    message: "สามารถบริโภคได้อย่างปลอดภัย",
    icon: CheckCircle2,
    ring: "border-safe/40",
    glow: "shadow-glow-safe",
    pill: "bg-safe/10 text-safe border-safe/30",
    cook: "ปรุงได้ตามต้องการ — เหมาะกับเมนูสเต๊ก ย่าง หรือต้ม",
    temp: "ปรุงให้สุก ≥ 63°C (เนื้อชิ้น) / 71°C (เนื้อบด)",
    warn: "เก็บต่อในตู้เย็น 0–4°C และบริโภคภายใน 2–3 วัน",
  },
  {
    key: "warning",
    emoji: "🟡",
    title: "Warning",
    titleTh: "เฝ้าระวัง",
    message: "ควรนำไปปรุงอาหารโดยเร็ว",
    icon: AlertTriangle,
    ring: "border-warn/40",
    glow: "shadow-[0_0_40px_-6px_hsl(38_92%_50%/0.5)]",
    pill: "bg-warn/10 text-warn border-warn/30",
    cook: "ควรปรุงให้สุกทั่วถึงทันที หลีกเลี่ยงเมนูดิบหรือกึ่งสุก",
    temp: "ปรุงให้ร้อนทั่วถึงที่ ≥ 75°C อย่างน้อย 2 นาที",
    warn: "ห้ามแช่กลับเพื่อเก็บต่อ และสังเกตอาการผิดปกติหลังปรุง",
  },
  {
    key: "spoiled",
    emoji: "🔴",
    title: "Spoiled",
    titleTh: "เน่าเสีย",
    message: "ไม่แนะนำให้บริโภค",
    icon: XCircle,
    ring: "border-meat/40",
    glow: "shadow-glow-meat",
    pill: "bg-meat/10 text-meat border-meat/30",
    cook: "ไม่ควรนำไปปรุงอาหาร แม้ปรุงสุกก็ยังมีสารพิษตกค้าง",
    temp: "การปรุงด้วยความร้อนไม่สามารถกำจัดสารพิษได้ทั้งหมด",
    warn: "ทิ้งทันทีและทำความสะอาดพื้นผิว/ภาชนะที่สัมผัส",
  },
];

export function Consumption() {
  return (
    <section id="consumption" className="relative scroll-mt-24 py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          eyebrow="Consumption Recommendation"
          title={<>คำแนะนำ<span className="text-gradient">การบริโภค</span></>}
          subtitle="ระบบจำแนกคุณภาพออกเป็น 3 ระดับ พร้อมแนวทางปฏิบัติที่ปลอดภัย"
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {levels.map((l, i) => (
            <Reveal key={l.key} delay={i * 0.1}>
              <div
                className={`relative flex h-full flex-col overflow-hidden rounded-2xl border ${l.ring} glass p-6 transition-all duration-300 hover:-translate-y-1.5 hover:${l.glow}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${l.pill}`}>
                    <l.icon className="h-3.5 w-3.5" /> {l.title}
                  </span>
                  <span className="text-3xl">{l.emoji}</span>
                </div>

                <h3 className="mt-5 text-2xl font-extrabold">{l.titleTh}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{l.message}</p>

                <div className="mt-6 space-y-4 text-sm">
                  <Detail icon={ChefHat} label="วิธีปรุงอาหาร" text={l.cook} />
                  <Detail icon={Flame} label="อุณหภูมิการทำอาหาร" text={l.temp} />
                  <Detail icon={AlertTriangle} label="คำเตือน" text={l.warn} highlight />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Detail({
  icon: Icon,
  label,
  text,
  highlight,
}: {
  icon: typeof ChefHat;
  label: string;
  text: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <span
        className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-white/10 ${
          highlight ? "bg-meat/10 text-meat" : "bg-white/[0.04] text-muted-foreground"
        }`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        <p className="mt-0.5 leading-relaxed text-foreground/90">{text}</p>
      </div>
    </div>
  );
}
