import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Share, SquarePlus, X } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";

/**
 * "Install app" call-to-action shown on the app home.
 * - Chromium → triggers the native A2HS prompt.
 * - iOS → shows the manual Share → Add to Home Screen steps.
 * - Hidden entirely once the app is already installed / running standalone.
 */
export function InstallApp() {
  const { canInstall, isStandalone, isIOS, promptInstall } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [showIOS, setShowIOS] = useState(false);

  if (isStandalone || dismissed) return null;
  // Only render when we can actually install (Chromium) or can guide (iOS).
  if (!canInstall && !isIOS) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-safe/25 bg-gradient-to-br from-safe/10 to-transparent p-4"
    >
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:bg-white/10 hover:text-foreground"
        aria-label="ปิด"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.05] text-safe">
          <Download className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1 pr-6">
          <p className="text-sm font-bold">ติดตั้ง MEAT GUARD เป็นแอป</p>
          <p className="text-xs text-muted-foreground">
            เพิ่มลงหน้าจอโฮม เปิดใช้งานเร็ว เต็มจอ เหมือนแอปจริง
          </p>
        </div>
        <button
          onClick={() => (isIOS ? setShowIOS((v) => !v) : promptInstall())}
          className="shrink-0 rounded-xl bg-safe px-4 py-2 text-sm font-semibold text-accent-foreground shadow-glow-safe transition-all hover:brightness-110 active:scale-95"
        >
          ติดตั้ง
        </button>
      </div>

      <AnimatePresence>
        {isIOS && showIOS && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-3 space-y-2 border-t border-white/10 pt-3 text-sm text-muted-foreground"
          >
            <p className="flex items-center gap-2">
              <Share className="h-4 w-4 text-safe" /> 1. แตะปุ่ม “แชร์” ในแถบเบราว์เซอร์
            </p>
            <p className="flex items-center gap-2">
              <SquarePlus className="h-4 w-4 text-safe" /> 2. เลือก “เพิ่มไปยังหน้าจอโฮม (Add to Home Screen)”
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
