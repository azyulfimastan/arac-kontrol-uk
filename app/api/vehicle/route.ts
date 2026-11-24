import { NextRequest, NextResponse } from "next/server";
import { demoVehicle } from "@/lib/demo";
import type { MotTest, Vehicle } from "@/lib/types";

export const dynamic = "force-dynamic";

async function motToken(): Promise<string | null> {
  const { MOT_CLIENT_ID, MOT_CLIENT_SECRET, MOT_TOKEN_URL, MOT_SCOPE } = process.env;
  if (!MOT_CLIENT_ID || !MOT_CLIENT_SECRET || !MOT_TOKEN_URL) return null;
  const r = await fetch(MOT_TOKEN_URL, {
    method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials", client_id: MOT_CLIENT_ID, client_secret: MOT_CLIENT_SECRET, scope: MOT_SCOPE || "https://tapi.dvsa.gov.uk/.default" }),
  });
  if (!r.ok) return null;
  return (await r.json()).access_token ?? null;
}

export async function GET(req: NextRequest) {
  const reg = (req.nextUrl.searchParams.get("reg") || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (reg.length < 2 || reg.length > 8) return NextResponse.json({ error: "invalid_reg" }, { status: 400 });

  const dvlaKey = process.env.DVLA_API_KEY;
  if (!dvlaKey) return NextResponse.json(demoVehicle(reg));

  try {
    const d = await fetch("https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles", {
      method: "POST", headers: { "x-api-key": dvlaKey, "content-type": "application/json" },
      body: JSON.stringify({ registrationNumber: reg }), cache: "no-store",
    });
    if (d.status === 404) return NextResponse.json({ error: "not_found" }, { status: 404 });
    if (!d.ok) return NextResponse.json({ error: "dvla_error" }, { status: 502 });
    const dv = await d.json();

    let tests: MotTest[] = []; let model = "";
    const motKey = process.env.MOT_API_KEY; const token = motKey ? await motToken() : null;
    if (motKey && token) {
      const m = await fetch(`https://history.mot.api.gov.uk/v1/trade/vehicles/registration/${reg}`, {
        headers: { Authorization: `Bearer ${token}`, "x-api-key": motKey, Accept: "application/json" }, cache: "no-store",
      });
      if (m.ok) {
        const mj = await m.json();
        model = mj.model || "";
        tests = (mj.motTests || []).map((t: any): MotTest => ({
          date: (t.completedDate || "").slice(0, 10), result: t.testResult || "", expiry: t.expiryDate,
          mileage: t.odometerValue != null ? Number(t.odometerValue) : null, unit: (t.odometerUnit || "mi").toLowerCase(),
          defects: (t.defects || []).map((x: any) => ({ text: x.text || "", type: x.dangerous ? "DANGEROUS" : x.type || "" })),
        }));
      }
    }
    const v: Vehicle = {
      reg, make: dv.make || "", model, colour: dv.colour || "", fuel: dv.fuelType || "", engineCc: dv.engineCapacity ?? null,
      year: dv.yearOfManufacture ?? null, co2: dv.co2Emissions ?? null, taxStatus: dv.taxStatus || "", taxDue: dv.taxDueDate || null,
      motStatus: dv.motStatus || "", motExpiry: dv.motExpiryDate || null, tests, demo: false,
    };
    return NextResponse.json(v);
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
