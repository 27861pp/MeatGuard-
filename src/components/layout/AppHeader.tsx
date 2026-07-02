import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

interface AppHeaderProps {
  title: React.ReactNode;
  subtitle?: string;
  /** path for the back button (defaults to the dashboard) */
  back?: string;
}

/** Compact sticky header for in-app pages (mobile-first). */
export function AppHeader({ title, subtitle, back = "/dashboard" }: AppHeaderProps) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/70 backdrop-blur-xl">
      <div className="container flex items-center gap-3 py-3.5">
        <button
          onClick={() => navigate(back)}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl glass transition-colors hover:bg-white/[0.08]"
          aria-label="ย้อนกลับ"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-extrabold leading-tight">{title}</h1>
          {subtitle && (
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl glass transition-colors hover:bg-white/[0.08]"
          aria-label="แดชบอร์ด"
        >
          <Home className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
