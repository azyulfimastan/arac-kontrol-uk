export type Defect = { text: string; type: string };
export type MotTest = { date: string; result: string; mileage: number | null; unit: string; expiry?: string; defects: Defect[] };
export type Vehicle = {
  reg: string; make: string; model: string; colour: string; fuel: string; engineCc: number | null;
  year: number | null; co2: number | null; taxStatus: string; taxDue: string | null;
  motStatus: string; motExpiry: string | null; euroStatus?: string | null; firstReg?: string | null; exported?: boolean | null; v5c?: string | null; typeApproval?: string | null; wheelplan?: string | null; tests: MotTest[]; demo: boolean;
};
export type Risk = { score: number; level: "low" | "mid" | "high"; flags: { key: string; sev: "ok" | "warn" | "bad"; tr: string; en: string }[] };
