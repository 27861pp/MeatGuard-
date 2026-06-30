/**
 * Local sensor simulator used in DEMO MODE.
 *
 * Produces a believable random-walk so the dashboard, charts and analysis
 * engine all behave exactly as they would with a real ESP32 feed. The walk
 * slowly drifts upward (spoilage) then resets, so users see Fresh → Warning →
 * Spoiled cycles without waiting hours.
 */
import type { SensorReading } from "./analysis";

export interface SimState {
  temperature: number;
  humidity: number;
  nh3: number;
  h2s: number;
  /** hidden "spoilage progress" driver, 0..1 */
  decay: number;
}

export function initialSimState(): SimState {
  return { temperature: 2.5, humidity: 68, nh3: 2.4, h2s: 0.15, decay: 0.05 };
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
/** Smooth pseudo-noise without Math.random dependency on first paint. */
const jitter = (amp: number) => (Math.random() - 0.5) * 2 * amp;

export function nextSimState(prev: SimState): SimState {
  // advance decay; occasionally "replace the sample" with a fresh batch
  let decay = prev.decay + 0.012 + Math.random() * 0.01;
  if (decay > 1.05) decay = 0.02; // new fresh sample placed in the chamber

  const temperature = clamp(prev.temperature + jitter(0.25) + decay * 0.04, -2, 16);
  const humidity = clamp(prev.humidity + jitter(1.2), 45, 92);

  // gases rise non-linearly with decay
  const nh3 = clamp(prev.nh3 * 0.7 + (1.5 + decay * decay * 16) * 0.3 + jitter(0.3), 0, 30);
  const h2s = clamp(prev.h2s * 0.7 + (0.1 + decay * decay * 2.1) * 0.3 + jitter(0.04), 0, 5);

  return { temperature, humidity, nh3, h2s, decay };
}

export function stateToReading(s: SimState, timestamp: number): SensorReading {
  return {
    temperature: Math.round(s.temperature * 10) / 10,
    humidity: Math.round(s.humidity),
    nh3: Math.round(s.nh3 * 10) / 10,
    h2s: Math.round(s.h2s * 100) / 100,
    timestamp,
  };
}

/** Seed a history array so charts aren't empty on first render. */
export function seedHistory(points: number, now: number): SensorReading[] {
  let s = initialSimState();
  const out: SensorReading[] = [];
  for (let i = points; i > 0; i--) {
    s = nextSimState(s);
    out.push(stateToReading(s, now - i * 3000));
  }
  return out;
}
