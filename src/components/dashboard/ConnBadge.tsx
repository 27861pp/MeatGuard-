import type { ConnectionStatus } from "@/hooks/useSensorData";
import { cn } from "@/lib/utils";

/** ONLINE / OFFLINE / connecting pill for headers and toolbars. */
export function ConnBadge({
  status,
  compact = false,
}: {
  status: ConnectionStatus;
  compact?: boolean;
}) {
  const map = {
    live: { label: "ONLINE", cls: "border-safe/30 bg-safe/10 text-safe", dot: "bg-safe" },
    connecting: {
      label: "เชื่อมต่อ…",
      cls: "border-white/10 bg-white/[0.04] text-muted-foreground",
      dot: "bg-muted-foreground",
    },
    offline: { label: "OFFLINE", cls: "border-meat/30 bg-meat/10 text-meat", dot: "bg-meat" },
  }[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-bold",
        compact ? "px-2.5 py-1 text-[10px]" : "px-3 py-1.5 text-xs",
        map.cls
      )}
    >
      <span className="relative flex h-2 w-2">
        {status === "live" && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-safe opacity-75" />
        )}
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", map.dot)} />
      </span>
      {map.label}
    </span>
  );
}
