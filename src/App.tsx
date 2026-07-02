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
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PageLoader } from "@/components/PageLoader";
import { useAuth } from "@/contexts/AuthContext";
import { LiveDataProvider } from "@/contexts/LiveDataContext";

const Home = lazy(() => import("@/pages/Home"));
const Login = lazy(() => import("@/pages/Login"));
const AppHome = lazy(() => import("@/pages/AppHome"));
const Recipes = lazy(() => import("@/pages/Recipes"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const MonitorLayout = lazy(() => import("@/components/layout/MonitorLayout"));
const Overview = lazy(() => import("@/pages/monitor/Overview"));
const Sensors = lazy(() => import("@/pages/monitor/Sensors"));
const Realtime = lazy(() => import("@/pages/monitor/Realtime"));
const Analysis = lazy(() => import("@/pages/monitor/Analysis"));

const SafetyPage = lazy(() => import("@/pages/knowledge/Safety"));
const HowItWorksPage = lazy(() => import("@/pages/knowledge/HowItWorksPage"));
const StoragePage = lazy(() => import("@/pages/knowledge/StoragePage"));
const ConsumptionPage = lazy(() => import("@/pages/knowledge/ConsumptionPage"));

/**
 * Root: logged-in users go straight to the dashboard (sign in once → monitor).
 * A "?section=..." link still shows the landing so the marketing sections stay
 * reachable.
 */
function RootRoute() {
  const { user, loading } = useAuth();
  const [params] = useSearchParams();
  if (loading) return <PageLoader />;
  if (user && !params.get("section")) return <Navigate to="/dashboard" replace />;
  return <Home />;
}

export default function App() {
  const location = useLocation();
  const { user, loading } = useAuth();

  // Marketing navbar/footer only on the public landing (and 404).
  const showChrome =
    location.pathname === "/" || location.pathname === "/404";

  return (
    <LiveDataProvider enabled={!!user && !loading}>
      <div className="flex min-h-screen flex-col">
        {showChrome && <Navbar />}

        <main className="flex-1">
          <Suspense fallback={<PageLoader />}>
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<RootRoute />} />
                <Route path="/login" element={<Login />} />

                {/* ── monitor app (sidebar shell) ── */}
                <Route
                  element={
                    <ProtectedRoute>
                      <MonitorLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/dashboard" element={<Overview />} />
                  <Route path="/sensors" element={<Sensors />} />
                  <Route path="/realtime" element={<Realtime />} />
                  <Route path="/analysis" element={<Analysis />} />
                </Route>

                {/* ── standalone in-app pages ── */}
                <Route
                  path="/home"
                  element={
                    <ProtectedRoute>
                      <AppHome />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recipes"
                  element={
                    <ProtectedRoute>
                      <Recipes />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/safety"
                  element={
                    <ProtectedRoute>
                      <SafetyPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/how-it-works"
                  element={
                    <ProtectedRoute>
                      <HowItWorksPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/storage"
                  element={
                    <ProtectedRoute>
                      <StoragePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/consumption"
                  element={
                    <ProtectedRoute>
                      <ConsumptionPage />
                    </ProtectedRoute>
                  }
                />

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
