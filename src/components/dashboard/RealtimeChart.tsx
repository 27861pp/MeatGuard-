import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { SensorReading } from "@/lib/analysis";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export interface Series {
  key: keyof Pick<SensorReading, "nh3" | "h2s" | "temperature" | "humidity">;
  label: string;
  color: string; // hsl/hex
}

interface RealtimeChartProps {
  title: string;
  subtitle?: string;
  history: SensorReading[];
  series: Series[];
  unit?: string;
}

function hexToRgba(color: string, alpha: number) {
  // supports #rrggbb
  const m = color.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function RealtimeChart({
  title,
  subtitle,
  history,
  series,
  unit,
}: RealtimeChartProps) {
  const labels = useMemo(
    () =>
      history.map((r) =>
        new Date(r.timestamp).toLocaleTimeString("th-TH", {
          minute: "2-digit",
          second: "2-digit",
        })
      ),
    [history]
  );

  const data: ChartData<"line"> = useMemo(
    () => ({
      labels,
      datasets: series.map((s) => ({
        label: s.label,
        data: history.map((r) => r[s.key]),
        borderColor: s.color,
        backgroundColor: (ctx) => {
          const { chart } = ctx;
          const { ctx: c, chartArea } = chart;
          if (!chartArea) return hexToRgba(s.color, 0.15);
          const grad = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          grad.addColorStop(0, hexToRgba(s.color, 0.35));
          grad.addColorStop(1, hexToRgba(s.color, 0));
          return grad;
        },
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: s.color,
      })),
    }),
    [labels, history, series]
  );

  const options: ChartOptions<"line"> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 400 },
      interaction: { intersect: false, mode: "index" },
      plugins: {
        legend: {
          display: series.length > 1,
          position: "top",
          align: "end",
          labels: {
            color: "rgba(255,255,255,0.65)",
            usePointStyle: true,
            pointStyle: "circle",
            boxWidth: 6,
            font: { size: 11 },
          },
        },
        tooltip: {
          backgroundColor: "rgba(10,10,15,0.92)",
          borderColor: "rgba(255,255,255,0.1)",
          borderWidth: 1,
          padding: 10,
          cornerRadius: 10,
          titleColor: "#fff",
          bodyColor: "rgba(255,255,255,0.8)",
          callbacks: unit
            ? { label: (c) => ` ${c.dataset.label}: ${c.formattedValue} ${unit}` }
            : undefined,
        },
      },
      scales: {
        x: {
          grid: { color: "rgba(255,255,255,0.04)" },
          ticks: { color: "rgba(255,255,255,0.4)", maxTicksLimit: 6, font: { size: 10 } },
        },
        y: {
          grid: { color: "rgba(255,255,255,0.06)" },
          ticks: { color: "rgba(255,255,255,0.4)", font: { size: 10 } },
          beginAtZero: true,
        },
      },
    }),
    [series.length, unit]
  );

  return (
    <Card className="glass">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold">{title}</h3>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-safe">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-safe opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-safe" />
            </span>
            LIVE
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <Line data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
