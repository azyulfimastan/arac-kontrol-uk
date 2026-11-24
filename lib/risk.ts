import { Risk, Vehicle } from "./types";

export function computeRisk(v: Vehicle): Risk {
  let score = 0;
  const flags: Risk["flags"] = [];
  const push = (sev: "ok" | "warn" | "bad", key: string, tr: string, en: string, pts: number) => {
    flags.push({ key, sev, tr, en }); score += pts;
  };
  const tests = [...v.tests].sort((a, b) => a.date.localeCompare(b.date));

  // Kilometre geri alma
  let rollback = false;
  for (let i = 1; i < tests.length; i++) {
    const a = tests[i - 1].mileage, b = tests[i].mileage;
    if (a != null && b != null && b < a - 50) rollback = true;
  }
  if (rollback) push("bad", "rollback", "Kilometre geri alınmış olabilir (kayıtlar tutarsız)", "Possible mileage rollback (records inconsistent)", 40);
  else if (tests.length > 1) push("ok", "mileage", "Kilometre kayıtları tutarlı", "Mileage records are consistent", 0);
  else push("warn", "nomileage", "Karşılaştıracak yeterli kilometre kaydı yok", "Not enough mileage records to compare", 5);

  // MOT durumu
  if (v.motStatus && !/^valid$/i.test(v.motStatus) && !/not required/i.test(v.motStatus)) push("bad", "mot", `MOT durumu: ${v.motStatus}`, `MOT status: ${v.motStatus}`, 20);
  else push("ok", "mot", "MOT geçerli veya gerekmiyor", "MOT valid or not required", 0);

  // Vergi
  if (v.taxStatus && /untaxed|sorn/i.test(v.taxStatus)) push("warn", "tax", `Vergi durumu: ${v.taxStatus}`, `Tax status: ${v.taxStatus}`, 10);
  else push("ok", "tax", "Vergi ödenmiş", "Vehicle is taxed", 0);

  // Kalma oranı
  const fails = tests.filter((t) => /fail/i.test(t.result)).length;
  if (tests.length >= 2 && fails / tests.length > 0.4) push("bad", "fails", `MOT'ta sık kalmış (${fails}/${tests.length})`, `Frequent MOT failures (${fails}/${tests.length})`, 20);
  else if (fails > 0) push("warn", "fails", `${fails} kez MOT'tan kalmış`, `Failed MOT ${fails} time(s)`, 8);
  else if (tests.length) push("ok", "fails", "MOT'tan hiç kalmamış", "Never failed an MOT", 0);

  // Tehlikeli kusur
  const dangerous = tests.some((t) => t.defects.some((d) => /dangerous|major/i.test(d.type)));
  if (dangerous) push("warn", "major", "Geçmişte major/dangerous kusur kaydı var", "Major/dangerous defects recorded in the past", 8);

  // Tekrar eden advisory
  const counts = new Map<string, number>();
  tests.forEach((t) => t.defects.forEach((d) => { const k = d.text.toLowerCase().slice(0, 40); counts.set(k, (counts.get(k) || 0) + 1); }));
  const repeats = [...counts.values()].filter((n) => n >= 3).length;
  if (repeats) push("warn", "repeat", `${repeats} uyarı her yıl tekrar ediyor (çözülmemiş)`, `${repeats} advisory repeats yearly (unresolved)`, 10);

  // Yıllık km çok yüksek
  const first = tests.find((t) => t.mileage != null), last = [...tests].reverse().find((t) => t.mileage != null);
  if (first && last && first !== last) {
    const yrs = (new Date(last.date).getTime() - new Date(first.date).getTime()) / 31557600000;
    const perYear = yrs > 0 ? ((last.mileage! - first.mileage!) / yrs) : 0;
    if (perYear > 20000) push("warn", "highkm", `Yıllık km yüksek (~${Math.round(perYear).toLocaleString("en-GB")})`, `High yearly mileage (~${Math.round(perYear).toLocaleString("en-GB")})`, 8);
  }

  // Yaş
  if (v.year && new Date().getFullYear() - v.year > 15) push("warn", "age", "Araç 15 yaşından büyük", "Vehicle is over 15 years old", 5);

  score = Math.max(0, Math.min(100, score));
  return { score, level: score >= 50 ? "high" : score >= 20 ? "mid" : "low", flags };
}
