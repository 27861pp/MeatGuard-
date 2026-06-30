import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { Logo } from "@/components/Logo";
import { SensorOrb } from "@/components/sections/SensorOrb";
import { useAuth } from "@/contexts/AuthContext";
import { DEMO_MODE } from "@/lib/firebase";

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 4.75 12 4.75Z" />
    </svg>
  );
}

export default function Login() {
  const { user, loading, signInWithGoogle, error } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? "/home";

  useEffect(() => {
    if (!loading && user) navigate(from, { replace: true });
  }, [user, loading, from, navigate]);

  if (!loading && user) return <Navigate to={from} replace />;

  const handleSignIn = async () => {
    setSubmitting(true);
    await signInWithGoogle();
    setSubmitting(false);
  };

  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      {/* ── left: brand visual ── */}
      <div className="relative hidden items-center justify-center overflow-hidden border-r border-white/10 p-12 lg:flex">
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-40 [mask-image:radial-gradient(70%_70%_at_50%_40%,black,transparent)]" />
        <div className="relative z-10 w-full max-w-sm">
          <SensorOrb />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 text-center"
          >
            <h2 className="text-2xl font-extrabold">ตรวจสอบความสด แบบ Real-Time</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              เข้าถึง Monitor Dashboard และข้อมูลเซ็นเซอร์ได้ทันทีหลังเข้าสู่ระบบ
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── right: auth panel ── */}
      <div className="relative flex flex-col items-center justify-center p-6 sm:p-12">
        <Link
          to="/"
          className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> กลับหน้าแรก
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 flex flex-col items-center text-center">
            <Logo size={52} withWordmark={false} />
            <h1 className="mt-5 text-3xl font-black tracking-tight">
              MEAT <span className="text-gradient">GUARD</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              เข้าสู่ระบบเพื่อเริ่มต้นการตรวจสอบคุณภาพเนื้อสัตว์
            </p>
          </div>

          <div className="rounded-2xl glass-strong p-6 sm:p-8">
            <motion.button
              onClick={handleSignIn}
              disabled={submitting}
              whileTap={{ scale: 0.98 }}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-zinc-800 shadow-lg transition-all hover:brightness-95 disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  กำลังเข้าสู่ระบบ…
                </>
              ) : (
                <>
                  <GoogleIcon />
                  Sign in with Google
                </>
              )}
            </motion.button>

            {error && (
              <p className="mt-4 rounded-lg border border-meat/30 bg-meat/10 px-3 py-2 text-center text-xs text-meat">
                {error}
              </p>
            )}

            <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-white/10" />
              ปลอดภัยด้วย Firebase Authentication
              <span className="h-px flex-1 bg-white/10" />
            </div>

            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-safe" /> ข้อมูลเข้ารหัสและป้องกันด้วย Security Rules
              </li>
              <li className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-meat" /> เข้าถึง Dashboard และการแจ้งเตือนแบบ Real-Time
              </li>
            </ul>
          </div>

          {DEMO_MODE && (
            <div className="mt-4 rounded-xl border border-safe/20 bg-safe/[0.06] px-4 py-3 text-center text-xs text-muted-foreground">
              <span className="font-semibold text-safe">DEMO MODE</span> · ยังไม่ได้ตั้งค่า Firebase —
              ปุ่มด้านบนจะจำลองการเข้าสู่ระบบให้ทดลองใช้งานได้ทันที
            </div>
          )}

          <p className="mt-6 text-center text-xs text-muted-foreground">
            การเข้าสู่ระบบถือว่าคุณยอมรับเงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัว
          </p>
        </motion.div>
      </div>
    </div>
  );
}
