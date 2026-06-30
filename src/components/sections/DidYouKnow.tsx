import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lightbulb, Plus, Sparkles } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/Reveal";
import { cn } from "@/lib/utils";

const facts = [
  {
    q: "เนื้อสัตว์เปลี่ยนคุณภาพได้ แม้อยู่ในตู้เย็น",
    a: "หากอุณหภูมิไม่คงที่หรือสูงเกิน 4°C แบคทีเรียยังคงเติบโตได้ การเปิด-ปิดตู้เย็นบ่อยจึงเร่งการเสื่อมคุณภาพโดยที่เราไม่รู้ตัว",
    stat: "4°C",
  },
  {
    q: "กลิ่นและสี อาจไม่เพียงพอต่อการตรวจสอบ",
    a: "เชื้อก่อโรคหลายชนิดไม่ทำให้สีหรือกลิ่นเปลี่ยน เนื้อที่ดู ‘ปกติ’ จึงอาจปนเปื้อนแล้ว การวัดค่าก๊าซให้ผลที่แม่นยำกว่าประสาทสัมผัส",
    stat: "60%",
  },
  {
    q: "เซ็นเซอร์ตรวจจับสารเน่าเสียได้ ‘ก่อน’ มนุษย์",
    a: "ก๊าซ NH₃ และ H₂S เกิดขึ้นในระยะแรกของการย่อยสลายโปรตีน เซ็นเซอร์ตรวจจับได้ในระดับ ppm ก่อนที่จมูกมนุษย์จะรับรู้",
    stat: "ppm",
  },
];

export function DidYouKnow() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="relative scroll-mt-24 py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          eyebrow="Did You Know?"
          title={<>เกร็ดความรู้ที่ <span className="text-gradient">หลายคนมองข้าม</span></>}
          subtitle="แตะที่การ์ดเพื่อเปิดดูข้อมูลเชิงลึก"
        />

        <div className="mx-auto mt-14 grid max-w-4xl gap-4">
          {facts.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={f.q} delay={i * 0.08}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className={cn(
                    "group w-full overflow-hidden rounded-2xl glass p-1 text-left transition-all duration-300",
                    isOpen && "shadow-glow-meat"
                  )}
                >
                  <div className="flex items-center gap-4 p-5">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04]">
                      {i === 2 ? (
                        <Sparkles className="h-5 w-5 text-safe" />
                      ) : (
                        <Lightbulb className="h-5 w-5 text-meat" />
                      )}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-base font-bold sm:text-lg">{f.q}</h3>
                    </div>
                    <span className="hidden shrink-0 text-2xl font-black text-white/10 sm:block">
                      {f.stat}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10"
                    >
                      <Plus className="h-4 w-4" />
                    </motion.span>
                  </div>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <p className="px-5 pb-5 pl-[5.25rem] text-sm leading-relaxed text-muted-foreground">
                          {f.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
