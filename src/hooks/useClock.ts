import { useEffect, useState } from "react";

/** Ticks every second; returns the current Date plus formatted Thai strings. */
export function useClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const hm = now.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
  const seconds = now.toLocaleTimeString("th-TH", { second: "2-digit" });
  const date = now.toLocaleDateString("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return { now, time, hm, seconds, date };
}
