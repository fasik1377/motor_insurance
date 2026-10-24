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
  { rate: 10, label: "Cyclone", group: "Add Extra Perils" },
  { rate: 11, label: "Earthquake", group: "Add Extra Perils" },
  { rate: 12, label: "Strike, Riot and Civil Commotion", group: "Add Extra Perils" },
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

// Covers the VB Premium form ticks and locks itself (Mauritius policies, any class except TRAILER):
//  - Driver Only is always included (No = 1, no amount);
//  - Passenger Risk is mandatory for Goods Vehicle (Public), Contract Car, Taxi Car, Taxi Bus and ContractBus/Van.
export type CoverRule = { required: true; amountLocked?: boolean };
export function mandatoryCoverRules(vehicleClass: string, country: string): Record<number, CoverRule> {
  const vehicle = String(vehicleClass ?? "").trim().toUpperCase();
  if (!vehicle || String(country ?? "").trim().toUpperCase() !== "MAURITIUS" || vehicle === "TRAILER") return {};
  const rules: Record<number, CoverRule> = { 7: { required: true, amountLocked: true } };
  if (/GOODS VEHICLE\(PUBLIC\)|CONTRACT CAR|TAXI CAR|TAXI BUS|CONTRACTBUS\/VAN/.test(vehicle)) rules[1] = { required: true };
  return rules;
}

// The form values with the mandatory covers applied (ticked, count defaulting to 1, locked amount cleared).
export function applyCoverRules<T extends Record<string, unknown>>(values: T, rules: Record<number, CoverRule>): T {
  const next: Record<string, unknown> = { ...values };
  for (const cover of PREMIUM_COVERS) {
    const rule = rules[cover.rate];
    if (!rule) continue;
    next[`cover${cover.rate}`] = true;
    if (cover.count && String(next[`rate${cover.rate}`] ?? "").trim() === "") next[`rate${cover.rate}`] = "1";
    if (rule.amountLocked) next[`amt${cover.rate}`] = "";
  }
  return next as T;
}

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
export function coverErrors(values: Record<string, unknown>, seating: number, restrictedRates: number[] = [], rules: Record<number, CoverRule> = {}): [string, string][] {
  const errors: [string, string][] = [];
  const passengerSeats = seating > 1 ? seating - 1 : 0; // seating capacity less the driver
  for (const cover of PREMIUM_COVERS) {
    if (!isSelected(values[`cover${cover.rate}`])) {
      if (rules[cover.rate]) errors.push([`cover${cover.rate}`, `${cover.label} is mandatory for this vehicle class.`]);
      continue;
    }
    // A mandatory cover is never treated as restricted.
    if (restrictedRates.includes(cover.rate) && !rules[cover.rate]) { errors.push([`cover${cover.rate}`, `${cover.label} is not available for this vehicle class.`]); continue; }
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
  // Rate numbering follows the cover list (Rate10 = Cyclone, Rate12 = Strike and Riot).
  if (rate(10) > 0) items.push("Storm,Tempest,Cyclone,Flood and Inundation Extension");
  if (rate(12) > 0) items.push("SRCC");
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

// dbo.MotCoverDecListforVehType lists, per vehicle class (VehicleType) and country, the covers that are
// NOT available (e.g. Passenger Risk for a TRAILER). The cover names there use the VB wording.
const RESTRICTED_COVER_NAMES: [RegExp, number][] = [
  [/^PASSENGER RISK$/, 1],
  [/^PERSONAL ACCIDENT$/, 2],
  [/^(PA \(CONDUCTOR\)|PERSONAL ACCIDENT FOR CONDUCTOR)$/, 3],
  [/^(PA \(EMPLOYEE\)|PERSONAL ACCIDENT FOR EMPLOYEES?)$/, 4],
  [/^(PA \(FAMILY MEMBERS\)|PERSONAL ACCIDENT FOR FAMILY MEMBERS?)$/, 5],
  [/^AUTO PLUS$/, 6],
  [/^DRIVER( ONLY)?$/, 7],
  [/^LOSS OF USE$/, 8],
  [/^TOWING$/, 9],
  [/^CYCLONE$/, 10],
  [/^EARTHQUAKE$/, 11],
  [/^STRIKE,\s*RIOT AND CIVIL COMMO/, 12],
];

// Rate numbers of the Premium form covers that a usp_CurCoverinfo cover name restricts.
export function restrictedRatesFromNames(names: string[]): number[] {
  const rates = new Set<number>();
  for (const name of names) {
    const normalized = String(name ?? "").trim().toUpperCase().replace(/\s+/g, " ");
    const match = RESTRICTED_COVER_NAMES.find(([pattern]) => pattern.test(normalized));
    if (match) rates.add(match[1]);
  }
  return [...rates].sort((a, b) => a - b);
}

// @AddOnCoverName sent to usp_GetAdditionalPremium for each cover (the rate number is its Rate<n> column).
export const ADDON_TARIFF_NAMES: Record<number, string> = {
  1: "Passenger Risk", 2: "Personal Accident", 3: "PA Conductor", 4: "PA Employee", 5: "PA Family",
  6: "Auto Plus", 7: "Driver Only", 8: "Loss of Use", 9: "Towing", 10: "Cyclone", 11: "Earthquake", 12: "Strike and Riot",
  22: "Windscreen", 23: "Waiver of Excess", 24: "Loss of Keys", 25: "Airfreight", 26: "Personal Belongings",
  27: "Rodents", 28: "Misfuelling", 29: "Enhanced PA", 30: "Funeral Expenses",
};
// Covers priced per person (amount x number); Loss of Use is priced by its number of days (tariff Rate match).
export const PER_PERSON_COVERS = new Set([1, 2, 3, 4, 5]);

// Selected covers that need a tariff price (Driver Only has no amount, as in the VB form).
export function pricedCovers(values: Record<string, unknown>, rules: Record<number, CoverRule> = {}) {
  return PREMIUM_COVERS.filter((cover) => isSelected(values[`cover${cover.rate}`]) && !rules[cover.rate]?.amountLocked)
    .map((cover) => ({ rate: cover.rate, count: cover.count ? Math.trunc(toNumber(values[`rate${cover.rate}`])) || 0 : 1 }));
}

// Basic premium (usp_GetPremiumRateMotor) + add-on covers = total premium; + document charge = invoice amount.
export function withPremiumTotals<T extends Record<string, unknown>>(values: T, rules: Record<number, CoverRule> = {}): T {
  const basic = toNumber(values.basicAmt);
  if (!Number.isFinite(basic) || basic <= 0) return values;
  const addOn = pricedCovers(values, rules).reduce((sum, cover) => {
    const amount = toNumber(values[`amt${cover.rate}`]);
    return sum + (Number.isFinite(amount) ? amount : 0);
  }, 0);
  const documentCharge = toNumber(values.documentCharge);
  const premium = Math.round((basic + addOn) * 100) / 100;
  const invoice = Math.round((premium + (Number.isFinite(documentCharge) ? documentCharge : 0)) * 100) / 100;
  return { ...values, addOnPremium: String(Math.round(addOn * 100) / 100), premium: String(premium), invoiceAmount: String(invoice) };
}
