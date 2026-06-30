/**
 * MEAT GUARD — freshness analysis engine.
 *
 * Pure, deterministic functions that turn raw sensor values into a
 * food-safety verdict. Kept framework-free so the exact same logic can
 * later run on an ESP32 / Cloud Function without modification.
 */

export type QualityLevel = "fresh" | "warning" | "spoiled";

export interface SensorReading {
  /** Celsius */
  temperature: number;
  /** Relative humidity, % */
  humidity: number;
  /** Ammonia, ppm */
  nh3: number;
  /** Hydrogen sulfide, ppm */
  h2s: number;
  /** epoch ms */
  timestamp: number;
}

export interface QualityVerdict {
  level: QualityLevel;
  /** 0–100, higher = fresher */
  score: number;
  label: string;
  labelEn: string;
  emoji: string;
  message: string;
  advice: string;
}

/**
 * Safety thresholds. Values are illustrative defaults derived from common
 * spoilage indicators for chilled meat; calibrate against your own sensor +
 * meat type before production use.
 */
export const THRESHOLDS = {
  nh3: { fresh: 5, warning: 12 }, // ppm
  h2s: { fresh: 0.5, warning: 1.5 }, // ppm
  temperature: { fresh: 4, warning: 10 }, // °C (cold-chain)
} as const;

export const SENSOR_RANGE = {
  temperature: { min: -20, max: 40, unit: "°C" },
  humidity: { min: 0, max: 100, unit: "%" },
  nh3: { min: 0, max: 30, unit: "ppm" },
  h2s: { min: 0, max: 5, unit: "ppm" },
} as const;

/** Map an individual metric to a 0–100 sub-score (100 = ideal). */
function metricScore(value: number, fresh: number, warning: number): number {
  if (value <= fresh) return 100;
  if (value >= warning * 1.6) return 0;
  if (value <= warning) {
    // linear 100 -> 55 across the fresh..warning band
    return 100 - ((value - fresh) / (warning - fresh)) * 45;
  }
  // 55 -> 0 across warning..(warning*1.6)
  return 55 - ((value - warning) / (warning * 0.6)) * 55;
}

/**
 * Classify a reading. Gas concentrations (NH3 + H2S) dominate the verdict
 * because they are the most reliable early indicators of microbial spoilage;
 * temperature acts as a risk multiplier.
 */
export function analyzeReading(r: SensorReading): QualityVerdict {
  const nh3Score = metricScore(r.nh3, THRESHOLDS.nh3.fresh, THRESHOLDS.nh3.warning);
  const h2sScore = metricScore(r.h2s, THRESHOLDS.h2s.fresh, THRESHOLDS.h2s.warning);
  const tempScore = metricScore(
    r.temperature,
    THRESHOLDS.temperature.fresh,
    THRESHOLDS.temperature.warning
  );

  // Gases weighted highest, temperature as supporting signal.
  const score = Math.round(nh3Score * 0.42 + h2sScore * 0.42 + tempScore * 0.16);

  let level: QualityLevel;
  if (
    r.nh3 <= THRESHOLDS.nh3.fresh &&
    r.h2s <= THRESHOLDS.h2s.fresh &&
    score >= 75
  ) {
    level = "fresh";
  } else if (r.nh3 >= THRESHOLDS.nh3.warning || r.h2s >= THRESHOLDS.h2s.warning || score < 45) {
    level = "spoiled";
  } else {
    level = "warning";
  }

  return { ...VERDICT_META[level], level, score };
}

const VERDICT_META: Record<QualityLevel, Omit<QualityVerdict, "level" | "score">> = {
  fresh: {
    label: "สด ปลอดภัย",
    labelEn: "FRESH",
    emoji: "🟢",
    message: "สามารถบริโภคได้อย่างปลอดภัย",
    advice: "เนื้อสัตว์อยู่ในสภาพดี เก็บต่อในอุณหภูมิ 0–4°C เพื่อคงความสด",
  },
  warning: {
    label: "เฝ้าระวัง",
    labelEn: "WARNING",
    emoji: "🟡",
    message: "ควรนำไปปรุงอาหารโดยเร็ว",
    advice: "เริ่มพบสัญญาณการเสื่อมคุณภาพ ควรปรุงให้สุกทั่วถึงที่ ≥ 75°C ทันที",
  },
  spoiled: {
    label: "เน่าเสีย",
    labelEn: "SPOILED",
    emoji: "🔴",
    message: "ไม่แนะนำให้บริโภค",
    advice: "ตรวจพบสารจากการเน่าเสียในระดับสูง เพื่อความปลอดภัยควรทิ้งทันที",
  },
};

/** Per-metric status used for card colour coding. */
export type MetricStatus = "good" | "warn" | "bad";

export function metricStatus(
  key: keyof typeof THRESHOLDS,
  value: number
): MetricStatus {
  const t = THRESHOLDS[key];
  if (value <= t.fresh) return "good";
  if (value <= t.warning) return "warn";
  return "bad";
}

/** Humidity has no hard safety threshold — treat extremes as "warn". */
export function humidityStatus(value: number): MetricStatus {
  if (value >= 45 && value <= 80) return "good";
  if (value > 88 || value < 30) return "bad";
  return "warn";
}
