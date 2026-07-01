import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from "firebase/auth";
import { auth, DEMO_MODE, googleProvider } from "@/lib/firebase";

/** Popups are unreliable on mobile/in-app browsers — prefer the redirect flow there. */
function isMobileBrowser() {
  if (typeof navigator === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|Mobile|Opera Mini|IEMobile/i.test(
    navigator.userAgent
  );
}

export interface AppUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  demo: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const DEMO_USER: AppUser = {
  uid: "demo-user",
  displayName: "Demo Inspector",
  email: "demo@meatguard.io",
  photoURL: "",
};

const DEMO_KEY = "meatguard.demoSession";

function toAppUser(u: User): AppUser {
  return {
    uid: u.uid,
    displayName: u.displayName,
    email: u.email,
    photoURL: u.photoURL,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (DEMO_MODE || !auth) {
      // Restore a simulated session so refresh keeps you logged in.
      const persisted = sessionStorage.getItem(DEMO_KEY);
      setUser(persisted ? (JSON.parse(persisted) as AppUser) : null);
      setLoading(false);
      return;
    }
    // Complete any pending redirect-based sign-in (mobile flow).
    getRedirectResult(auth).catch((e) => {
      // eslint-disable-next-line no-console
      console.error("[MEAT GUARD] redirect result error", e);
    });

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u ? toAppUser(u) : null);
      setLoading(false);
    });
    return unsub;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    if (DEMO_MODE || !auth || !googleProvider) {
      // Simulate the popup latency for a realistic feel.
      await new Promise((r) => setTimeout(r, 900));
      sessionStorage.setItem(DEMO_KEY, JSON.stringify(DEMO_USER));
      setUser(DEMO_USER);
      return;
    }

    // On mobile, go straight to the redirect flow — popups are blocked or
    // give a poor UX in most mobile / in-app browsers.
    if (isMobileBrowser()) {
      await signInWithRedirect(auth, googleProvider);
      return;
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      GoogleAuthProvider.credentialFromResult(result);
    } catch (e) {
      const code = (e as { code?: string }).code ?? "";
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        return; // user dismissed — not a real error
      }
      // Popup was blocked or unsupported → fall back to a full-page redirect.
      if (
        code === "auth/popup-blocked" ||
        code === "auth/operation-not-supported-in-this-environment"
      ) {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectErr) {
          // eslint-disable-next-line no-console
          console.error("[MEAT GUARD] redirect sign-in error", redirectErr);
        }
      }
      setError("เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      // eslint-disable-next-line no-console
      console.error("[MEAT GUARD] sign-in error", e);
    }
  }, []);

  const logout = useCallback(async () => {
    if (DEMO_MODE || !auth) {
      sessionStorage.removeItem(DEMO_KEY);
      setUser(null);
      return;
    }
    await signOut(auth);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, demo: DEMO_MODE, error, signInWithGoogle, logout }),
    [user, loading, error, signInWithGoogle, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
