import { useNavigate } from "react-router-dom";
import { ArrowRight, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/Reveal";

export function CallToAction() {
  const navigate = useNavigate();

  return (
    <section className="py-20 sm:py-28">
      <div className="container">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl glass-strong px-6 py-14 text-center sm:px-12 sm:py-20">
            <div className="pointer-events-none absolute inset-0 grid-bg opacity-30 [mask-image:radial-gradient(60%_60%_at_50%_50%,black,transparent)]" />
            <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-meat/20 blur-3xl" />
            <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-safe/20 blur-3xl" />

            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-semibold">
                <Cpu className="h-3.5 w-3.5 text-safe" /> พร้อมเชื่อมต่อ ESP32 + Sensor จริง
              </span>
              <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
                เริ่มตรวจสอบความสด<span className="text-gradient">แบบ Real-Time</span> วันนี้
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
                เข้าสู่ระบบด้วย Google เพื่อเปิด Monitor Dashboard และดูค่าจากเซ็นเซอร์ทันที
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button size="lg" onClick={() => navigate("/dashboard")}>
                  เปิด Monitor Dashboard <ArrowRight />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/dashboard")}>
                  เข้าสู่ระบบ
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
