file:///c%3A/Users/yidid/OneDrive/Desktop/Remote%20Jobs/motor_insurance/motor_insurance/app/buy-online/page.tsx {"mtime":1790024509909,"ctime":1786102238177,"size":111355,"etag":"3gm9nb1393mr3","orphaned":false,"typeId":""}
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type PolicyCover = "" | "Comprehensive" | "Comprehensive AutoPlus" | "Third Party Fire & Theft" | "Third Party Only";

const generalDownloads = [
  { name: "Motor insurance proposal form", size: "81.92 KB", href: "/documents/motor-proposal-form.pdf" },
  { name: "Motor claim form", size: "54.78 KB", href: "/documents/motor-claim-form.pdf" },
  { name: "Safe driving — do's and don'ts", size: "37.82 KB", href: "/documents/motor-safety-guide.pdf" },
];

const policyDownloads: Record<Exclude<PolicyCover, "">, { name: string; size: string; href: string }[]> = {
  Comprehensive: [
    { name: "Comprehensive motor policy wording", size: "1.24 MB", href: "/documents/comprehensive-policy-wording.pdf" },
    { name: "Comprehensive cover benefits guide", size: "420 KB", href: "/documents/comprehensive-benefits-guide.pdf" },
    { name: "Comprehensive claims checklist", size: "196 KB", href: "/documents/comprehensive-claims-checklist.pdf" },
  ],
  "Comprehensive AutoPlus": [
    { name: "Comprehensive AutoPlus motor policy wording", size: "1.24 MB", href: "/documents/comprehensive-autoplus-policy-wording.pdf" },
    { name: "Comprehensive AutoPlus cover benefits guide", size: "420 KB", href: "/documents/comprehensive-autoplus-benefits-guide.pdf" },
    { name: "Comprehensive AutoPlus claims checklist", size: "196 KB", href: "/documents/comprehensive-autoplus-claims-checklist.pdf" },
  ],
  "Third Party Fire & Theft": [
    { name: "Third Party Fire & Theft policy wording", size: "980 KB", href: "/documents/third-party-fire-theft-wording.pdf" },
    { name: "Fire and theft claims checklist", size: "184 KB", href: "/documents/fire-theft-claims-checklist.pdf" },
  ],
  "Third Party Only": [
    { name: "Third Party Only policy wording", size: "860 KB", href: "/documents/third-party-only-wording.pdf" },
    { name: "Revised motor third-party premium rates", size: "3.87 MB", href: "/documents/third-party-premium-rates.pdf" },
    { name: "Third-party accident guide", size: "210 KB", href: "/documents/third-party-accident-guide.pdf" },
  ],
};

const steps = [
  { label: "Detailed Quote", icon: "quote" },
  { label: "Payment", icon: "payment" },
];

const newVehicleSections = [
  {
    title: "KYC", pending: "7 mandatory fields pending", alert: true, rows: [
      ["Registration No.", "Vehicle registration number"], ["Make", "Vehicle manufacturer"], ["Model", "Vehicle model"], ["Engine No.", "Engine identification number"], ["Chassis No.", "Chassis identification number"], ["Colour", "Vehicle colour"], ["Year Mfg. & Date of Reg.", "Manufacturing year and registration date"], ["Seating", "Full count for seats and students"], ["CC / kW", "Engine capacity or power"], ["Gross Vehicle Weight", "Registered gross vehicle weight"], ["Trailer Ft.", "Trailer measurement, if applicable"], ["Remarks", "Additional vehicle remarks"],
    ]
  },
  {
    title: "Policy Details", pending: "3 mandatory fields pending", alert: true, rows: [
      ["Cover Required", "Selected motor cover"], ["Sum Insured", "Declared sum insured"], ["Voluntary Excess Amount", "Selected voluntary excess"], ["Young Driver Excess", "Applicable young driver excess"], ["Compulsory Excess", "Mandatory policy excess"], ["TPF Excess", "Third-party fire excess"], ["TPPD Excess", "Third-party property damage excess"], ["Additional Excess", "Any additional excess amount"], ["Theft Excess", "Applicable theft excess"], ["Total Loss Excess", "Applicable total-loss excess"], ["Approved Discount Request", "Approved discount reference, if available"],
    ]
  },
  {
    title: "Vechicle Details", rows: [
      ["Country", "Mauritius"], ["Vehicle Type", "Selected vehicle type"], ["Fuel Type", "Vehicle fuel type"], ["Class", "Motor policy class"], ["Vehicle Status", "New or existing vehicle"], ["Issue Date", "Policy issue date and time"], ["From", "Policy commencement date"], ["To", "Policy expiry date"], ["Client", "Client master record"], ["Lien", "Lienholder details, if applicable"], ["Policy Risk", "Standard or selected risk"],
    ]
  },
  {
    title: "Accessories", rows: [
      ["No Claim Bonus", "Rate percentage and discount amount"], ["Fleet Discount", "Rate percentage and discount amount"], ["Special Discount", "Rate percentage and discount amount"], ["Claim Loading", "Rate percentage and loading amount"], ["Get Discount %", "Calculate and apply eligible discount"], ["Remarks for Other Loading", "Additional loading remarks"],
    ]
  },
  {
    title: "General Information", rows: [
      ["Passenger Risk", "Optional passenger-risk cover"], ["Personal Accident", "Personal accident protection"], ["PA (Conductor)", "Personal accident cover for conductor"], ["PA (Employee)", "Personal accident cover for employee"], ["PA (Family Members)", "Personal accident cover for family members"], ["Auto Plus", "Optional Auto Plus cover"], ["Driver Only", "Named-driver protection"], ["Loss of Use", "Loss-of-use benefit"], ["Towing", "Towing expense cover"], ["Strike, Riot and Civil Commotion", "Additional peril protection"], ["Earthquake", "Earthquake protection"], ["Cyclone", "Cyclone protection"], ["Windscreen Extension", "Extended windscreen cover"], ["Waiver of Excess", "Optional excess waiver"], ["Loss of Car Keys", "Replacement car-key cover"], ["Airfreight Expenses", "Airfreight expense protection"], ["Personal Belongings", "Personal belongings in vehicle"], ["Damage by Rodents", "Rodent-damage protection"], ["Accidental Misfuelling", "Misfuelling expense cover"], ["Enhanced Personal Accidental", "Enhanced personal accident benefit"], ["Funeral Expenses", "Funeral expense benefit"],
    ]
  },
  { title: "Common Det.", rows: [] },
  { title: "Premium", rows: [] },
  { title: "Attached Document", rows: [] },
];

const sectionRequirements: Record<string, Array<[string, string]>> = {
  "Policy Details": [
    ["vehicleType", "Select the vehicle type."], ["vehicleClass", "Select the vehicle class."],
    ["vehicleStatus", "Select the vehicle status."], ["issueDate", "Enter the issue date."], ["fromDate", "Enter the cover start date."], ["toDate", "Enter the cover end date."],
  ],
  "Vechicle Details": [
    ["vehicleNo", "Enter the registration number."], ["make", "Select the vehicle make."],
    ["model", "Select the vehicle model."], ["engineNo", "Enter the engine number."],
    ["chassisNo", "Enter the chassis number."], ["coverRequired", "Select the required cover."],
  ],
  Premium: [["premium", "Enter the total premium."], ["invoiceAmount", "Enter the invoice amount."]],
  Accessories: [["accessoriesConfirmed", "Select or confirm the applicable accessory and discount details."]],
  "General Information": [["pricePaid", "Enter the price paid for the vehicle."], ["generalInformationConfirmed", "Complete the general information declarations."]],
  "Common Det.": [["commonDetailsConfirmed", "Complete the common vehicle details declarations."]],
  "Attached Document": [["documentsConfirmed", "Confirm the required supporting documents."]],
};

function StepIcon({ type }: { type: string }) {
  if (type === "payment") {
    return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="6" width="18" height="12" rx="1" /><path d="M3 10h18M7 15h4" /></svg>;
  }
  if (type === "summary") {
    return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 4h8M9 2h6v4H9z" /><rect x="5" y="4" width="14" height="18" rx="1" /><path d="M8 10h8M8 14h8M8 18h5" /></svg>;
  }
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 3h11l3 3v15H5z" /><path d="M8 8h8M8 12h8M8 16h5" />{type === "details" ? <circle cx="17" cy="18" r="3" fill="white" /> : null}</svg>;
}

type ClientRecord = Record<string, string | number | boolean | null>;

type ProfileData = {
  Title?: string;
  FirstName?: string;
  Surname?: string;
  Gender?: string;
  DateOfBirth?: string;
  Email?: string;
  Mobile?: string;
};

function ClientDetailsForm({ onClientSelected, onSaved, onKycStatus }: { onClientSelected: (client: ClientRecord) => void; onSaved: () => void; onKycStatus: (missing: string[]) => void }) {
  const inputClass = "w-full border border-violet-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-[#35126d] focus:ring-2 focus:ring-violet-100";
  const labelClass = "text-xs font-semibold text-slate-600";
  const [client, setClient] = useState<ClientRecord>({ Code: "", Category: "Individual" });
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [messageError, setMessageError] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isNewClient, setIsNewClient] = useState(true);

  const value = (field: string) => client[field] == null ? "" : String(client[field]);
  const dateValue = (field: string) => value(field).slice(0, 10);
  const checked = (field: string) => {
    const current = client[field];
    if (current === true || current === 1) return true;
    if (typeof current === "string") return ["true", "1", "yes"].includes(current.trim().toLowerCase());
    return false;
  };
  const missingFields = (record: ClientRecord) => {
    const missing: string[] = [];
    if (!valueFrom(record, "Category")) missing.push("Category");
    if (!valueFrom(record, "Title")) missing.push("Title");
    if (!valueFrom(record, "Name")) missing.push("Name");
    if (valueFrom(record, "Category") === "Individual" && !valueFrom(record, "Surname")) missing.push("Surname");
    if (!valueFrom(record, "UBO") && valueFrom(record, "Category") !== "Individual") missing.push("UBO");
    if (!valueFrom(record, "Mobile") && !valueFrom(record, "TelRes") && !valueFrom(record, "TelForegin")) missing.push("Mobile or residential phone");
    if (valueFrom(record, "Category") === "Individual" && !valueFrom(record, "Gender")) missing.push("Gender");
    return missing;
  };
  const valueFrom = (record: ClientRecord, field: string) => record[field] == null ? "" : String(record[field]).trim();

  const updateUboFromName = (record: ClientRecord) => {
    const category = valueFrom(record, "Category");
    if (category === "Individual") {
      const title = valueFrom(record, "Title");
      const name = valueFrom(record, "Name");
      const surname = valueFrom(record, "Surname");
      const ubo = [title, name, surname].filter(Boolean).join(" ");
      if (ubo) {
        return { ...record, UBO: ubo };
      }
    } else if (category === "Company") {
      // Clear UBO when switching to Company
      if (valueFrom(record, "UBO")) {
        return { ...record, UBO: "" };
      }
    }
    return record;
  };

  const setField = (field: string, fieldValue: string | boolean) => {
    setClient((current) => {
      let next = { ...current, [field]: fieldValue };
      if (field === "Category" || field === "Title" || field === "Name" || field === "Surname") {
        next = updateUboFromName(next);
      }
      return next;
    });
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  useEffect(() => {
    onKycStatus(missingFields(client));
  }, [client, onKycStatus]);

  async function fetchProfile() {
    try {
      const response = await fetch("/api/profile");
      const data = await response.json();
      if (response.ok && data.profile) {
        setProfile(data.profile);
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
    }
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile && isNewClient && !loaded) {
      setClient((current) => {
        let next = {
          ...current,
          Title: profile.Title || "",
          Name: profile.FirstName || "",
          Surname: profile.Surname || "",
          Gender: profile.Gender || "",
          DOB: profile.DateOfBirth || "",
          EMail: profile.Email || "",
          Mobile: profile.Mobile || "",
          Category: "Individual",
        };
        // Apply UBO auto-merge for Individual
        next = updateUboFromName(next);
        return next;
      });
    }
  }, [profile, isNewClient, loaded]);

  async function findClient() {
    const code = value("Code").trim();
    if (!code) return;
    setBusy(true);
    setMessage("");
    setMessageError(false);
    setErrors({});
    try {
      const response = await fetch(`/api/clients?code=${encodeURIComponent(code)}`);
      const data = (await response.json()) as { client?: ClientRecord; error?: string };
      if (!response.ok || !data.client) throw new Error(data.error || "Client could not be loaded.");
      // Apply UBO auto-merge for Individual category
      const clientWithUbo = updateUboFromName(data.client);
      setClient(clientWithUbo);
      onKycStatus(missingFields(clientWithUbo));
      onClientSelected(clientWithUbo);
      setLoaded(true);
      setIsNewClient(false);
      if (checkedValue(clientWithUbo.HasKYC)) onSaved();
      setMessage(`Client ${code} loaded from SQL Server.`);
    } catch (error) {
      setLoaded(false);
      setIsNewClient(true);
      setMessageError(true);
      setMessage(error instanceof Error ? error.message : "Client could not be loaded.");
    } finally {
      setBusy(false);
    }
  }

  function checkedValue(current: ClientRecord[string]) {
    if (current === true || current === 1) return true;
    return typeof current === "string" && ["true", "1", "yes"].includes(current.trim().toLowerCase());
  }

  async function saveKyc(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const missing = missingFields(client);
    if (missing.length > 0) {
      setMessageError(true);
      setMessage(`Please fill in required fields: ${missing.join(", ")}`);
      return;
    }

    const nationality = value("Nationality").toLowerCase();
    const category = value("Category");
    const nid = value("NID");

    if (category === "Individual" && nationality === "mauritius") {
      if (!nid) {
        setMessageError(true);
        setMessage("NID is required for Mauritian individuals.");
        return;
      }
      const nidRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{14}$/;
      if (!nidRegex.test(nid)) {
        setMessageError(true);
        setMessage("NID must be 14 alphanumeric characters containing both letters and numbers.");
        return;
      }
    }

    setBusy(true);
    setMessage("");
    setMessageError(false);
    setErrors({});
    try {
      const isNew = isNewClient && !loaded;
      const payload = { ...client };

      // Generate client code for new clients if not provided
      if (isNew && !payload.Code) {
        payload.Code = `WEB${Date.now().toString().slice(-8)}`;
      }

      const response = await fetch("/api/clients", {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { client?: ClientRecord; message?: string; error?: string; errors?: Record<string, string> };
      if (!response.ok) {
        setErrors(data.errors || {});
        setMessageError(true);
        throw new Error(data.error || "KYC could not be saved.");
      }
      setClient((current) => ({ ...current, ...data.client, HasKYC: true }));
      onKycStatus([]);
      onSaved();
      setMessage(data.message || "KYC saved successfully.");
      setLoaded(true);
      setIsNewClient(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "KYC could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  const isReadOnly = loaded && checkedValue(client.HasKYC);
  const clientCodeReadOnly = loaded || !isNewClient;
  const canSave = isNewClient ? missingFields(client).length === 0 : (loaded && !isReadOnly);

  return (
    <form onSubmit={saveKyc} className="border border-violet-200 bg-[#f7f5fb]">
      <div className="space-y-3 p-4 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-[130px_minmax(0,1fr)] sm:items-center">
          <label htmlFor="client-code" className={labelClass}>Client Code</label><input id="client-code" name="clientCode" value={value("Code")} onChange={(event) => { if (!clientCodeReadOnly) setField("Code", event.target.value); }} onKeyDown={(event) => { if (event.key === "Enter" && !clientCodeReadOnly) findClient(); }} readOnly={clientCodeReadOnly} className={`${inputClass} ${clientCodeReadOnly ? "bg-slate-100 cursor-not-allowed" : ""}`} />
        </div>

        {message ? <p role="status" className={`border px-3 py-2 text-sm font-medium ${messageError ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{message}</p> : null}
        {Object.keys(errors).length > 0 ? <div role="alert" className="border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"><p className="font-semibold">Please correct the following:</p><ul className="mt-1 list-disc pl-5">{Object.values(errors).map((error) => <li key={error}>{error}</li>)}</ul></div> : null}

        <div className="grid gap-3 sm:grid-cols-[130px_minmax(0,1fr)] sm:items-center">
          <label className={labelClass}>Category</label>
          <div className="flex flex-wrap gap-5 text-sm"><label className="flex items-center gap-2"><input type="radio" name="category" checked={value("Category") === "Company"} onChange={() => { if (!isReadOnly) setField("Category", "Company"); }} disabled={isReadOnly} className="accent-[#35126d]" /> Company</label><label className="flex items-center gap-2"><input type="radio" name="category" checked={value("Category") === "Individual"} onChange={() => { if (!isReadOnly) setField("Category", "Individual"); }} disabled={isReadOnly} className="accent-[#35126d]" /> Individual</label></div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[130px_minmax(0,1fr)] sm:items-center"><label className={labelClass}>Name</label><div className="grid grid-cols-[110px_1fr] gap-2"><select value={value("Title")} onChange={(event) => { if (!isReadOnly) setField("Title", event.target.value); }} disabled={isReadOnly} className={inputClass}><option value="">Title</option><option>Mr.</option><option>Mrs.</option><option>Ms</option></select><input value={value("Name")} onChange={(event) => { if (!isReadOnly) setField("Name", event.target.value); }} readOnly={isReadOnly} className={inputClass} /></div></div>
        {[["Surname", "Surname"], ["Address", "Address"], ["City", "City"]].map(([label, field]) => <div key={field} className="grid gap-3 sm:grid-cols-[130px_minmax(0,1fr)] sm:items-center"><label className={labelClass}>{label}</label><input value={value(field)} onChange={(event) => { if (!isReadOnly) setField(field, event.target.value); }} readOnly={isReadOnly} className={inputClass} /></div>)}
        <div className="grid gap-3 sm:grid-cols-[130px_minmax(0,1fr)] sm:items-center"><label className={labelClass}>UBO (Ultimate beneficial owner)</label><input value={value("UBO")} onChange={(event) => { if (!isReadOnly && value("Category") === "Company") setField("UBO", event.target.value); }} readOnly={isReadOnly || value("Category") === "Individual"} className={`${inputClass} ${value("Category") === "Individual" ? "bg-slate-100" : ""}`} /></div>

        {[[["VAT", "VAT"], ["Tel Res / Abroad", "TelRes"]], [["Tel Off", "TelOff"], ["Fax", "Fax"]], [["Mobile", "Mobile"], ["Qualification", "Qualification"]]].map((pair) => <div key={pair[0][1]} className="grid gap-3 sm:grid-cols-[130px_1fr_145px_1fr] sm:items-center">{pair.map(([label, field]) => <span key={field} className="contents"><label className={labelClass}>{label}</label><input value={value(field) || (field === "TelRes" ? value("TelForegin") : "")} onChange={(event) => { if (!isReadOnly) setField(field, event.target.value); }} readOnly={isReadOnly} className={inputClass} /></span>)}</div>)}
        <div className="grid gap-3 sm:grid-cols-[130px_minmax(0,1fr)] sm:items-center"><label className={labelClass}>E-Mail</label><input type="email" value={value("EMail")} onChange={(event) => { if (!isReadOnly) setField("EMail", event.target.value); }} readOnly={isReadOnly} className={inputClass} /></div>

        <div className="grid gap-3 sm:grid-cols-[130px_1fr_145px_1fr] sm:items-center"><label className={labelClass}>Occupation</label><input value={value("Occupation")} onChange={(event) => { if (!isReadOnly) setField("Occupation", event.target.value); }} readOnly={isReadOnly} className={inputClass} /><div className="col-span-2 flex flex-wrap gap-4 text-sm"><label className="flex items-center gap-2"><input type="radio" name="residence" checked={checked("Resident")} onChange={() => { if (!isReadOnly) { setField("Resident", true); setField("Nationality", "Mauritius"); } }} disabled={isReadOnly} className="accent-[#35126d]" /> Resident</label><label className="flex items-center gap-2"><input type="radio" name="residence" checked={!checked("Resident")} onChange={() => { if (!isReadOnly) setField("Resident", false); }} disabled={isReadOnly} className="accent-[#35126d]" /> Non Resident</label></div></div>
        <div className="grid gap-3 sm:grid-cols-[130px_1fr_145px_1fr] sm:items-center"><label className={labelClass}>Nationality</label><input value={value("Nationality")} onChange={(event) => { if (!isReadOnly && !checked("Resident")) setField("Nationality", event.target.value); }} readOnly={isReadOnly || checked("Resident")} className={`${inputClass} ${checked("Resident") ? "bg-slate-100" : ""}`} /><label className={labelClass}>Country Code</label><input value={value("CountryCode")} onChange={(event) => { if (!isReadOnly) setField("CountryCode", event.target.value); }} readOnly={isReadOnly} className={inputClass} /></div>
        <div className="grid gap-3 sm:grid-cols-[130px_1fr_145px_1fr] sm:items-center"><label className={labelClass}>Passport No.</label><input value={value("PassportNo")} onChange={(event) => { if (!isReadOnly) setField("PassportNo", event.target.value); }} readOnly={isReadOnly} className={inputClass} minLength={9} /><label className={labelClass}>NID</label><input disabled={isReadOnly || (value("Category") !== "Individual" || value("Nationality").toLowerCase() !== "mauritius")} value={value("NID")} onChange={(event) => { if (!isReadOnly) setField("NID", event.target.value); }} readOnly={isReadOnly} className={inputClass} /></div>
        <div className="grid gap-3 sm:grid-cols-[130px_1fr_145px_1fr] sm:items-center"><label className={labelClass}>BRN</label><input disabled={isReadOnly || value("Category") !== "Company"} value={value("BRN")} onChange={(event) => { if (!isReadOnly) setField("BRN", event.target.value); }} readOnly={isReadOnly} className={inputClass} /><label className={labelClass}>Gender</label><div className="flex gap-4 text-sm"><label className="flex items-center gap-2"><input type="radio" name="gender" disabled={isReadOnly || value("Category") !== "Individual"} checked={value("Gender") === "Male"} onChange={() => { if (!isReadOnly) setField("Gender", "Male"); }} className="accent-[#35126d]" /> Male</label><label className="flex items-center gap-2"><input type="radio" name="gender" disabled={isReadOnly || value("Category") !== "Individual"} checked={value("Gender") === "Female"} onChange={() => { if (!isReadOnly) setField("Gender", "Female"); }} className="accent-[#35126d]" /> Female</label></div></div>
        {loaded ? <p className="text-xs font-semibold text-violet-700">KYC record: {checked("HasKYC") ? "Available" : "Not available"}</p> : null}
        <button type="submit" disabled={busy || !canSave} className="w-full bg-[#35126d] px-4 py-3 text-sm font-bold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:bg-slate-400">{busy ? "Saving..." : isReadOnly ? "KYC already completed" : "Save KYC"}</button>
      </div>
    </form>
  );
}

function MotorProposalForm({ onStatusChange, clientCode, coverRequired }: { onStatusChange: (missing: number) => void; clientCode?: string; coverRequired?: string }) {
  const inputClass = "w-full border border-violet-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-[#35126d] focus:ring-2 focus:ring-violet-100";
  const labelClass = "text-xs font-semibold text-slate-600";

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatDateShort = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = monthNames[date.getMonth()];
    const year = String(date.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
  };

  const formatDateInput = (date: Date) => {
    return date.toISOString().slice(0, 10);
  };

  const localDateTime = (date: Date, zero = false) => { const d = new Date(date); if (zero) d.setHours(0, 0, 0, 0); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [issueDate, setIssueDate] = useState("");

  const [vehicleTypes, setVehicleTypes] = useState<string[]>([]);
  const [vehicleClasses, setVehicleClasses] = useState<string[]>([]);
  const [policyNo, setPolicyNo] = useState("");
  const [banks, setBanks] = useState<Array<{ Code: string; Name: string; BankName: string }>>([]);

  const [values, setValues] = useState({ vehicleType: "", fuelType: "", vehicleClass: "", vehicleStatus: "", lien: "", lienType: "", lienholder: "", issueDate: "", fromDate: "", toDate: "" });

  // Initialize dates on client side
  useEffect(() => {
    const today = new Date();
    setFromDate(localDateTime(today, true));
    setToDate(localDateTime(new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()), true));
    setIssueDate(localDateTime(today));
    setValues((prev) => ({ ...prev, issueDate: formatDate(today), fromDate: formatDateInput(today), toDate: formatDateInput(new Date(today.getFullYear() + 1, today.getMonth(), today.getDate())) }));
  }, []);

  // Fetch policy number from database
  const fetchPolicyNumber = useCallback(() => {
    const params = new URLSearchParams();
    if (values.vehicleClass) params.set("vehicleClass", values.vehicleClass);
    if (coverRequired) params.set("coverRequired", coverRequired);
    if (values.fromDate) params.set("fromDate", values.fromDate);
    fetch(`/api/motor/policy-number?${params.toString()}`)
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (data?.policyNo) setPolicyNo(data.policyNo); })
      .catch(() => undefined);
  }, [values.vehicleClass, coverRequired, values.fromDate]);

  useEffect(() => {
    fetchPolicyNumber();
  }, [fetchPolicyNumber]);

  const fuelTypes = ["Petrol", "Diesel", "Electric", "Hybrid"];

  // Fetch initial vehicle types (categories like Commercial Vehicle, Private Car, Two Wheelers)
  useEffect(() => {
    fetch("/api/motor/lookups")
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { setVehicleTypes(data?.vehicleTypes || []); })
      .catch(() => undefined);
  }, []);

  // Fetch vehicle classes (specific types like TANKER, TAXI CAR) when vehicleType or fuelType changes
  useEffect(() => {
    if (!values.vehicleType || !values.fuelType) {
      setVehicleClasses([]);
      return;
    }
    const controller = new AbortController();
    fetch(`/api/motor/lookups?vehicleType=${encodeURIComponent(values.vehicleType)}&fuelType=${encodeURIComponent(values.fuelType)}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (!controller.signal.aborted) setVehicleClasses(data?.vehicleClasses || []); })
      .catch(() => undefined);
    return () => controller.abort();
  }, [values.vehicleType, values.fuelType]);

  useEffect(() => {
    fetch("/api/motor/banks")
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { setBanks(data?.banks || []); })
      .catch(() => undefined);
  }, []);

  const setRequired = (field: keyof typeof values, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const vehicleTypeOptions = useMemo(() => {
    return [...new Set([...vehicleTypes, values.vehicleType].filter(Boolean))];
  }, [vehicleTypes, values.vehicleType]);

  const vehicleClassOptions = useMemo(() => {
    return [...new Set([...vehicleClasses, values.vehicleClass].filter(Boolean))];
  }, [vehicleClasses, values.vehicleClass]);
  const requiredSelect = (label: string, name: keyof typeof values, options: string[]) => (
    <label className="grid gap-1.5 sm:grid-cols-[130px_minmax(0,1fr)] sm:items-center">
      <span className={labelClass}>{label}<span className="text-rose-600"> *</span></span>
      <select name={name} value={values[name]} onChange={(event) => setRequired(name, event.target.value)} className={inputClass}>
        <option value="">Select {label.toLowerCase()}</option>{options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
  const documents = ["Certificate", "Vignette", "Sch", "Inv", "Premium", "Com", "PSSA", "Acc. Gen", "ICAC", "MIE", "AML", "AMCCU", "MRA", "PSEA", "BOM", "EWF", "Pro Note", "Summary", "Policy-wording", "KYC", "Scarcity", "Proposal"];
  const actions = ["Insert & Save", "Edit & Save", "View", "Print", "Not approved", "Approve", "Insert 2 NTA", "Reports in PDF", "Exit"];

  return (
    <div className="border border-violet-200 bg-[#f7f5fb]">
      <div>
        <div className="space-y-3 p-4 sm:p-6 lg:border-r lg:border-violet-200">
          <div className="space-y-3">
            <label className="grid gap-1.5 sm:grid-cols-[130px_minmax(0,1fr)] sm:items-center"><span className={labelClass}>Policy No.</span><input name="policyNo" value={policyNo} readOnly className={`${inputClass} bg-slate-100`} /></label>
            <label className="grid gap-1.5 sm:grid-cols-[130px_minmax(0,1fr)] sm:items-center"><span className={labelClass}>Country</span><select name="country" defaultValue="Mauritius" className={inputClass}><option>Mauritius</option><option>Rodrigues</option></select></label>
            <div className="grid gap-3 sm:grid-cols-[100px_1fr_100px_1fr] sm:items-center">
              <label className="grid gap-1.5 sm:grid-cols-[100px_minmax(0,1fr)] sm:items-center"><span className={labelClass}>Vehicle Type</span><select name="vehicleType" value={values.vehicleType} onChange={(e) => { setRequired("vehicleType", e.target.value); setRequired("vehicleClass", ""); }} className={inputClass}><option value="">Select vehicle type</option>{vehicleTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
              <label className="grid gap-1.5 sm:grid-cols-[100px_minmax(0,1fr)] sm:items-center"><span className={labelClass}>Fuel Type</span><select name="fuelType" value={values.fuelType} onChange={(e) => { setRequired("fuelType", e.target.value); setRequired("vehicleClass", ""); }} className={inputClass}><option value="">Select fuel type</option>{fuelTypes.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
            </div>
            <div className="grid gap-3 sm:grid-cols-[100px_1fr_100px_1fr] sm:items-center">
              <label className="grid gap-1.5 sm:grid-cols-[100px_minmax(0,1fr)] sm:items-center"><span className={labelClass}>Vehicle Class</span><select name="vehicleClass" value={values.vehicleClass} onChange={(e) => setRequired("vehicleClass", e.target.value)} className={inputClass}><option value="">Select vehicle class</option>{vehicleClassOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
              <label className="grid gap-1.5 sm:grid-cols-[100px_minmax(0,1fr)] sm:items-center">{requiredSelect("Vehicle Status", "vehicleStatus", ["NEW", "SECOND HAND", "RECON"])}</label>
            </div>
            <label className="grid gap-1.5 sm:grid-cols-[130px_minmax(0,1fr)] sm:items-center"><span className={labelClass}>Issue Date</span><input name="issueDate" value={values.issueDate} readOnly className={`${inputClass} bg-slate-100`} /></label>
            <div className="grid gap-3 sm:grid-cols-[100px_1fr_100px_1fr] sm:items-center">
              <label className="grid gap-1.5 sm:grid-cols-[100px_minmax(0,1fr)] sm:items-center"><span className={labelClass}>From Date</span><div className="relative"><input type="text" value={formatDateShort(new Date(values.fromDate))} readOnly className={`${inputClass} bg-slate-100 cursor-pointer`} /><input name="fromDate" type="date" value={values.fromDate} min={values.fromDate} onChange={(e) => { setFromDate(e.target.value); const d = new Date(e.target.value); setToDate(formatDateInput(new Date(d.getFullYear() + 1, d.getMonth(), d.getDate()))); setRequired("fromDate", e.target.value); setRequired("toDate", formatDateInput(new Date(d.getFullYear() + 1, d.getMonth(), d.getDate()))); }} className="absolute inset-0 opacity-0 cursor-pointer" /><svg className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 002 2v12a2 2 0 002 2z" /></svg></div></label>
              <label className="grid gap-1.5 sm:grid-cols-[100px_minmax(0,1fr)] sm:items-center"><span className={labelClass}>To Date</span><div className="relative"><input type="text" value={formatDateShort(new Date(toDate))} readOnly className={`${inputClass} bg-slate-100 cursor-pointer`} /><input name="toDate" type="date" value={toDate} min={values.fromDate} onChange={(e) => { setToDate(e.target.value); setRequired("toDate", e.target.value); }} className="absolute inset-0 opacity-0 cursor-pointer" /><svg className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 002 2v12a2 2 0 002 2z" /></svg></div></label>
            </div>
            <input type="hidden" name="clientCode" value={clientCode || ""} />
            <div className="grid gap-3 sm:grid-cols-[130px_1fr] sm:items-start"><label className={`${labelClass} flex items-center gap-2`}><input name="lien" type="checkbox" required checked={values.lien === "true"} onChange={(e) => setRequired("lien", String(e.target.checked))} className="accent-[#35126d]" /> Lien <span className="text-rose-600">*</span></label>{values.lien === "true" ? <div className="grid grid-cols-2 gap-2"><select name="lienType" required value={values.lienType} onChange={(e) => setRequired("lienType", e.target.value)} className={inputClass}><option value="No Lien">No Lien</option><option value="in favour of">in favour of</option><option value="on lease to">on lease to</option><option value="on account of">on account of</option><option value="on finance lease to">on finance lease to</option><option value="on lease (Financial)">on lease (Financial)</option><option value="on lease (Finance Lease) to">on lease (Finance Lease) to</option><option value="on financial lease to">on financial lease to</option><option value="on Operating lease to">on Operating lease to</option><option value="on lease (Financial) to">on lease (Financial) to</option></select>{values.lienType !== "No Lien" ? <select name="lienholder" required value={values.lienholder} onChange={(e) => setRequired("lienholder", e.target.value)} className={inputClass}><option value="">Select bank</option>{banks.map((bank) => <option key={bank.Code} value={bank.Name}>{bank.Name}</option>)}</select> : <input name="lienholder" value={values.lienholder} onChange={(e) => setRequired("lienholder", e.target.value)} placeholder="Lienholder" className={inputClass} />}</div> : null}</div>
          </div>
        </div>
        <aside className="hidden">
          <h3 className="border-b border-violet-100 pb-3 text-center text-sm font-bold uppercase tracking-wider text-[#35126d]">Print New Documents</h3>
          <div className="mt-4 grid grid-cols-3 gap-x-3 gap-y-4">{documents.map((document, index) => <label key={document} className="flex items-center gap-2 text-xs text-violet-700"><input type="radio" name="print-document" defaultChecked={index === 0} className="accent-[#35126d]" />{document}</label>)}</div>
          <div className="mt-6 grid grid-cols-3 gap-2">{actions.map((action) => <button key={action} type="button" className="min-h-16 border border-violet-200 bg-violet-50 px-2 py-3 text-xs font-semibold text-[#35126d] transition hover:bg-violet-100">{action}</button>)}</div>
          <label className="mt-5 block text-xs font-bold uppercase tracking-wider text-red-600">Remarks<textarea rows={4} className={`mt-2 ${inputClass}`} /></label>
        </aside>
      </div>
    </div>
  );
}

const sectionDescriptions: Record<string, string> = {
  KYC: "Policyholder identity and contact information",
  "Policy Details": "Cover dates, policy class and client records",
  "Vechicle Details": "Registration, engine and vehicle specifications",
  Accessories: "Optional equipment, discounts and loadings",
  "General Information": "Driver history, vehicle use and declarations",
  "Common Det.": "Usage, ownership and carrying capacity",
  Premium: "Covers, charges and final premium calculation",
  "Attached Document": "Upload and confirm supporting documents",
};

function SectionIcon({ title }: { title: string }) {
  if (title === "KYC") return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="3" /><path d="M5.5 20c.6-4 2.8-6 6.5-6s5.9 2 6.5 6" /></svg>;
  if (title === "Policy Details") return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 3h9l3 3v15H6z" /><path d="M9 10h6M9 14h6M9 18h4" /></svg>;
  if (title === "Vechicle Details") return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m5 16 1.5-6h11l1.5 6M4 16h16v4h-3v-2H7v2H4zM7 13h.01M17 13h.01" /></svg>;
  if (title === "Attached Document") return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 12.5 13.5 7a3 3 0 0 1 4.2 4.2l-7 7a5 5 0 0 1-7.1-7.1l7.2-7.2" /></svg>;
  if (title === "Premium") return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M15 8.5c-.7-.6-1.7-1-3-1-1.7 0-3 .9-3 2s1.1 1.8 3 2.2 3 1.1 3 2.3-1.3 2.2-3 2.2c-1.2 0-2.4-.4-3.2-1.2M12 5.5v13" /></svg>;
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3 4 7v5c0 4.6 3.4 7.8 8 9 4.6-1.2 8-4.4 8-9V7z" /><path d="m9 12 2 2 4-4" /></svg>;
}

function VehicleProposalForm({ policyCover, onPolicyCoverChange, onStatusChange, vehicleClass, vehicleType, fuelType, issueDate }: { policyCover: PolicyCover; onPolicyCoverChange: (cover: PolicyCover) => void; onStatusChange: (missing: number) => void; vehicleClass?: string; vehicleType?: string; fuelType?: string; issueDate?: string }) {
  const inputClass = "h-9 w-full border border-violet-200 bg-white px-2 text-sm text-slate-800 outline-none focus:border-[#35126d] focus:ring-2 focus:ring-violet-100";
  const labelClass = "text-xs font-semibold text-slate-600";
  const [requiredValues, setRequiredValues] = useState<Record<string, string>>({ vehicleNo: "", make: "", model: "", engineNo: "", chassisNo: "", gvw: "", trailerFeet: "", manufactureDate: "" });
  const [covers, setCovers] = useState<Array<{ name: string; code: number; youngDriverExcess: boolean }>>([]);
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [coverLocked, setCoverLocked] = useState(false);
  const [todayISO, setTodayISO] = useState("");

  // Excess options from database
  const [compulsoryExcessOptions, setCompulsoryExcessOptions] = useState<string[]>(["Select..."]);
  const [youngDriverExcessOptions, setYoungDriverExcessOptions] = useState<string[]>(["Select..."]);
  const [totalLossExcessValue, setTotalLossExcessValue] = useState("");
  const [tpfExcessOptions, setTpfExcessOptions] = useState<string[]>(["Select..."]);
  const [fetchingExcess, setFetchingExcess] = useState(false);

  useEffect(() => {
    const today = new Date();
    setTodayISO(today.toISOString().slice(0, 10));
  }, []);

  useEffect(() => {
    fetch("/api/motor/covers")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => data?.covers && setCovers(data.covers))
      .catch(() => undefined);
  }, []);

  // Fetch excess values when relevant fields change
  useEffect(() => {
    const cover = requiredValues.coverRequired;
    const isComprehensive = cover === "Comprehensive" || cover === "Comprehensive AutoPlus";
    if (!isComprehensive || !requiredValues.manufactureDate || !requiredValues.sumInsured) {
      return;
    }

    const controller = new AbortController();
    setFetchingExcess(true);

    const params = new URLSearchParams({
      vehicleClass: vehicleClass || "",
      vehicleType: vehicleType || "",
      fuelType: fuelType || "",
      make: requiredValues.make || "",
      model: requiredValues.model || "",
      sumInsured: requiredValues.sumInsured || "0",
      manufactureDate: requiredValues.manufactureDate || "",
      issueDate: issueDate || "",
      seating: requiredValues.seating || "0",
      country: "MAURITIUS"
    });

    fetch(`/api/motor/excess?${params.toString()}`, { signal: controller.signal })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (!controller.signal.aborted) {
          setCompulsoryExcessOptions(data?.compulsoryExcess || ["Select..."]);
          setYoungDriverExcessOptions(data?.youngDriverExcess || ["Select..."]);
          setTotalLossExcessValue(data?.totalLossExcess || "");
          setTpfExcessOptions(data?.tpfExcess || ["Select..."]);

          // Auto-set values if only one option
          setRequiredValues((prev) => {
            const next = { ...prev };
            if (data?.compulsoryExcess && data.compulsoryExcess.length === 1 && data.compulsoryExcess[0] !== "Select...") {
              next.compulsoryExcess = data.compulsoryExcess[0];
            }
            if (data?.youngDriverExcess && data.youngDriverExcess.length === 1 && data.youngDriverExcess[0] !== "Select...") {
              next.youngDriverExcess = data.youngDriverExcess[0];
            }
            if (data?.totalLossExcess) {
              next.totalLossExcess = data.totalLossExcess;
            }
            return next;
          });
        }
      })
      .catch(() => undefined)
      .finally(() => { if (!controller.signal.aborted) setFetchingExcess(false); });

    return () => controller.abort();
  }, [requiredValues.coverRequired, requiredValues.manufactureDate, requiredValues.sumInsured, requiredValues.make, requiredValues.model, vehicleClass, vehicleType, fuelType, issueDate]);

  useEffect(() => {
    if (!vehicleClass) { setMakes([]); setModels([]); return; }
    const controller = new AbortController();
    fetch(`/api/motor/lookups?vehicleClass=${encodeURIComponent(vehicleClass)}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (!controller.signal.aborted) { setMakes(data?.makes || []); setModels([]); } })
      .catch(() => undefined);
    return () => controller.abort();
  }, [vehicleClass]);

  useEffect(() => {
    if (!requiredValues.make) { setModels([]); return; }
    const controller = new AbortController();
    fetch(`/api/motor/lookups?make=${encodeURIComponent(requiredValues.make)}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (!controller.signal.aborted) setModels(data?.models || []); })
      .catch(() => undefined);
    return () => controller.abort();
  }, [requiredValues.make]);

  const updateManufactureDate = (date: string) => {
    setRequiredValues((prev) => {
      const next = { ...prev, manufactureDate: date };
      return next;
    });
  };

  useEffect(() => {
    if (!requiredValues.manufactureDate) {
      setCoverLocked(false);
      return;
    }
    const today = new Date();
    const fifteenDaysAgo = new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    if (requiredValues.manufactureDate >= fifteenDaysAgo) {
      setCoverLocked(true);
      onPolicyCoverChange("Comprehensive AutoPlus");
    } else {
      setCoverLocked(true);
      onPolicyCoverChange("Comprehensive");
    }
  }, [requiredValues.manufactureDate, onPolicyCoverChange]);

  const updateRequired = (name: string, value: string) => {
    setRequiredValues((prev) => {
      const next = { ...prev, [name]: value };
      return next;
    });
  };

  useEffect(() => {
    onStatusChange(Object.values(requiredValues).filter((item) => !item.trim()).length + (policyCover ? 0 : 1));
  }, [requiredValues, policyCover, onStatusChange]);
  const documents = ["Certificate", "Vignette", "Sch", "Inv", "Premium", "Com", "PSSA", "Acc. Gen", "ICAC", "MIE", "AML", "AMCCU", "MRA", "PSEA", "BOM", "EWF", "Pro Note", "Summary", "Policy-wording", "KYC", "Scarcity", "Proposal"];
  const actions = ["Insert & Save", "Edit & Save", "View", "Print", "Not approved", "Approve", "Insert 2 NTA", "Reports in PDF", "Exit"];

  const field = (label: string, name: string, type: "input" | "select" = "input", options?: string[], required?: boolean) => {
    // Special handling for excess fields with dynamic options
    let fieldOptions = options;
    if (name === "compulsoryExcess") fieldOptions = compulsoryExcessOptions;
    if (name === "youngDriverExcess") fieldOptions = youngDriverExcessOptions;
    if (name === "tpfExcess") fieldOptions = tpfExcessOptions;

    return (
      <label key={label} className="grid grid-cols-[135px_1fr] items-center gap-2">
        <span className={labelClass}>{label}{required ? <span className="text-rose-600"> *</span> : null}</span>
        {type === "select" ? <select name={name} value={requiredValues[name] || ""} onChange={(event) => updateRequired(name, event.target.value)} className={inputClass} disabled={fetchingExcess}><option value="">Select</option>{fieldOptions?.map((o) => <option key={o}>{o}</option>)}</select> : <input name={name} value={requiredValues[name] || ""} maxLength={name === "seating" ? 2 : undefined} inputMode={name === "seating" ? "numeric" : undefined} onChange={(event) => { let value = event.target.value; if (name === "vehicleNo") value = value.toUpperCase().replace(/[^A-Z0-9]/g, "").replace(/^([A-Z]+)(\d+)$/, "$1-$2"); if (name === "seating") value = value.replace(/\D/g, "").slice(0, 2); if (name === "gvw" || name === "trailerFeet") value = value.replace(/[^0-9.]/g, ""); updateRequired(name, value); }} className={inputClass} />}
      </label>
    );
  };

  const isGoodsVehicle = /GOODS VEHICLE\(PRIVATE\)|GOODS VEHICLE\(PUBLIC\)/i.test(vehicleType || "");
  const isTankerTrailerTractor = /TANKER|TRAILER|TRACTOR/i.test(vehicleType || "");

  const manufactureDateField = (
    <label className="grid grid-cols-[135px_1fr] items-center gap-2">
      <span className={labelClass}>Year Mfg. & Date of Reg.<span className="text-rose-600"> *</span></span>
      <input
        name="manufactureDate"
        type="date"
        value={requiredValues.manufactureDate || ""}
        max={todayISO}
        onChange={(event) => updateManufactureDate(event.target.value)}
        className={inputClass}
      />
    </label>
  );

  return (
    <div className="border border-violet-200 bg-[#f7f5fb]">
      <div>
        <div className="p-4 sm:p-5 lg:border-r lg:border-violet-200">
          <div className="grid gap-x-5 gap-y-3 sm:grid-cols-2">
            <div className="space-y-3">{field("Reg No", "vehicleNo")}{field("Make", "make", "select", makes)}{field("Model", "model", "select", models)}{field("Eng No", "engineNo")}{field("Chassis No", "chassisNo")}</div>
            <div className="space-y-3">{field("Colour", "colour")}{manufactureDateField}{field("Seating", "seating")}<label className="grid grid-cols-[135px_1fr] items-center gap-2"><span className={labelClass}>CC / kW</span><input name="cc" inputMode="decimal" onInput={e => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9.]/g, ""); }} className={inputClass} /></label>{isTankerTrailerTractor && <label className="grid grid-cols-[135px_1fr] items-center gap-2"><span className={labelClass}>Trailer Ft.</span><input name="trailerFeet" type="number" min="0" required={isTankerTrailerTractor} className={inputClass} /></label>}</div>
            {isGoodsVehicle && <label className="grid grid-cols-[135px_1fr] items-center gap-2"><span className={labelClass}>Gross Vehicle Weight</span><input name="gvw" type="number" required={isGoodsVehicle} className={inputClass} /></label>}
          </div>

          <fieldset className="mt-5 border-t border-violet-200 pt-4">
            <legend className="pr-3 text-sm font-bold text-[#35126d]">Cover Details</legend>
            <input type="hidden" name="calculateFromBasicTariff" value="true" />
            <div className="grid gap-x-5 gap-y-3 sm:grid-cols-2">
              <div className="space-y-3">
                <label className="grid gap-1.5 sm:grid-cols-[135px_minmax(0,1fr)] sm:items-center"><span className={labelClass}>Cover Required<span className="text-rose-600"> *</span></span><select name="coverRequired" value={policyCover} onChange={(event) => { if (!coverLocked) { onPolicyCoverChange(event.target.value as PolicyCover); onStatusChange(Object.values(requiredValues).filter((item) => !item.trim()).length + (event.target.value ? 0 : 1)); } }} className={inputClass} disabled={coverLocked}><option value="">Select cover</option>{covers.filter((cover) => cover.name === "COMPREHENSIVE" || cover.name === "COMPREHENSIVE AUTOPLUS").map((cover) => <option key={cover.name} value={cover.name === "COMPREHENSIVE" ? "Comprehensive" : cover.name === "COMPREHENSIVE AUTOPLUS" ? "Comprehensive AutoPlus" : cover.name}>{cover.name === "COMPREHENSIVE" ? "Comprehensive" : cover.name === "COMPREHENSIVE AUTOPLUS" ? "Comprehensive AutoPlus" : cover.name}</option>)}</select></label>
                {field("Young Driver Excess", "youngDriverExcess", "select", youngDriverExcessOptions)}{field("Total Loss Excess", "totalLossExcess", "input")}
              </div>
              <div className="space-y-3">{field("Sum Insured", "sumInsured", "input", undefined, true)}{field("Compulsory Excess", "compulsoryExcess", "select", compulsoryExcessOptions)}</div>
            </div>
          </fieldset>
        </div>
        <aside className="hidden">
          <div className="mt-4 grid grid-cols-3 gap-x-3 gap-y-4">{documents.map((document, index) => <label key={document} className="flex items-center gap-2 text-xs text-violet-700"><input type="radio" name="vehicle-print-document" defaultChecked={index === 0} className="accent-[#35126d]" />{document}</label>)}</div>
          <div className="mt-6 grid grid-cols-3 gap-2">{actions.map((action) => <button key={action} type="button" className="min-h-16 border border-violet-200 bg-violet-50 px-2 py-3 text-xs font-semibold text-[#35126d] hover:bg-violet-100">{action}</button>)}</div>
        </aside>
      </div>
    </div>
  );
}

function TrailersAndOthersForm() {
  const inputClass = "h-9 w-full border border-violet-200 bg-white px-2 text-sm text-slate-800 outline-none focus:border-[#35126d] focus:ring-2 focus:ring-violet-100";
  const documents = ["Certificate", "Vignette", "Sch", "Inv", "Premium", "Com", "PSSA", "Acc. Gen", "ICAC", "MIE", "AML", "AMCCU", "MRA", "PSEA", "BOM", "EWF", "Pro Note", "Summary", "Policy-wording", "KYC", "Scarcity", "Proposal"];
  const actions = ["Insert & Save", "Edit & Save", "View", "Print", "Not approved", "Approve", "Insert 2 NTA", "Reports in PDF", "Exit"];
  const columns = ["Reg No", "Make", "Model", "Chassis No", "Status", "Sum Insured", "Rate", "Premium", "Excess (Comp)", "Excess (Young)"];

  return (
    <div className="border border-violet-200 bg-[#f7f5fb]">

      <div>
        <div className="p-4 sm:p-5 lg:border-r lg:border-violet-200">
          <div className="grid gap-3 sm:grid-cols-[130px_1fr_55px_150px] sm:items-center">
            <label className="text-xs font-semibold text-slate-600">Cover Required</label>
            <select className={inputClass}><option>Select cover</option></select>
            <label className="text-xs font-semibold text-slate-600">Feet</label>
            <input type="number" min="0" className={inputClass} />
          </div>

          <div className="mt-4 overflow-x-auto border border-violet-200">
            <table className="w-full min-w-[900px] border-collapse text-left text-xs">
              <thead><tr className="bg-violet-100 text-[#35126d]">{columns.map((column) => <th key={column} className="border-r border-violet-200 px-2 py-2 font-semibold last:border-r-0">{column}</th>)}</tr></thead>
              <tbody><tr className="bg-slate-100">{columns.map((column) => <td key={column} className="h-44 border-r border-violet-100 last:border-r-0" />)}</tr></tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" className="h-9 bg-[#35126d] px-5 text-xs font-bold text-white hover:bg-violet-800">Calculate Premium</button>
            <label className="flex items-center gap-3 text-xs font-semibold text-slate-600 sm:w-64"><span>Total Premium</span><input type="number" defaultValue="0" className={inputClass} /></label>
          </div>

          <div className="mt-4 space-y-3">
            <label className="grid gap-2 sm:grid-cols-[210px_1fr]"><span className="pt-2 text-xs font-semibold text-slate-600">Additional Information (if required)</span><textarea rows={2} className="w-full border border-violet-200 bg-white px-2 py-2 text-sm outline-none focus:border-[#35126d] focus:ring-2 focus:ring-violet-100" /></label>
            <label className="grid gap-2 sm:grid-cols-[210px_1fr]"><span className="pt-2 text-xs font-semibold text-slate-600">Remarks (Super User)</span><textarea rows={2} className="w-full border border-violet-200 bg-white px-2 py-2 text-sm outline-none focus:border-[#35126d] focus:ring-2 focus:ring-violet-100" /></label>
            <label className="grid gap-2 sm:grid-cols-[210px_1fr]"><span className="pt-2 text-xs font-semibold text-slate-600">Point (6)</span><textarea rows={2} className="w-full border border-violet-200 bg-white px-2 py-2 text-sm outline-none focus:border-[#35126d] focus:ring-2 focus:ring-violet-100" /></label>
            <label className="grid gap-2 sm:grid-cols-[210px_1fr]"><span className="pt-2 text-xs font-semibold text-slate-600">Point (7)</span><textarea rows={2} className="w-full border border-violet-200 bg-white px-2 py-2 text-sm outline-none focus:border-[#35126d] focus:ring-2 focus:ring-violet-100" /></label>
          </div>
        </div>

        <aside className="hidden">
          <h3 className="border-b border-violet-100 pb-3 text-center text-sm font-bold uppercase tracking-wider text-[#35126d]">Print New Documents</h3>
          <div className="mt-4 grid grid-cols-3 gap-x-3 gap-y-4">{documents.map((document, index) => <label key={document} className="flex items-center gap-2 text-xs text-violet-700"><input type="radio" name="trailer-print-document" defaultChecked={index === 0} className="accent-[#35126d]" />{document}</label>)}</div>
          <div className="mt-6 grid grid-cols-3 gap-2">{actions.map((action) => <button key={action} type="button" className="min-h-16 border border-violet-200 bg-violet-50 px-2 py-3 text-xs font-semibold text-[#35126d] hover:bg-violet-100">{action}</button>)}</div>
          <label className="mt-5 block text-xs font-bold uppercase tracking-wider text-red-600">Remarks<textarea rows={4} className={`mt-2 ${inputClass}`} /></label>
        </aside>
      </div>
    </div>
  );
}

function AccessoriesForm() {
  const inputClass = "h-9 w-full border border-violet-200 bg-white px-2 text-sm text-slate-800 outline-none focus:border-[#35126d] focus:ring-2 focus:ring-violet-100";
  const documents = ["Certificate", "Vignette", "Sch", "Inv", "Premium", "Com", "PSSA", "Acc. Gen", "ICAC", "MIE", "AML", "AMCCU", "MRA", "PSEA", "BOM", "EWF", "Pro Note", "Summary", "Policy-wording", "KYC", "Scarcity", "Proposal"];
  const actions = ["Insert & Save", "Edit & Save", "View", "Print", "Not approved", "Approve", "Insert 2 NTA", "Reports in PDF", "Exit"];
  const [accessories, setAccessories] = useState<Array<{ name: string; rate: number }>>([]);
  const [amounts, setAmounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/motor/accessories")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => data?.accessories && setAccessories(data.accessories))
      .catch(() => undefined);
  }, []);

  const updateAmount = (index: number, value: string) => {
    const amount = Number(value) || 0;
    setAmounts(prev => ({ ...prev, [index]: amount }));
  };

  const getPremium = (index: number) => {
    const rate = accessories[index]?.rate || 0;
    const amount = amounts[index] || 0;
    return (rate * amount / 100).toFixed(2);
  };

  return (
    <div className="border border-violet-200 bg-[#f7f5fb]">

      <div>
        <div className="p-4 sm:p-5 lg:border-r lg:border-violet-200">
          <div className="max-h-[520px] overflow-auto border border-violet-200">
            <table className="w-full min-w-[720px] border-collapse text-left text-xs">
              <thead className="sticky top-0 z-10"><tr className="bg-violet-100 text-[#35126d]"><th className="border-r border-violet-200 px-2 py-2">Description</th><th className="border-r border-violet-200 px-2 py-2">Make & Model</th><th className="border-r border-violet-200 px-2 py-2">Rate</th><th className="border-r border-violet-200 px-2 py-2">Amount</th><th className="px-2 py-2">Premium</th></tr></thead>
              <tbody>{accessories.map((accessory, index) => <tr key={accessory.name} className={index % 2 === 0 ? "bg-white" : "bg-emerald-50"}><td className="border-b border-r border-violet-100 px-2 py-1.5 font-medium text-slate-700">{accessory.name}</td><td className="border-b border-r border-violet-100 p-1"><input name={`accessoryMakeModel_${index}`} className="h-7 w-full border border-transparent bg-transparent px-1 outline-none focus:border-violet-300 focus:bg-white" /></td><td className="border-b border-r border-violet-100 px-2 text-right text-slate-600">{accessory.rate}</td><td className="border-b border-r border-violet-100 p-1"><input name={`accessoryAmount_${index}`} type="number" min="0" step="0.01" value={amounts[index] || ""} onChange={(e) => updateAmount(index, e.target.value)} className="h-7 w-full bg-transparent px-1 outline-none focus:bg-white" /><input type="hidden" name={`accessoryPremium_${index}`} value={getPremium(index)} /></td><td className="border-b border-violet-100 px-2 text-right text-slate-600"><input type="text" name={`accessoryPremiumDisplay_${index}`} value={getPremium(index)} readOnly className="h-7 w-full bg-slate-50 text-right px-1 outline-none" /></td></tr>)}</tbody>
            </table>
          </div>
          <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-3 text-xs font-semibold text-slate-600 sm:w-64"><span>Total Premium</span><input type="number" defaultValue="0" className={inputClass} /></label>
          </div>
        </div>

        <aside className="hidden">
          <h3 className="border-b border-violet-100 pb-3 text-center text-sm font-bold uppercase tracking-wider text-[#35126d]">Print New Documents</h3>
          <div className="mt-4 grid grid-cols-3 gap-x-3 gap-y-4">{documents.map((document, index) => <label key={document} className="flex items-center gap-2 text-xs text-violet-700"><input type="radio" name="accessory-print-document" defaultChecked={index === 0} className="accent-[#35126d]" />{document}</label>)}</div>
          <div className="mt-6 grid grid-cols-3 gap-2">{actions.map((action) => <button key={action} type="button" className="min-h-16 border border-violet-200 bg-violet-50 px-2 py-3 text-xs font-semibold text-[#35126d] hover:bg-violet-100">{action}</button>)}</div>
          <label className="mt-5 block text-xs font-bold uppercase tracking-wider text-red-600">Remarks<textarea rows={4} className={`mt-2 ${inputClass}`} /></label>
        </aside>
      </div>
    </div>
  );
}

function GeneralInformationForm() {
  const inputClass = "h-9 w-full border border-violet-200 bg-white px-2 text-sm text-slate-800 outline-none focus:border-[#35126d] focus:ring-2 focus:ring-violet-100";
  const documents = ["Certificate", "Vignette", "Sch", "Inv", "Premium", "Com", "PSSA", "Acc. Gen", "ICAC", "MIE", "AML", "AMCCU", "MRA", "PSEA", "BOM", "EWF", "Pro Note", "Summary", "Policy-wording", "KYC", "Scarcity", "Proposal"];
  const actions = ["Insert & Save", "Edit & Save", "View", "Print", "Not approved", "Approve", "Insert 2 NTA", "Reports in PDF", "Exit"];
  const questions = [
    "Do you or any other person who to your knowledge will drive suffer from defective vision or hearing or from any physical infirmity?",
    "Do you require insurance to be restricted to the vehicle being driven solely by yourself?",
    "If Yes, please specify details of other drivers with valid licence in Mauritius.",
    "Will the vehicle be used exclusively for private, social, domestic, pleasure and professional purpose?",
    "Carriage of goods other than samples or personal luggage?",
    "Is the vehicle in good condition free from any defect?",
    "Has the driver ever been involved or convicted for causing any accident or loss?",
    "Has any insurance company ever declined or refused to continue any insurance of yours?",
  ];

  return (
    <div className="border border-violet-200 bg-[#f7f5fb]">

      <div>
        <div className="space-y-3 p-4 sm:p-5 lg:border-r lg:border-violet-200">
          {questions.slice(0, 2).map((question, index) => <div key={question} className="grid gap-3 sm:grid-cols-[22px_1fr_105px]"><span className="text-xs font-semibold">{String.fromCharCode(97 + index)})</span><p className="text-xs leading-5 text-slate-700">{question}</p><div className="flex items-center gap-4 text-xs"><label className="flex items-center gap-1"><input type="radio" name={`general-${index}`} className="accent-[#35126d]" />Yes</label><label className="flex items-center gap-1"><input type="radio" name={`general-${index}`} className="accent-[#35126d]" />No</label></div></div>)}

          <div className="grid gap-3 sm:grid-cols-[22px_1fr_220px]"><span className="text-xs font-semibold">c)</span><p className="text-xs leading-5 text-slate-700">{questions[2]}</p><div className="overflow-hidden border border-violet-200"><div className="grid grid-cols-[1fr_50px] bg-violet-100 px-2 py-1 text-[11px] font-semibold"><span>Name</span><span>Age</span></div><div className="h-12 bg-slate-100" /></div></div>

          {questions.slice(3, 6).map((question, index) => <div key={question} className="grid gap-3 sm:grid-cols-[22px_1fr_105px]"><span className="text-xs font-semibold">{String.fromCharCode(100 + index)})</span><p className="text-xs leading-5 text-slate-700">{question}</p><div className="flex items-center gap-4 text-xs"><label className="flex items-center gap-1"><input type="radio" name={`general-${index + 3}`} className="accent-[#35126d]" />Yes</label><label className="flex items-center gap-1"><input type="radio" name={`general-${index + 3}`} className="accent-[#35126d]" />No</label></div></div>)}

          <div className="grid gap-3 border-y border-violet-100 py-3 sm:grid-cols-[150px_1fr_150px_1fr]"><label className="text-xs font-semibold text-slate-600">Licence Number</label><input className={inputClass} /><label className="text-xs font-semibold text-slate-600">Issued Date</label><input type="date" className={inputClass} /></div>
          <div className="grid gap-3 sm:grid-cols-[250px_1fr]"><p className="text-xs leading-5 text-slate-700">State of Driving Licence / Licence</p><div className="flex gap-5 text-xs"><label className="flex items-center gap-1"><input type="radio" name="licence-state" className="accent-[#35126d]" />Permanent</label><label className="flex items-center gap-1"><input type="radio" name="licence-state" className="accent-[#35126d]" />Learner</label></div></div>
          <label className="grid gap-3 sm:grid-cols-[250px_1fr]"><span className="text-xs leading-5 text-slate-700">Number of years you have held a valid licence to drive motor vehicles in Mauritius</span><input type="number" min="0" className={inputClass} /></label>

          <div><p className="mb-2 text-xs leading-5 text-slate-700">Give details of accidents or claims (including pending prosecution, if any)</p><div className="overflow-x-auto border border-violet-200"><table className="w-full min-w-[620px] border-collapse text-left text-xs"><thead><tr className="bg-violet-100 text-[#35126d]"><th className="border-r border-violet-200 px-2 py-2">Driver Name</th><th className="border-r border-violet-200 px-2 py-2">Date of Accident</th><th className="border-r border-violet-200 px-2 py-2">Circumstances of Accident/Claim</th><th className="px-2 py-2">Loss/Cost Rs.</th></tr></thead><tbody><tr className="bg-amber-50"><td className="h-8 border-r border-violet-100" /><td className="border-r border-violet-100" /><td className="border-r border-violet-100" /><td /></tr><tr className="bg-emerald-50"><td className="h-8 border-r border-violet-100" /><td className="border-r border-violet-100" /><td className="border-r border-violet-100" /><td /></tr></tbody></table></div></div>

          <label className="grid gap-3 sm:grid-cols-[290px_1fr]"><span className="text-xs text-slate-700">Name of the insurance company previously insured with</span><select className={inputClass}><option>Select company</option></select></label>
          <label className="grid gap-3 sm:grid-cols-[290px_1fr]"><span className="text-xs text-slate-700">Details of past claims (total claims for 5 years)</span><input className={inputClass} /></label>
          {questions.slice(6).map((question, index) => <div key={question} className="grid gap-3 sm:grid-cols-[22px_1fr_105px]"><span className="text-xs font-semibold">{String.fromCharCode(108 + index)})</span><p className="text-xs leading-5 text-slate-700">{question}</p><div className="flex items-center gap-4 text-xs"><label className="flex items-center gap-1"><input type="radio" name={`general-${index + 6}`} className="accent-[#35126d]" />Yes</label><label className="flex items-center gap-1"><input type="radio" name={`general-${index + 6}`} className="accent-[#35126d]" />No</label></div></div>)}
          <label className="grid gap-3 sm:grid-cols-[290px_1fr]"><span className="text-xs text-slate-700">Price paid by you</span><input name="pricePaid" type="number" min="0" step="0.01" className={inputClass} /></label>
          <label className="grid gap-3 sm:grid-cols-[290px_1fr]"><span className="text-xs text-slate-700">Date of purchase of vehicle</span><input type="date" className={inputClass} /></label>
          <label className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#35126d]"><input name="generalInformationConfirmed" type="checkbox" className="accent-[#35126d]" /> I confirm the general information declarations are complete.</label>
        </div>

        <aside className="hidden">
          <h3 className="border-b border-violet-100 pb-3 text-center text-sm font-bold uppercase tracking-wider text-[#35126d]">Print New Documents</h3>
          <div className="mt-4 grid grid-cols-3 gap-x-3 gap-y-4">{documents.map((document, index) => <label key={document} className="flex items-center gap-2 text-xs text-violet-700"><input type="radio" name="general-print-document" defaultChecked={index === 0} className="accent-[#35126d]" />{document}</label>)}</div>
          <div className="mt-6 grid grid-cols-3 gap-2">{actions.map((action) => <button key={action} type="button" className="min-h-16 border border-violet-200 bg-violet-50 px-2 py-3 text-xs font-semibold text-[#35126d] hover:bg-violet-100">{action}</button>)}</div>
          <label className="mt-5 block text-xs font-bold uppercase tracking-wider text-red-600">Remarks<textarea rows={4} className={`mt-2 ${inputClass}`} /></label>
        </aside>
      </div>
    </div>
  );
}

function CommonDetailsForm() {
  const inputClass = "h-9 w-full border border-violet-200 bg-white px-2 text-sm text-slate-800 outline-none focus:border-[#35126d] focus:ring-2 focus:ring-violet-100";
  const documents = ["Certificate", "Vignette", "Sch", "Inv", "Premium", "Com", "PSSA", "Acc. Gen", "ICAC", "MIE", "AML", "AMCCU", "MRA", "PSEA", "BOM", "EWF", "Pro Note", "Summary", "Policy-wording", "KYC", "Scarcity", "Proposal"];
  const actions = ["Insert & Save", "Edit & Save", "View", "Print", "Not approved", "Approve", "Insert 2 NTA", "Reports in PDF", "Exit"];
  const yesNo = (name: string) => <div className="flex items-center gap-5 text-xs"><label className="flex items-center gap-1"><input type="radio" name={name} className="accent-[#35126d]" />Yes</label><label className="flex items-center gap-1"><input type="radio" name={name} className="accent-[#35126d]" />No</label></div>;

  return (
    <div className="border border-violet-200 bg-[#f7f5fb]">

      <div>
        <div className="space-y-4 p-4 sm:p-6 lg:border-r lg:border-violet-200">
          <div className="grid gap-3 sm:grid-cols-[22px_1fr_minmax(360px,1.2fr)]"><span className="text-xs font-semibold">a)</span><p className="text-xs leading-5 text-slate-700">Purpose for which vehicle will be used</p><div className="flex flex-wrap gap-x-5 gap-y-2 text-xs"><label className="flex items-center gap-1"><input type="radio" name="vehicle-purpose" className="accent-[#35126d]" />Passenger Carry</label><label className="flex items-center gap-1"><input type="radio" name="vehicle-purpose" className="accent-[#35126d]" />Commercial</label><label className="flex items-center gap-1"><input type="radio" name="vehicle-purpose" className="accent-[#35126d]" />Goods Carry</label><label className="flex items-center gap-1"><input type="radio" name="vehicle-purpose" className="accent-[#35126d]" />Other</label></div></div>
          <div className="grid gap-3 sm:grid-cols-[22px_1fr_minmax(360px,1.2fr)]"><span className="text-xs font-semibold">b)</span><p className="text-xs leading-5 text-slate-700">If vehicle used for carriage of goods specify its nature</p><div className="flex flex-wrap gap-x-5 gap-y-2 text-xs"><label className="flex items-center gap-1"><input type="radio" name="goods-nature" className="accent-[#35126d]" />General</label><label className="flex items-center gap-1"><input type="radio" name="goods-nature" className="accent-[#35126d]" />Hazardous</label></div></div>
          <div className="grid gap-3 sm:grid-cols-[22px_1fr_230px]"><span className="text-xs font-semibold">c)</span><p className="text-xs leading-5 text-slate-700">If hazardous cargo will be carried state whether explosives or petrol will be carried</p>{yesNo("hazardous-cargo")}</div>
          <div className="grid gap-3 sm:grid-cols-[22px_1fr_230px]"><span className="text-xs font-semibold">d)</span><p className="text-xs leading-5 text-slate-700">Vehicle registered in your name</p>{yesNo("registered-name")}</div>
          <div className="grid gap-3 sm:grid-cols-[22px_1fr_230px]"><span className="text-xs font-semibold">e)</span><p className="text-xs leading-5 text-slate-700">Has any alteration or addition been made to manufacturer&apos;s standard design</p>{yesNo("altered-design")}</div>
          <label className="grid gap-3 sm:ml-[22px] sm:grid-cols-[1fr_1.2fr]"><span className="text-xs leading-5 text-slate-500">If yes, provide alteration details</span><textarea rows={3} className="w-full border border-violet-200 bg-white px-2 py-2 text-sm outline-none focus:border-[#35126d] focus:ring-2 focus:ring-violet-100" /></label>
          <div className="grid gap-3 border-y border-violet-100 py-4 sm:grid-cols-[22px_1fr_170px_1fr]"><span className="text-xs font-semibold">f)</span><p className="text-xs leading-5 text-slate-700">Maximum licensed carrying capacity (No. of passengers) in case of passenger carrying vehicle.</p><label className="text-xs font-semibold text-slate-600">No. of Passengers</label><input type="number" min="0" className={inputClass} /></div>
          <div className="grid gap-3 sm:grid-cols-[22px_1fr_230px]"><span className="text-xs font-semibold">g)</span><p className="text-xs leading-5 text-slate-700">Whether the use of the vehicle is limited to own premises</p>{yesNo("own-premises")}</div>
          <div className="grid gap-3 sm:grid-cols-[22px_1fr_230px]"><span className="text-xs font-semibold">h)</span><p className="text-xs leading-5 text-slate-700">Whether the commercial vehicle is also used for private purpose</p>{yesNo("private-purpose")}</div>
          <label className="grid gap-3 sm:ml-[22px] sm:grid-cols-[1fr_1.2fr]"><span className="text-xs leading-5 text-slate-700">Excluding use for hire / reward</span><textarea rows={3} className="w-full border border-violet-200 bg-white px-2 py-2 text-sm outline-none focus:border-[#35126d] focus:ring-2 focus:ring-violet-100" /></label>
          <label className="grid gap-3 sm:ml-[22px] sm:grid-cols-[1fr_1.2fr]"><span className="text-xs leading-5 text-slate-700">If yes please give details</span><textarea rows={3} className="w-full border border-violet-200 bg-white px-2 py-2 text-sm outline-none focus:border-[#35126d] focus:ring-2 focus:ring-violet-100" /></label>
          <label className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#35126d]"><input name="commonDetailsConfirmed" type="checkbox" className="accent-[#35126d]" /> I confirm the common vehicle details are complete.</label>
        </div>

        <aside className="hidden">
          <h3 className="border-b border-violet-100 pb-3 text-center text-sm font-bold uppercase tracking-wider text-[#35126d]">Print New Documents</h3>
          <div className="mt-4 grid grid-cols-3 gap-x-3 gap-y-4">{documents.map((document, index) => <label key={document} className="flex items-center gap-2 text-xs text-violet-700"><input type="radio" name="common-print-document" defaultChecked={index === 0} className="accent-[#35126d]" />{document}</label>)}</div>
          <div className="mt-6 grid grid-cols-3 gap-2">{actions.map((action) => <button key={action} type="button" className="min-h-16 border border-violet-200 bg-violet-50 px-2 py-3 text-xs font-semibold text-[#35126d] hover:bg-violet-100">{action}</button>)}</div>
          <label className="mt-5 block text-xs font-bold uppercase tracking-wider text-red-600">Remarks<textarea rows={4} className={`mt-2 ${inputClass}`} /></label>
        </aside>
      </div>
    </div>
  );
}

function PremiumForm() {
  const inputClass = "h-8 w-full border border-violet-200 bg-white px-2 text-xs text-slate-800 outline-none focus:border-[#35126d] focus:ring-2 focus:ring-violet-100";
  const documents = ["Certificate", "Vignette", "Sch", "Inv", "Premium", "Com", "PSSA", "Acc. Gen", "ICAC", "MIE", "AML", "AMCCU", "MRA", "PSEA", "BOM", "EWF", "Pro Note", "Summary", "Policy-wording", "KYC", "Scarcity", "Proposal"];
  const actions = ["Insert & Save", "Edit & Save", "View", "Print", "Not approved", "Approve", "Insert 2 NTA", "Reports in PDF", "Exit"];
  const leftGroups = [
    ["Additional Cover", ["Passenger Risk", "Personal Accident", "PA (Conductor)", "PA (Employee)", "PA (Family Members)", "Auto Plus", "Driver Only", "Loss of Use", "Towing"]],
    ["Add Extra Perils", ["Strike, Riot and Civil Commotion", "Earthquake", "Cyclone"]],
    ["Discounts", ["No Claim Bonus", "Fleet Discount", "Special Discount"]],
    ["Claim/Other Loading", ["Claim Loading"]],
  ];
  const additionalCovers = ["Windscreen Extension", "Waiver of Excess", "Loss of Car Keys", "Airfreight Expenses", "Personal Belongings", "Damage by Rodents", "Accidental Misfuelling", "Enhanced Personal Accidental", "Funeral Expenses"];

  const optionTable = (title: string, rows: string[]) => <div key={title} className="border border-violet-200"><div className="grid grid-cols-[1fr_52px_80px] bg-[#7766db] px-2 py-1.5 text-[11px] font-bold text-white"><span>{title}</span><span>No</span><span>Amount</span></div>{rows.map((row, index) => <div key={row} className={`grid grid-cols-[1fr_52px_80px] items-center border-t border-violet-100 px-2 py-1 ${index % 2 ? "bg-violet-50/50" : "bg-white"}`}><label className="flex items-center gap-2 text-xs"><input type="checkbox" className="accent-[#35126d]" />{row}</label><input type="number" className="h-6 w-11 border border-violet-100 bg-transparent px-1" aria-label={`${row} number`} /><input type="number" defaultValue="0" className="h-6 w-full border border-violet-100 bg-transparent px-1 text-right" aria-label={`${row} amount`} /></div>)}</div>;

  return (
    <div className="border border-violet-200 bg-[#f7f5fb]">

      <div>
        <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-2 lg:border-r lg:border-violet-200">
          <div className="space-y-3">
            <div className="border border-violet-200 bg-white p-2"><label className="flex items-center gap-2 text-xs font-semibold text-[#35126d]"><input type="checkbox" className="accent-[#35126d]" />Remove only Commission</label><div className="mt-2 grid grid-cols-[1fr_90px] gap-2"><label className="flex items-center gap-2 text-xs"><input type="checkbox" />Basic Rate</label><input className={inputClass} /><label className="flex items-center gap-2 text-xs"><input type="checkbox" />Fap Risk</label><input className={inputClass} /></div></div>
            {leftGroups.map(([title, rows]) => optionTable(title as string, rows as string[]))}
            <button type="button" className="float-right h-9 bg-[#35126d] px-6 text-xs font-bold text-white hover:bg-violet-800">Get Discount %</button>
          </div>

          <div className="space-y-3">
            {optionTable("Additional Cover", additionalCovers)}
            <div className="grid grid-cols-[110px_1fr_65px_1fr] items-center gap-2"><label className="text-xs font-semibold">Authorized by</label><select className={inputClass}><option>Select</option></select><label className="text-xs font-semibold">Remarks</label><input className={inputClass} /></div>
            <div className="flex flex-wrap gap-5 py-1 text-xs"><label className="flex items-center gap-1"><input type="radio" name="premium-period" defaultChecked className="accent-[#35126d]" />Annual</label><label className="flex items-center gap-1"><input type="radio" name="premium-period" className="accent-[#35126d]" />Pro Rata</label><label className="flex items-center gap-1"><input type="radio" name="premium-period" className="accent-[#35126d]" />Short Period</label></div>
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">{[["Total Premium (Incl. Tow)", "", "premium"], ["Doc. Charges", "150", "documentCharge"], ["Levy Charge", "0.39", "levy"], ["Hit & Run Charge", "", "hitAndRun"], ["Inv. Amount", "150", "invoiceAmount"]].map(([label, value, name]) => <label key={label} className="grid grid-cols-[1fr_70px] items-center gap-2 text-xs font-semibold"><span>{label}</span><input name={name} type="number" defaultValue={value} className={inputClass} /></label>)}</div>
              <div className="space-y-2">{["Currency", "Ex. Rate", "Sum Insured", "Premium", "Doc.", "Levy", "Inv. Amount", "Com. Amt"].map((label) => <label key={label} className="grid grid-cols-[1fr_70px] items-center gap-2 text-xs"><span>{label}</span>{label === "Currency" ? <select className={inputClass}><option>MUR</option></select> : <input type="number" defaultValue="0" className={inputClass} />}</label>)}</div>
            </div>
            <div><label className="text-xs font-semibold">Remarks for Other Loading<textarea name="remarks" rows={3} className="mt-1 w-full border border-violet-200 bg-white p-2 font-normal outline-none focus:border-[#35126d]" /></label></div>
            <label className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#35126d]"><input name="premiumConfirmed" type="checkbox" className="accent-[#35126d]" /> I confirm the premium and charges are complete.</label>
          </div>
        </div>

        <aside className="hidden">
          <h3 className="border-b border-violet-100 pb-3 text-center text-sm font-bold uppercase tracking-wider text-[#35126d]">Print New Documents</h3>
          <div className="mt-4 grid grid-cols-3 gap-x-3 gap-y-4">{documents.map((document, index) => <label key={document} className="flex items-center gap-2 text-xs text-violet-700"><input type="radio" name="premium-print-document" defaultChecked={index === 0} className="accent-[#35126d]" />{document}</label>)}</div>
          <div className="mt-6 grid grid-cols-3 gap-2">{actions.map((action) => <button key={action} type="button" className="min-h-16 border border-violet-200 bg-violet-50 px-2 py-3 text-xs font-semibold text-[#35126d] hover:bg-violet-100">{action}</button>)}</div>
          <label className="mt-5 block text-xs font-bold uppercase tracking-wider text-red-600">Remarks<textarea rows={4} className={`mt-2 ${inputClass}`} /></label>
        </aside>
      </div>
    </div>
  );
}

function AttachedDocumentForm() {
  const inputClass = "h-9 w-full border border-violet-200 bg-white px-2 text-sm text-slate-800 outline-none focus:border-[#35126d] focus:ring-2 focus:ring-violet-100";
  const documents = ["Certificate", "Vignette", "Sch", "Inv", "Premium", "Com", "PSSA", "Acc. Gen", "ICAC", "MIE", "AML", "AMCCU", "MRA", "PSEA", "BOM", "EWF", "Pro Note", "Summary", "Policy-wording", "KYC", "Scarcity", "Proposal"];
  const requiredDocuments = ["Licence", "NID_Passport_Ben", "HorsePower SaleDeed", "ProposalForm", "KYC_AddressProof"];
  const actions = ["Insert & Save", "Edit & Save", "View", "Print", "Not approved", "Approve", "Insert 2 NTA", "Reports in PDF", "Exit"];

  return (
    <div className="border border-violet-200 bg-[#f7f5fb]">

      <div>
        <div className="p-4 sm:p-5 lg:border-r lg:border-violet-200">
          <p className="text-xs font-bold uppercase text-slate-800">Click the below link to attach the policy documents</p>
          <label className="mt-3 grid max-w-md grid-cols-[100px_1fr] items-center gap-3"><span className="text-xs font-semibold text-slate-600">Doc Type</span><select className={inputClass}><option>Select document type</option><option>Licence</option><option>National ID / Passport</option><option>Sale Deed</option><option>Proposal Form</option><option>Address Proof</option></select></label>

          <div className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1.7fr)_minmax(220px,0.8fr)]">
            <div className="overflow-hidden border border-violet-200">
              <div className="grid grid-cols-[55px_1fr] bg-violet-100 px-2 py-2 text-xs font-bold text-[#35126d]"><span>Sl-no</span><span>File-Name</span></div>
              <div className="min-h-[330px] bg-slate-100">
                {[1, 2, 3, 4, 5].map((row) => <button key={row} type="button" className={`grid h-9 w-full grid-cols-[55px_1fr] border-t border-violet-100 text-left text-xs ${row % 2 === 0 ? "bg-emerald-50" : "bg-white"}`}><span className="border-r border-violet-100 px-2 py-2">{row}</span><span className="px-2 py-2 text-violet-600">{row === 1 ? "Click to attach document" : ""}</span></button>)}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-bold leading-5 text-slate-700">Check to confirm the below documents uploaded in the system</p>
              <div className="overflow-hidden border border-violet-200"><div className="grid grid-cols-[1fr_70px] bg-violet-100 px-2 py-2 text-xs font-bold text-[#35126d]"><span>Name of the Documents</span><span>Uploaded</span></div>{requiredDocuments.map((document, index) => <label key={document} className={`grid grid-cols-[1fr_70px] items-center border-t border-violet-100 px-2 py-2 text-xs ${index % 2 ? "bg-emerald-50" : "bg-white"}`}><span>{document}</span><input type="checkbox" className="justify-self-center accent-[#35126d]" /></label>)}<div className="h-48 bg-slate-100" /></div>
              <button type="button" className="mt-3 w-full bg-[#35126d] px-4 py-3 text-xs font-bold text-white hover:bg-violet-800">Update Documents selection</button>
              <label className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#35126d]"><input name="documentsConfirmed" type="checkbox" className="accent-[#35126d]" /> I confirm all required documents are uploaded.</label>
            </div>
          </div>
        </div>

        <aside className="hidden">
          <h3 className="border-b border-violet-100 pb-3 text-center text-sm font-bold uppercase tracking-wider text-[#35126d]">Print New Documents</h3>
          <div className="mt-4 grid grid-cols-3 gap-x-3 gap-y-4">{documents.map((document, index) => <label key={document} className="flex items-center gap-2 text-xs text-violet-700"><input type="radio" name="attachment-print-document" defaultChecked={index === 0} className="accent-[#35126d]" />{document}</label>)}</div>
          <div className="mt-6 grid grid-cols-3 gap-2">{actions.map((action) => <button key={action} type="button" className="min-h-16 border border-violet-200 bg-violet-50 px-2 py-3 text-xs font-semibold text-[#35126d] hover:bg-violet-100">{action}</button>)}</div>
          <label className="mt-5 block text-xs font-bold uppercase tracking-wider text-red-600">Remarks<textarea rows={4} className={`mt-2 ${inputClass}`} /></label>
        </aside>
      </div>
    </div>
  );
}

export default function BuyOnlinePage() {
  console.log("===== BUY ONLINE CURRENT SOURCE =====");
console.log("VERSION TEST: 2026-10-08");
  const [currentStep, setCurrentStep] = useState(0);
  const [registration, setRegistration] = useState("");
  const [fullName, setFullName] = useState("");
  const [policyCover, setPolicyCover] = useState<PolicyCover>("");
  const [openSection, setOpenSection] = useState<string | null>("KYC");
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [proposalDraft, setProposalDraft] = useState<Record<string, string | boolean>>({});
  const [savedSections, setSavedSections] = useState<Set<string>>(new Set());
  const [kycMissing, setKycMissing] = useState<string[]>(["Category", "Title", "Name", "Mobile or residential phone"]);
  const [policyMissing, setPolicyMissing] = useState(3);
  const [vehicleMissing, setVehicleMissing] = useState(6);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [payment, setPayment] = useState({ method: "card", name: "", cardNumber: "", expiry: "", cvv: "" });
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentError, setPaymentError] = useState(false);
  const detailsComplete = Boolean(registration.trim() && fullName.trim());
  const submitPayment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setPaymentMessage(""); setPaymentError(false); setSaving(true);
    try {
      const response = await fetch("/api/motor/payment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payment, clientCode: proposalDraft.clientCode, policyNo: saveMessage.match(/Policy:\s*(\S+)/)?.[1] || "", amount: proposalDraft.invoiceAmount || proposalDraft.premium }) });
      const data = await response.json() as { error?: string; message?: string; clientCode?: string };
      if (!response.ok) throw new Error(data.error || "Payment could not be submitted.");
      setPaymentOpen(false); setPaymentMessage(`${data.message || "Payment submitted successfully."} Client code: ${data.clientCode || proposalDraft.clientCode}`);
    } catch (error) { setPaymentError(true); setPaymentMessage(error instanceof Error ? error.message : "Payment could not be submitted."); }
    finally { setSaving(false); }
  };
  const completedSectionCount = newVehicleSections.filter((section) => savedSections.has(section.title)).length;
  const allSectionsSaved = completedSectionCount === newVehicleSections.length;
  const availableDownloads = policyCover ? [...policyDownloads[policyCover], ...generalDownloads] : generalDownloads;

  const saveProposal = async () => {
    const root = document.getElementById("new-business-fields");
    if (!root) return false;
    const payload: Record<string, string | boolean> = { ...proposalDraft };
    root.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("[name]").forEach((field) => {
      if (!field.name || ["gender", "category"].includes(field.name)) return;
      if ((field.type === "radio" || field.type === "checkbox") && !field.checked) return;
      payload[field.name] = field.type === "checkbox" ? field.checked : field.value;
    });
    setSaving(true); setSaveMessage(""); setSaveError(false);
    try {
      const response = await fetch("/api/motor/new-business", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json() as { error?: string; message?: string; policyNo?: string; errors?: Record<string, string> };
      if (!response.ok) {
        if (data.errors?.issueDate || data.errors?.fromDate || data.errors?.toDate) setOpenSection("Policy Details");
        // An existing active policy is a completed business outcome. Keep the
        // server message visible, but allow the customer to proceed to payment.
        if (data.error?.toLowerCase().includes("already has an active policy")) {
          setSaveError(true); setSaveMessage(data.error); return "existing";
        }
        throw new Error(data.errors ? Object.values(data.errors).join(" ") : data.error || "Policy could not be saved.");
      }
      setSaveMessage(`${data.message} Policy: ${data.policyNo}`);
      return true;
    } catch (error) {
      setSaveError(true); setSaveMessage(error instanceof Error ? error.message : "Policy could not be saved.");
      return false;
    } finally { setSaving(false); }
  };

  const markSectionSaved = (title: string) => {
    setSavedSections((current) => new Set(current).add(title));
    const index = newVehicleSections.findIndex((section) => section.title === title);
    const next = newVehicleSections[index + 1];
    if (next) setOpenSection(next.title);
  };

  const saveCurrentSection = async () => {
    if (!openSection || openSection === "KYC") return;
    setSaveMessage(""); setSaveError(false);
    // Read the live controls before validating. Vehicle fields are controlled
    // inside their form component and React state updates may be asynchronous.
    const currentDraft: Record<string, string | boolean> = { ...proposalDraft };
    const root = document.getElementById("new-business-fields");
    root?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("[name]").forEach((field) => {
      if (!field.name || (field.type === "radio" || field.type === "checkbox") && !field.checked) return;
      currentDraft[field.name] = field.type === "checkbox" ? field.checked : field.value;
    });
    setProposalDraft(currentDraft);
    const missing = (sectionRequirements[openSection] || []).filter(([name]) => {
      const value = currentDraft[name];
      return value === undefined || value === "" || value === false || (typeof value === "string" && Number(value) === 0 && ["premium", "invoiceAmount"].includes(name));
    });
    if (openSection === "Vechicle Details" && String(currentDraft.coverRequired || "").toUpperCase().includes("COMP") && Number(currentDraft.sumInsured || 0) <= 0) {
      missing.push(["sumInsured", "Enter the sum insured for comprehensive cover."]);
    }
    if (missing.length) { setSaveError(true); setSaveMessage(missing.map(([, message]) => message).join(" ")); return; }
    if (openSection === "Attached Document") {
      const saved = await saveProposal();
      if (!saved) return;
    } else {
      setSaveMessage(`${openSection} saved successfully.`);
    }
    markSectionSaved(openSection);
  };

  const advanceStep = () => {
    if (currentStep === 0) { setCurrentStep(1); return; }
    if (currentStep === 1 && detailsComplete) setCurrentStep(2);
    if (currentStep === 2) setCurrentStep(3);
  };

  return (
    
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#f4efff_0,_#f5f7fb_42%,_#eef1f7_100%)] font-sans text-slate-700">
      <div
  style={{
    background: "red",
    color: "white",
    padding: "20px",
    fontSize: "24px",
    fontWeight: "bold",
    textAlign: "center",
    position: "relative",
    zIndex: 99999,
  }}
>
  CURRENT BUY-ONLINE SOURCE — OCTOBER 8, 2026
</div>
      <div className="grid w-full gap-3 p-2 sm:p-3 lg:grid-cols-[minmax(0,2.2fr)_minmax(280px,0.65fr)]">
        <section>
          <div className="relative mb-3 grid grid-cols-4 overflow-x-auto border border-violet-100 bg-white px-2 py-3 shadow-[0_8px_24px_rgba(53,18,109,0.06)] sm:px-4">
            <div className="absolute left-[12.5%] right-[12.5%] top-8 h-0.5 bg-violet-200" />
            <div className="absolute left-[12.5%] top-8 h-0.5 bg-[#35126d] transition-all duration-500" style={{ width: `${currentStep * 100}%` }} />
            {steps.map((step, index) => (
              <button key={step.label} type="button" disabled={index > currentStep} onClick={() => index < currentStep && setCurrentStep(index)} className="relative z-10 flex min-w-[110px] flex-col items-center text-center disabled:cursor-default">
                <div className={`flex h-9 w-9 items-center justify-center border-2 transition ${index === currentStep ? "border-[#35126d] bg-[#35126d] text-white ring-4 ring-violet-100" : index < currentStep ? "border-violet-500 bg-violet-500 text-white" : "border-violet-200 bg-white text-violet-300"}`}>
                  <StepIcon type={step.icon} />
                </div>
                <p className={`mt-2 whitespace-nowrap text-xs font-semibold sm:text-sm ${index === currentStep ? "text-[#35126d]" : index < currentStep ? "text-violet-600" : "text-slate-400"}`}>{step.label}</p>
              </button>
            ))}
          </div>

          <div className="overflow-hidden border border-violet-100 bg-white shadow-[0_12px_35px_rgba(53,18,109,0.07)]">
            <div className="relative border-b border-violet-100 bg-gradient-to-r from-white via-white to-violet-50 px-4 py-4 sm:px-5">
              <div className="absolute inset-y-0 left-0 w-1 bg-[#35126d]" />
              <h1 className="text-xl font-semibold tracking-tight text-[#35126d]">
                {currentStep === 0 && "Complete your insurance details"}
                {currentStep === 1 && "Choose your payment method"}
              </h1>
            </div>

            {currentStep === 0 ? (
              <div id="new-business-fields" onChangeCapture={(event) => { const field = event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement; if (field.name && ((field.type !== "radio" && field.type !== "checkbox") || field.checked)) { setProposalDraft((current) => ({ ...current, [field.name]: field.type === "checkbox" ? field.checked : field.value })); if (openSection) { const changedIndex = newVehicleSections.findIndex((section) => section.title === openSection); setSavedSections((current) => new Set([...current].filter((title) => newVehicleSections.findIndex((section) => section.title === title) < changedIndex))); } } }} className="bg-[#f8f9fc] p-3 sm:p-4">
                {saveMessage ? <p role={saveError ? "alert" : "status"} className={`mb-3 border px-4 py-3 text-sm font-semibold ${saveError ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{saveMessage}</p> : null}
                <div className="mb-4 overflow-hidden bg-[#35126d] text-white shadow-lg shadow-violet-950/10">
                  <div className="grid gap-4 bg-[radial-gradient(circle_at_85%_10%,_rgba(167,139,250,0.55),_transparent_35%)] p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
                    <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-200">Your application journey</p><h2 className="mt-2 text-xl font-semibold">Build your cover, one clear step at a time</h2><p className="mt-1 max-w-xl text-sm leading-6 text-violet-100">Choose a section from the journey map. Your information stays visible in one focused workspace.</p></div>
                    <div className="flex items-center gap-3 bg-white/10 px-4 py-3 ring-1 ring-white/15"><span className="text-3xl font-semibold">{Math.round((completedSectionCount / newVehicleSections.length) * 100)}%</span><span className="text-xs leading-4 text-violet-100">Application<br />completed</span></div>
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-[270px_minmax(0,1fr)]">
                  <nav aria-label="Insurance detail sections" className="relative border border-violet-100 bg-white p-2 shadow-sm">
                    <div className="absolute bottom-8 left-[29px] top-8 hidden w-px bg-violet-100 xl:block" />
                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                      {newVehicleSections.map((section, index) => {
                        const isActive = openSection === section.title;
                        const isSaved = savedSections.has(section.title);
                        const isUnlocked = index === 0 || savedSections.has(newVehicleSections[index - 1].title);
                        return <button key={section.title} type="button" disabled={!isUnlocked} onClick={() => isUnlocked && setOpenSection(section.title)} aria-current={isActive ? "step" : undefined} className={`group relative flex items-center gap-3 p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-45 ${isActive ? "bg-[#35126d] text-white shadow-md shadow-violet-900/15" : "text-slate-600 hover:bg-violet-50 hover:text-[#35126d]"}`}>
                          <span className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center transition ${isActive ? "bg-white/15 text-white" : "bg-violet-50 text-violet-600 ring-1 ring-violet-100 group-hover:bg-white"}`}><SectionIcon title={section.title} /></span>
                          <span className="min-w-0 flex-1"><span className={`block text-[10px] font-bold uppercase tracking-widest ${isActive ? "text-violet-200" : "text-slate-400"}`}>Section {String(index + 1).padStart(2, "0")}</span><span className="mt-0.5 block truncate text-sm font-semibold">{section.title}</span></span>
                          {isSaved ? <span className={`text-sm font-bold ${isActive ? "text-emerald-200" : "text-emerald-600"}`}>OK</span> : section.alert ? <span className={`h-2 w-2 shrink-0 rounded-full ${isActive ? "bg-amber-300" : "bg-red-500"}`} /> : <svg viewBox="0 0 20 20" className={`h-4 w-4 shrink-0 ${isActive ? "text-violet-200" : "text-slate-300"}`} fill="none" stroke="currentColor" strokeWidth="2"><path d="m7 4 6 6-6 6" /></svg>}
                        </button>;
                      })}
                    </div>
                  </nav>

                  {newVehicleSections.map((section) => (
                    <section key={section.title} hidden={openSection !== section.title} className="min-w-0 overflow-hidden border border-violet-100 bg-white shadow-sm">
                      <div className="flex flex-col gap-3 border-b border-violet-100 bg-gradient-to-r from-violet-50/80 to-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                        <div className="flex items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center bg-white text-[#35126d] shadow-sm ring-1 ring-violet-100"><SectionIcon title={section.title} /></span><div><h3 className="font-semibold text-slate-900 sm:text-lg">{section.title}</h3><p className="mt-0.5 text-xs text-slate-500 sm:text-sm">{section.title === "KYC" && kycMissing.length ? `Missing: ${kycMissing.join(", ")}` : sectionDescriptions[section.title]}</p></div></div>
                        {section.title === "KYC" ? <span className="self-start bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 ring-1 ring-red-100 sm:self-auto">{kycMissing.length ? `${kycMissing.length} mandatory field${kycMissing.length === 1 ? "" : "s"} pending` : "Complete"}</span> : section.title === "Policy Details" ? <span className={`self-start px-3 py-1.5 text-xs font-bold ring-1 sm:self-auto ${policyMissing ? "bg-red-50 text-red-700 ring-red-100" : "bg-emerald-50 text-emerald-700 ring-emerald-100"}`}>{policyMissing ? `${policyMissing} mandatory fields pending` : "Complete"}</span> : section.title === "Vechicle Details" ? <span className={`self-start px-3 py-1.5 text-xs font-bold ring-1 sm:self-auto ${vehicleMissing ? "bg-red-50 text-red-700 ring-red-100" : "bg-emerald-50 text-emerald-700 ring-emerald-100"}`}>{vehicleMissing ? `${vehicleMissing} mandatory fields pending` : "Complete"}</span> : section.pending ? <span className="self-start bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 ring-1 ring-red-100 sm:self-auto">{section.pending}</span> : <span className="self-start bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100 sm:self-auto">Ready to complete</span>}
                      </div>
                      <div className="overflow-x-auto p-3 sm:p-4">
                        {section.title === "KYC" ? <ClientDetailsForm onKycStatus={setKycMissing} onClientSelected={(client) => setProposalDraft((current) => ({ ...current, clientCode: String(client.Code || "") }))} onSaved={() => markSectionSaved("KYC")} /> : section.title === "Policy Details" ? <MotorProposalForm clientCode={String(proposalDraft.clientCode || "")} onStatusChange={setPolicyMissing} coverRequired={policyCover} /> : section.title === "Vechicle Details" ? <VehicleProposalForm policyCover={policyCover} onPolicyCoverChange={setPolicyCover} onStatusChange={setVehicleMissing} vehicleClass={proposalDraft.vehicleClass} vehicleType={proposalDraft.vehicleType} fuelType={proposalDraft.fuelType} issueDate={proposalDraft.issueDate} /> : section.title === "Accessories" ? <AccessoriesForm /> : section.title === "General Information" ? <GeneralInformationForm /> : section.title === "Common Det." ? <CommonDetailsForm /> : section.title === "Premium" ? <PremiumForm /> : <AttachedDocumentForm />}
                        {section.title !== "KYC" ? <div className="mt-4 flex justify-end border-t border-violet-100 pt-4"><button type="button" disabled={saving} onClick={() => void saveCurrentSection()} className="bg-[#35126d] px-6 py-3 text-sm font-bold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:bg-slate-400">{saving ? "Saving..." : section.title === "Attached Document" ? "Save policy and continue" : "Save and continue"}</button></div> : null}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            ) : null}

            {currentStep === 1 ? (
              <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6">
                <label className="flex cursor-pointer items-center gap-4 border border-violet-200 bg-violet-50 p-5"><input type="radio" name="payment" defaultChecked className="h-5 w-5 accent-[#35126d]" /><span className="font-semibold text-[#35126d]">Credit or debit card</span></label>
                <label className="flex cursor-pointer items-center gap-4 border border-violet-200 p-5"><input type="radio" name="payment" className="h-5 w-5 accent-[#35126d]" /><span className="font-semibold text-[#35126d]">Internet banking</span></label>
              </div>
            ) : null}

            <div className="flex items-center justify-between border-t border-violet-100 bg-[#faf9fd] px-6 py-4">
              <button type="button" disabled={currentStep === 0} onClick={() => setCurrentStep((step) => Math.max(0, step - 1))} className="border border-violet-300 px-6 py-3 text-sm font-semibold text-[#35126d] transition hover:bg-violet-50 disabled:invisible">Back</button>
              <button type="button" disabled={saving || (currentStep === 0 && !allSectionsSaved)} onClick={currentStep === 0 ? advanceStep : () => setPaymentOpen(true)} className="bg-[#35126d] px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-violet-900/15 transition hover:-translate-y-0.5 hover:bg-violet-800 disabled:cursor-not-allowed disabled:bg-slate-300">{saving ? "Saving..." : currentStep === 0 ? "Continue to payment" : "Proceed to pay"}</button>
            </div>
          </div>
        </section>

        <aside className="self-start overflow-hidden border border-violet-100 bg-white shadow-[0_12px_35px_rgba(53,18,109,0.06)] lg:sticky lg:top-3">
          <div className="border-b border-violet-100 bg-gradient-to-br from-violet-50 to-white px-4 py-4">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-white text-[#5b3aa4] shadow-sm ring-1 ring-violet-100">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3v11m0 0 4-4m-4 4-4-4M5 19h14" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-500">Resources</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">Policy downloads</h2>
              </div>
            </div>
            <p className="mt-2 text-sm leading-5 text-slate-500">Forms, policy documents and helpful motor insurance guides.</p>
            <div className={`mt-4 flex items-center gap-2 px-3 py-2 text-xs font-semibold ${policyCover ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100" : "bg-amber-50 text-amber-700 ring-1 ring-amber-100"}`}>
              <span className={`h-2 w-2 rounded-full ${policyCover ? "bg-emerald-500" : "bg-amber-500"}`} />
              {policyCover || "Select a cover in Vehicle Details"}
            </div>
          </div>
          <ul className="space-y-1 p-2">
            {availableDownloads.map((item, index) => (
              <li key={item.href}>
                <a href={item.href} download className="group flex items-start gap-3 px-3 py-2.5 transition hover:bg-violet-50">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center bg-slate-50 text-[10px] font-bold text-[#5b3aa4] ring-1 ring-slate-200 transition group-hover:bg-white group-hover:ring-violet-200">PDF</span>
                  <span className="min-w-0 flex-1"><span className="block text-sm leading-5 text-slate-600 transition group-hover:text-[#412484]">{item.name}</span><span className="mt-0.5 block text-[11px] text-slate-400">{item.size}{policyCover && index < policyDownloads[policyCover].length ? " · Selected cover" : " · General"}</span></span>
                  <svg viewBox="0 0 24 24" className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-y-0.5 group-hover:text-violet-500" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 4v11m0 0 4-4m-4 4-4-4M5 20h14" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </a>
              </li>
            ))}
          </ul>
          <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-4">
            <p className="text-xs leading-5 text-slate-400">{policyCover ? `Showing documents for ${policyCover}, plus general motor forms.` : "Choose your cover to reveal its policy wording and claims guidance."}</p>
          </div>
        </aside>
      </div>
      {paymentMessage ? <p role={paymentError ? "alert" : "status"} className={`fixed bottom-4 right-4 z-50 border px-4 py-3 text-sm font-semibold ${paymentError ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{paymentMessage}</p> : null}
      {paymentOpen ? <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 p-4"><form onSubmit={submitPayment} className="w-full max-w-lg space-y-4 bg-white p-6 shadow-xl"><h2 className="text-xl font-semibold text-[#35126d]">Complete payment</h2><select value={payment.method} onChange={e => setPayment({ ...payment, method: e.target.value })} className="w-full border p-3"><option value="card">Credit or debit card</option><option value="bank">Internet banking</option></select><input required placeholder="Name on card" value={payment.name} onChange={e => setPayment({ ...payment, name: e.target.value })} className="w-full border p-3" /><input required placeholder="Card number" value={payment.cardNumber} onChange={e => setPayment({ ...payment, cardNumber: e.target.value })} className="w-full border p-3" /><div className="grid grid-cols-2 gap-3"><input required placeholder="MM/YY" value={payment.expiry} onChange={e => setPayment({ ...payment, expiry: e.target.value })} className="border p-3" /><input required placeholder="CVV" value={payment.cvv} onChange={e => setPayment({ ...payment, cvv: e.target.value })} className="border p-3" /></div><div className="flex justify-end gap-3"><button type="button" onClick={() => setPaymentOpen(false)} className="border px-4 py-2">Cancel</button><button type="submit" disabled={saving} className="bg-[#35126d] px-5 py-2 font-semibold text-white">{saving ? "Submitting..." : "Submit payment"}</button></div></form></div> : null}
    </main>
  );
}


