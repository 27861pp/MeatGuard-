import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { ConnBadge } from "@/components/dashboard/ConnBadge";
import { useLiveData } from "@/contexts/LiveDataContext";

/**
 * Shell for all monitor pages: desktop sidebar, mobile drawer + topbar, and
 * the routed page content via <Outlet />.
 */
export default function MonitorLayout() {
  const [drawer, setDrawer] = useState(false);
  const location = useLocation();
  const { status } = useLiveData();

  useEffect(() => setDrawer(false), [location.pathname]);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[280px_1fr]">
      {/* ── desktop sidebar ── */}
      <aside className="sticky top-0 hidden h-screen border-r border-white/10 bg-background/40 backdrop-blur-xl lg:block">
        <DashboardSidebar />
      </aside>

      {/* ── mobile drawer ── */}
      <AnimatePresence>
        {drawer && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawer(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto border-r border-white/10 bg-background lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >
              <button
                onClick={() => setDrawer(false)}
                className="absolute right-3 top-4 z-10 grid h-9 w-9 place-items-center rounded-lg glass"
                aria-label="ปิดเมนู"
              >
                <X className="h-4 w-4" />
              </button>
              <DashboardSidebar onNavigate={() => setDrawer(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── content ── */}
      <div className="min-w-0">
        {/* mobile topbar */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-background/70 px-4 py-3 backdrop-blur-xl lg:hidden">
          <button
            onClick={() => setDrawer(true)}
            className="grid h-10 w-10 place-items-center rounded-xl glass"
            aria-label="เปิดเมนู"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Logo size={28} />
          <ConnBadge status={status} compact />
        </div>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
