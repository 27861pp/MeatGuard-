import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSensorData, type ConnectionStatus } from "@/hooks/useSensorData";
import type { SensorReading } from "@/lib/analysis";

/**
 * App-level live data store.
 *
 * - `latest`        : freshest reading from the board (meat/live or meat/latest)
 * - `minuteHistory` : the board's 1-minute log (meat/history)
 * - `liveBuffer`    : client-side per-second rolling buffer (for the
 *                     second-by-second chart and the 10-minute analysis).
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
  const { latest, history, status, lastUpdate } = useSensorData(enabled);
  const [liveBuffer, setLiveBuffer] = useState<SensorReading[]>([]);

  const latestRef = useRef(latest);
  latestRef.current = latest;
  const statusRef = useRef(status);
  statusRef.current = status;

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
      value={{ latest, minuteHistory: history, liveBuffer, status, lastUpdate }}
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
