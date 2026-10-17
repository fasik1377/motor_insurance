// Optional covers of the Premium form. Each one is saved in MotorMaster / MotorPro as Rate<n>
// (the "No" column: number of persons / days, or 1 when the cover is simply selected) and Amt<n>
// (the amount). usp_GetAdditionalRiskCovered builds the "Additional Risk Covered" text from the
// same Rate columns, so the numbers below must stay aligned with that procedure.
export type PremiumCover = { rate: number; label: string; group: string; count?: string };

export const PREMIUM_COVERS: PremiumCover[] = [
  { rate: 1, label: "Passenger Risk", group: "Additional Cover", count: "Passengers" },
  { rate: 2, label: "Personal Accident", group: "Additional Cover", count: "Passengers" },
  { rate: 3, label: "PA (Conductor)", group: "Additional Cover", count: "Conductors" },
  { rate: 4, label: "PA (Employee)", group: "Additional Cover", count: "Employees" },
  { rate: 5, label: "PA (Family Members)", group: "Additional Cover", count: "Members" },
  { rate: 6, label: "Auto Plus", group: "Additional Cover" },
  { rate: 7, label: "Driver Only", group: "Additional Cover" },
  { rate: 8, label: "Loss of Use", group: "Additional Cover", count: "Days" },
  { rate: 9, label: "Towing", group: "Additional Cover" },
  { rate: 10, label: "Strike, Riot and Civil Commotion", group: "Add Extra Perils" },
  { rate: 12, label: "Cyclone", group: "Add Extra Perils" },
  { rate: 22, label: "Windscreen Extension", group: "Additional Cover (Extensions)" },
  { rate: 23, label: "Waiver of Excess", group: "Additional Cover (Extensions)" },
  { rate: 24, label: "Loss of Car Keys", group: "Additional Cover (Extensions)" },
  { rate: 25, label: "Airfreight Expenses", group: "Additional Cover (Extensions)" },
  { rate: 26, label: "Personal Belongings", group: "Additional Cover (Extensions)" },
  { rate: 27, label: "Damage by Rodents", group: "Additional Cover (Extensions)" },
  { rate: 28, label: "Accidental Misfuelling", group: "Additional Cover (Extensions)" },
  { rate: 29, label: "Enhanced Personal Accidental", group: "Additional Cover (Extensions)" },
  { rate: 30, label: "Funeral Expenses", group: "Additional Cover (Extensions)" },
];

// Form fields: cover<n> (selected), rate<n> (number for the count covers), amt<n> (amount).
export const coverFieldNames = PREMIUM_COVERS.flatMap((c) => [`cover${c.rate}`, `rate${c.rate}`, `amt${c.rate}`]);

const toNumber = (value: unknown) => { const n = Number(String(value ?? "").replace(/,/g, "").trim()); return Number.isFinite(n) ? n : NaN; };
const isSelected = (value: unknown) => value === true || String(value).toLowerCase() === "true";

// Rate<n> / Amt<n> values to save: 0 when the cover is not selected.
export function coverColumns(values: Record<string, unknown>): Record<string, number> {
  const columns: Record<string, number> = {};
  for (const cover of PREMIUM_COVERS) {
    const selected = isSelected(values[`cover${cover.rate}`]);
    const count = toNumber(values[`rate${cover.rate}`]);
    const amount = toNumber(values[`amt${cover.rate}`]);
    columns[`Rate${cover.rate}`] = selected ? (cover.count ? (Number.isFinite(count) ? Math.trunc(count) : 0) : 1) : 0;
    columns[`Amt${cover.rate}`] = selected && Number.isFinite(amount) ? amount : 0;
  }
  return columns;
}

// Validation of the selected covers. Returns [field, message] pairs.
export function coverErrors(values: Record<string, unknown>, seating: number): [string, string][] {
  const errors: [string, string][] = [];
  const passengerSeats = seating > 1 ? seating - 1 : 0; // seating capacity less the driver
  for (const cover of PREMIUM_COVERS) {
    if (!isSelected(values[`cover${cover.rate}`])) continue;
    const rawAmount = String(values[`amt${cover.rate}`] ?? "").trim();
    const amount = toNumber(rawAmount);
    if (rawAmount && (!Number.isFinite(amount) || amount < 0)) errors.push([`amt${cover.rate}`, `${cover.label}: the amount must be 0 or more.`]);
    if (!cover.count) continue;
    const count = toNumber(values[`rate${cover.rate}`]);
    if (!Number.isInteger(count) || count < 1) {
      errors.push([`rate${cover.rate}`, `${cover.label}: enter the number of ${cover.count.toLowerCase()} (a whole number of 1 or more).`]);
    } else if ((cover.rate === 1 || cover.rate === 2) && passengerSeats && count > passengerSeats) {
      errors.push([`rate${cover.rate}`, `${cover.label}: at most ${passengerSeats} passengers can be covered (seating capacity ${seating} less the driver).`]);
    }
  }
  return errors;
}

// Port of usp_GetAdditionalRiskCovered: the "Additional Risk Covered" text for a policy.
// rates holds the Rate<n> values (keyed by n); student and seating come from the vehicle.
export function additionalRiskCovered({ rates, vehicleClass = "", cover = "", student = 0, seating = 0 }: { rates: Record<number, number>; vehicleClass?: string; cover?: string; student?: number; seating?: number }): string {
  const items: string[] = [];
  const rate = (n: number) => { const value = Number(rates[n]); return Number.isFinite(value) ? value : 0; };
  const whole = (value: number) => String(Math.trunc(value));

  if (vehicleClass.trim().toUpperCase() === "MOTOR TRADE" && cover.trim().toUpperCase() !== "THIRD PARTY ONLY") items.push("MAXIMUM 2 CLAIMS ALLOWED ON OWN DAMAGES");
  if (rate(1) > 0) {
    if (!student) items.push(`${whole(rate(1))} Passenger's Risk`);
    else if (!items.length) items.push(`${seating - 1} Passenger's OR ${student - 1} Student's Risk`);
    // As in the original VB / procedure, this branch uses Student - 1 for both numbers.
    else items.push(`${student - 1} Passenger's OR ${student - 1} Student's Risk`);
  }
  if (rate(2) > 0) items.push(`Personal Accident Cover for ${whole(rate(2))} Passengers`);
  if (rate(3) > 0) items.push(`Personal Accident Cover for ${whole(rate(3))} Conductor`);
  if (rate(4) > 0) items.push(`Personal Accident Cover for ${whole(rate(4))} Employee`);
  if (rate(5) > 0) items.push(`Personal Accident Cover for ${whole(rate(5))} Family Members`);
  if (rate(6) > 0) items.push("Auto Plus");
  if (rate(7) > 0) items.push("Personal Accident Cover for Driver/Rider");
  if (rate(8) > 0) items.push(`${whole(rate(8))} Days Loss of Use Per Policy Period`);
  if (rate(10) > 0) items.push("SRCC");
  if (rate(12) > 0) items.push("Storm,Tempest,Cyclone,Flood and Inundation Extension");
  if (rate(22) > 0) items.push("Windscreen Cover - Rs.25,000");
  if (rate(23) > 0) items.push("Waiver of Excess - 2 Claims");
  if (rate(24) > 0) items.push("Loss of Car Keys - Rs 10,000");
  if (rate(25) > 0) items.push("Airfreight Expenses - Rs.15,000");
  if (rate(26) > 0) items.push("Personal Belongings Cover - Rs.20,000");
  if (rate(27) > 0) items.push("Damage by Rodents - Rs. 20,000");
  if (rate(28) > 0) items.push("Accidental Misfuelling - Rs. 20,000");
  if (rate(29) > 0) items.push("Enhanced Personal Accident-Rs.1 Million Personal Accident Cover and Rs.100,000 Medical Expenses");
  if (rate(30) > 0) items.push("Funeral Expenses - Rs. 25,000");
  return items.join(", ");
}

// Rate<n> values of a saved policy row (or of coverColumns()) keyed by n.
export const ratesFromColumns = (row: Record<string, unknown> | undefined) =>
  Object.fromEntries(PREMIUM_COVERS.map((c) => [c.rate, Number(row?.[`Rate${c.rate}`]) || 0]));
