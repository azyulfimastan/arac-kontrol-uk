import { MotTest, Vehicle } from "./types";

function hash(s: string) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }

export function demoVehicle(reg: string): Vehicle {
  const h = hash(reg);
  const makes = [["FORD", "FIESTA"], ["VAUXHALL", "CORSA"], ["VOLKSWAGEN", "GOLF"], ["TOYOTA", "YARIS"], ["BMW", "320D"], ["HONDA", "CIVIC"]];
  const [make, model] = makes[h % makes.length];
  const year = 2010 + (h % 12);
  const colours = ["BLACK", "SILVER", "BLUE", "WHITE", "RED", "GREY"];
  const fuels = ["PETROL", "DIESEL", "PETROL", "HYBRID ELECTRIC"];
  const rollback = h % 5 === 0;
  const tests: MotTest[] = [];
  let km = 8000 + (h % 5000);
  const now = new Date();
  const start = Math.max(year + 3, now.getFullYear() - 6);
  for (let y = start; y <= now.getFullYear() - 1; y++) {
    km += 7000 + ((h >> (y % 8)) % 6000);
    const shown = rollback && y === now.getFullYear() - 2 ? km - 30000 : km;
    const fail = (h + y) % 7 === 0;
    tests.push({
      date: `${y}-${String(1 + ((h + y) % 11)).padStart(2, "0")}-15`, result: fail ? "FAILED" : "PASSED", mileage: shown, unit: "mi",
      defects: [
        ...(fail ? [{ text: "Nearside front brake disc worn, pitted or scored", type: "FAIL" }] : []),
        { text: "Tyre worn close to legal limit", type: "ADVISORY" },
      ],
    });
  }
  return {
    reg, make, model, colour: colours[h % colours.length], fuel: fuels[h % fuels.length], engineCc: [998, 1242, 1598, 1995][h % 4],
    year, co2: 90 + (h % 80), taxStatus: "Taxed", taxDue: `${now.getFullYear() + 1}-03-01`, motStatus: "Valid", motExpiry: `${now.getFullYear() + 1}-01-14`,
    tests, demo: true,
  };
}
