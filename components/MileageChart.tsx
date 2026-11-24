import { MotTest } from "@/lib/types";

export default function MileageChart({ tests }: { tests: MotTest[] }) {
  const pts = [...tests].filter((t) => t.mileage != null).sort((a, b) => a.date.localeCompare(b.date));
  if (pts.length < 2) return null;
  const W = 320, H = 130, P = 28;
  const xs = pts.map((p) => new Date(p.date).getTime()), ys = pts.map((p) => p.mileage as number);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y1 = Math.max(...ys), y0 = 0;
  const X = (v: number) => P + ((v - x0) / (x1 - x0 || 1)) * (W - P * 2);
  const Y = (v: number) => H - P - ((v - y0) / (y1 - y0 || 1)) * (H - P * 2);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${X(new Date(p.date).getTime()).toFixed(1)},${Y(p.mileage as number).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="mileage">
      <path d={line} fill="none" stroke="var(--accent)" strokeWidth="2.5" />
      {pts.map((p, i) => {
        const bad = i > 0 && (p.mileage as number) < (pts[i - 1].mileage as number) - 50;
        return <circle key={i} cx={X(new Date(p.date).getTime())} cy={Y(p.mileage as number)} r={4} fill={bad ? "var(--bad)" : "var(--accent)"} />;
      })}
      <text x={P} y={H - 6} className="axis">{pts[0].date.slice(0, 4)}</text>
      <text x={W - P} y={H - 6} className="axis" textAnchor="end">{pts[pts.length - 1].date.slice(0, 4)}</text>
      <text x={P} y={14} className="axis">{Math.round(y1).toLocaleString("en-GB")} {pts[0].unit}</text>
    </svg>
  );
}
