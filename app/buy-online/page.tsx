"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
  { title: "KYC", pending: "7 mandatory fields pending", alert: true, rows: [
    ["Registration No.", "Vehicle registration number"], ["Make", "Vehicle manufacturer"], ["Model", "Vehicle model"], ["Engine No.", "Engine identification number"], ["Chassis No.", "Chassis identification number"], ["Colour", "Vehicle colour"], ["Year Mfg. & Date of Reg.", "Manufacturing year and registration date"], ["Seating", "Full count for seats and students"], ["CC / kW", "Engine capacity or power"], ["Gross Vehicle Weight", "Registered gross vehicle weight"], ["Trailer Ft.", "Trailer measurement, if applicable"], ["Remarks", "Additional vehicle remarks"],
  ] },
  { title: "Policy Details", pending: "3 mandatory fields pending", alert: true, rows: [
    ["Cover Required", "Selected motor cover"], ["Sum Insured", "Declared sum insured"], ["Voluntary Excess Amount", "Selected voluntary excess"], ["Young Driver Excess", "Applicable young driver excess"], ["Compulsory Excess", "Mandatory policy excess"], ["TPF Excess", "Third-party fire excess"], ["TPPD Excess", "Third-party property damage excess"], ["Additional Excess", "Any additional excess amount"], ["Theft Excess", "Applicable theft excess"], ["Total Loss Excess", "Applicable total-loss excess"], ["Approved Discount Request", "Approved discount reference, if available"],
  ] },
  { title: "Vechicle Details", rows: [
    ["Country", "Mauritius"], ["Vehicle Type", "Selected vehicle type"], ["Fuel Type", "Vehicle fuel type"], ["Class", "Motor policy class"], ["Vehicle Status", "New or existing vehicle"], ["Issue Date", "Policy issue date and time"], ["From", "Policy commencement date"], ["To", "Policy expiry date"], ["Client", "Client master record"], ["Lien", "Lienholder details, if applicable"], ["Policy Risk", "Standard or selected risk"],
  ] },
  { title: "Accessories", rows: [
    ["No Claim Bonus", "Rate percentage and discount amount"], ["Fleet Discount", "Rate percentage and discount amount"], ["Special Discount", "Rate percentage and discount amount"], ["Claim Loading", "Rate percentage and loading amount"], ["Get Discount %", "Calculate and apply eligible discount"], ["Remarks for Other Loading", "Additional loading remarks"],
  ] },
  { title: "General Information", rows: [
    ["Passenger Risk", "Optional passenger-risk cover"], ["Personal Accident", "Personal accident protection"], ["PA (Conductor)", "Personal accident cover for conductor"], ["PA (Employee)", "Personal accident cover for employee"], ["PA (Family Members)", "Personal accident cover for family members"], ["Auto Plus", "Optional Auto Plus cover"], ["Driver Only", "Named-driver protection"], ["Loss of Use", "Loss-of-use benefit"], ["Towing", "Towing expense cover"], ["Strike, Riot and Civil Commotion", "Additional peril protection"], ["Earthquake", "Earthquake protection"], ["Cyclone", "Cyclone protection"], ["Windscreen Extension", "Extended windscreen cover"], ["Waiver of Excess", "Optional excess waiver"], ["Loss of Car Keys", "Replacement car-key cover"], ["Airfreight Expenses", "Airfreight expense protection"], ["Personal Belongings", "Personal belongings in vehicle"], ["Damage by Rodents", "Rodent-damage protection"], ["Accidental Misfuelling", "Misfuelling expense cover"], ["Enhanced Personal Accidental", "Enhanced personal accident benefit"], ["Funeral Expenses", "Funeral expense benefit"],
  ] },
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
  Premium: [],
  Accessories: [],
  "General Information": [],
  "Common Det.": [["commonDetailsConfirmed", "Complete the common vehicle details declarations."]],
  "Attached Document": [],
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

function ClientDetailsForm({ onClientSelected, onSaved, onKycStatus, onClientChange }: { onClientSelected: (client: ClientRecord) => void; onSaved: () => void; onKycStatus: (missing: string[]) => void; onClientChange?: (client: ClientRecord) => void }) {
  const inputClass = "w-full border border-violet-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-[#35126d] focus:ring-2 focus:ring-violet-100";
  const labelClass = "text-xs font-semibold text-slate-600";
  const [client, setClient] = useState<ClientRecord>({ Code: "", Category: "Individual" });
  // Share the live KYC record with the page (used for the policy email and its PDF documents).
  useEffect(() => { onClientChange?.(client); }, [client, onClientChange]);
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
<div className="grid gap-3 sm:grid-cols-[max-content_minmax(0,1fr)] sm:items-center">
          <label htmlFor="client-code" className={labelClass}>Client Code</label><input id="client-code" name="clientCode" value={value("Code")} onChange={(event) => { if (!clientCodeReadOnly) setField("Code", event.target.value); }} onKeyDown={(event) => { if (event.key === "Enter" && !clientCodeReadOnly) findClient(); }} readOnly={clientCodeReadOnly} className={`${inputClass} ${clientCodeReadOnly ? "bg-slate-100 cursor-not-allowed" : ""}`} />
        </div>

        {message ? <p role="status" className={`border px-3 py-2 text-sm font-medium ${messageError ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{message}</p> : null}
        {Object.keys(errors).length > 0 ? <div role="alert" className="border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"><p className="font-semibold">Please correct the following:</p><ul className="mt-1 list-disc pl-5">{Object.values(errors).map((error) => <li key={error}>{error}</li>)}</ul></div> : null}

        <div className="grid gap-3 sm:grid-cols-[max-content_minmax(0,1fr)] sm:items-center">
          <label className={labelClass}>Category</label>
          <div className="flex flex-wrap gap-5 text-sm"><label className="flex items-center gap-2"><input type="radio" name="category" checked={value("Category") === "Company"} onChange={() => { if (!isReadOnly) setField("Category", "Company"); }} disabled={isReadOnly} className="accent-[#35126d]" /> Company</label><label className="flex items-center gap-2"><input type="radio" name="category" checked={value("Category") === "Individual"} onChange={() => { if (!isReadOnly) setField("Category", "Individual"); }} disabled={isReadOnly} className="accent-[#35126d]" /> Individual</label></div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[max-content_minmax(0,1fr)] sm:items-center"><label className={labelClass}>Name</label><div className="grid grid-cols-[max-content_1fr] gap-2"><select value={value("Title")} onChange={(event) => { if (!isReadOnly) setField("Title", event.target.value); }} disabled={isReadOnly} className={inputClass}><option value="">Title</option><option>Mr.</option><option>Mrs.</option><option>Ms</option></select><input value={value("Name")} onChange={(event) => { if (!isReadOnly) setField("Name", event.target.value); }} readOnly={isReadOnly} className={inputClass} /></div></div>
        {[ ["Surname","Surname"], ["Address","Address"], ["City","City"] ].map(([label, field]) => <div key={field} className="grid gap-3 sm:grid-cols-[max-content_minmax(0,1fr)] sm:items-center"><label className={labelClass}>{label}</label><input value={value(field)} onChange={(event) => { if (!isReadOnly) setField(field, event.target.value); }} readOnly={isReadOnly} className={inputClass} /></div>)}
        <div className="grid gap-3 sm:grid-cols-[max-content_minmax(0,1fr)] sm:items-center"><label className={labelClass}>UBO (Ultimate beneficial owner)</label><input value={value("UBO")} onChange={(event) => { if (!isReadOnly && value("Category") === "Company") setField("UBO", event.target.value); }} readOnly={isReadOnly || value("Category") === "Individual"} className={`${inputClass} ${value("Category") === "Individual" ? "bg-slate-100" : ""}`} /></div>

        {[ [["VAT","VAT"],["Tel Res / Abroad","TelRes"]], [["Tel Off","TelOff"],["Fax","Fax"]], [["Mobile","Mobile"],["Qualification","Qualification"]] ].map((pair) => <div key={pair[0][1]} className="grid gap-3 sm:grid-cols-[max-content_1fr_max-content_1fr] sm:items-center">{pair.map(([label, field]) => <span key={field} className="contents"><label className={labelClass}>{label}</label><input value={value(field) || (field === "TelRes" ? value("TelForegin") : "")} onChange={(event) => { if (!isReadOnly) setField(field, event.target.value); }} readOnly={isReadOnly} className={inputClass} /></span>)}</div>)}
        <div className="grid gap-3 sm:grid-cols-[max-content_minmax(0,1fr)] sm:items-center"><label className={labelClass}>E-Mail</label><input type="email" value={value("EMail")} onChange={(event) => { if (!isReadOnly) setField("EMail", event.target.value); }} readOnly={isReadOnly} className={inputClass} /></div>

        <div className="grid gap-3 sm:grid-cols-[max-content_1fr_max-content_1fr] sm:items-center"><label className={labelClass}>Occupation</label><input value={value("Occupation")} onChange={(event) => { if (!isReadOnly) setField("Occupation", event.target.value); }} readOnly={isReadOnly} className={inputClass} /><div className="col-span-2 flex flex-wrap gap-4 text-sm"><label className="flex items-center gap-2"><input type="radio" name="residence" checked={checked("Resident")} onChange={() => { if (!isReadOnly) { setField("Resident", true); setField("Nationality", "Mauritius"); }} } disabled={isReadOnly} className="accent-[#35126d]" /> Resident</label><label className="flex items-center gap-2"><input type="radio" name="residence" checked={!checked("Resident")} onChange={() => { if (!isReadOnly) setField("Resident", false); }} disabled={isReadOnly} className="accent-[#35126d]" /> Non Resident</label></div></div>
        <div className="grid gap-3 sm:grid-cols-[max-content_1fr_max-content_1fr] sm:items-center"><label className={labelClass}>Nationality</label><input value={value("Nationality")} onChange={(event) => { if (!isReadOnly && !checked("Resident")) setField("Nationality", event.target.value); }} readOnly={isReadOnly || checked("Resident")} className={`${inputClass} ${checked("Resident") ? "bg-slate-100" : ""}`} /><label className={labelClass}>Country Code</label><input value={value("CountryCode")} onChange={(event) => { if (!isReadOnly) setField("CountryCode", event.target.value); }} readOnly={isReadOnly} className={inputClass} /></div>
        <div className="grid gap-3 sm:grid-cols-[max-content_1fr_max-content_1fr] sm:items-center"><label className={labelClass}>Passport No.</label><input value={value("PassportNo")} onChange={(event) => { if (!isReadOnly) setField("PassportNo", event.target.value); }} readOnly={isReadOnly} className={inputClass} minLength={9} /><label className={labelClass}>NID</label><input disabled={isReadOnly || (value("Category") !== "Individual" || value("Nationality").toLowerCase() !== "mauritius")} value={value("NID")} onChange={(event) => { if (!isReadOnly) setField("NID", event.target.value); }} readOnly={isReadOnly} className={inputClass} /></div>
<div className="grid gap-3 sm:grid-cols-[max-content_1fr_max-content_1fr] sm:items-center"><label className={labelClass}>BRN</label><input disabled={isReadOnly || value("Category") !== "Company"} value={value("BRN")} onChange={(event) => { if (!isReadOnly) setField("BRN", event.target.value); }} readOnly={isReadOnly} className={inputClass} /><label className={labelClass}>Gender</label><div className="flex gap-4 text-sm"><label className="flex items-center gap-2"><input type="radio" name="gender" disabled={isReadOnly || value("Category") !== "Individual"} checked={value("Gender") === "Male"} onChange={() => { if (!isReadOnly) setField("Gender", "Male"); }} className="accent-[#35126d]" /> Male</label><label className="flex items-center gap-2"><input type="radio" name="gender" disabled={isReadOnly || value("Category") !== "Individual"} checked={value("Gender") === "Female"} onChange={() => { if (!isReadOnly) setField("Gender", "Female"); }} className="accent-[#35126d]" /> Female</label></div></div>
        {loaded ? <p className="text-xs font-semibold text-violet-700">KYC record: {checked("HasKYC") ? "Available" : "Not available"}</p> : null}
        <button type="submit" disabled={busy || !canSave} className="w-full bg-[#35126d] px-4 py-3 text-sm font-bold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:bg-slate-400">{busy ? "Saving..." : isReadOnly ? "KYC already completed" : "Save KYC"}</button>
      </div>
    </form>
  );
}

function MotorProposalForm({ onStatusChange, clientCode, coverRequired, onValuesChange }: { onStatusChange: (missing: number) => void; clientCode?: string; coverRequired?: string; onValuesChange?: (values: Record<string, string>) => void }) {
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
    <label className="grid gap-1.5 sm:grid-cols-[max-content_minmax(0,1fr)] sm:items-center">
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
              <label className="grid gap-1.5 sm:grid-cols-[max-content_minmax(0,1fr)] sm:items-center"><span className={labelClass}>Policy No.</span><input name="policyNo" value={policyNo} readOnly className={`${inputClass} bg-slate-100`} /></label>
              <label className="grid gap-1.5 sm:grid-cols-[max-content_minmax(0,1fr)] sm:items-center"><span className={labelClass}>Country</span><select name="country" defaultValue="Mauritius" className={inputClass}><option>Mauritius</option><option>Rodrigues</option></select></label>
              <div className="grid gap-3 sm:grid-cols-[max-content_1fr_max-content_1fr] sm:items-center">
                <label className="grid gap-1.5 sm:grid-cols-[max-content_minmax(0,1fr)] sm:items-center"><span className={labelClass}>Vehicle Type</span><select name="vehicleType" value={values.vehicleType} onChange={(e) => { setRequired("vehicleType", e.target.value); setRequired("vehicleClass", ""); }} className={inputClass}><option value="">Select vehicle type</option>{vehicleTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
                <label className="grid gap-1.5 sm:grid-cols-[max-content_minmax(0,1fr)] sm:items-center"><span className={labelClass}>Fuel Type</span><select name="fuelType" value={values.fuelType} onChange={(e) => { setRequired("fuelType", e.target.value); setRequired("vehicleClass", ""); }} className={inputClass}><option value="">Select fuel type</option>{fuelTypes.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
              </div>
              <div className="grid gap-3 sm:grid-cols-[max-content_1fr_max-content_1fr] sm:items-center">
                <label className="grid gap-1.5 sm:grid-cols-[max-content_minmax(0,1fr)] sm:items-center"><span className={labelClass}>Vehicle Class</span><select name="vehicleClass" value={values.vehicleClass} onChange={(e) => setRequired("vehicleClass", e.target.value)} className={inputClass}><option value="">Select vehicle class</option>{vehicleClassOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
                <label className="grid gap-1.5 sm:grid-cols-[max-content_minmax(0,1fr)] sm:items-center">{requiredSelect("Vehicle Status", "vehicleStatus", ["NEW", "SECOND HAND", "RECON"])}</label>
              </div>
              <label className="grid gap-1.5 sm:grid-cols-[max-content_minmax(0,1fr)] sm:items-center"><span className={labelClass}>Issue Date</span><input name="issueDate" value={values.issueDate} readOnly className={`${inputClass} bg-slate-100`} /><input type="hidden" name="issueDate" value={values.issueDate ? formatDateInput(new Date(values.issueDate)) : ""} /></label>
<div className="grid gap-3 sm:grid-cols-[max-content_1fr_max-content_1fr] sm:items-center">
                <label className="grid gap-1.5 sm:grid-cols-[max-content_minmax(0,1fr)] sm:items-center"><span className={labelClass}>From Date</span><div className="relative"><input type="text" value={values.fromDate ? formatDateShort(new Date(values.fromDate)) : ""} readOnly className={`${inputClass} bg-slate-100 cursor-pointer`} /><input name="fromDate" type="date" value={values.fromDate} min={values.fromDate} onChange={(e) => { setFromDate(e.target.value); const d = new Date(e.target.value); setToDate(formatDateInput(new Date(d.getFullYear() + 1, d.getMonth(), d.getDate()))); setRequired("fromDate", e.target.value); setRequired("toDate", formatDateInput(new Date(d.getFullYear() + 1, d.getMonth(), d.getDate()))); }} className="absolute inset-0 opacity-0 cursor-pointer" /><svg className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 002 2v12a2 2 0 002 2z" /></svg></div></label>
                <label className="grid gap-1.5 sm:grid-cols-[max-content_minmax(0,1fr)] sm:items-center"><span className={labelClass}>To Date</span><div className="relative"><input type="text" value={toDate ? formatDateShort(new Date(toDate)) : ""} readOnly className={`${inputClass} bg-slate-100 cursor-pointer`} /><input name="toDate" type="date" value={toDate} min={values.fromDate} onChange={(e) => { setToDate(e.target.value); setRequired("toDate", e.target.value); }} className="absolute inset-0 opacity-0 cursor-pointer" /><svg className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 002 2v12a2 2 0 002 2z" /></svg></div></label>
              </div>
              <input type="hidden" name="clientCode" value={clientCode || ""} />
              <div className="grid gap-3 sm:grid-cols-[max-content_1fr] sm:items-start"><label className={`${labelClass} flex items-center gap-2`}><input name="lien" type="checkbox" required checked={values.lien === "true"} onChange={(e) => setRequired("lien", String(e.target.checked))} className="accent-[#35126d]" /> Lien <span className="text-rose-600">*</span></label>{values.lien === "true" ? <div className="grid grid-cols-2 gap-2"><select name="lienType" required value={values.lienType} onChange={(e) => setRequired("lienType", e.target.value)} className={inputClass}><option value="No Lien">No Lien</option><option value="in favour of">in favour of</option><option value="on lease to">on lease to</option><option value="on account of">on account of</option><option value="on finance lease to">on finance lease to</option><option value="on lease (Financial)">on lease (Financial)</option><option value="on lease (Finance Lease) to">on lease (Finance Lease) to</option><option value="on financial lease to">on financial lease to</option><option value="on Operating lease to">on Operating lease to</option><option value="on lease (Financial) to">on lease (Financial) to</option></select>{values.lienType !== "No Lien" ? <select name="lienholder" required value={values.lienholder} onChange={(e) => setRequired("lienholder", e.target.value)} className={inputClass}><option value="">Select bank</option>{banks.map((bank) => <option key={bank.Code} value={bank.Name}>{bank.Name}</option>)}</select> : <input name="lienholder" value={values.lienholder} onChange={(e) => setRequired("lienholder", e.target.value)} placeholder="Lienholder" className={inputClass} />}</div> : null}</div>
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

// Readable messages for the error codes returned by usp_GetMotorExcess (via /api/motor/excess).
const excessErrorMessages: Record<string, string> = {
  "HO REVIEW-10M": "Sum insured above 10,000,000 must be referred to Head Office for review (HO REVIEW-10M). The sum insured has been cleared.",
  "NO Class B-VERIFY": "This make is a Class B vehicle, but no Class B excess is defined for this sum insured. Please verify (NO Class B-VERIFY).",
  "NO ELECTRIC TARIFF FOUND": "No electric-vehicle excess tariff was found for this sum insured and date.",
  "NO RATE AVAILABLE": "No excess rate was found for these vehicle details. Please check the vehicle class, seating, CC/kW and sum insured.",
  "NO Configuration details- VEHICLE TYPE": "No tariff configuration exists for this vehicle class. Please inform Head Office.",
};

function VehicleProposalForm({ policyCover, onPolicyCoverChange, onStatusChange, onValuesChange, vehicleClass, vehicleType, fuelType, issueDate, country }: { policyCover: PolicyCover; onPolicyCoverChange: (cover: PolicyCover) => void; onStatusChange: (missing: number) => void; onValuesChange?: (values: Record<string, string>) => void; vehicleClass?: string; vehicleType?: string; fuelType?: string; issueDate?: string; country?: string }) {
  const inputClass = "h-9 w-full border border-violet-200 bg-white px-2 text-sm text-slate-800 outline-none focus:border-[#35126d] focus:ring-2 focus:ring-violet-100";
  const labelClass = "text-xs font-semibold text-slate-600";
  const [requiredValues, setRequiredValues] = useState<Record<string, string>>({ vehicleNo: "", make: "", model: "", engineNo: "", chassisNo: "", gvw: "", trailerFeet: "", manufactureDate: "", sumInsured: "", seating: "", cc: "", fromDate: "" });
  const [covers, setCovers] = useState<Array<{ name: string; code: number; youngDriverExcess: boolean }>>([]);
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [coverLocked, setCoverLocked] = useState(false);
  const [todayISO, setTodayISO] = useState("");
  
  // Excess options from database
  const [compulsoryExcessOptions, setCompulsoryExcessOptions] = useState<string[]>(["Select..."]);
  const [youngDriverExcessOptions, setYoungDriverExcessOptions] = useState<string[]>(["Select..."]);
  const [tpfExcessOptions, setTpfExcessOptions] = useState<string[]>(["Select..."]);
  const [fetchingExcess, setFetchingExcess] = useState(false);
  const [excessCalculated, setExcessCalculated] = useState(false);
  const [excessError, setExcessError] = useState("");
  const fetchIdRef = useRef(0);
  
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
    const cover = policyCover;
    const isComprehensive = cover === "Comprehensive" || cover === "Comprehensive AutoPlus";
    
    // Clear excess values when sumInsured is empty
    if (!requiredValues.sumInsured || requiredValues.sumInsured.trim() === "") {
      setCompulsoryExcessOptions(["Select..."]);
      setYoungDriverExcessOptions(["Select..."]);
      setTpfExcessOptions(["Select..."]);
      setRequiredValues((prev) => ({
        ...prev,
        compulsoryExcess: "",
        youngDriverExcess: "",
        totalLossExcess: "",
        additionalExcess: "0"
      }));
      setExcessError("");
      setExcessCalculated(false);
      setFetchingExcess(false);
      return;
    }
    
    const sumInsuredValue = parseFloat(requiredValues.sumInsured);
    // Clear Total Loss Excess when sumInsured < 3,000,000
    if (sumInsuredValue < 3000000) {
      setRequiredValues((prev) => ({
        ...prev,
        totalLossExcess: ""
      }));
    }
    
    if (!isComprehensive || !requiredValues.manufactureDate || !requiredValues.sumInsured) {
      console.log("[Frontend] Excess fetch skipped:", { cover: policyCover, isComprehensive, manufactureDate: requiredValues.manufactureDate, sumInsured: requiredValues.sumInsured });
      setExcessCalculated(false);
      return;
    }
    
    const controller = new AbortController();
    const currentFetchId = ++fetchIdRef.current;
    setFetchingExcess(true);
    setExcessCalculated(false);
    
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
      country: country || "Mauritius",
      cylCapacity: requiredValues.cc || "0",
      trailerFeet: requiredValues.trailerFeet || "0",
      gvw: requiredValues.gvw || "0",
      dateOfManufacture: requiredValues.manufactureDate || "",
      fromDate: requiredValues.fromDate || issueDate || "",
      coverRequired: policyCover || "",
      status: "NEW"
    });
    console.log("[Frontend] Fetching excess with params:", Object.fromEntries(params));
    console.log("[Frontend] Current requiredValues.sumInsured:", requiredValues.sumInsured);
    
    fetch(`/api/motor/excess?${params.toString()}`, { signal: controller.signal })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        console.log("[Frontend] Excess API response:", data);
        console.log("[Frontend] compulsoryExcess:", data?.compulsoryExcess);
        console.log("[Frontend] youngDriverExcess:", data?.youngDriverExcess);
        console.log("[Frontend] totalLossExcess:", data?.totalLossExcess);
        if (!controller.signal.aborted && currentFetchId === fetchIdRef.current) {
          setCompulsoryExcessOptions(data?.compulsoryExcess || ["Select..."]);
          setYoungDriverExcessOptions(data?.youngDriverExcess || ["Select..."]);
          setTpfExcessOptions(data?.tpfExcess || ["Select..."]);

          // A failed lookup must not leave the previous excess values on screen.
          if (!data || data.success === false) {
            const code = String(data?.errorMsg ?? "");
            setExcessError(excessErrorMessages[code] || (code ? code : "Enter the seating capacity or CC/kW to look up the excess."));
            setRequiredValues((prev) => ({
              ...prev,
              compulsoryExcess: "",
              youngDriverExcess: "",
              totalLossExcess: "",
              additionalExcess: "0",
              // usp_GetMotorExcess clears the sum insured for HO REVIEW-10M (TxtSumInsured.Text = "").
              ...(code === "HO REVIEW-10M" ? { sumInsured: "" } : {}),
            }));
            setExcessCalculated(true);
            return;
          }
          setExcessError("");

          // Auto-set values from API response (for input fields)
          setRequiredValues((prev) => {
            const next: Record<string, string> = { ...prev, additionalExcess: data?.addExcess ? String(data.addExcess) : "0" };
            if (data?.compulsoryExcess && data.compulsoryExcess.length > 0 && data.compulsoryExcess[0] !== "Select...") {
              next.compulsoryExcess = data.compulsoryExcess[0];
            }
            if (data?.youngDriverExcess && data.youngDriverExcess.length > 0 && data.youngDriverExcess[0] !== "Select...") {
              next.youngDriverExcess = data.youngDriverExcess[0];
            }
            if (data?.totalLossExcess) {
              next.totalLossExcess = data.totalLossExcess;
            }
            return next;
          });
          setExcessCalculated(true);
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          console.error("[Frontend] Excess fetch error:", err);
          setExcessError("The excess could not be loaded. Please try again.");
          setRequiredValues((prev) => ({ ...prev, compulsoryExcess: "", youngDriverExcess: "", totalLossExcess: "", additionalExcess: "0" }));
        }
        setExcessCalculated(false);
      })
      .finally(() => { if (currentFetchId === fetchIdRef.current) setFetchingExcess(false); });

    return () => controller.abort();
  }, [policyCover, requiredValues.manufactureDate, requiredValues.sumInsured, requiredValues.make, requiredValues.model, requiredValues.cc, requiredValues.seating, requiredValues.gvw, requiredValues.trailerFeet, vehicleClass, vehicleType, fuelType, issueDate, country]);
  
  useEffect(() => {
    if (!vehicleClass) { setMakes([]); setModels([]); return; }
    const controller = new AbortController();
    fetch(`/api/motor/lookups?vehicleClass=${encodeURIComponent(vehicleClass)}&fuelType=${encodeURIComponent(fuelType || "")}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (!controller.signal.aborted) { setMakes(data?.makes || []); setModels([]); } })
      .catch(() => undefined);
    return () => controller.abort();
  }, [vehicleClass, fuelType]);
  
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
    onStatusChange(Object.values(requiredValues).filter((item): item is string => typeof item === "string" && !item.trim()).length + (policyCover ? 0 : 1));
  }, [requiredValues, policyCover, onStatusChange]);

  const prevValuesRef = useRef<string>(JSON.stringify(requiredValues));
  useEffect(() => {
    const current = JSON.stringify(requiredValues);
    if (current !== prevValuesRef.current && onValuesChange) {
      prevValuesRef.current = current;
      onValuesChange(requiredValues);
    }
  }, [requiredValues, onValuesChange]);
  const documents = ["Certificate", "Vignette", "Sch", "Inv", "Premium", "Com", "PSSA", "Acc. Gen", "ICAC", "MIE", "AML", "AMCCU", "MRA", "PSEA", "BOM", "EWF", "Pro Note", "Summary", "Policy-wording", "KYC", "Scarcity", "Proposal"];
  const actions = ["Insert & Save", "Edit & Save", "View", "Print", "Not approved", "Approve", "Insert 2 NTA", "Reports in PDF", "Exit"];

  const formatRegNo = (value: string) => {
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const groups = cleaned.match(/[A-Z]+|\d+/g);
    return groups ? groups.join("-") : cleaned;
  };

  const field = (label: string, name: string, type: "input" | "select" = "input", options?: string[], required?: boolean, readOnly?: boolean) => {
    // Special handling for excess fields with dynamic options
    let fieldOptions = options;
    if (name === "compulsoryExcess") fieldOptions = compulsoryExcessOptions;
    if (name === "youngDriverExcess") fieldOptions = youngDriverExcessOptions;
    if (name === "tpfExcess") fieldOptions = tpfExcessOptions;
    
    // Excess fields are calculated read-only values (from API)
    if (name === "totalLossExcess" || name === "youngDriverExcess" || name === "compulsoryExcess" || name === "additionalExcess") {
      const value = requiredValues[name] || "";
      const isFetching = fetchingExcess && !excessCalculated;
      return (
        <label key={label} className="grid grid-cols-[max-content_1fr] items-center gap-2">
          <span className={labelClass}>{label}</span>
          <div className={`${inputClass} bg-slate-50 cursor-default font-mono text-slate-700 ${isFetching ? "animate-pulse" : ""}`}>
            {isFetching ? (
              <span className="text-slate-400">Calculating...</span>
            ) : value ? (
              Number(value).toLocaleString()
            ) : (
              <span className="text-slate-400">—</span>
            )}
          </div>
        </label>
      );
    }
    
    return (
      <label key={label} className="grid grid-cols-[max-content_1fr] items-center gap-2">
        <span className={labelClass}>{label}{required ? <span className="text-rose-600"> *</span> : null}</span>
        {type === "select" ? <select name={name} value={requiredValues[name] || ""} onChange={(event) => updateRequired(name, event.target.value)} className={`${inputClass} ${readOnly ? "bg-slate-100 cursor-not-allowed" : ""}`} disabled={fetchingExcess || readOnly}><option value="">Select</option>{fieldOptions?.map((o) => <option key={o}>{o}</option>)}</select> : <input name={name} value={requiredValues[name] || ""} maxLength={name === "seating" ? 2 : undefined} inputMode={name === "seating" || name === "sumInsured" || name === "gvw" || name === "trailerFeet" ? "numeric" : undefined} onChange={(event) => { let value = event.target.value; if (name === "vehicleNo") value = formatRegNo(value); if (name === "seating") value = value.replace(/\D/g, "").slice(0, 2); if (name === "sumInsured" || name === "gvw" || name === "trailerFeet") value = value.replace(/[^0-9.]/g, ""); updateRequired(name, value); }} className={`${inputClass} ${readOnly ? "bg-slate-100 cursor-not-allowed" : ""}`} readOnly={readOnly} />}
      </label>
    );
  };

  const isGoodsVehicle = /GOODS VEHICLE\(PRIVATE\)|GOODS VEHICLE\(PUBLIC\)/i.test(vehicleClass || "");
  const isTankerTrailerTractor = /TANKER|TRAILER|TRACTOR/i.test(vehicleClass || "");

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const formatDisplayDate = (isoDate: string) => {
    if (!isoDate) return "";
    const date = new Date(isoDate + "T00:00:00");
    const day = String(date.getDate()).padStart(2, "0");
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const parseDisplayDate = (displayDate: string) => {
    const match = displayDate.match(/^(\d{2})-([A-Za-z]{3})-(\d{4})$/);
    if (!match) return "";
    const [, day, monthStr, year] = match;
    const month = monthNames.indexOf(monthStr.charAt(0).toUpperCase() + monthStr.slice(1).toLowerCase());
    if (month === -1) return "";
    return `${year}-${String(month + 1).padStart(2, "0")}-${day}`;
  };

  const manufactureDateField = (
    <label className="grid grid-cols-[max-content_1fr] items-center gap-2">
      <span className={labelClass}>Year Mfg. & Date of Reg.<span className="text-rose-600"> *</span></span>
      <div className="relative">
        <input
          name="manufactureDate"
          type="text"
          value={formatDisplayDate(requiredValues.manufactureDate || "")}
          placeholder="DD-Mon-YYYY"
          maxLength={11}
          onChange={(event) => {
            const displayValue = event.target.value;
            const isoValue = parseDisplayDate(displayValue);
            if (isoValue && isoValue <= todayISO) {
              updateManufactureDate(isoValue);
            } else if (!isoValue || displayValue.length <= 11) {
              updateManufactureDate(isoValue);
            }
          }}
          onBlur={(event) => {
            const displayValue = event.target.value;
            const isoValue = parseDisplayDate(displayValue);
            if (isoValue && isoValue <= todayISO) {
              updateManufactureDate(isoValue);
            } else {
              event.currentTarget.value = formatDisplayDate(requiredValues.manufactureDate || "");
            }
          }}
          className={`${inputClass} pr-10`}
          readOnly
        />
        <input
          type="date"
          value={requiredValues.manufactureDate || ""}
          max={todayISO}
          onChange={(event) => updateManufactureDate(event.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer"
          tabIndex={-1}
        />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            const dateInput = e.currentTarget.previousElementSibling as HTMLInputElement;
            dateInput?.focus();
            dateInput?.click();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#35126d] transition-colors"
          aria-label="Open calendar"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    </label>
  );

  return (
    <div className="border border-violet-200 bg-[#f7f5fb]">
      <div>
        <div className="p-4 sm:p-5 lg:border-r lg:border-violet-200">
          <div className="grid gap-x-5 gap-y-3 sm:grid-cols-2">
            <div className="space-y-3">{field("Reg No", "vehicleNo")}{field("Make", "make", "select", makes)}{field("Model", "model", "select", models)}{field("Eng No", "engineNo")}{field("Chassis No", "chassisNo")}</div>
            <div className="space-y-3">{field("Colour", "colour")}{manufactureDateField}{field("Seating", "seating")}<label className="grid grid-cols-[max-content_1fr] items-center gap-2"><span className={labelClass}>CC / kW</span><input name="cc" inputMode="decimal" max={isTankerTrailerTractor ? 500 : 10000} onInput={e => { let v = e.currentTarget.value.replace(/[^0-9.]/g, ""); if (parseFloat(v) > (isTankerTrailerTractor ? 500 : 10000)) v = String(isTankerTrailerTractor ? 500 : 10000); e.currentTarget.value = v; updateRequired("cc", v); }} className={inputClass} /></label>{isTankerTrailerTractor && <label className="grid grid-cols-[max-content_1fr] items-center gap-2"><span className={labelClass}>Trailer Ft.</span><input name="trailerFeet" type="number" min="0" required={isTankerTrailerTractor} className={inputClass} /></label>}</div>
            {isGoodsVehicle && <label className="grid grid-cols-[max-content_1fr] items-center gap-2"><span className={labelClass}>Gross Vehicle Weight</span><input name="gvw" type="number" required={isGoodsVehicle} className={inputClass} /></label>}
          </div>

<fieldset className="mt-5 border-t border-violet-200 pt-4">
            <legend className="pr-3 text-sm font-bold text-[#35126d]">Cover Details</legend>
            <input type="hidden" name="calculateFromBasicTariff" value="true" />
<div className="grid gap-x-5 gap-y-3 sm:grid-cols-2">
                  <div className="space-y-3">
                    <label className="grid gap-1.5 sm:grid-cols-[max-content_minmax(0,1fr)] sm:items-center"><span className={labelClass}>Cover Required<span className="text-rose-600"> *</span></span><select name="coverRequired" value={policyCover} onChange={(event) => { if (!coverLocked) { onPolicyCoverChange(event.target.value as PolicyCover); onStatusChange(Object.values(requiredValues).filter((item): item is string => typeof item === "string" && !item.trim()).length + (event.target.value ? 0 : 1)); } }} className={inputClass} disabled={coverLocked}><option value="">Select cover</option>{covers.filter((cover) => cover.name === "COMPREHENSIVE" || cover.name === "COMPREHENSIVE AUTOPLUS").map((cover) => <option key={cover.name} value={cover.name === "COMPREHENSIVE" ? "Comprehensive" : cover.name === "COMPREHENSIVE AUTOPLUS" ? "Comprehensive AutoPlus" : cover.name}>{cover.name === "COMPREHENSIVE" ? "Comprehensive" : cover.name === "COMPREHENSIVE AUTOPLUS" ? "Comprehensive AutoPlus" : cover.name}</option>)}</select></label>
                    {field("Young Driver Excess", "youngDriverExcess")}{field("Total Loss Excess", "totalLossExcess")}
</div>
                  <div className="space-y-3">{field("Sum Insured", "sumInsured", "input", undefined, true)}{field("Price Paid", "pricePaid", "input", undefined, true)}{field("Compulsory Excess", "compulsoryExcess")}{field("Additional Excess", "additionalExcess")}</div>
</div>
                {excessError ? <p role="alert" className="mt-3 border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">{excessError}</p> : null}
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
          <div className="grid gap-3 sm:grid-cols-[max-content_1fr_max-content_1fr] sm:items-center">
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
            <label className="grid gap-2 sm:grid-cols-[max-content_1fr]"><span className="pt-2 text-xs font-semibold text-slate-600">Additional Information (if required)</span><textarea rows={2} className="w-full border border-violet-200 bg-white px-2 py-2 text-sm outline-none focus:border-[#35126d] focus:ring-2 focus:ring-violet-100" /></label>
            <label className="grid gap-2 sm:grid-cols-[max-content_1fr]"><span className="pt-2 text-xs font-semibold text-slate-600">Remarks (Super User)</span><textarea rows={2} className="w-full border border-violet-200 bg-white px-2 py-2 text-sm outline-none focus:border-[#35126d] focus:ring-2 focus:ring-violet-100" /></label>
            <label className="grid gap-2 sm:grid-cols-[max-content_1fr]"><span className="pt-2 text-xs font-semibold text-slate-600">Point (6)</span><textarea rows={2} className="w-full border border-violet-200 bg-white px-2 py-2 text-sm outline-none focus:border-[#35126d] focus:ring-2 focus:ring-violet-100" /></label>
            <label className="grid gap-2 sm:grid-cols-[max-content_1fr]"><span className="pt-2 text-xs font-semibold text-slate-600">Point (7)</span><textarea rows={2} className="w-full border border-violet-200 bg-white px-2 py-2 text-sm outline-none focus:border-[#35126d] focus:ring-2 focus:ring-violet-100" /></label>
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
  const documents = ["Certificate", "Vignette", "Sch", "Inv", "Premium", "Com", "PSSA", "Acc. Gen", "ICAC", "MIE", "AML", "AMCCU", "MRA", "PSEA", "BOM", "EWF", "Pro Note", "Summary", "Policy-wording", "KYC", "Scarcity", "Proposal"];
  const actions = ["Insert & Save", "Edit & Save", "View", "Print", "Not approved", "Approve", "Insert 2 NTA", "Reports in PDF", "Exit"];
  const [accessories, setAccessories] = useState<Array<{ name: string; rate: number; category?: string }>>([]);
  // Amounts are keyed by accessory name so they stay with the right row when the category filter changes.
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    fetch("/api/motor/accessories")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => data?.accessories && setAccessories(data.accessories))
      .catch(() => undefined);
  }, []);

  const updateAmount = (name: string, value: string) => {
    setAmounts(prev => ({ ...prev, [name]: value }));
  };

  // Premium = rate * amount / 100, rounded to 2 decimals.
  const getPremium = (accessory: { name: string; rate: number }) => {
    const rate = Number(accessory.rate) || 0;
    const amount = Number(amounts[accessory.name]) || 0;
    return Math.round(rate * amount) / 100;
  };
  
  const categories = useMemo(() => {
    const cats = [...new Set(accessories.map(a => a.category || "General"))];
    return ["All", ...cats];
  }, [accessories]);
  
  const filteredAccessories = useMemo(() => {
    if (selectedCategory === "All") return accessories;
    return accessories.filter(a => (a.category || "General") === selectedCategory);
  }, [accessories, selectedCategory]);
  
  // Sum over all accessories (not only the visible category) so every entered amount counts.
  const totalPremium = accessories.reduce((sum, accessory) => sum + getPremium(accessory), 0);

  return (
    <div className="border border-violet-200 bg-[#f7f5fb]">
      <div>
        <div className="p-4 sm:p-5 lg:border-r lg:border-violet-200">
          <div className="mb-4 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition ${
                  selectedCategory === cat
                    ? "bg-[#35126d] text-white"
                    : "bg-white text-slate-600 hover:bg-violet-50 border border-violet-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="grid gap-4">
            <div className="overflow-auto border border-violet-200 bg-white rounded-lg">
              <table className="w-full min-w-[720px] border-collapse text-left text-xs">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-violet-100 text-[#35126d]">
                    <th className="border-r border-violet-200 px-3 py-2.5">Description</th>
                    <th className="border-r border-violet-200 px-3 py-2.5">Make & Model</th>
                    <th className="border-r border-violet-200 px-3 py-2.5 text-center">Rate (%)</th>
                    <th className="border-r border-violet-200 px-3 py-2.5 text-center">Amount</th>
                    <th className="px-3 py-2.5 text-center">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccessories.map((accessory, rowIndex) => {
                    const index = accessories.indexOf(accessory);
                    const premium = getPremium(accessory).toFixed(2);
                    return (
                    <tr key={accessory.name} className={rowIndex % 2 === 0 ? "bg-white" : "bg-violet-50/50"} onMouseEnter={(e) => e.currentTarget.classList.add("bg-violet-50")} onMouseLeave={(e) => e.currentTarget.classList.remove("bg-violet-50")}>
                      <td className="border-b border-r border-violet-100 px-3 py-2 font-medium text-slate-700">{accessory.name}</td>
                      <td className="border-b border-r border-violet-100 px-2 py-1.5">
                        <input
                          name={`accessoryMakeModel_${index}`}
                          placeholder="Optional"
                          className="h-8 w-full border border-transparent bg-transparent px-2 outline-none focus:border-violet-300 focus:bg-white rounded text-xs"
                        />
                      </td>
                      <td className="border-b border-r border-violet-100 px-3 py-2 text-center text-slate-600 font-mono">{(Number(accessory.rate) || 0).toFixed(2)}%</td>
                      <td className="border-b border-r border-violet-100 px-2 py-1.5 text-center">
                        <input
                          name={`accessoryAmount_${index}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={amounts[accessory.name] ?? ""}
                          onChange={(e) => updateAmount(accessory.name, e.target.value)}
                          className="h-8 w-24 mx-auto border border-violet-200 bg-white px-2 text-center text-sm outline-none focus:border-[#35126d] focus:ring-2 focus:ring-violet-100 rounded"
                        />
                        <input type="hidden" name={`accessoryPremium_${index}`} value={premium} />
                      </td>
                      <td className="border-b border-violet-100 px-3 py-2 text-center">
                        <input
                          type="text"
                          name={`accessoryPremiumDisplay_${index}`}
                          value={premium}
                          readOnly
                          className="h-8 w-24 mx-auto bg-slate-50 text-right text-sm font-medium px-2 outline-none rounded border border-slate-200"
                        />
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 border-t border-violet-200 pt-4">
              <div className="sm:col-span-2"></div>
              <div className="bg-white border border-violet-200 rounded-lg p-4 text-right">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Accessories Premium</p>
                <p className="mt-1 text-2xl font-bold text-[#35126d] tabular-nums">{totalPremium.toFixed(2)}</p>
                <input type="hidden" name="accessoriesTotalPremium" value={totalPremium.toFixed(2)} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GeneralInformationForm() {
  const inputClass = "h-9 w-full border border-violet-200 bg-white px-2 text-sm text-slate-800 outline-none focus:border-[#35126d] focus:ring-2 focus:ring-violet-100";
  const labelClass = "text-xs font-semibold text-slate-600";
  const [activeSection, setActiveSection] = useState<string>("declarations");

  const sections = [
    { id: "declarations", title: "Declarations" },
    { id: "accidents", title: "Accident History" },
    { id: "previous", title: "Previous Insurance" },
    { id: "additional", title: "Additional Questions" },
  ];

  const questions = [
    { id: "q1", text: "Do you or any other person who to your knowledge will drive suffer from defective vision or hearing or from any physical infirmity?", section: "declarations" },
    { id: "q2", text: "Do you require insurance to be restricted to the vehicle being driven solely by yourself?", section: "declarations" },
    { id: "q3", text: "If Yes, please specify details of other drivers with valid licence in Mauritius.", section: "declarations", conditional: "q2", conditionalValue: "Yes" },
    { id: "q4", text: "Will the vehicle be used exclusively for private, social, domestic, pleasure and professional purpose?", section: "declarations" },
    { id: "q5", text: "Carriage of goods other than samples or personal luggage?", section: "declarations" },
    { id: "q6", text: "Is the vehicle in good condition free from any defect?", section: "declarations" },
    { id: "q7", text: "Has the driver ever been involved or convicted for causing any accident or loss?", section: "accidents" },
    { id: "q8", text: "Has any insurance company ever declined or refused to continue any insurance of yours?", section: "additional" },
  ];

  const renderQuestion = (q: typeof questions[0], index: number) => {
    const isConditional = q.conditional && q.conditionalValue;
    return (
      <div key={q.id} className={`space-y-3 p-4 border border-violet-100 bg-white rounded-lg transition ${isConditional ? "opacity-60" : ""}`}>
        <div className="flex items-start gap-3">
          <span className="flex-shrink-0 w-6 text-center text-xs font-bold text-violet-600">{String.fromCharCode(97 + index)})</span>
          <p className="flex-1 text-xs leading-5 text-slate-700 mt-0.5">{q.text}</p>
        </div>
        {q.id === "q3" ? (
          <div className="ml-9 space-y-2">
            <div className="grid grid-cols-[1fr_60px] gap-2 bg-violet-50 p-2 rounded">
              <span className="text-[11px] font-semibold text-slate-600">Driver Name</span>
              <span className="text-[11px] font-semibold text-slate-600">Age</span>
            </div>
            <div className="grid grid-cols-[1fr_60px] gap-2">
              <input type="text" name={`${q.id}_name_1`} placeholder="Driver name" className={inputClass} />
              <input type="number" name={`${q.id}_age_1`} min="18" max="100" placeholder="Age" className={inputClass} />
            </div>
            <div className="grid grid-cols-[1fr_60px] gap-2">
              <input type="text" name={`${q.id}_name_2`} placeholder="Driver name" className={inputClass} />
              <input type="number" name={`${q.id}_age_2`} min="18" max="100" placeholder="Age" className={inputClass} />
            </div>
          </div>
        ) : (
          <div className="ml-9 flex items-center gap-6 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer"><input type="radio" name={q.id} value="Yes" className="accent-[#35126d] h-4 w-4" /> Yes</label>
            <label className="flex items-center gap-1.5 cursor-pointer"><input type="radio" name={q.id} value="No" className="accent-[#35126d] h-4 w-4" /> No</label>
          </div>
        )}
      </div>
    );
  };

  const accidentsSection = (
    <div className="space-y-4">
      <p className="mb-3 text-xs leading-5 text-slate-700">Give details of accidents or claims (including pending prosecution, if any)</p>
      <div className="overflow-x-auto border border-violet-200 rounded-lg">
        <table className="w-full min-w-[680px] border-collapse text-left text-xs">
          <thead>
            <tr className="bg-violet-100 text-[#35126d]">
              <th className="border-r border-violet-200 px-3 py-2.5">Driver Name</th>
              <th className="border-r border-violet-200 px-3 py-2.5">Date of Accident</th>
              <th className="border-r border-violet-200 px-3 py-2.5">Circumstances of Accident/Claim</th>
              <th className="px-3 py-2.5">Loss/Cost (Rs.)</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2].map((row) => (
              <tr key={row} className={row % 2 === 0 ? "bg-violet-50/50" : "bg-white"}>
                <td className="border-b border-r border-violet-100 px-3 py-2"><input type="text" name={`accident_driver_${row}`} className="w-full border border-transparent bg-transparent px-1 outline-none focus:border-violet-300 focus:bg-white text-xs" /></td>
                <td className="border-b border-r border-violet-100 px-3 py-2"><input type="date" name={`accident_date_${row}`} className="w-full border border-transparent bg-transparent px-1 outline-none focus:border-violet-300 focus:bg-white text-xs" /></td>
                <td className="border-b border-r border-violet-100 px-3 py-2"><textarea name={`accident_circumstances_${row}`} rows={2} className="w-full border border-transparent bg-transparent px-1 outline-none focus:border-violet-300 focus:bg-white text-xs resize-none" /></td>
                <td className="border-b border-violet-100 px-3 py-2"><input type="number" name={`accident_cost_${row}`} min="0" step="0.01" className="w-full border border-transparent bg-transparent px-1 outline-none focus:border-violet-300 focus:bg-white text-xs text-right" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const previousInsuranceSection = (
    <div className="space-y-4">
      <label className="grid grid-cols-[max-content_1fr] gap-3 items-start">
        <span className="text-xs text-slate-700 mt-1">Name of the insurance company previously insured with</span>
        <select className={inputClass}>
          <option value="">Select company</option>
          <option>Company A</option>
          <option>Company B</option>
          <option>Company C</option>
        </select>
      </label>
      <label className="grid grid-cols-[max-content_1fr] gap-3 items-start">
        <span className="text-xs text-slate-700 mt-1">Details of past claims (total claims for 5 years)</span>
        <input className={inputClass} placeholder="Enter details" />
      </label>
    </div>
  );

  return (
    <div className="border border-violet-200 bg-[#f7f5fb]">
      <div>
        <div className="p-4 sm:p-5 lg:border-r lg:border-violet-200">
          <div className="mb-4 border-b border-violet-200">
            <nav className="flex flex-wrap gap-1" aria-label="General Information sections">
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition ${
                    activeSection === section.id
                      ? "bg-[#35126d] text-white"
                      : "text-slate-600 hover:bg-violet-50 hover:text-[#35126d]"
                  }`}
                >
                  <span>{section.icon}</span> {section.title}
                </button>
              ))}
            </nav>
          </div>

          <div className="space-y-4">
            {activeSection === "declarations" && (
              <>
                {questions.filter(q => q.section === "declarations").map((q, idx) => renderQuestion(q, idx))}
              </>
            )}
            {activeSection === "accidents" && accidentsSection}
            {activeSection === "previous" && previousInsuranceSection}
            {activeSection === "additional" && (
              <>
                {questions.filter(q => q.section === "additional").map((q, idx) => renderQuestion(q, idx))}
              </>
            )}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className={labelClass}>Remarks</span>
              <textarea rows={3} className={inputClass} placeholder="Additional remarks..." />
            </label>
          </div>
        </div>
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
          <div className="grid gap-3 sm:grid-cols-[max-content_1fr_minmax(360px,1.2fr)]"><span className="text-xs font-semibold">a)</span><p className="text-xs leading-5 text-slate-700">Purpose for which vehicle will be used</p><div className="flex flex-wrap gap-x-5 gap-y-2 text-xs"><label className="flex items-center gap-1"><input type="radio" name="vehicle-purpose" className="accent-[#35126d]" />Passenger Carry</label><label className="flex items-center gap-1"><input type="radio" name="vehicle-purpose" className="accent-[#35126d]" />Commercial</label><label className="flex items-center gap-1"><input type="radio" name="vehicle-purpose" className="accent-[#35126d]" />Goods Carry</label><label className="flex items-center gap-1"><input type="radio" name="vehicle-purpose" className="accent-[#35126d]" />Other</label></div></div>
          <div className="grid gap-3 sm:grid-cols-[max-content_1fr_minmax(360px,1.2fr)]"><span className="text-xs font-semibold">b)</span><p className="text-xs leading-5 text-slate-700">If vehicle used for carriage of goods specify its nature</p><div className="flex flex-wrap gap-x-5 gap-y-2 text-xs"><label className="flex items-center gap-1"><input type="radio" name="goods-nature" className="accent-[#35126d]" />General</label><label className="flex items-center gap-1"><input type="radio" name="goods-nature" className="accent-[#35126d]" />Hazardous</label></div></div>
          <div className="grid gap-3 sm:grid-cols-[max-content_1fr_max-content]"><span className="text-xs font-semibold">c)</span><p className="text-xs leading-5 text-slate-700">If hazardous cargo will be carried state whether explosives or petrol will be carried</p>{yesNo("hazardous-cargo")}</div>
          <div className="grid gap-3 sm:grid-cols-[max-content_1fr_max-content]"><span className="text-xs font-semibold">d)</span><p className="text-xs leading-5 text-slate-700">Vehicle registered in your name</p>{yesNo("registered-name")}</div>
          <div className="grid gap-3 sm:grid-cols-[max-content_1fr_max-content]"><span className="text-xs font-semibold">e)</span><p className="text-xs leading-5 text-slate-700">Has any alteration or addition been made to manufacturer&apos;s standard design</p>{yesNo("altered-design")}</div>
          <label className="grid gap-3 sm:ml-[22px] sm:grid-cols-[1fr_1.2fr]"><span className="text-xs leading-5 text-slate-500">If yes, provide alteration details</span><textarea rows={3} className="w-full border border-violet-200 bg-white px-2 py-2 text-sm outline-none focus:border-[#35126d] focus:ring-2 focus:ring-violet-100" /></label>
          <div className="grid gap-3 border-y border-violet-100 py-4 sm:grid-cols-[max-content_1fr_max-content_1fr]"><span className="text-xs font-semibold">f)</span><p className="text-xs leading-5 text-slate-700">Maximum licensed carrying capacity (No. of passengers) in case of passenger carrying vehicle.</p><label className="text-xs font-semibold text-slate-600">No. of Passengers</label><input type="number" min="0" className={inputClass} /></div>
          <div className="grid gap-3 sm:grid-cols-[max-content_1fr_max-content]"><span className="text-xs font-semibold">g)</span><p className="text-xs leading-5 text-slate-700">Whether the use of the vehicle is limited to own premises</p>{yesNo("own-premises")}</div>
          <div className="grid gap-3 sm:grid-cols-[max-content_1fr_max-content]"><span className="text-xs font-semibold">h)</span><p className="text-xs leading-5 text-slate-700">Whether the commercial vehicle is also used for private purpose</p>{yesNo("private-purpose")}</div>
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

function PremiumForm({ values, calculating, onCalculate, error }: { values: Record<string, string | boolean>; calculating?: boolean; onCalculate?: () => void; error?: string }) {
  const inputClass = "h-8 w-full border border-violet-200 bg-white px-2 text-xs text-slate-800 outline-none focus:border-[#35126d] focus:ring-2 focus:ring-violet-100";
  const documents = ["Certificate", "Vignette", "Sch", "Inv", "Premium", "Com", "PSSA", "Acc. Gen", "ICAC", "MIE", "AML", "AMCCU", "MRA", "PSEA", "BOM", "EWF", "Pro Note", "Summary", "Policy-wording", "KYC", "Scarcity", "Proposal"];
  const actions = ["Insert & Save", "Edit & Save", "View", "Print", "Not approved", "Approve", "Insert 2 NTA", "Reports in PDF", "Exit"];
  const leftGroups = [
    ["Additional Cover", ["Passenger Risk", "Personal Accident", "PA (Conductor)", "PA (Employee)", "PA (Family Members)", "Auto Plus", "Driver Only", "Loss of Use", "Towing"]],
    ["Add Extra Perils", ["Strike, Riot and Civil Commotion", "Cyclone"]],
    ["Discounts", []],
    ["Claim/Other Loading", []],
  ];
  const additionalCovers = ["Windscreen Extension", "Waiver of Excess", "Loss of Car Keys", "Airfreight Expenses", "Personal Belongings", "Damage by Rodents", "Accidental Misfuelling", "Enhanced Personal Accidental", "Funeral Expenses"];

  const optionTable = (title: string, rows: string[]) => {
    if (!rows.length) return null;
    return <div key={title} className="border border-violet-200"><div className="grid grid-cols-[1fr_52px_80px] bg-[#7766db] px-2 py-1.5 text-[11px] font-bold text-white"><span>{title}</span><span>No</span><span>Amount</span></div>{rows.map((row, index) => <div key={row} className={`grid grid-cols-[1fr_52px_80px] items-center border-t border-violet-100 px-2 py-1 ${index % 2 ? "bg-violet-50/50" : "bg-white"}`}><label className="flex items-center gap-2 text-xs"><input type="checkbox" className="accent-[#35126d]" />{row}</label><input type="number" className="h-6 w-11 border border-violet-100 bg-transparent px-1" aria-label={`${row} number`} /><input type="number" defaultValue="0" className="h-6 w-full border border-violet-100 bg-transparent px-1 text-right" aria-label={`${row} amount`} /></div>)}</div>;
  };

  const numericFields = new Set(["premium", "basicRate", "basicAmt", "addCharge", "minPremium", "loadingPer", "tpPremium", "mgwRate", "excess", "youngExcess", "tpfExcess", "fixPremium", "documentCharge", "levy", "hitAndRun", "invoiceAmount"]);

  const getValue = (name: string): string => {
    const val = values[name];
    if (calculating) return "Calculating...";
    if (val === undefined || val === null || val === "") {
      return numericFields.has(name) ? "0.00" : "";
    }
    if (typeof val === "boolean") return val ? "1" : "0";
    const strVal = String(val);
    const num = parseFloat(strVal);
    return isNaN(num) ? strVal : num.toFixed(2);
  };

  return (
    <div className="border border-violet-200 bg-[#f7f5fb]">

      <div>
        <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-2 lg:border-r lg:border-violet-200">
          <div className="space-y-3">
            {leftGroups.map(([title, rows]) => optionTable(title as string, rows as string[]))}
          </div>

          <div className="space-y-3">
            {optionTable("Additional Cover", additionalCovers)}
            <div className="flex flex-wrap gap-5 py-1 text-xs"><label className="flex items-center gap-1"><input type="radio" name="premium-period" defaultChecked className="accent-[#35126d]" disabled />Annual</label><label className="flex items-center gap-1"><input type="radio" name="premium-period" className="accent-[#35126d]" disabled />Pro Rata</label><label className="flex items-center gap-1"><input type="radio" name="premium-period" className="accent-[#35126d]" disabled />Short Period</label></div>
            <div className="space-y-2">
              <button type="button" onClick={onCalculate} disabled={calculating} className="h-9 bg-[#35126d] px-5 text-xs font-bold text-white hover:bg-violet-800 disabled:bg-slate-400">
                {calculating ? "Calculating..." : "Calculate Premium"}
              </button>
              {error && <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 px-2 py-1 rounded">{error}</p>}
              {[["Total Premium (Incl. Tow)", "premium"], ["Basic Rate", "basicRate"], ["Basic Amount", "basicAmt"], ["Additional Charge", "addCharge"], ["Min Premium", "minPremium"], ["Loading %", "loadingPer"], ["TP Premium", "tpPremium"], ["MGW Rate", "mgwRate"], ["Excess", "excess"], ["Young Driver Excess", "youngExcess"], ["TPF Excess", "tpfExcess"], ["Fix Premium", "fixPremium"], ["Doc. Charges", "documentCharge"], ["Levy Charge", "levy"], ["Hit & Run Charge", "hitAndRun"], ["Inv. Amount", "invoiceAmount"]].map(([label, name]) => <label key={label} className="grid grid-cols-[1fr_70px] items-center gap-2 text-xs font-semibold"><span>{label}</span><input name={name} type="number" step="0.01" value={getValue(name) as string} onChange={(e) => {}} className={inputClass} readOnly /></label>)}
            </div>
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

// A document chosen in the Attached Document form. It is kept in the page until the payment is
// confirmed, then stored on the server (policy folder, or the KYC folder of the insured).
type PendingDocument = { slot: string; docType: string; kyc: boolean; file: File };
type StoredDocumentRow = { fileName: string; fullPath: string };
type StoredDocumentList = { policyDocuments: StoredDocumentRow[]; kycDocuments: StoredDocumentRow[] };
const ACCEPTED_DOCUMENT_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"];
const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024;

function documentFileError(file: File): string {
  const dot = file.name.lastIndexOf(".");
  const extension = dot > 0 ? file.name.slice(dot).toLowerCase() : "";
  if (!extension) return "Document is not valid, NO EXTENSION. Please verify.";
  if (!ACCEPTED_DOCUMENT_EXTENSIONS.includes(extension)) return "Only PDF, JPG, PNG, DOC and DOCX documents are accepted.";
  if (file.size > MAX_DOCUMENT_BYTES) return "The maximum size is 5 MB.";
  return "";
}
const formatFileSize = (bytes: number) => bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

function AttachedDocumentForm({ policyNo, documents: pendingDocuments, onDocumentsChange, stored, uploadMessage }: { policyNo: string; documents: PendingDocument[]; onDocumentsChange: (documents: PendingDocument[]) => void; stored: StoredDocumentList | null; uploadMessage: { text: string; error: boolean } | null }) {
  const inputClass = "h-9 w-full border border-violet-200 bg-white px-2 text-sm text-slate-800 outline-none focus:border-[#35126d] focus:ring-2 focus:ring-violet-100";
  const labelClass = "text-xs font-semibold text-slate-600";
  // docType is the "Document Type" used in the stored file name; kyc documents go to the insured's KYC folder.
  const requiredDocuments = [
    { id: "licence", name: "Driver's Licence", types: ["Licence"], docType: "Licence", kyc: false, required: true, accepted: "PDF, JPG, PNG (Max 5MB)" },
    { id: "nid_passport", name: "NID / Passport", types: ["National ID / Passport"], docType: "NID Passport", kyc: true, required: true, accepted: "PDF, JPG, PNG (Max 5MB)" },
    { id: "sale_deed", name: "Sale Deed / HorsePower", types: ["Sale Deed"], docType: "Sale Deed", kyc: false, required: true, accepted: "PDF, JPG, PNG (Max 5MB)" },
    { id: "address_proof", name: "KYC / Address Proof", types: ["Address Proof"], docType: "Address Proof", kyc: true, required: true, accepted: "PDF, JPG, PNG (Max 5MB)" },
  ];
  const [selectedDocType, setSelectedDocType] = useState<string>("");
  const uploadedFiles: Record<string, { name: string; size: string }> = Object.fromEntries(pendingDocuments.map((d) => [d.slot, { name: d.file.name, size: formatFileSize(d.file.size) }]));
  const [documentChecks, setDocumentChecks] = useState<Record<string, boolean>>(() => Object.fromEntries(pendingDocuments.map((d) => [d.slot, true])));
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
  const [extraNames, setExtraNames] = useState<Record<string, string>>(() => Object.fromEntries(pendingDocuments.filter((d) => d.slot.startsWith("extra_")).map((d) => [d.slot, d.docType])));
  const [dragActive, setDragActive] = useState<string | null>(null);

  const setDocument = (slot: string, document: PendingDocument | null) => {
    onDocumentsChange([...pendingDocuments.filter((d) => d.slot !== slot), ...(document ? [document] : [])]);
  };
  
  // Auto-select checkboxes when Doc Type is selected
  useEffect(() => {
    if (selectedDocType) {
      setDocumentChecks((prev) => {
        const next = { ...prev };
        requiredDocuments.forEach((doc) => {
          if (doc.types.includes(selectedDocType)) {
            next[doc.id] = true;
          }
        });
        return next;
      });
    }
  }, [selectedDocType]);
  
  const handleDocTypeChange = (value: string) => {
    setSelectedDocType(value);
  };
  
  const handleFileUpload = (docId: string, file: File) => {
    setDragActive(null);
    const error = documentFileError(file);
    setFileErrors((prev) => ({ ...prev, [docId]: error }));
    if (error) return;
    const doc = requiredDocuments.find((d) => d.id === docId);
    if (!doc) return;
    setDocument(docId, { slot: docId, docType: doc.docType, kyc: doc.kyc, file });
    setDocumentChecks((prev) => ({ ...prev, [docId]: true }));
  };

  const handleExtraFile = (slot: string, file: File | undefined) => {
    if (!file) { setDocument(slot, null); return; }
    const error = documentFileError(file);
    setFileErrors((prev) => ({ ...prev, [slot]: error }));
    if (error) return;
    setDocument(slot, { slot, docType: extraNames[slot]?.trim() || "OTHER", kyc: false, file });
  };

  const handleExtraName = (slot: string, name: string) => {
    setExtraNames((prev) => ({ ...prev, [slot]: name }));
    const existing = pendingDocuments.find((d) => d.slot === slot);
    if (existing) setDocument(slot, { ...existing, docType: name.trim() || "OTHER" });
  };
  
  const handleDragOver = (e: React.DragEvent, docId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(docId);
  };
  
  const handleDragLeave = (e: React.DragEvent, docId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragActive === docId) setDragActive(null);
  };
  
  const handleDrop = (e: React.DragEvent, docId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(docId, file);
    setDragActive(null);
  };
  
  const handleCheckChange = (docId: string, checked: boolean) => {
    setDocumentChecks((prev) => ({ ...prev, [docId]: checked }));
  };
  
  const isDocRequired = (docId: string) => {
    const doc = requiredDocuments.find(d => d.id === docId);
    return doc?.required || false;
  };
  
  const allRequiredUploaded = requiredDocuments
    .filter(d => d.required)
    .every(d => documentChecks[d.id] && uploadedFiles[d.id]);
  
  const requiredUploadedCount = requiredDocuments
    .filter(d => d.required && uploadedFiles[d.id])
    .length;
  const requiredTotalCount = requiredDocuments.filter(d => d.required).length;
  
  const getStatusIcon = (doc: typeof requiredDocuments[0]) => {
    const hasFile = !!uploadedFiles[doc.id];
    const isChecked = documentChecks[doc.id];
    if (hasFile && isChecked) return <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></span>;
    if (hasFile) return <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-600"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg></span>;
    if (doc.required) return <span className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">!</span>;
    return <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">○</span>;
  };

  return (
    <div className="border border-violet-200 bg-[#f7f5fb]">
      <div>
        <div className="p-4 sm:p-5 lg:border-r lg:border-violet-200">
          {/* Document number (policy number) - the documents are stored under it on the server */}
          <div className="mb-5 grid gap-2 border border-violet-200 bg-white p-3 sm:grid-cols-[max-content_1fr] sm:items-center">
            <span className="text-xs font-semibold text-slate-600">Document No (Policy No)</span>
            <input readOnly value={policyNo || ""} placeholder="Assigned when the policy is saved" className="h-9 w-full border border-violet-200 bg-slate-50 px-2 font-mono text-sm text-slate-800 outline-none" />
            <p className="text-xs text-slate-500 sm:col-span-2">The documents are uploaded to the server when the payment is confirmed: policy documents to the policy folder, and NID / Passport and Address Proof to the insured&apos;s KYC folder.</p>
          </div>

          {/* Progress Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800">Document Upload</h3>
              <span className="text-xs font-semibold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full">
                {requiredUploadedCount} / {requiredTotalCount} Required
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#35126d] to-violet-500 transition-all duration-300"
                style={{ width: `${(requiredUploadedCount / requiredTotalCount) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">Upload all required documents to proceed with policy confirmation</p>
          </div>

          {/* Document Type Filter */}
          <div className="mb-6 p-4 bg-white border border-violet-200 rounded-xl">
            <label className="block text-xs font-semibold text-slate-600 mb-2">Filter by Document Type</label>
            <div className="flex flex-wrap gap-2">
              {["All", "Licence", "National ID / Passport", "Sale Deed", "Address Proof"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleDocTypeChange(type === "All" ? "" : type)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                    selectedDocType === (type === "All" ? "" : type)
                      ? "bg-[#35126d] text-white shadow-sm"
                      : "bg-white text-slate-600 hover:bg-violet-50 border border-violet-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Upload Grid */}
          <div className="space-y-3">
            {requiredDocuments
              .filter(doc => !selectedDocType || doc.types.includes(selectedDocType))
              .map((doc, index) => (
                <div
                  key={doc.id}
                  className={`group relative bg-white rounded-xl border-2 transition-all duration-200 ${
                    uploadedFiles[doc.id] 
                      ? "border-emerald-200 bg-emerald-50" 
                      : dragActive === doc.id 
                        ? "border-[#35126d] bg-violet-50" 
                        : "border-violet-100 hover:border-violet-300"
                  }`}
                  onDragOver={(e) => handleDragOver(e, doc.id)}
                  onDragLeave={(e) => handleDragLeave(e, doc.id)}
                  onDrop={(e) => handleDrop(e, doc.id)}
                >
                  <input
                    type="file"
                    id={`file_${doc.id}`}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(doc.id, file);
                      e.target.value = "";
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    disabled={false}
                  />
                  <div className="p-4 flex items-center gap-4">
                    {/* Status Icon */}
                    <div className="flex-shrink-0">{getStatusIcon(doc)}</div>
                    
                    {/* Document Icon & Info */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
                      {doc.id === "licence" && (
                        <svg className="w-5 h-5 text-[#35126d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                      {doc.id === "nid_passport" && (
                        <svg className="w-5 h-5 text-[#35126d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 8V4a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2h-4l-4 4H6a2 2 0 01-2-2V8z" />
                        </svg>
                      )}
                      {doc.id === "sale_deed" && (
                        <svg className="w-5 h-5 text-[#35126d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10l4-8" />
                        </svg>
                      )}
                      {doc.id === "address_proof" && (
                        <svg className="w-5 h-5 text-[#35126d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-800 truncate">{doc.name}</span>
                        {doc.required && (
                          <span className="px-2 py-0.5 text-[10px] font-bold text-rose-600 bg-rose-50 rounded-full">Required</span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                        <span>{doc.accepted}</span>
                        {uploadedFiles[doc.id] && (
                          <span className="text-emerald-600 font-medium flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            {uploadedFiles[doc.id].name} ({uploadedFiles[doc.id].size})
                          </span>
                        )}
                      </div>
                      {fileErrors[doc.id] ? <p role="alert" className="mt-1 text-xs font-medium text-rose-600">{fileErrors[doc.id]}</p> : null}
                    </div>
                    
                    {/* Checkbox */}
                    <div className="flex-shrink-0 flex items-center">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={documentChecks[doc.id] || false}
                          onChange={(e) => { e.stopPropagation(); handleCheckChange(doc.id, e.target.checked); }}
                          disabled={!uploadedFiles[doc.id] && doc.required}
                          className={`h-4 w-4 accent-[#35126d] rounded border-2 ${!uploadedFiles[doc.id] && doc.required ? "opacity-40 cursor-not-allowed border-slate-200" : "border-violet-300"}`}
                        />
                        <span className="text-[11px] text-slate-500 hidden sm:block">Confirm</span>
                      </label>
                    </div>
                    
                    {/* Upload Label Overlay */}
                    {!uploadedFiles[doc.id] && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-xl border-2 border-dashed border-violet-200">
                          <svg className="w-8 h-8 mx-auto text-violet-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                          <p className="text-sm font-medium text-violet-600">Drag & drop or click to upload</p>
                          <p className="text-xs text-violet-400 mt-1">{doc.accepted}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>

          {/* Additional Documents */}
          <div className="mt-6">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Additional Documents (Optional)
            </h4>
            <div className="space-y-2">
              {[1, 2, 3].map((row) => {
                const slot = `extra_${row}`;
                const attached = pendingDocuments.find((d) => d.slot === slot);
                return (
                <div key={row} className="bg-white border border-violet-100 rounded-xl p-3">
                  <div className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-500">{requiredDocuments.length + row}</span>
                  <input type="text" placeholder="Document name (Document Type)" value={extraNames[slot] ?? ""} onChange={(e) => handleExtraName(slot, e.target.value)} className="flex-1 text-sm border border-violet-200 bg-white px-3 py-2 rounded-lg outline-none focus:border-[#35126d] focus:ring-2 focus:ring-violet-100" />
                  <label className="flex-shrink-0 cursor-pointer">
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="sr-only" onChange={(e) => { handleExtraFile(slot, e.target.files?.[0]); e.target.value = ""; }} />
                    <span className="px-4 py-2 text-sm font-medium text-violet-600 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors border border-violet-200">{attached ? "Replace" : "Attach"}</span>
                  </label>
                  {attached ? <button type="button" onClick={() => handleExtraFile(slot, undefined)} className="flex-shrink-0 text-xs font-medium text-rose-600 hover:underline">Remove</button> : null}
                  </div>
                  {attached ? <p className="mt-2 pl-11 text-xs font-medium text-emerald-600">{attached.file.name} ({formatFileSize(attached.file.size)})</p> : null}
                  {fileErrors[slot] ? <p role="alert" className="mt-2 pl-11 text-xs font-medium text-rose-600">{fileErrors[slot]}</p> : null}
                </div>
                );
              })}
            </div>
          </div>

          {/* Confirmation Section */}
          <div className="mt-6 bg-white border-2 rounded-xl overflow-hidden">
            <div className={`px-5 py-4 border-b ${allRequiredUploaded ? "border-emerald-200 bg-emerald-50" : "border-violet-200"}`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${allRequiredUploaded ? "bg-emerald-100 text-emerald-600" : "bg-violet-100 text-violet-600"}`}>
                  {allRequiredUploaded ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Confirm Documents</p>
                  <p className="text-xs text-slate-500">
                    {allRequiredUploaded ? "All required documents uploaded and confirmed" : "Upload all required documents to enable confirmation"}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <button
                type="button"
                className="w-full bg-[#35126d] px-5 py-3 text-sm font-bold text-white hover:bg-violet-800 transition-colors rounded-lg flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Update Documents Selection
              </button>
              <label className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${allRequiredUploaded ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-50 text-slate-500 border border-slate-200 cursor-not-allowed"}`}>
                <input
                  name="documentsConfirmed"
                  type="checkbox"
                  checked={allRequiredUploaded}
                  onChange={(e) => setDocumentChecks((prev) => {
                    const next = { ...prev };
                    requiredDocuments.forEach(d => { if (d.required) next[d.id] = e.target.checked; });
                    return next;
                  })}
                  disabled={!allRequiredUploaded}
                  className="h-5 w-5 accent-[#35126d]"
                />
                <span className="text-sm font-semibold">I confirm all required documents are uploaded</span>
              </label>
              {!allRequiredUploaded && (
                <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                  Please upload all required documents before confirming.
                </div>
              )}
            </div>
          </div>

          {/* Upload result and documents stored for this policy (GetDocList) */}
          {uploadMessage ? <p role={uploadMessage.error ? "alert" : "status"} className={`mt-6 border px-3 py-2 text-xs font-medium ${uploadMessage.error ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{uploadMessage.text}</p> : null}
          {stored && (stored.policyDocuments.length > 0 || stored.kycDocuments.length > 0) ? (
            <div className="mt-6 overflow-auto border border-violet-200 bg-white">
              <table className="w-full min-w-[560px] border-collapse text-left text-xs">
                <thead><tr className="bg-violet-100 text-[#35126d]"><th className="border-r border-violet-200 px-3 py-2">Folder</th><th className="border-r border-violet-200 px-3 py-2">File Name</th><th className="px-3 py-2">Full Path</th></tr></thead>
                <tbody>
                  {[...stored.policyDocuments.map((d) => ({ ...d, folder: "Policy" })), ...stored.kycDocuments.map((d) => ({ ...d, folder: "KYC" }))].map((d) => (
                    <tr key={`${d.folder}-${d.fullPath}`} className="border-t border-violet-100"><td className="border-r border-violet-100 px-3 py-2 font-semibold text-slate-600">{d.folder}</td><td className="border-r border-violet-100 px-3 py-2 text-slate-700">{d.fileName}</td><td className="px-3 py-2 font-mono text-slate-500">{d.fullPath}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {/* Remarks */}
          <div className="mt-6">
            <label className="grid gap-2">
              <span className={labelClass}>Remarks</span>
              <textarea rows={3} className={inputClass} placeholder="Additional remarks for attached documents..." />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

// Values written by a premium calculation; cleared when the inputs change so a stale premium is never shown or saved.
const premiumOutputFields = ["premium", "basicRate", "basicAmt", "addCharge", "minPremium", "loadingPer", "tpPremium", "mgwRate", "excess", "youngExcess", "tpfExcess", "fixPremium", "isMinPremiumApplied", "isGoodsVehicle", "invoiceAmount", "documentCharge", "levy", "hitAndRun"];

// usp_GetPremiumRateMotor overrides CC itself for these classes (TRAILER 2001; MOTOR TRADE 2000 or 5000), so the entered CC is not used.
const ccOverriddenByTariff = (vehicleClass: string) => ["TRAILER", "MOTOR TRADE"].includes(vehicleClass.trim().toUpperCase());

export default function BuyOnlinePage() {
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
  const [premiumCalculating, setPremiumCalculating] = useState(false);
  const [premiumCalculated, setPremiumCalculated] = useState(false);
  const [premiumError, setPremiumError] = useState("");
  // Policy number returned when the policy is saved (Attached Document); required for payment and the policy email.
  const [policyNo, setPolicyNo] = useState("");
  // Live KYC record from the KYC form (name, email, address, occupation, ...).
  const [kycClient, setKycClient] = useState<ClientRecord>({});
  // Documents chosen in the Attached Document form; uploaded to the server once the payment is confirmed.
  const [pendingDocuments, setPendingDocuments] = useState<PendingDocument[]>([]);
  const [storedDocuments, setStoredDocuments] = useState<StoredDocumentList | null>(null);
  const [documentUploadMessage, setDocumentUploadMessage] = useState<{ text: string; error: boolean } | null>(null);

  const calculateVehicleAge = (manufactureDate: string, issueDate: string): number => {
    if (!manufactureDate || !issueDate) return 0;
    const mfg = new Date(manufactureDate);
    const iss = new Date(issueDate);
    const diffYears = (iss.getTime() - mfg.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return Math.floor(diffYears * 100) / 100;
  };

  const clearPremiumOutputs = useCallback(() => {
    setPremiumCalculated(false);
    setProposalDraft((prev) => {
      if (premiumOutputFields.every((f) => !prev[f])) return prev;
      const next = { ...prev };
      premiumOutputFields.forEach((f) => { next[f] = ""; });
      return next;
    });
  }, []);

  const calculatePremium = useCallback(async () => {
    const vehicleClass = String(proposalDraft.vehicleClass || "").toUpperCase();
    const ccOverridden = ccOverriddenByTariff(vehicleClass);
    const requiredFields = [
      "vehicleClass", "vehicleType", "fuelType", "sumInsured",
      "manufactureDate", "issueDate", "seating", "vehicleStatus",
      ...(ccOverridden ? [] : ["cc"]),
    ];
    if (/GOODS VEHICLE\(PRIVATE\)|GOODS VEHICLE\(PUBLIC\)/.test(vehicleClass)) {
      requiredFields.push("gvw");
    }
    if (/TANKER|TRAILER|TRACTOR/.test(vehicleClass)) {
      requiredFields.push("trailerFeet");
    }
    const missing = requiredFields.filter((f) => !proposalDraft[f] || String(proposalDraft[f]).trim() === "");
    if (missing.length > 0) {
      console.log("[Premium] Missing fields for calculation:", missing);
      setPremiumError(`Missing required fields: ${missing.join(", ")}`);
      clearPremiumOutputs();
      return;
    }

    const mgw = parseFloat(String(proposalDraft.gvw || "0"));
    if (/GOODS VEHICLE\(PRIVATE\)|GOODS VEHICLE\(PUBLIC\)/.test(vehicleClass) && mgw <= 0) {
      setPremiumError("Gross Vehicle Weight (GVW) must be greater than 0 for Goods Vehicles");
      clearPremiumOutputs();
      return;
    }

    const trailerFeet = parseFloat(String(proposalDraft.trailerFeet || "0"));
    if (/TANKER|TRAILER|TRACTOR/.test(vehicleClass) && trailerFeet <= 0) {
      setPremiumError("Trailer Feet must be greater than 0 for Tanker/Trailer/Tractor");
      clearPremiumOutputs();
      return;
    }

    if (!ccOverridden) {
      const cc = parseFloat(String(proposalDraft.cc || "0"));
      if (cc <= 0) {
        setPremiumError("Engine Capacity (CC/kW) must be greater than 0");
        clearPremiumOutputs();
        return;
      }
      const maxCc = /TANKER|TRAILER|TRACTOR/.test(vehicleClass) ? 500 : 10000;
      if (cc > maxCc) {
        setPremiumError(`Engine Capacity (CC/kW) must be ${maxCc} or less (got ${cc})`);
        clearPremiumOutputs();
        return;
      }
    }

    if (new Date(String(proposalDraft.manufactureDate)) > new Date(String(proposalDraft.issueDate))) {
      setPremiumError("Date of manufacture cannot be after the issue date");
      clearPremiumOutputs();
      return;
    }

    const age = calculateVehicleAge(
      String(proposalDraft.manufactureDate || ""),
      String(proposalDraft.issueDate || "")
    );

    setPremiumCalculating(true);
    setPremiumError("");
    try {
      const params = new URLSearchParams({
        country: (proposalDraft.country as string) || "MAURITIUS",
        issueDate: String(proposalDraft.issueDate || ""),
        coverRequired: String(proposalDraft.coverRequired || policyCover),
        vehicleStatus: String(proposalDraft.vehicleStatus || "NEW"),
        vehicleClass: String(proposalDraft.vehicleClass || ""),
        vehicleType: String(proposalDraft.vehicleType || ""),
        age: String(age),
        seating: String(proposalDraft.seating || "0"),
        cylCapacity: String(proposalDraft.cc || "0"),
        trailerFeet: String(proposalDraft.trailerFeet || "0"),
        excess: String(proposalDraft.compulsoryExcess || "0"),
        sumInsured: String(proposalDraft.sumInsured || "0"),
        mgw: String(proposalDraft.gvw || "0"),
        tariffDate: String(proposalDraft.issueDate || ""),
      });

      console.log("[Premium] Sending params:", Object.fromEntries(params));
      const response = await fetch(`/api/motor/premium-calculation?${params.toString()}`);
      const data = await response.json();
      console.log("[Premium] API Response:", data);

      if (data.success) {
        const updates = {
          premium: String(data.totalPremium || data.basicAmt || 0),
          basicRate: String(data.basicRate || 0),
          basicAmt: String(data.basicAmt || 0),
          addCharge: String(data.addCharge || 0),
          minPremium: String(data.minPremium || 0),
          loadingPer: String(data.loadingPer || 0),
          tpPremium: String(data.tpPremium || 0),
          mgwRate: String(data.mgwRate || 0),
          excess: String(data.excess || 0),
          youngExcess: String(data.youngExcess || 0),
          tpfExcess: String(data.tpfExcess || 0),
          fixPremium: String(data.fixPremium || 0),
          isMinPremiumApplied: data.isMinPremiumApplied ? "true" : "false",
          isGoodsVehicle: data.isGoodsVehicle ? "true" : "false",
          invoiceAmount: String((data.totalPremium || data.basicAmt || 0) + 150),
          documentCharge: "150",
          levy: "0.39",
          hitAndRun: "0",
        };
        console.log("[Premium] Setting values:", updates);
        setProposalDraft((prev) => ({ ...prev, ...updates }));
        setPremiumCalculated(true);
      } else {
        console.error("[Premium] Calculation failed:", data.errorMsg);
        setPremiumError(data.errorMsg || "Premium calculation failed");
        clearPremiumOutputs();
      }
    } catch (error) {
      console.error("[Premium] Calculation error:", error);
      setPremiumError("Failed to calculate premium. Please try again.");
      clearPremiumOutputs();
    } finally {
      setPremiumCalculating(false);
    }
  }, [proposalDraft, policyCover, clearPremiumOutputs]);
  useEffect(() => {
    const today = new Date();
    const isoDate = today.toISOString().slice(0, 10);
    setProposalDraft((prev) => ({ ...prev, issueDate: isoDate }));
  }, []);

  // Recalculate whenever an input sent to usp_GetPremiumRateMotor changes (debounced while typing),
  // so the premium on screen always matches the current details.
  const premiumInputKey = JSON.stringify(
    ["country", "issueDate", "coverRequired", "vehicleStatus", "vehicleClass", "vehicleType", "fuelType",
      "manufactureDate", "seating", "cc", "trailerFeet", "compulsoryExcess", "sumInsured", "gvw"]
      .map((f) => String(proposalDraft[f] ?? ""))
      .concat(policyCover)
  );
  const lastPremiumInputKey = useRef<string | null>(null);

  useEffect(() => {
    if (lastPremiumInputKey.current === premiumInputKey) return;
    const timer = setTimeout(() => {
      lastPremiumInputKey.current = premiumInputKey;
      const triggerFields = [
        "vehicleClass", "vehicleType", "fuelType", "sumInsured",
        "manufactureDate", "issueDate", "seating", "vehicleStatus",
        ...(ccOverriddenByTariff(String(proposalDraft.vehicleClass || "")) ? [] : ["cc"]),
      ];
      // coverRequired comes from policyCover state, not proposalDraft
      const hasAllFields = triggerFields.every((f) => proposalDraft[f] && String(proposalDraft[f]).trim() !== "")
        && policyCover && policyCover.trim() !== "";
      if (hasAllFields) {
        console.log("[Premium] Auto-triggering calculation with:", { ...proposalDraft, coverRequired: policyCover });
        calculatePremium();
      } else {
        clearPremiumOutputs();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [premiumInputKey, proposalDraft, policyCover, calculatePremium, clearPremiumOutputs]);

const detailsComplete = Boolean(registration.trim() && fullName.trim());
  const [emailPreviewOpen, setEmailPreviewOpen] = useState(false);
  const [emailPreviewData, setEmailPreviewData] = useState<{ policyNo: string; clientCode: string; fullName: string; email: string; title: string; firstName: string; surname: string } | null>(null);
  const kycValue = (field: string) => kycClient[field] == null ? "" : String(kycClient[field]).trim();
  const draftValue = (field: string) => proposalDraft[field] == null ? "" : String(proposalDraft[field]).trim();

  useEffect(() => {
    console.log("[Payment] emailPreviewOpen changed:", emailPreviewOpen, "emailPreviewData:", emailPreviewData);
  }, [emailPreviewOpen, emailPreviewData]);

  const showEmailPreview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("[Payment] showEmailPreview called, policyNo:", policyNo);
    if (!policyNo) {
      setPaymentError(true);
      setPaymentMessage("Policy number not found. Please save the policy first (Attached Document section).");
      return;
    }
    
    // Client details come from the KYC form (falling back to a client picked by code search).
    const title = kycValue("Title") || draftValue("title");
    const firstName = kycValue("Name") || draftValue("firstName");
    const surname = kycValue("Surname") || draftValue("surname");
    const fullName = `${title} ${firstName} ${surname}`.replace(/\s+/g, " ").trim().toUpperCase();
    const email = kycValue("EMail") || draftValue("email");
    const clientCode = kycValue("Code") || draftValue("clientCode") || "WEB";
    if (!email) {
      setPaymentError(true);
      setPaymentMessage("Enter the client's e-mail address in the KYC form so the policy documents can be sent.");
      return;
    }

    console.log("[Payment] Opening email preview with:", { policyNo, clientCode, fullName, email });
    setEmailPreviewData({ policyNo, clientCode, fullName, email, title, firstName, surname });
    setPaymentOpen(false);
    // Use timeout to ensure state updates are processed
    setTimeout(() => {
      setEmailPreviewOpen(true);
      console.log("[Payment] Email preview should be open now");
    }, 0);
  };

  // Uploads the documents chosen in the Attached Document form (after the payment is confirmed),
  // then reloads the list of documents stored for the policy.
  const uploadPendingDocuments = async (policyNumber: string, clientCode: string): Promise<{ text: string; failed: boolean }> => {
    const messages: string[] = [];
    let failed = false;
    const toSend = pendingDocuments.filter((d) => !d.kyc || clientCode);
    if (pendingDocuments.some((d) => d.kyc) && !clientCode) {
      failed = true;
      messages.push("The KYC documents were not uploaded because no client (insured) code is selected in KYC.");
    }
    if (toSend.length) {
      const form = new FormData();
      form.set("policyNo", policyNumber);
      form.set("clientCode", clientCode);
      toSend.forEach((d, index) => { form.set(`file_${index}`, d.file); form.set(`docType_${index}`, d.docType); form.set(`kyc_${index}`, String(d.kyc)); });
      try {
        const response = await fetch("/api/motor/attachments", { method: "POST", body: form });
        const data = await response.json().catch(() => ({})) as { error?: string };
        if (!response.ok) { failed = true; messages.push(data.error || "Document could not be uploaded. Please inform HO Or send the document through E-MaiL and request to upload by HO."); }
        else { messages.push(`${toSend.length} attached document(s) uploaded to the server.`); setPendingDocuments((current) => current.filter((d) => !toSend.includes(d))); }
      } catch {
        failed = true;
        messages.push("Document could not be uploaded. Please inform HO Or send the document through E-MaiL and request to upload by HO.");
      }
    }
    try {
      const response = await fetch(`/api/motor/attachments?policyNo=${encodeURIComponent(policyNumber)}`);
      if (response.ok) setStoredDocuments(await response.json() as StoredDocumentList);
    } catch { /* the list is informational */ }
    const text = messages.join(" ");
    setDocumentUploadMessage(text ? { text, error: failed } : null);
    return { text, failed };
  };

  const submitPayment = async () => {
    if (!emailPreviewData) return;
    setEmailPreviewOpen(false);
    setPaymentMessage(""); setPaymentError(false); setSaving(true);
    try {
      // Data shown in the KYC, Policy Details, Vehicle Details and Premium forms. The server prefers the
      // saved policy and client records and uses these values only where the database has no value.
      const documents: Record<string, string> = {
        address: kycValue("Address"), city: kycValue("City"), occupation: kycValue("Occupation"), mobile: kycValue("Mobile"),
        country: draftValue("country") || "Mauritius", vehicleType: draftValue("vehicleType"), vehicleClass: draftValue("vehicleClass"),
        vehicleStatus: draftValue("vehicleStatus"), fuelType: draftValue("fuelType"), coverRequired: policyCover || draftValue("coverRequired"),
        issueDate: draftValue("issueDate"), fromDate: draftValue("fromDate"), toDate: draftValue("toDate"),
        vehicleNo: draftValue("vehicleNo"), make: draftValue("make"), model: draftValue("model"), engineNo: draftValue("engineNo"),
        chassisNo: draftValue("chassisNo"), seating: draftValue("seating"), cc: draftValue("cc"), manufactureDate: draftValue("manufactureDate"),
        sumInsured: draftValue("sumInsured"), compulsoryExcess: draftValue("compulsoryExcess"), additionalExcess: draftValue("additionalExcess"),
        youngDriverExcess: draftValue("youngDriverExcess"), totalLossExcess: draftValue("totalLossExcess"), tpfExcess: draftValue("tpfExcess"),
        premium: draftValue("premium"), documentCharge: draftValue("documentCharge"), levy: draftValue("levy"),
        hitAndRun: draftValue("hitAndRun"), invoiceAmount: draftValue("invoiceAmount"),
      };
      const response = await fetch("/api/motor/payment", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        ...payment,
        clientCode: emailPreviewData.clientCode === "WEB" ? "" : emailPreviewData.clientCode,
        policyNo: emailPreviewData.policyNo,
        amount: proposalDraft.invoiceAmount || proposalDraft.premium,
        title: emailPreviewData.title,
        firstName: emailPreviewData.firstName,
        surname: emailPreviewData.surname,
        email: emailPreviewData.email,
        documents,
      }) });
      const data = await response.json() as { error?: string; message?: string; clientCode?: string; paymentProcessed?: boolean; invoiceNo?: number; emailSent?: boolean; emailMessage?: string; storageMessage?: string };
      if (!response.ok) {
        if (data.paymentProcessed) {
          // Payment confirmed: push the attached documents to the server as well.
          const upload = await uploadPendingDocuments(emailPreviewData.policyNo, "");
          setPaymentError(true);
          setPaymentMessage(`${data.error} Payment was processed (Invoice: ${data.invoiceNo}). Please select a client in KYC. ${data.storageMessage || ""} ${data.emailMessage || ""} ${upload.text}`.replace(/\s+/g, " ").trim());
        } else {
          throw new Error(data.error || "Payment could not be submitted.");
        }
      } else {
        setPaymentOpen(false);
        // Payment confirmed: push the attached documents to the server (policy folder / KYC folder).
        const upload = await uploadPendingDocuments(emailPreviewData.policyNo, data.clientCode || (emailPreviewData.clientCode === "WEB" ? "" : emailPreviewData.clientCode));
        setPaymentError(data.emailSent === false || upload.failed);
        setPaymentMessage(`${data.message || "Payment submitted successfully."} Client code: ${data.clientCode || emailPreviewData.clientCode}. ${data.storageMessage || ""} ${data.emailMessage || ""} ${upload.text}`.replace(/\s+/g, " ").trim());
      }
    } catch (error) { setPaymentError(true); setPaymentMessage(error instanceof Error ? error.message : "Payment could not be submitted."); }
    finally { setSaving(false); }
  };

  const visibleSections = useMemo(() => {
    const isCommercialVehicle = /COMMERCIAL VEHICLE/i.test(proposalDraft.vehicleType || "");
    return newVehicleSections.filter((section) => {
      if (section.title === "Common Det.") return isCommercialVehicle;
      return true;
    });
  }, [proposalDraft.vehicleType]);

  const completedSectionCount = visibleSections.filter((section) => savedSections.has(section.title)).length;
  const allSectionsSaved = completedSectionCount === visibleSections.length;
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
      setPolicyNo(data.policyNo);
      return true;
    } catch (error) {
      setSaveError(true); setSaveMessage(error instanceof Error ? error.message : "Policy could not be saved.");
      return false;
    } finally { setSaving(false); }
  };

const markSectionSaved = (title: string) => {
    setSavedSections((current) => new Set(current).add(title));
    const index = visibleSections.findIndex((section) => section.title === title);
    const next = visibleSections[index + 1];
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
    
    // For Premium section, ensure calculation is complete
    if (openSection === "Premium" && !premiumCalculated) {
      await calculatePremium();
      // Re-read draft after calculation
      const updatedDraft = { ...proposalDraft };
      root?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("[name]").forEach((field) => {
        if (!field.name || (field.type === "radio" || field.type === "checkbox") && !field.checked) return;
        updatedDraft[field.name] = field.type === "checkbox" ? field.checked : field.value;
      });
      setProposalDraft(updatedDraft);
    }
    
    const missing = (sectionRequirements[openSection] || []).filter(([name]) => {
      const value = currentDraft[name];
      return value === undefined || value === "" || value === false;
    });
    if (openSection === "Vechicle Details" && String(currentDraft.coverRequired || "").toUpperCase().includes("COMP") && Number(currentDraft.sumInsured || 0) <= 0) {
      missing.push(["sumInsured", "Enter the sum insured for comprehensive cover."]);
    }
    // Skip validation for Attached Document - allow proceeding to payment without all documents
    if (missing.length && openSection !== "Attached Document") { setSaveError(true); setSaveMessage(missing.map(([, message]) => message).join(" ")); return; }
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
                      {visibleSections.map((section, index) => {
                        const isActive = openSection === section.title;
                        const isSaved = savedSections.has(section.title);
                        const isUnlocked = index === 0 || savedSections.has(visibleSections[index - 1].title);
                        return <button key={section.title} type="button" disabled={!isUnlocked} onClick={() => isUnlocked && setOpenSection(section.title)} aria-current={isActive ? "step" : undefined} className={`group relative flex items-center gap-3 p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-45 ${isActive ? "bg-[#35126d] text-white shadow-md shadow-violet-900/15" : "text-slate-600 hover:bg-violet-50 hover:text-[#35126d]"}`}>
                          <span className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center transition ${isActive ? "bg-white/15 text-white" : "bg-violet-50 text-violet-600 ring-1 ring-violet-100 group-hover:bg-white"}`}><SectionIcon title={section.title} /></span>
                          <span className="min-w-0 flex-1"><span className={`block text-[10px] font-bold uppercase tracking-widest ${isActive ? "text-violet-200" : "text-slate-400"}`}>Section {String(index + 1).padStart(2, "0")}</span><span className="mt-0.5 block truncate text-sm font-semibold">{section.title}</span></span>
                          {isSaved ? <span className={`text-sm font-bold ${isActive ? "text-emerald-200" : "text-emerald-600"}`}>OK</span> : section.alert ? <span className={`h-2 w-2 shrink-0 rounded-full ${isActive ? "bg-amber-300" : "bg-red-500"}`} /> : <svg viewBox="0 0 20 20" className={`h-4 w-4 shrink-0 ${isActive ? "text-violet-200" : "text-slate-300"}`} fill="none" stroke="currentColor" strokeWidth="2"><path d="m7 4 6 6-6 6" /></svg>}
                        </button>;
                      })}
                    </div>
</nav>

  {visibleSections.map((section) => (
                    <section key={section.title} hidden={openSection !== section.title} className="min-w-0 overflow-hidden border border-violet-100 bg-white shadow-sm">
                      <div className="flex flex-col gap-3 border-b border-violet-100 bg-gradient-to-r from-violet-50/80 to-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                        <div className="flex items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center bg-white text-[#35126d] shadow-sm ring-1 ring-violet-100"><SectionIcon title={section.title} /></span><div><h3 className="font-semibold text-slate-900 sm:text-lg">{section.title}</h3><p className="mt-0.5 text-xs text-slate-500 sm:text-sm">{section.title === "KYC" && kycMissing.length ? `Missing: ${kycMissing.join(", ")}` : sectionDescriptions[section.title]}</p></div></div>
                        {section.title === "KYC" ? <span className="self-start bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 ring-1 ring-red-100 sm:self-auto">{kycMissing.length ? `${kycMissing.length} mandatory field${kycMissing.length === 1 ? "" : "s"} pending` : "Complete"}</span> : section.title === "Policy Details" ? <span className={`self-start px-3 py-1.5 text-xs font-bold ring-1 sm:self-auto ${policyMissing ? "bg-red-50 text-red-700 ring-red-100" : "bg-emerald-50 text-emerald-700 ring-emerald-100"}`}>{policyMissing ? `${policyMissing} mandatory fields pending` : "Complete"}</span> : section.title === "Vechicle Details" ? <span className={`self-start px-3 py-1.5 text-xs font-bold ring-1 sm:self-auto ${vehicleMissing ? "bg-red-50 text-red-700 ring-red-100" : "bg-emerald-50 text-emerald-700 ring-emerald-100"}`}>{vehicleMissing ? `${vehicleMissing} mandatory fields pending` : "Complete"}</span> : section.pending ? <span className="self-start bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 ring-1 ring-red-100 sm:self-auto">{section.pending}</span> : <span className="self-start bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100 sm:self-auto">Ready to complete</span>}
                      </div>
<div className="overflow-x-auto p-3 sm:p-4">
                        {section.title === "KYC" ? <ClientDetailsForm onKycStatus={setKycMissing} onClientSelected={(client) => setProposalDraft((current) => ({ ...current, clientCode: String(client.Code || ""), title: String(client.Title || ""), firstName: String(client.Name || ""), surname: String(client.Surname || ""), email: String(client.EMail || "") }))} onSaved={() => markSectionSaved("KYC")} onClientChange={setKycClient} /> : section.title === "Policy Details" ? <MotorProposalForm clientCode={String(proposalDraft.clientCode || "")} onStatusChange={setPolicyMissing} coverRequired={policyCover} onValuesChange={(vals) => setProposalDraft((prev) => ({ ...prev, ...vals }))} /> : section.title === "Vechicle Details" ? <VehicleProposalForm policyCover={policyCover} onPolicyCoverChange={setPolicyCover} onStatusChange={setVehicleMissing} onValuesChange={(vals) => setProposalDraft((prev) => ({ ...prev, ...vals }))} vehicleClass={proposalDraft.vehicleClass} vehicleType={proposalDraft.vehicleType} fuelType={proposalDraft.fuelType} issueDate={proposalDraft.issueDate} country={String(proposalDraft.country || "Mauritius")} /> : section.title === "Accessories" ? <AccessoriesForm /> : section.title === "General Information" ? <GeneralInformationForm /> : section.title === "Common Det." ? <CommonDetailsForm /> : section.title === "Premium" ? <PremiumForm values={proposalDraft as Record<string, string | boolean>} calculating={premiumCalculating} onCalculate={calculatePremium} error={premiumError} /> : <AttachedDocumentForm policyNo={policyNo} documents={pendingDocuments} onDocumentsChange={setPendingDocuments} stored={storedDocuments} uploadMessage={documentUploadMessage} />}
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
      {console.log("[Render] emailPreviewOpen:", emailPreviewOpen, "emailPreviewData:", emailPreviewData) || (emailPreviewOpen && emailPreviewData ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"><div className="w-full max-w-2xl bg-white p-6 shadow-xl"><h2 className="text-xl font-semibold text-[#35126d] mb-4">Policy Email Preview</h2><div className="border border-violet-200 rounded-lg p-4 mb-4 bg-violet-50"><p className="text-sm font-semibold text-[#35126d]">Policy Confirmation Email</p><p className="text-xs text-slate-600 mt-1">This email will be sent to the client upon payment confirmation, with the Certificate of Insurance, Debit Note (Invoice), Policy Schedule and Insurance Vignette attached as PDF files.</p></div><div className="space-y-3 text-sm"><div><span className="font-semibold text-slate-700">To:</span> <span className="text-slate-600">{emailPreviewData.fullName}</span></div><div><span className="font-semibold text-slate-700">Email:</span> <span className="text-slate-600">{emailPreviewData.email || "Not provided"}</span></div><div><span className="font-semibold text-slate-700">Policy No:</span> <span className="font-mono text-[#35126d]">{emailPreviewData.policyNo}</span></div><div><span className="font-semibold text-slate-700">Client Code:</span> <span className="font-mono text-[#35126d]">{emailPreviewData.clientCode}</span></div></div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setEmailPreviewOpen(false)} className="border px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button><button type="button" onClick={submitPayment} disabled={saving} className="bg-[#35126d] px-5 py-2 text-sm font-semibold text-white">{saving ? "Submitting..." : "Send Email & Submit Payment"}</button></div></div></div> : null)}
      {paymentOpen ? <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 p-4"><form onSubmit={(e) => { e.preventDefault(); showEmailPreview(e); }} className="w-full max-w-lg space-y-4 bg-white p-6 shadow-xl"><h2 className="text-xl font-semibold text-[#35126d]">Complete payment</h2><select value={payment.method} onChange={e => setPayment({...payment, method:e.target.value})} className="w-full border p-3"><option value="card">Credit or debit card</option><option value="bank">Internet banking</option></select><input required placeholder="Name on card" value={payment.name} onChange={e=>setPayment({...payment,name:e.target.value})} className="w-full border p-3" /><input required placeholder="Card number" value={payment.cardNumber} onChange={e=>setPayment({...payment,cardNumber:e.target.value})} className="w-full border p-3" /><div className="grid grid-cols-2 gap-3"><input required placeholder="MM/YY" value={payment.expiry} onChange={e=>setPayment({...payment,expiry:e.target.value})} className="border p-3" /><input required placeholder="CVV" value={payment.cvv} onChange={e=>setPayment({...payment,cvv:e.target.value})} className="border p-3" /></div><div className="flex justify-end gap-3"><button type="button" onClick={()=>setPaymentOpen(false)} className="border px-4 py-2">Cancel</button><button type="button" onClick={(e) => { e.preventDefault(); showEmailPreview(e); }} disabled={saving} className="bg-[#35126d] px-5 py-2 font-semibold text-white">{saving ? "Submitting..." : "Continue to Email Preview"}</button></div></form></div> : null}
    </main>
  );
}


