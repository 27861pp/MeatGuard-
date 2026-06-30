import { Suspense, lazy } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PageLoader } from "@/components/PageLoader";
import { useAuth } from "@/contexts/AuthContext";

const Home = lazy(() => import("@/pages/Home"));
const Login = lazy(() => import("@/pages/Login"));
const AppHome = lazy(() => import("@/pages/AppHome"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Recipes = lazy(() => import("@/pages/Recipes"));
const NotFound = lazy(() => import("@/pages/NotFound"));

/** In-app screens render without the marketing navbar/footer chrome. */
const APP_ROUTES = ["/home", "/dashboard", "/recipes"];

/**
 * Root: logged-in users land on the app home (so re-opening the app skips the
 * marketing page). A hash link (e.g. /#safety) still shows the landing so the
 * knowledge sections stay reachable from the app.
 */
function RootRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoader />;
  if (user && !location.hash) return <Navigate to="/home" replace />;
  return <Home />;
}

export default function App() {
  const location = useLocation();
  const isAuthScreen = location.pathname === "/login";
  const isAppRoute = APP_ROUTES.includes(location.pathname);
  const hideChrome = isAuthScreen || isAppRoute;

  return (
    <div className="flex min-h-screen flex-col">
      {!hideChrome && <Navbar />}

      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<RootRoute />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <AppHome />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
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
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>

      {!hideChrome && <Footer />}
    </div>
  );
}
