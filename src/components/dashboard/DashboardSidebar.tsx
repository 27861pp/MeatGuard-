import { Link, NavLink } from "react-router-dom";
import {
  Activity,
  ChefHat,
  Cpu,
  Gauge,
  Home,
  LineChart,
  LogOut,
  Refrigerator,
  ShieldCheck,
  Thermometer,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { useLiveData } from "@/contexts/LiveDataContext";
import { DeviceBattery } from "@/components/dashboard/DeviceBattery";
import type { ConnectionStatus } from "@/hooks/useSensorData";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  end?: boolean;
}

const MONITOR_NAV: NavItem[] = [
  { to: "/dashboard", icon: Gauge, label: "ภาพรวม", end: true },
  { to: "/sensors", icon: Thermometer, label: "เซ็นเซอร์" },
  { to: "/realtime", icon: LineChart, label: "กราฟเรียลไทม์" },
  { to: "/analysis", icon: Activity, label: "ผลวิเคราะห์" },
];

const KNOWLEDGE_NAV: NavItem[] = [
  { to: "/safety", icon: ShieldCheck, label: "ความปลอดภัย" },
  { to: "/how-it-works", icon: Cpu, label: "หลักการทำงาน" },
  { to: "/storage", icon: Refrigerator, label: "การเก็บรักษา" },
  { to: "/consumption", icon: ChefHat, label: "คำแนะนำบริโภค" },
  { to: "/recipes", icon: Utensils, label: "เมนูอาหาร · วิดีโอ" },
];

const STATUS_META: Record<ConnectionStatus, { label: string; cls: string }> = {
  live: { label: "ONLINE · บอร์ดเชื่อมต่อ", cls: "text-safe" },
  connecting: { label: "กำลังเชื่อมต่อ…", cls: "text-muted-foreground" },
  offline: { label: "OFFLINE · ไม่พบบอร์ด", cls: "text-meat" },
};

export function DashboardSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth();
  const { status, latest, admin } = useLiveData();
  const meta = STATUS_META[status];
  const initial = (user?.displayName || user?.email || "U").charAt(0).toUpperCase();

  const renderItem = (n: NavItem) => (
    <NavLink
      key={n.to}
      to={n.to}
      end={n.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
          isActive
            ? "border border-white/10 bg-white/[0.06] text-foreground"
            : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
        )
      }
    >
      <n.icon className="h-4 w-4 shrink-0" />
      {n.label}
    </NavLink>
  );

  return (
    <div className="flex h-full flex-col gap-4 p-5">
      <Link to="/dashboard" className="px-1" onClick={onNavigate}>
        <Logo />
      </Link>

      {/* board connection + box battery */}
      <div className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            {status === "live" && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-safe opacity-75" />
            )}
            <span
              className={cn(
                "relative inline-flex h-2.5 w-2.5 rounded-full",
                status === "live" ? "bg-safe" : status === "offline" ? "bg-meat" : "bg-muted-foreground"
              )}
            />
          </span>
          <span className={cn("truncate text-xs font-semibold", meta.cls)}>{meta.label}</span>
        </span>
        <span className="flex items-center gap-1.5">
          {admin.config.manual && (
            <span className="rounded-full border border-warn/30 bg-warn/10 px-2 py-0.5 text-[9px] font-bold text-warn">
              MANUAL
            </span>
          )}
          <DeviceBattery percent={latest?.battery} online={status === "live"} />
        </span>
      </div>

      {/* nav */}
      <nav className="no-scrollbar flex flex-1 flex-col gap-1 overflow-y-auto">
        <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Monitor
        </p>
        {MONITOR_NAV.map(renderItem)}

        <p className="px-3 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          ความรู้
        </p>
        {KNOWLEDGE_NAV.map(renderItem)}

        <p className="px-3 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          ทั่วไป
        </p>
        {renderItem({ to: "/home", icon: Home, label: "หน้าสรุป" })}
        {/* หน้า Admin ไม่แสดงในเมนู — เข้าโดยตรงที่ #/admin เท่านั้น */}
      </nav>

      <div className="space-y-3">
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
