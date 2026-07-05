import { Link } from "react-router-dom";
import { Cpu, Github, Mail, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/10">
      <div className="container py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-4">
            <Logo size={40} />
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              ระบบอัจฉริยะตรวจสอบคุณภาพและความสดของเนื้อสัตว์แบบ Real-Time
              ด้วยเซ็นเซอร์ IoT และการวิเคราะห์อัจฉริยะ
              เพื่อความปลอดภัยก่อนบริโภค
            </p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-safe" /> ESP32 Ready
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-meat" /> Food Safety
              </span>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">เมนู</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/?section=how" className="hover:text-foreground">หลักการทำงาน</Link></li>
              <li><Link to="/?section=safety" className="hover:text-foreground">ความปลอดภัยด้านอาหาร</Link></li>
              <li><Link to="/?section=consumption" className="hover:text-foreground">คำแนะนำการบริโภค</Link></li>
              <li><Link to="/?section=storage" className="hover:text-foreground">การเก็บรักษา</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">ระบบ</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/dashboard" className="hover:text-foreground">Monitor Dashboard</Link></li>
              <li><Link to="/dashboard" className="hover:text-foreground">เข้าสู่ระบบ</Link></li>
              <li className="flex items-center gap-2 pt-1">
                <a href="https://github.com/27861pp/MeatGuard-" target="_blank" rel="noopener noreferrer" className="grid h-8 w-8 place-items-center rounded-lg glass hover:text-foreground" aria-label="GitHub"><Github className="h-4 w-4" /></a>
                <a href="mailto:hello@meatguard.io" className="grid h-8 w-8 place-items-center rounded-lg glass hover:text-foreground" aria-label="Email"><Mail className="h-4 w-4" /></a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} MEAT GUARD — Smart Food Safety System.</p>
          <p>Built with React · Firebase · Chart.js · Tailwind</p>
        </div>
      </div>
    </footer>
  );
}
