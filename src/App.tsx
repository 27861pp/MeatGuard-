import { Suspense, lazy } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageLoader } from "@/components/PageLoader";
import { LiveDataProvider } from "@/contexts/LiveDataContext";

const Home = lazy(() => import("@/pages/Home"));
const AppHome = lazy(() => import("@/pages/AppHome"));
const Recipes = lazy(() => import("@/pages/Recipes"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const MonitorLayout = lazy(() => import("@/components/layout/MonitorLayout"));
const Overview = lazy(() => import("@/pages/monitor/Overview"));
const Sensors = lazy(() => import("@/pages/monitor/Sensors"));
const Realtime = lazy(() => import("@/pages/monitor/Realtime"));
const Analysis = lazy(() => import("@/pages/monitor/Analysis"));
const Admin = lazy(() => import("@/pages/monitor/Admin"));

const SafetyPage = lazy(() => import("@/pages/knowledge/Safety"));
const HowItWorksPage = lazy(() => import("@/pages/knowledge/HowItWorksPage"));
const StoragePage = lazy(() => import("@/pages/knowledge/StoragePage"));
const ConsumptionPage = lazy(() => import("@/pages/knowledge/ConsumptionPage"));

/**
 * Root: everyone goes straight to the dashboard — no login required for
 * viewing. A "?section=..." link still shows the landing so the marketing
 * sections stay reachable.
 */
function RootRoute() {
  const [params] = useSearchParams();
  if (!params.get("section")) return <Navigate to="/dashboard" replace />;
  return <Home />;
}

export default function App() {
  const location = useLocation();

  // Marketing navbar/footer only on the public landing (and 404).
  const showChrome =
    location.pathname === "/" || location.pathname === "/404";

  return (
    <LiveDataProvider enabled>
      <div className="flex min-h-screen flex-col">
        {showChrome && <Navbar />}

        <main className="flex-1">
          <Suspense fallback={<PageLoader />}>
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<RootRoute />} />
                {/* ไม่ใช้ Authentication แล้ว — ลิงก์เก่า /login พาเข้าแดชบอร์ดเลย */}
                <Route path="/login" element={<Navigate to="/dashboard" replace />} />

                {/* ── monitor app (sidebar shell) — เปิดดูได้เลย ไม่ต้อง login ── */}
                <Route element={<MonitorLayout />}>
                  <Route path="/dashboard" element={<Overview />} />
                  <Route path="/sensors" element={<Sensors />} />
                  <Route path="/realtime" element={<Realtime />} />
                  <Route path="/analysis" element={<Analysis />} />
                  {/* Admin ซ่อนจากเมนู — เข้าตรงที่ #/admin (ไม่มี login แล้ว) */}
                  <Route path="/admin" element={<Admin />} />
                </Route>

                {/* ── standalone in-app pages ── */}
                <Route path="/home" element={<AppHome />} />
                <Route path="/recipes" element={<Recipes />} />
                <Route path="/safety" element={<SafetyPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/storage" element={<StoragePage />} />
                <Route path="/consumption" element={<ConsumptionPage />} />

                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </AnimatePresence>
          </Suspense>
        </main>

        {showChrome && <Footer />}
      </div>
    </LiveDataProvider>
  );
}
