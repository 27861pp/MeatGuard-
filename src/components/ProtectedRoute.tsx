import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PageLoader } from "@/components/PageLoader";

/**
 * Guards routes that require authentication. While the auth state is
 * resolving we show the loader; unauthenticated users are redirected to
 * /login and returned here after a successful sign-in.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader label="กำลังตรวจสอบสิทธิ์การเข้าใช้งาน…" />;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
