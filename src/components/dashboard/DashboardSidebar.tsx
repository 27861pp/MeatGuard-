import { Link } from "react-router-dom";
import {
  Activity,
  Gauge,
  Home,
  LineChart,
  LogOut,
  Settings,
  ShieldCheck,
  Thermometer,
  Utensils,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import type { ConnectionStatus } from "@/hooks/useSensorData";
import { cn } from "@/lib/utils";

const NAV = [
  { icon: Gauge, label: "ภาพรวม", href: "#overview", active: true },
  { icon: Thermometer, label: "เซ็นเซอร์", href: "#sensors" },
  { icon: LineChart, label: "กราฟเรียลไทม์", href: "#charts" },
  { icon: Activity, label: "ผลวิเคราะห์", href: "#analysis" },
];

const STATUS_META: Record<ConnectionStatus, { label: string; cls: string }> = {
  live: { label: "Live · Firebase", cls: "text-safe" },
  waiting: { label: "รอข้อมูลเซ็นเซอร์", cls: "text-warn" },
  demo: { label: "Demo Mode", cls: "text-warn" },
  connecting: { label: "กำลังเชื่อมต่อ…", cls: "text-muted-foreground" },
  offline: { label: "ออฟไลน์", cls: "text-meat" },
};

interface Props {
  status: ConnectionStatus;
  onNavigate?: () => void;
}

export function DashboardSidebar({ status, onNavigate }: Props) {
  const { user, logout } = useAuth();
  const meta = STATUS_META[status];
  const initial = (user?.displayName || user?.email || "U").charAt(0).toUpperCase();

  return (
    <div className="flex h-full flex-col gap-6 p-5">
      <Link to="/" className="px-1">
        <Logo />
      </Link>

      {/* connection pill */}
      <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
        <span className="relative flex h-2.5 w-2.5">
          {status !== "offline" && (
            <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", status === "live" ? "bg-safe" : "bg-warn")} />
          )}
          <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", status === "live" ? "bg-safe" : status === "offline" ? "bg-meat" : "bg-warn")} />
        </span>
        <span className={cn("text-xs font-semibold", meta.cls)}>{meta.label}</span>
      </div>

      {/* nav */}
      <nav className="flex flex-col gap-1">
        <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Monitor
        </p>
        {NAV.map((n) => (
          <a
            key={n.href}
            href={n.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              n.active
                ? "border border-white/10 bg-white/[0.06] text-foreground"
                : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
            )}
          >
            <n.icon className="h-4 w-4" />
            {n.label}
          </a>
        ))}

        <p className="px-3 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          ทั่วไป
        </p>
        <Link
          to="/home"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
        >
          <Home className="h-4 w-4" /> หน้าหลัก
        </Link>
        <Link
          to="/recipes"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
        >
          <Utensils className="h-4 w-4" /> เมนูแนะนำ
        </Link>
        <button className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground">
          <Settings className="h-4 w-4" /> ตั้งค่า
        </button>
      </nav>

      <div className="mt-auto space-y-3">
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName ?? "user"}
              className="h-9 w-9 rounded-full object-cover ring-2 ring-white/10"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-meat to-safe text-sm font-bold text-white">
              {initial}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user?.displayName ?? "ผู้ใช้งาน"}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={() => logout()}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-meat/30 hover:bg-meat/10 hover:text-meat"
        >
          <LogOut className="h-4 w-4" /> ออกจากระบบ
        </button>

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
          <ShieldCheck className="h-3 w-3" /> Protected by Firebase Auth
        </div>
      </div>
    </div>
  );
}
