import type { Vehicle } from "./types";
import type { Lang } from "./i18n";

export type Countdown = { days: number | null; sev: "ok" | "warn" | "bad" | "na" };

export function daysUntil(date: string | null, now = new Date()): number | null {
  if (!date) return null;
  const d = new Date(date + (date.length === 10 ? "T00:00:00" : ""));
  if (isNaN(d.getTime())) return null;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

export function countdown(date: string | null): Countdown {
  const days = daysUntil(date);
  if (days == null) return { days: null, sev: "na" };
  return { days, sev: days < 0 ? "bad" : days <= 30 ? "warn" : "ok" };
}

export function countdownText(c: Countdown, lang: Lang): string {
  if (c.days == null) return lang === "tr" ? "Bilinmiyor" : "Unknown";
  if (c.days < 0) return lang === "tr" ? `${-c.days} gün geçti` : `${-c.days} days overdue`;
  if (c.days === 0) return lang === "tr" ? "Bugün bitiyor" : "Ends today";
  return lang === "tr" ? `${c.days} gün kaldı` : `${c.days} days left`;
}

/** ULEZ: petrol Euro 4+, diesel Euro 6+, electric always. Uses DVLA euroStatus, falls back to year. */
export type Ulez = { status: "yes" | "no" | "likely" | "unlikely" | "unknown"; basis: string };

function euroNum(s: string | null | undefined): number | null {
  if (!s) return null;
  const m = s.match(/(\d)/);
  return m ? Number(m[1]) : null;
}

export function ulez(v: Vehicle): Ulez {
  const fuel = (v.fuel || "").toUpperCase();
  if (/^ELECTRIC(ITY)?$/.test(fuel) || fuel === "ELECTRIC") return { status: "yes", basis: "electric" };
  const diesel = /DIESEL/.test(fuel);
  const petrol = /PETROL|HYBRID/.test(fuel);
  if (!diesel && !petrol) return { status: "unknown", basis: "fuel" };
  const need = diesel ? 6 : 4;
  const e = euroNum(v.euroStatus);
  if (e != null) return { status: e >= need ? "yes" : "no", basis: `Euro ${e}` };
  if (v.year == null) return { status: "unknown", basis: "year" };
  const cut = diesel ? 2016 : 2006;
  return { status: v.year >= cut ? "likely" : "unlikely", basis: String(v.year) };
}

export function ulezText(u: Ulez, lang: Lang): string {
  const tr = { yes: "Uyumlu", no: "Uyumsuz (günlük ücret)", likely: "Muhtemelen uyumlu", unlikely: "Muhtemelen uyumsuz", unknown: "Bilinmiyor" };
  const en = { yes: "Compliant", no: "Not compliant (daily charge)", likely: "Likely compliant", unlikely: "Likely not compliant", unknown: "Unknown" };
  return (lang === "tr" ? tr : en)[u.status];
}

/** Average yearly mileage from first to last MOT odometer reading (miles or km as recorded). */
export function yearlyMileage(v: Vehicle): number | null {
  const pts = v.tests.filter((t) => t.mileage != null).sort((a, b) => a.date.localeCompare(b.date));
  if (pts.length < 2) return null;
  const a = pts[0], b = pts[pts.length - 1];
  const yrs = (new Date(b.date).getTime() - new Date(a.date).getTime()) / 31557600000;
  if (yrs < 0.5) return null;
  const per = (b.mileage! - a.mileage!) / yrs;
  return per > 0 ? Math.round(per) : null;
}

export const RECALL_URL = "https://www.gov.uk/check-vehicle-recall";
