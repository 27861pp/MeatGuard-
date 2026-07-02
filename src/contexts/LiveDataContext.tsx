import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSensorData, type ConnectionStatus } from "@/hooks/useSensorData";
import {
  applyAdmin,
  useAdminConfig,
  type AdminConfig,
} from "@/hooks/useAdminConfig";
import type { SensorReading } from "@/lib/analysis";

/**
 * App-level live data store.
 *
 * - `latest`        : freshest reading (after admin overrides are applied)
 * - `minuteHistory` : the board's 1-minute log (meat/history)
 * - `liveBuffer`    : client-side per-second rolling buffer (for the
 *                     second-by-second chart and the 10-minute analysis).
 * - `admin`         : manual-override config from meat/admin + save()
 *
 * Lives at the App level (not per page) so the buffer keeps filling while the
 * user navigates between pages — a running 10-minute analysis survives.
 */

const BUFFER_MAX = 1500; // ~25 minutes at 1 point/second

interface LiveDataValue {
  latest: SensorReading | null;
  minuteHistory: SensorReading[];
  liveBuffer: SensorReading[];
  status: ConnectionStatus;
  lastUpdate: number;
  admin: {
    config: AdminConfig;
    save: (patch: Partial<AdminConfig>) => Promise<void>;
    loaded: boolean;
  };
}

const LiveDataContext = createContext<LiveDataValue | undefined>(undefined);

export function LiveDataProvider({
  enabled,
  children,
}: {
  /** subscribe only when a user is signed in */
  enabled: boolean;
  children: ReactNode;
}) {
  const { latest: rawLatest, history, status: rawStatus, lastUpdate } =
    useSensorData(enabled);
  const { config: adminConfig, save: saveAdmin, loaded: adminLoaded } =
    useAdminConfig(enabled);
  const [liveBuffer, setLiveBuffer] = useState<SensorReading[]>([]);

  // Manual overrides (force online/offline, force verdict, pinned values)
  // applied once here so every page sees the same effective state.
  const effective = useMemo(
    () => applyAdmin(adminConfig, rawLatest, rawStatus),
    [adminConfig, rawLatest, rawStatus]
  );

  const latestRef = useRef(effective.latest);
  latestRef.current = effective.latest;
  const statusRef = useRef(effective.status);
  statusRef.current = effective.status;

  // 1-second ticker: append the current best-known reading while the board is
  // online. When the board goes offline the buffer simply stops growing.
  useEffect(() => {
    if (!enabled) {
      setLiveBuffer([]);
      return;
    }
    const id = window.setInterval(() => {
      const cur = latestRef.current;
      if (!cur || statusRef.current !== "live") return;
      setLiveBuffer((b) =>
        [...b, { ...cur, timestamp: Date.now() }].slice(-BUFFER_MAX)
      );
    }, 1000);
    return () => window.clearInterval(id);
  }, [enabled]);

  return (
    <LiveDataContext.Provider
      value={{
        latest: effective.latest,
        minuteHistory: history,
        liveBuffer,
        status: effective.status,
        lastUpdate,
        admin: { config: adminConfig, save: saveAdmin, loaded: adminLoaded },
      }}
    >
      {children}
    </LiveDataContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLiveData() {
  const ctx = useContext(LiveDataContext);
  if (!ctx) throw new Error("useLiveData must be used within a LiveDataProvider");
  return ctx;
}
