import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  RotateCcw,
  Save,
  SlidersHorizontal,
  ToggleLeft,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useLiveData } from "@/contexts/LiveDataContext";
import {
  ADMIN_DEFAULTS,
  type AdminConnection,
  type AdminStatus,
} from "@/hooks/useAdminConfig";
import { analyzeReading } from "@/lib/analysis";
import { PageHead } from "@/components/PageHead";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConnBadge } from "@/components/dashboard/ConnBadge";
import { cn } from "@/lib/utils";

const CONNECTION_OPTIONS: { value: AdminConnection; label: string }[] = [
  { value: "auto", label: "อัตโนมัติ" },
  { value: "online", label: "บังคับ ONLINE" },
  { value: "offline", label: "บังคับ OFFLINE" },
];

const STATUS_OPTIONS: { value: AdminStatus; label: string; cls?: string }[] = [
  { value: "auto", label: "อัตโนมัติ" },
  { value: "FRESH", label: "🟢 สด", cls: "data-[on=true]:bg-safe/15 data-[on=true]:text-safe" },
  { value: "WARNING", label: "🟡 ควรระวัง", cls: "data-[on=true]:bg-warn/15 data-[on=true]:text-warn" },
  { value: "SPOILED", label: "🔴 เน่า", cls: "data-[on=true]:bg-meat/15 data-[on=true]:text-meat" },
];

const VALUE_FIELDS = [
  { key: "temp", label: "อุณหภูมิ (°C)", step: 0.1 },
  { key: "humidity", label: "ความชื้น (%)", step: 1 },
  { key: "nh3", label: "NH₃ (ppm)", step: 0.1 },
  { key: "h2s", label: "H₂S (ppm)", step: 0.05 },
  { key: "battery", label: "แบตเตอรี่ (%)", step: 1 },
] as const;

type ValueKey = (typeof VALUE_FIELDS)[number]["key"];

export default function Admin() {
  const { latest, status, admin } = useLiveData();
  const { config, save, loaded } = admin;

  // local drafts for the numeric inputs (applied with the save button)
  const [draft, setDraft] = useState<Record<ValueKey, string>>({
    temp: "", humidity: "", nh3: "", h2s: "", battery: "",
  });
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    if (!loaded) return;
    setDraft({
      temp: String(config.temp),
      humidity: String(config.humidity),
      nh3: String(config.nh3),
      h2s: String(config.h2s),
      battery: String(config.battery),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  const verdict = useMemo(() => (latest ? analyzeReading(latest) : null), [latest]);

  const applyValues = async () => {
    const num = (s: string, fallback: number) => {
      const n = parseFloat(s);
      return Number.isFinite(n) ? n : fallback;
    };
    await save({
      temp: num(draft.temp, config.temp),
      humidity: num(draft.humidity, config.humidity),
      nh3: num(draft.nh3, config.nh3),
      h2s: num(draft.h2s, config.h2s),
      battery: num(draft.battery, config.battery),
      useValues: true,
      manual: true,
    });
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1800);
  };

  const resetAll = async () => {
    await save({ ...ADMIN_DEFAULTS });
    setDraft({
      temp: String(ADMIN_DEFAULTS.temp),
      humidity: String(ADMIN_DEFAULTS.humidity),
      nh3: String(ADMIN_DEFAULTS.nh3),
      h2s: String(ADMIN_DEFAULTS.h2s),
      battery: String(ADMIN_DEFAULTS.battery),
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <PageHead
        title={
          <>
            Admin · <span className="text-gradient">ระบบแมนนวล</span>
          </>
        }
        subtitle="ควบคุมการแสดงผลด้วยตัวเอง เผื่อกรณีค่าจากเซ็นเซอร์เพี้ยน — มีผลกับทุกหน้าจอทันที"
        right={
          <>
            <ConnBadge status={status} />
            {verdict && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold">
                {verdict.emoji} {verdict.labelEn}
              </span>
            )}
          </>
        }
      />

      <div className="space-y-5">
        {/* master switch */}
        <Card
          className={cn(
            "glass-strong transition-colors",
            config.manual && "border-warn/40"
          )}
        >
          <div className="flex flex-wrap items-center gap-4 p-5">
            <span
              className={cn(
                "grid h-12 w-12 shrink-0 place-items-center rounded-xl border",
                config.manual
                  ? "border-warn/30 bg-warn/10 text-warn"
                  : "border-white/10 bg-white/[0.04] text-muted-foreground"
              )}
            >
              <SlidersHorizontal className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">
                โหมดแมนนวล{" "}
                {config.manual && (
                  <span className="ml-1 rounded-full border border-warn/30 bg-warn/10 px-2 py-0.5 text-[10px] font-bold text-warn">
                    MANUAL ACTIVE
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {config.manual
                  ? "ระบบกำลังใช้ค่าที่กำหนดเอง — การตั้งค่าด้านล่างมีผลกับผู้ชมทุกคน"
                  : "ปิดอยู่ — ระบบแสดงข้อมูลจริงจากบอร์ด ESP32 ตามปกติ"}
              </p>
            </div>
            <Switch
              on={config.manual}
              onChange={(v) => save({ manual: v })}
              disabled={!loaded}
            />
          </div>
        </Card>

        {/* connection override */}
        <Card className={cn("glass", !config.manual && "opacity-50")}>
          <div className="p-5">
            <p className="flex items-center gap-2 text-sm font-bold">
              {config.connection === "offline" ? (
                <WifiOff className="h-4 w-4 text-meat" />
              ) : (
                <Wifi className="h-4 w-4 text-safe" />
              )}
              สถานะการเชื่อมต่อ (ONLINE / OFFLINE)
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              บังคับสถานะบอร์ดที่แสดงบนเว็บ — “บังคับ ONLINE” จะทำให้ไฟเซ็นเซอร์เป็นสีเขียวทั้งหมดด้วย
            </p>
            <Segmented
              options={CONNECTION_OPTIONS}
              value={config.connection}
              onChange={(v) => save({ connection: v, manual: true })}
              disabled={!config.manual}
            />
          </div>
        </Card>

        {/* freshness override */}
        <Card className={cn("glass", !config.manual && "opacity-50")}>
          <div className="p-5">
            <p className="flex items-center gap-2 text-sm font-bold">
              <ToggleLeft className="h-4 w-4 text-violet-400" />
              ผลความสดของเนื้อ (สด / ควรระวัง / เน่า)
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              บังคับผลวิเคราะห์ที่แสดง — “อัตโนมัติ” = คำนวณจากค่าเซ็นเซอร์ตามปกติ
            </p>
            <Segmented
              options={STATUS_OPTIONS}
              value={config.status}
              onChange={(v) => save({ status: v, manual: true })}
              disabled={!config.manual}
            />
          </div>
        </Card>

        {/* pinned values */}
        <Card className={cn("glass", !config.manual && "opacity-50")}>
          <div className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold">กำหนดค่าเซ็นเซอร์เอง</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  ใช้แทนค่าจริงจากบอร์ดทั้งหมด (แสดงบนการ์ด, กราฟ และการวิเคราะห์)
                </p>
              </div>
              <Switch
                on={config.useValues}
                onChange={(v) => save({ useValues: v, manual: true })}
                disabled={!config.manual}
              />
            </div>

            <div
              className={cn(
                "mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5",
                !config.useValues && "opacity-50"
              )}
            >
              {VALUE_FIELDS.map((f) => (
                <label key={f.key} className="block">
                  <span className="mb-1 block text-[11px] font-medium text-muted-foreground">
                    {f.label}
                  </span>
                  <input
                    type="number"
                    step={f.step}
                    value={draft[f.key]}
                    disabled={!config.manual || !config.useValues}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, [f.key]: e.target.value }))
                    }
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-semibold tabular-nums outline-none transition-colors focus:border-safe/50 disabled:cursor-not-allowed"
                  />
                </label>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-3">
              <Button
                size="sm"
                variant="safe"
                onClick={applyValues}
                disabled={!config.manual || !config.useValues}
              >
                <Save /> {savedFlash ? "บันทึกแล้ว ✓" : "บันทึกค่า"}
              </Button>
              <p className="text-[11px] text-muted-foreground">
                เกณฑ์: NH₃ สด &lt; 10 · เตือน ≥ 10 · เน่า ≥ 25 ppm
              </p>
            </div>
          </div>
        </Card>

        {/* reset + note */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="outline" onClick={resetAll}>
            <RotateCcw /> รีเซ็ตทั้งหมดเป็นอัตโนมัติ
          </Button>
          <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5 text-warn" />
            การตั้งค่า sync ผ่าน Firebase (meat/admin) — มีผลกับผู้ชมทุกคนแบบเรียลไทม์
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ── small controls ─────────────────────────────────────────────── */

function Switch({
  on,
  onChange,
  disabled,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className={cn(
        "relative h-8 w-14 shrink-0 rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        on ? "border-warn/40 bg-warn/30" : "border-white/15 bg-white/[0.06]"
      )}
    >
      <span
        className={cn(
          "absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all",
          on ? "left-7" : "left-1"
        )}
      />
    </button>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
  disabled,
}: {
  options: { value: T; label: string; cls?: string }[];
  value: T;
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          data-on={value === o.value}
          disabled={disabled}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-full border px-4 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed",
            value === o.value
              ? "border-white/20 bg-white/[0.1] text-foreground"
              : "border-white/10 bg-white/[0.02] text-muted-foreground hover:text-foreground",
            o.cls
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
