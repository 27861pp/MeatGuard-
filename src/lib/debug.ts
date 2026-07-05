/**
 * Lightweight debug logger for verifying the real-time data flow.
 *
 * Off by default in production. Turn on from the browser console with:
 *   localStorage.setItem("mgDebug", "1")   // then reload
 * Always on during local development (import.meta.env.DEV).
 */
function enabled(): boolean {
  try {
    if (import.meta.env.DEV) return true;
    return localStorage.getItem("mgDebug") === "1";
  } catch {
    return false;
  }
}

export function mgDebug(label: string, data: Record<string, unknown>): void {
  if (!enabled()) return;
  // eslint-disable-next-line no-console
  console.debug(
    `%c[MG] ${label}`,
    "color:#22c55e;font-weight:bold",
    { at: new Date().toISOString(), ...data }
  );
}
