"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PREMIUM_COVERS, additionalRiskCovered, applyCoverRules, coverColumns, coverErrors, mandatoryCoverRules, ratesFromColumns, type CoverRule } from "@/lib/additional-risk";

type PolicyCover = "" | "Comprehensive" | "Comprehensive AutoPlus" | "Third Party Fire & Theft" | "Third Party Only";

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
  "Common Det.": [], // validated by commonDetailsErrors()
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

  // Shows a client record from the database in the form (search by code, or the user's own record).
  function applyLoadedClient(record: ClientRecord) {
    // Apply UBO auto-merge for Individual category
    const clientWithUbo = updateUboFromName(record);
    setClient(clientWithUbo);
    onKycStatus(missingFields(clientWithUbo));
    onClientSelected(clientWithUbo);
    setLoaded(true);
    setIsNewClient(false);
    if (checkedValue(clientWithUbo.HasKYC)) onSaved();
  }

  // Returning user: load the client record they already have (client code, passport / NID, address, ...).
  // A first-time user gets no record back and keeps the new-client format filled from the profile.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/clients?mine=1")
      .then((response) => response.ok ? response.json() : null)
      .then((data: { client?: ClientRecord | null } | null) => {
        if (cancelled || !data?.client) return;
        applyLoadedClient(data.client);
        setMessageError(false);
        setMessage(`Your existing client record (code ${String(data.client.Code ?? "").trim()}) has been loaded.`);
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
    // Runs once when the KYC form opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Birth Date comes from the Profile page (and Gender when the record has none), also for a returning
  // user's record, as long as the KYC is not completed yet.
  useEffect(() => {
    if (!profile || checkedValue(client.HasKYC)) return;
    const dob = profile.DateOfBirth ? String(profile.DateOfBirth).slice(0, 10) : "";
    const gender = profile.Gender === "Male" || profile.Gender === "Female" ? profile.Gender : "";
    setClient((current) => {
      let changed = false;
      const next = { ...current };
      if (dob && String(current.DOB ?? "").slice(0, 10) !== dob) { next.DOB = dob; changed = true; }
      if (gender && !current.Gender) { next.Gender = gender; changed = true; }
      return changed ? next : current;
    });
    // Re-applied when a client record is loaded (client.Code changes).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, client.HasKYC, client.Code]);

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
      applyLoadedClient(data.client);
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
    const passportNo = value("PassportNo").trim();

    // Passport No.: at least 9 characters (letters, numbers or symbols) whenever it is entered,
    // and required for individuals who are not Mauritian.
    if (passportNo ? passportNo.length < 9 : category === "Individual" && nationality !== "mauritius") {
      setErrors({ PassportNo: "Passport number must contain at least 9 characters (letters, numbers or symbols)." });
      setMessageError(true);
      setMessage("Passport number must contain at least 9 characters (letters, numbers or symbols).");
      return;
    }
    
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

  const isIndividual = value("Category") === "Individual";
  const isCompany = value("Category") === "Company";
  // "" until the user chooses (a loaded record may have no residency value yet).
  const residence = checked("Resident") ? "resident" : ["false", "0"].includes(value("Resident").toLowerCase()) ? "non-resident" : "";
  const nationalityIsMauritius = value("Nationality").trim().toLowerCase() === "mauritius";
  const profileDob = profile?.DateOfBirth ? String(profile.DateOfBirth).slice(0, 10) : "";
  const dobLocked = isReadOnly || Boolean(profileDob);

  // Resident -> Nationality "Mauritius"; Non Resident -> Nationality cleared for the user to enter.
  const chooseResidence = (resident: boolean) => {
    if (isReadOnly) return;
    setField("Resident", resident);
    setField("Nationality", resident ? "Mauritius" : "");
  };

  const fieldClass = (field: string, locked = false) =>
    `h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#35126d] focus:ring-2 focus:ring-violet-100 ${errors[field] ? "border-rose-400 ring-2 ring-rose-100" : "border-violet-200"} ${locked ? "cursor-not-allowed bg-slate-50 text-slate-600" : ""}`;
  const fieldLabel = (text: string, required = false, hint?: string) => (
    <span className="mb-1.5 flex items-center justify-between gap-2 text-xs font-semibold text-slate-600">
      <span>{text}{required ? <span className="text-rose-600"> *</span> : null}</span>
      {hint ? <span className="text-[10px] font-medium uppercase tracking-wide text-violet-500">{hint}</span> : null}
    </span>
  );
  const section = (title: string, subtitle: string, icon: React.ReactNode, children: React.ReactNode) => (
    <section className="overflow-hidden rounded-xl border border-violet-100 bg-white shadow-sm">
      <header className="flex items-center gap-3 border-b border-violet-100 bg-gradient-to-r from-violet-50 to-white px-4 py-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#35126d] text-white">{icon}</span>
        <div>
          <h4 className="text-sm font-bold text-[#35126d]">{title}</h4>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </header>
      <div className="grid gap-4 p-4 sm:grid-cols-2">{children}</div>
    </section>
  );
  const choice = (name: string, label: string, isChecked: boolean, onSelect: () => void, disabled: boolean) => (
    <label className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${isChecked ? "border-[#35126d] bg-[#35126d] text-white shadow-sm" : "border-violet-200 bg-white text-slate-600 hover:border-violet-300 hover:bg-violet-50"} ${disabled ? "cursor-not-allowed opacity-60" : ""}`}>
      <input type="radio" name={name} checked={isChecked} onChange={onSelect} disabled={disabled} className="sr-only" />
      {label}
    </label>
  );
  const icon = (path: string) => <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={path} /></svg>;

  const statusBadge = isReadOnly
    ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">KYC completed</span>
    : loaded
      ? <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">KYC not completed</span>
      : <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">New client</span>;

  return (
    <form onSubmit={saveKyc} className="border border-violet-200 bg-[#f7f5fb]">
      <div className="space-y-4 p-4 sm:p-6">
        {/* Header: client code and KYC status */}
        <div className="rounded-xl bg-gradient-to-r from-[#35126d] to-[#5b3aa4] p-4 text-white shadow-sm sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">Know Your Customer</p>
              <h3 className="mt-1 text-lg font-bold">Client identification</h3>
            </div>
            {statusBadge}
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-[max-content_minmax(0,1fr)_max-content] sm:items-center">
            <label htmlFor="client-code" className="text-xs font-semibold text-violet-100">Client Code</label>
            <input id="client-code" name="clientCode" value={value("Code")} placeholder={clientCodeReadOnly ? "" : "Enter a client code and press Search"} onChange={(event) => { if (!clientCodeReadOnly) setField("Code", event.target.value); }} onKeyDown={(event) => { if (event.key === "Enter" && !clientCodeReadOnly) { event.preventDefault(); findClient(); } }} readOnly={clientCodeReadOnly} className={`h-10 w-full rounded-lg border border-white/30 px-3 font-mono text-sm outline-none ${clientCodeReadOnly ? "cursor-not-allowed bg-white/10 text-white" : "bg-white text-slate-800 focus:ring-2 focus:ring-violet-200"}`} />
            {!clientCodeReadOnly ? <button type="button" onClick={findClient} disabled={busy || !value("Code").trim()} className="h-10 rounded-lg bg-white px-4 text-sm font-semibold text-[#35126d] transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-60">Search</button> : null}
          </div>
        </div>

        {message ? <p role="status" className={`rounded-lg border px-3 py-2 text-sm font-medium ${messageError ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{message}</p> : null}
        {Object.keys(errors).length > 0 ? <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"><p className="font-semibold">Please correct the following:</p><ul className="mt-1 list-disc pl-5">{Object.values(errors).map((error) => <li key={error}>{error}</li>)}</ul></div> : null}

        {section("Personal details", "Who the policy is for", icon("M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"), <>
          <div className="sm:col-span-2">
            {fieldLabel("Category", true)}
            <div className="flex gap-2">
              {choice("category", "Individual", isIndividual, () => { if (!isReadOnly) setField("Category", "Individual"); }, isReadOnly)}
              {choice("category", "Company", isCompany, () => { if (!isReadOnly) setField("Category", "Company"); }, isReadOnly)}
            </div>
          </div>
          <label className="block">
            {fieldLabel("Title", true)}
            <select value={value("Title")} onChange={(event) => { if (!isReadOnly) setField("Title", event.target.value); }} disabled={isReadOnly} className={fieldClass("Title", isReadOnly)}><option value="">Select title</option><option>Mr.</option><option>Mrs.</option><option>Ms</option></select>
          </label>
          <label className="block">
            {fieldLabel(isCompany ? "Company Name" : "First Name", true)}
            <input value={value("Name")} onChange={(event) => { if (!isReadOnly) setField("Name", event.target.value); }} readOnly={isReadOnly} className={fieldClass("Name", isReadOnly)} />
          </label>
          <label className="block">
            {fieldLabel("Surname", isIndividual)}
            <input value={value("Surname")} onChange={(event) => { if (!isReadOnly) setField("Surname", event.target.value); }} readOnly={isReadOnly} className={fieldClass("Surname", isReadOnly)} />
          </label>
          <label className="block">
            {fieldLabel("UBO (Ultimate beneficial owner)", isCompany, isIndividual ? "Auto" : undefined)}
            <input value={value("UBO")} onChange={(event) => { if (!isReadOnly && isCompany) setField("UBO", event.target.value); }} readOnly={isReadOnly || isIndividual} className={fieldClass("UBO", isReadOnly || isIndividual)} />
          </label>
          <label className="block">
            {fieldLabel("Birth Date", isIndividual, profileDob ? "From profile" : undefined)}
            <input type="date" value={dateValue("DOB")} onChange={(event) => { if (!dobLocked) setField("DOB", event.target.value); }} readOnly={dobLocked} disabled={!isIndividual} className={fieldClass("DOB", dobLocked || !isIndividual)} />
          </label>
          <div>
            {fieldLabel("Gender", isIndividual)}
            <div className="flex gap-2">
              {choice("gender", "Male", value("Gender") === "Male", () => { if (!isReadOnly) setField("Gender", "Male"); }, isReadOnly || !isIndividual)}
              {choice("gender", "Female", value("Gender") === "Female", () => { if (!isReadOnly) setField("Gender", "Female"); }, isReadOnly || !isIndividual)}
            </div>
          </div>
        </>)}

        {section("Contact details", "How we reach the client", icon("M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"), <>
          <label className="block">
            {fieldLabel("Mobile", !value("TelRes") && !value("TelForegin"))}
            <input value={value("Mobile")} placeholder="5XXXXXXX" onChange={(event) => { if (!isReadOnly) setField("Mobile", event.target.value); }} readOnly={isReadOnly} className={fieldClass("Mobile", isReadOnly)} />
          </label>
          <label className="block">
            {fieldLabel("Tel Res / Abroad", !value("Mobile"))}
            <input value={value("TelRes") || value("TelForegin")} onChange={(event) => { if (!isReadOnly) setField("TelRes", event.target.value); }} readOnly={isReadOnly} className={fieldClass("TelRes", isReadOnly)} />
          </label>
          <label className="block">
            {fieldLabel("Tel Off")}
            <input value={value("TelOff")} onChange={(event) => { if (!isReadOnly) setField("TelOff", event.target.value); }} readOnly={isReadOnly} className={fieldClass("TelOff", isReadOnly)} />
          </label>
          <label className="block">
            {fieldLabel("Fax")}
            <input value={value("Fax")} onChange={(event) => { if (!isReadOnly) setField("Fax", event.target.value); }} readOnly={isReadOnly} className={fieldClass("Fax", isReadOnly)} />
          </label>
          <label className="block sm:col-span-2">
            {fieldLabel("E-Mail")}
            <input type="email" value={value("EMail")} onChange={(event) => { if (!isReadOnly) setField("EMail", event.target.value); }} readOnly={isReadOnly} className={fieldClass("EMail", isReadOnly)} />
          </label>
          <label className="block sm:col-span-2">
            {fieldLabel("Address")}
            <input value={value("Address")} onChange={(event) => { if (!isReadOnly) setField("Address", event.target.value); }} readOnly={isReadOnly} className={fieldClass("Address", isReadOnly)} />
          </label>
          <label className="block">
            {fieldLabel("City")}
            <input value={value("City")} onChange={(event) => { if (!isReadOnly) setField("City", event.target.value); }} readOnly={isReadOnly} className={fieldClass("City", isReadOnly)} />
          </label>
        </>)}

        {section("Residency & identity", "Residence, nationality and identity documents", icon("M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"), <>
          <div className="sm:col-span-2">
            {fieldLabel("Residence")}
            <div className="flex gap-2">
              {choice("residence", "Resident", residence === "resident", () => chooseResidence(true), isReadOnly)}
              {choice("residence", "Non Resident", residence === "non-resident", () => chooseResidence(false), isReadOnly)}
            </div>
          </div>
          <label className="block">
            {fieldLabel("Nationality", isIndividual, residence === "resident" ? "Resident" : undefined)}
            <input value={value("Nationality")} placeholder={residence === "non-resident" ? "Enter nationality" : ""} onChange={(event) => { if (!isReadOnly && residence !== "resident") setField("Nationality", event.target.value); }} readOnly={isReadOnly || residence === "resident"} className={fieldClass("Nationality", isReadOnly || residence === "resident")} />
          </label>
          <label className="block">
            {fieldLabel("Country Code")}
            <input value={value("CountryCode")} onChange={(event) => { if (!isReadOnly) setField("CountryCode", event.target.value); }} readOnly={isReadOnly} className={fieldClass("CountryCode", isReadOnly)} />
          </label>
          <label className="block">
            {fieldLabel("Passport No.", isIndividual && !nationalityIsMauritius, "Min 9 characters")}
            <input value={value("PassportNo")} onChange={(event) => { if (!isReadOnly) setField("PassportNo", event.target.value); }} readOnly={isReadOnly} minLength={9} className={fieldClass("PassportNo", isReadOnly)} />
          </label>
          <label className="block">
            {fieldLabel("NID", isIndividual && nationalityIsMauritius)}
            <input disabled={isReadOnly || !isIndividual || !nationalityIsMauritius} value={value("NID")} placeholder={isIndividual && nationalityIsMauritius ? "14 characters" : "Mauritian nationals only"} onChange={(event) => { if (!isReadOnly) setField("NID", event.target.value); }} readOnly={isReadOnly} className={fieldClass("NID", isReadOnly || !isIndividual || !nationalityIsMauritius)} />
          </label>
          <label className="block">
            {fieldLabel("BRN", isCompany)}
            <input disabled={isReadOnly || !isCompany} value={value("BRN")} placeholder={isCompany ? "" : "Companies only"} onChange={(event) => { if (!isReadOnly) setField("BRN", event.target.value); }} readOnly={isReadOnly} className={fieldClass("BRN", isReadOnly || !isCompany)} />
          </label>
          <label className="block">
            {fieldLabel("VAT")}
            <input value={value("VAT")} onChange={(event) => { if (!isReadOnly) setField("VAT", event.target.value); }} readOnly={isReadOnly} className={fieldClass("VAT", isReadOnly)} />
          </label>
        </>)}

        {section("Occupation", "Profession and qualification", icon("M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"), <>
          <label className="block">
            {fieldLabel("Occupation")}
            <input value={value("Occupation")} onChange={(event) => { if (!isReadOnly) setField("Occupation", event.target.value); }} readOnly={isReadOnly} className={fieldClass("Occupation", isReadOnly)} />
          </label>
          <label className="block">
            {fieldLabel("Qualification")}
            <input value={value("Qualification")} onChange={(event) => { if (!isReadOnly) setField("Qualification", event.target.value); }} readOnly={isReadOnly} className={fieldClass("Qualification", isReadOnly)} />
          </label>
        </>)}

        {loaded ? (
          checked("HasKYC")
            ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">KYC record: Completed</p>
            : <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">KYC record: Not completed yet. Fill in the missing details (Passport No / NID, Nationality, Address, Gender, Birth Date, ...) and click Save to complete the KYC.</p>
        ) : null}
        <p className="text-xs text-slate-500"><span className="text-rose-600">*</span> Required field</p>
        <button type="submit" disabled={busy || !canSave} className="w-full rounded-xl bg-[#35126d] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:bg-slate-400">{busy ? "Saving..." : isReadOnly ? "KYC already completed" : "Save KYC"}</button>
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
const fieldClass = (locked = false) =>
    `h-10 w-full rounded-lg border border-violet-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#35126d] focus:ring-2 focus:ring-violet-100 ${locked ? "cursor-default bg-slate-50 text-slate-600" : ""}`;
  const fieldLabel = (text: string, required = false, hint?: string) => (
    <span className="mb-1.5 flex items-center justify-between gap-2 text-xs font-semibold text-slate-600">
      <span>{text}{required ? <span className="text-rose-600"> *</span> : null}</span>
      {hint ? <span className="text-[10px] font-medium uppercase tracking-wide text-violet-500">{hint}</span> : null}
    </span>
  );
  const section = (title: string, subtitle: string, iconPath: string, children: React.ReactNode, columns = "sm:grid-cols-2") => (
    <section className="overflow-hidden rounded-xl border border-violet-100 bg-white shadow-sm">
      <header className="flex items-center gap-3 border-b border-violet-100 bg-gradient-to-r from-violet-50 to-white px-4 py-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#35126d] text-white"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={iconPath} /></svg></span>
        <div>
          <h4 className="text-sm font-bold text-[#35126d]">{title}</h4>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </header>
      <div className={`grid gap-4 p-4 ${columns}`}>{children}</div>
    </section>
  );
  const calendarIcon = <svg className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;

  // Summary of the period of cover shown in the header.
  const coverDays = values.fromDate && toDate ? Math.round((new Date(toDate).getTime() - new Date(values.fromDate).getTime()) / 86400000) : 0;
  const periodText = values.fromDate && toDate ? `${formatDateShort(new Date(values.fromDate))}  to  ${formatDateShort(new Date(toDate))}` : "";
  const classificationDone = [values.vehicleType, values.fuelType, values.vehicleClass, values.vehicleStatus].filter(Boolean).length;

return (
    <div className="border border-violet-200 bg-[#f7f5fb]">
      <div className="space-y-4 p-4 sm:p-6">
        {/* Header: policy number and period of cover */}
        <div className="rounded-xl bg-gradient-to-r from-[#35126d] to-[#5b3aa4] p-4 text-white shadow-sm sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">Policy Details</p>
              <h3 className="mt-1 text-lg font-bold">Cover, vehicle class and period</h3>
            </div>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">{classificationDone} / 4 classification fields</span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-violet-100">Policy No.</span>
              <input name="policyNo" value={policyNo} readOnly placeholder="Generated from the vehicle class and cover" className="h-10 w-full cursor-default rounded-lg border border-white/30 bg-white/10 px-3 font-mono text-sm text-white outline-none placeholder:text-violet-200" />
            </label>
            <div>
              <span className="mb-1.5 block text-xs font-semibold text-violet-100">Period of cover</span>
              <div className="flex h-10 items-center justify-between gap-2 rounded-lg border border-white/30 bg-white/10 px-3 text-sm">
                <span className="font-mono">{periodText || "-"}</span>
                {coverDays > 0 ? <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-[#35126d]">{coverDays} days</span> : null}
              </div>
            </div>
          </div>
        </div>

        {section("Vehicle classification", "Used for the tariff, excess and policy number", "M5 16l1.5-6h11l1.5 6M4 16h16v4h-3v-2H7v2H4zM7 13h.01M17 13h.01", <>
          <label className="block">
            {fieldLabel("Country")}
            <select name="country" defaultValue="Mauritius" className={fieldClass()}><option>Mauritius</option><option>Rodrigues</option></select>
          </label>
          <label className="block">
            {fieldLabel("Vehicle Status", true)}
            <select name="vehicleStatus" value={values.vehicleStatus} onChange={(event) => setRequired("vehicleStatus", event.target.value)} className={fieldClass()}>
              <option value="">Select vehicle status</option>{["NEW", "SECOND HAND", "RECON"].map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
          <label className="block">
            {fieldLabel("Vehicle Type", true)}
            <select name="vehicleType" value={values.vehicleType} onChange={(e) => { setRequired("vehicleType", e.target.value); setRequired("vehicleClass", ""); }} className={fieldClass()}><option value="">Select vehicle type</option>{vehicleTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select>
          </label>
          <label className="block">
            {fieldLabel("Fuel Type", true)}
            <select name="fuelType" value={values.fuelType} onChange={(e) => { setRequired("fuelType", e.target.value); setRequired("vehicleClass", ""); }} className={fieldClass()}><option value="">Select fuel type</option>{fuelTypes.map((option) => <option key={option} value={option}>{option}</option>)}</select>
          </label>
          <label className="block sm:col-span-2">
            {fieldLabel("Vehicle Class", true, !values.vehicleType || !values.fuelType ? "Select vehicle type and fuel type first" : `${vehicleClassOptions.length} available`)}
            <select name="vehicleClass" value={values.vehicleClass} onChange={(e) => setRequired("vehicleClass", e.target.value)} className={fieldClass()}><option value="">Select vehicle class</option>{vehicleClassOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select>
          </label>
        </>)}

        {section("Period of cover", "Issue date and the dates the policy is in force", "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", <>
          <label className="block">
            {fieldLabel("Issue Date", true, "Today")}
            <input name="issueDate" value={values.issueDate} readOnly className={fieldClass(true)} /><input type="hidden" name="issueDate" value={values.issueDate ? formatDateInput(new Date(values.issueDate)) : ""} />
          </label>
          <label className="block">
            {fieldLabel("From Date", true)}
            <div className="relative"><input type="text" value={values.fromDate ? formatDateShort(new Date(values.fromDate)) : ""} readOnly className={`${fieldClass()} cursor-pointer pr-10`} /><input name="fromDate" type="date" value={values.fromDate} min={values.fromDate} onChange={(e) => { setFromDate(e.target.value); const d = new Date(e.target.value); setToDate(formatDateInput(new Date(d.getFullYear() + 1, d.getMonth(), d.getDate()))); setRequired("fromDate", e.target.value); setRequired("toDate", formatDateInput(new Date(d.getFullYear() + 1, d.getMonth(), d.getDate()))); }} className="absolute inset-0 cursor-pointer opacity-0" />{calendarIcon}</div>
          </label>
          <label className="block">
            {fieldLabel("To Date", true, "1 year by default")}
            <div className="relative"><input type="text" value={toDate ? formatDateShort(new Date(toDate)) : ""} readOnly className={`${fieldClass()} cursor-pointer pr-10`} /><input name="toDate" type="date" value={toDate} min={values.fromDate} onChange={(e) => { setToDate(e.target.value); setRequired("toDate", e.target.value); }} className="absolute inset-0 cursor-pointer opacity-0" />{calendarIcon}</div>
          </label>
        </>, "sm:grid-cols-3")}

        <input type="hidden" name="clientCode" value={clientCode || ""} />

        {section("Lien / hypothecation", "Is the vehicle financed or leased?", "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z", <>
          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-violet-200 bg-violet-50/50 px-3 py-2.5 sm:col-span-2">
            <span className="text-sm font-semibold text-slate-700">Lien <span className="text-rose-600">*</span><span className="block text-xs font-normal text-slate-500">Tick to record the lien type and the lienholder</span></span>
            <span className="relative inline-flex items-center">
              <input name="lien" type="checkbox" required checked={values.lien === "true"} onChange={(e) => setRequired("lien", String(e.target.checked))} className="peer sr-only" />
              <span className="h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-[#35126d] peer-focus-visible:ring-2 peer-focus-visible:ring-violet-300" />
              <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
            </span>
          </label>
          {values.lien === "true" ? <>
            <label className="block">
              {fieldLabel("Lien Type", true)}
              <select name="lienType" required value={values.lienType} onChange={(e) => setRequired("lienType", e.target.value)} className={fieldClass()}><option value="No Lien">No Lien</option><option value="in favour of">in favour of</option><option value="on lease to">on lease to</option><option value="on account of">on account of</option><option value="on finance lease to">on finance lease to</option><option value="on lease (Financial)">on lease (Financial)</option><option value="on lease (Finance Lease) to">on lease (Finance Lease) to</option><option value="on financial lease to">on financial lease to</option><option value="on Operating lease to">on Operating lease to</option><option value="on lease (Financial) to">on lease (Financial) to</option></select>
            </label>
            <label className="block">
              {fieldLabel("Lienholder", true)}
              {values.lienType !== "No Lien" ? <select name="lienholder" required value={values.lienholder} onChange={(e) => setRequired("lienholder", e.target.value)} className={fieldClass()}><option value="">Select bank</option>{banks.map((bank) => <option key={bank.Code} value={bank.Name}>{bank.Name}</option>)}</select> : <input name="lienholder" value={values.lienholder} onChange={(e) => setRequired("lienholder", e.target.value)} placeholder="Lienholder" className={fieldClass()} />}
            </label>
          </> : null}
        </>)}

        <p className="text-xs text-slate-500"><span className="text-rose-600">*</span> Required field</p>
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

  // Mandatory fields still missing for THIS vehicle (GVW only for goods vehicles, Trailer Ft. only for
  // tanker / trailer / tractor; seating or CC/kW - usp_GetMotorExcess needs at least one; a compulsory excess must be found).
  const missingVehicleFields = (values: Record<string, string>, cover: string) => {
    const filled = (name: string) => Boolean(String(values[name] ?? "").trim());
    const missing = ["vehicleNo", "make", "model", "engineNo", "chassisNo", "manufactureDate", "sumInsured", "pricePaid"].filter((name) => !filled(name));
    if (!filled("seating") && !filled("cc")) missing.push("seating/cc");
    if (/GOODS VEHICLE\(PRIVATE\)|GOODS VEHICLE\(PUBLIC\)/i.test(vehicleClass || "") && !(Number(values.gvw) > 0)) missing.push("gvw");
    if (/TANKER|TRAILER|TRACTOR/i.test(vehicleClass || "") && !(Number(values.trailerFeet) > 0)) missing.push("trailerFeet");
    if (filled("sumInsured") && !filled("compulsoryExcess")) missing.push("compulsoryExcess");
    if (!cover) missing.push("coverRequired");
    return missing;
  };

  useEffect(() => {
    onStatusChange(missingVehicleFields(requiredValues, policyCover).length);
    // missingVehicleFields only reads requiredValues, policyCover and vehicleClass.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requiredValues, policyCover, vehicleClass, onStatusChange]);

  const prevValuesRef = useRef<string>(JSON.stringify(requiredValues));
  useEffect(() => {
    const current = JSON.stringify(requiredValues);
    if (current !== prevValuesRef.current && onValuesChange) {
      prevValuesRef.current = current;
      onValuesChange(requiredValues);
    }
  }, [requiredValues, onValuesChange]);

  const formatRegNo = (value: string) => {
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const groups = cleaned.match(/[A-Z]+|\d+/g);
    return groups ? groups.join("-") : cleaned;
  };

  const isGoodsVehicle = /GOODS VEHICLE\(PRIVATE\)|GOODS VEHICLE\(PUBLIC\)/i.test(vehicleClass || "");
  const isTankerTrailerTractor = /TANKER|TRAILER|TRACTOR/i.test(vehicleClass || "");
  const maxCc = isTankerTrailerTractor ? 500 : 10000;

  const fieldClass = (locked = false) =>
    `h-10 w-full rounded-lg border border-violet-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#35126d] focus:ring-2 focus:ring-violet-100 ${locked ? "cursor-not-allowed bg-slate-50 text-slate-600" : ""}`;
  const fieldLabel = (text: string, required = false, hint?: string) => (
    <span className="mb-1.5 flex items-center justify-between gap-2 text-xs font-semibold text-slate-600">
      <span>{text}{required ? <span className="text-rose-600"> *</span> : null}</span>
      {hint ? <span className="text-[10px] font-medium uppercase tracking-wide text-violet-500">{hint}</span> : null}
    </span>
  );

  const field = (label: string, name: string, type: "input" | "select" = "input", options?: string[], required?: boolean, readOnly?: boolean, hint?: string) => {
    // Special handling for excess fields with dynamic options
    let fieldOptions = options;
    if (name === "compulsoryExcess") fieldOptions = compulsoryExcessOptions;
    if (name === "youngDriverExcess") fieldOptions = youngDriverExcessOptions;
    if (name === "tpfExcess") fieldOptions = tpfExcessOptions;

    // Excess fields are calculated read-only values (from usp_GetMotorExcess via /api/motor/excess)
    if (name === "totalLossExcess" || name === "youngDriverExcess" || name === "compulsoryExcess" || name === "additionalExcess") {
      const value = requiredValues[name] || "";
      const isFetching = fetchingExcess && !excessCalculated;
      return (
        <div key={label} className="rounded-lg border border-violet-100 bg-gradient-to-br from-violet-50 to-white px-3 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className={`mt-1 font-mono text-lg font-bold ${value && Number(value) > 0 ? "text-[#35126d]" : "text-slate-400"} ${isFetching ? "animate-pulse" : ""}`}>
            {isFetching ? <span className="text-sm font-medium text-slate-400">Calculating...</span> : value ? Number(value).toLocaleString() : "—"}
          </p>
        </div>
      );
    }

    return (
      <label key={label} className="block">
        {fieldLabel(label, required, hint)}
        {type === "select" ? <select name={name} value={requiredValues[name] || ""} onChange={(event) => updateRequired(name, event.target.value)} className={fieldClass(fetchingExcess || readOnly)} disabled={fetchingExcess || readOnly}><option value="">Select {label.toLowerCase()}</option>{fieldOptions?.map((o) => <option key={o}>{o}</option>)}</select> : <input name={name} value={requiredValues[name] || ""} maxLength={name === "seating" ? 2 : undefined} inputMode={name === "seating" || name === "sumInsured" || name === "gvw" || name === "trailerFeet" || name === "pricePaid" ? "numeric" : undefined} onChange={(event) => { let value = event.target.value; if (name === "vehicleNo") value = formatRegNo(value); if (name === "seating") value = value.replace(/\D/g, "").slice(0, 2); if (name === "sumInsured" || name === "gvw" || name === "trailerFeet" || name === "pricePaid") value = value.replace(/[^0-9.]/g, ""); updateRequired(name, value); }} className={`${fieldClass(readOnly)} ${name === "vehicleNo" || name === "engineNo" || name === "chassisNo" ? "font-mono uppercase" : ""}`} readOnly={readOnly} />}
      </label>
    );
  };

  const section = (title: string, subtitle: string, iconPath: string, children: React.ReactNode, columns = "sm:grid-cols-2") => (
    <section className="overflow-hidden rounded-xl border border-violet-100 bg-white shadow-sm">
      <header className="flex items-center gap-3 border-b border-violet-100 bg-gradient-to-r from-violet-50 to-white px-4 py-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#35126d] text-white"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={iconPath} /></svg></span>
        <div>
          <h4 className="text-sm font-bold text-[#35126d]">{title}</h4>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </header>
      <div className={`grid gap-4 p-4 ${columns}`}>{children}</div>
    </section>
  );

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const formatDisplayDate = (isoDate: string) => {
    if (!isoDate) return "";
    const date = new Date(isoDate + "T00:00:00");
    const day = String(date.getDate()).padStart(2, "0");
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Vehicle age at the policy start (used for the 10-year additional excess, Step 7).
  const vehicleAgeYears = requiredValues.manufactureDate
    ? Math.floor(((new Date(requiredValues.fromDate || issueDate || todayISO || Date.now()).getTime()) - new Date(requiredValues.manufactureDate).getTime()) / (365 * 86400000))
    : null;

  const manufactureDateField = (
    <label className="block">
      {fieldLabel("Year Mfg. & Date of Reg.", true, vehicleAgeYears !== null && vehicleAgeYears >= 0 ? `${vehicleAgeYears} yr${vehicleAgeYears === 1 ? "" : "s"} old` : undefined)}
      <div className="relative">
        <input name="manufactureDate" type="text" value={formatDisplayDate(requiredValues.manufactureDate || "")} placeholder="DD-Mon-YYYY" readOnly className={`${fieldClass()} cursor-pointer pr-10`} />
        <input type="date" value={requiredValues.manufactureDate || ""} max={todayISO} onChange={(event) => updateManufactureDate(event.target.value)} className="absolute inset-0 cursor-pointer opacity-0" tabIndex={-1} aria-label="Year of manufacture and date of registration" />
        <svg className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
      </div>
    </label>
  );

  const pending = missingVehicleFields(requiredValues, policyCover).length;
  const coverOptions = covers.filter((cover) => cover.name === "COMPREHENSIVE" || cover.name === "COMPREHENSIVE AUTOPLUS");

  return (
    <div className="border border-violet-200 bg-[#f7f5fb]">
      <div className="space-y-4 p-4 sm:p-6">
        {/* Header: registration and vehicle class */}
        <div className="rounded-xl bg-gradient-to-r from-[#35126d] to-[#5b3aa4] p-4 text-white shadow-sm sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">Vehicle Details</p>
              <h3 className="mt-1 font-mono text-xl font-bold tracking-wider">{requiredValues.vehicleNo || "Registration No."}</h3>
              <p className="mt-1 text-xs text-violet-100">{[requiredValues.make, requiredValues.model].filter(Boolean).join(" ") || "Make and model"}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${pending ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-700"}`}>{pending ? `${pending} mandatory field${pending === 1 ? "" : "s"} pending` : "All mandatory fields complete"}</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {[["Type", vehicleType], ["Class", vehicleClass], ["Fuel", fuelType]].map(([label, text]) => <span key={label} className="rounded-full border border-white/25 bg-white/10 px-3 py-1"><span className="text-violet-200">{label}:</span> <span className="font-semibold">{text || "set in Policy Details"}</span></span>)}
          </div>
        </div>

        {section("Vehicle identification", "Registration, make, model and identification numbers", "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", <>
          {field("Reg No", "vehicleNo", "input", undefined, true)}
          {field("Colour", "colour")}
          {field("Make", "make", "select", makes, true, false, !vehicleClass ? "Select the vehicle class first" : undefined)}
          {field("Model", "model", "select", models, true, false, !requiredValues.make ? "Select the make first" : undefined)}
          {field("Eng No", "engineNo", "input", undefined, true)}
          {field("Chassis No", "chassisNo", "input", undefined, true)}
        </>)}

        {section("Specifications", "Used to find the tariff, excess and premium", "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z", <>
          {manufactureDateField}
          {field("Seating", "seating", "input", undefined, !requiredValues.cc, false, "Max 2 digits")}
          <label className="block">
            {fieldLabel("CC / kW", !requiredValues.seating, `Max ${maxCc.toLocaleString()}`)}
            <input name="cc" inputMode="decimal" value={requiredValues.cc || ""} onChange={(event) => { let v = event.target.value.replace(/[^0-9.]/g, ""); if (parseFloat(v) > maxCc) v = String(maxCc); updateRequired("cc", v); }} className={fieldClass()} />
          </label>
          {isTankerTrailerTractor ? field("Trailer Ft.", "trailerFeet", "input", undefined, true, false, "Tanker / trailer / tractor") : null}
          {isGoodsVehicle ? field("Gross Vehicle Weight", "gvw", "input", undefined, true, false, "Goods vehicles (MGW)") : null}
          <p className="text-xs text-slate-500 sm:col-span-2">Enter the seating capacity or the CC / kW (at least one is needed to find the excess).</p>
        </>)}

        {section("Cover & excess", "Excesses are calculated automatically from the tariff", "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", <>
          <input type="hidden" name="calculateFromBasicTariff" value="true" />
          <label className="block">
            {fieldLabel("Cover Required", true, coverLocked ? "Set from the registration date" : undefined)}
            <select name="coverRequired" value={policyCover} onChange={(event) => { if (!coverLocked) { onPolicyCoverChange(event.target.value as PolicyCover); onStatusChange(missingVehicleFields(requiredValues, event.target.value).length); } }} className={fieldClass(coverLocked)} disabled={coverLocked}><option value="">Select cover</option>{coverOptions.map((cover) => <option key={cover.name} value={cover.name === "COMPREHENSIVE" ? "Comprehensive" : cover.name === "COMPREHENSIVE AUTOPLUS" ? "Comprehensive AutoPlus" : cover.name}>{cover.name === "COMPREHENSIVE" ? "Comprehensive" : cover.name === "COMPREHENSIVE AUTOPLUS" ? "Comprehensive AutoPlus" : cover.name}</option>)}</select>
          </label>
          {field("Sum Insured", "sumInsured", "input", undefined, true, false, Number(requiredValues.sumInsured) > 10000000 ? "Above 10M: HO review" : undefined)}
          {field("Price Paid", "pricePaid", "input", undefined, true)}
          <div className="grid gap-3 sm:col-span-2 sm:grid-cols-4">
            {field("Compulsory Excess", "compulsoryExcess")}
            {field("Young Driver Excess", "youngDriverExcess")}
            {field("Total Loss Excess", "totalLossExcess")}
            {field("Additional Excess", "additionalExcess")}
          </div>
          <p className="text-xs text-slate-500 sm:col-span-2">Total Loss Excess applies from a sum insured of 3,000,000. Additional Excess applies to private cars over 10 years old of the listed makes.</p>
          {excessError ? <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 sm:col-span-2">{excessError}</p> : null}
        </>)}

        <p className="text-xs text-slate-500"><span className="text-rose-600">*</span> Required field</p>
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
  // Make & Model per accessory (letters, numbers and spaces); required once the accessory has an amount.
  const [makeModels, setMakeModels] = useState<Record<string, string>>({});
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

  const itemsWithAmount = accessories.filter((accessory) => Number(amounts[accessory.name]) > 0).length;

  return (
    <div className="border border-violet-200 bg-[#f7f5fb]">
      <div className="space-y-4 p-4 sm:p-6">
        {/* Header: total accessories premium */}
        <div className="rounded-xl bg-gradient-to-r from-[#35126d] to-[#5b3aa4] p-4 text-white shadow-sm sm:p-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">Accessories</p>
              <h3 className="mt-1 text-lg font-bold">Optional equipment fitted to the vehicle</h3>
              <p className="mt-1 text-xs text-violet-100">Enter the amount of each accessory; its premium is rate × amount ÷ 100.</p>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-3 text-right ring-1 ring-white/20">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-200">Total Accessories Premium</p>
              <p className="mt-0.5 font-mono text-2xl font-bold tabular-nums">{totalPremium.toFixed(2)}</p>
              <p className="text-[11px] text-violet-200">{itemsWithAmount} item{itemsWithAmount === 1 ? "" : "s"} with an amount</p>
            </div>
          </div>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                selectedCategory === cat
                  ? "bg-[#35126d] text-white shadow-sm"
                  : "border border-violet-200 bg-white text-slate-600 hover:bg-violet-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-violet-100 bg-white shadow-sm">
          <div className="max-h-[520px] overflow-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-xs">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#35126d] text-white">
                  <th className="px-4 py-3 font-semibold">Description</th>
                  <th className="px-3 py-3 font-semibold">Make & Model <span className="text-rose-300">*</span></th>
                  <th className="px-3 py-3 text-center font-semibold">Rate (%)</th>
                  <th className="px-3 py-3 text-center font-semibold">Amount</th>
                  <th className="px-4 py-3 text-right font-semibold">Premium</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccessories.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-400">{accessories.length === 0 ? "Loading accessories..." : "No accessories in this category."}</td></tr>
                ) : filteredAccessories.map((accessory, rowIndex) => {
                  const index = accessories.indexOf(accessory);
                  const premium = getPremium(accessory).toFixed(2);
                  const hasAmount = Number(amounts[accessory.name]) > 0;
                  return (
                  <tr key={accessory.name} className={`border-t border-violet-50 transition hover:bg-violet-50/70 ${hasAmount ? "bg-emerald-50/60" : rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                    <td className="px-4 py-2.5 font-medium text-slate-700">
                      <span className="flex items-center gap-2">{hasAmount ? <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-200" />}{accessory.name}</span>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        name={`accessoryMakeModel_${index}`}
                        value={makeModels[accessory.name] ?? ""}
                        onChange={(e) => setMakeModels((prev) => ({ ...prev, [accessory.name]: e.target.value.replace(/[^A-Za-z0-9 ]/g, "").slice(0, 100) }))}
                        placeholder="e.g. Pioneer DEH80"
                        maxLength={100}
                        aria-invalid={hasAmount && !(makeModels[accessory.name] ?? "").trim()}
                        className={`h-8 w-full rounded-md border px-2 text-xs outline-none transition focus:bg-white ${hasAmount && !(makeModels[accessory.name] ?? "").trim() ? "border-rose-300 bg-rose-50/60 focus:border-rose-400" : "border-transparent bg-transparent hover:border-violet-200 focus:border-violet-300"}`}
                      />
                      {hasAmount && !(makeModels[accessory.name] ?? "").trim() ? <span role="alert" className="mt-0.5 block text-[10px] font-medium text-rose-600">Enter the make & model</span> : null}
                    </td>
                    <td className="px-3 py-2 text-center font-mono text-slate-600">{(Number(accessory.rate) || 0).toFixed(2)}%</td>
                    <td className="px-3 py-2 text-center">
                      <input
                        name={`accessoryAmount_${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={amounts[accessory.name] ?? ""}
                        onChange={(e) => updateAmount(accessory.name, e.target.value)}
                        className="mx-auto h-8 w-28 rounded-md border border-violet-200 bg-white px-2 text-right text-sm outline-none transition focus:border-[#35126d] focus:ring-2 focus:ring-violet-100"
                      />
                      <input type="hidden" name={`accessoryPremium_${index}`} value={premium} />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <input
                        type="text"
                        name={`accessoryPremiumDisplay_${index}`}
                        value={premium}
                        readOnly
                        className={`h-8 w-28 rounded-md border px-2 text-right font-mono text-sm font-semibold outline-none ${hasAmount ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-500"}`}
                      />
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-violet-100 bg-violet-50/60 px-4 py-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Accessories Premium</span>
            <span className="font-mono text-lg font-bold tabular-nums text-[#35126d]">{totalPremium.toFixed(2)}</span>
            <input type="hidden" name="accessoriesTotalPremium" value={totalPremium.toFixed(2)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function GeneralInformationForm() {
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

  const fieldClass = "h-10 w-full rounded-lg border border-violet-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#35126d] focus:ring-2 focus:ring-violet-100";

  // Yes / No as toggle buttons (the radio inputs keep their names, so the answers are saved as before).
  const yesNo = (name: string) => (
    <div className="flex gap-2">
      {["Yes", "No"].map((answer) => (
        <label key={answer} className="cursor-pointer">
          <input type="radio" name={name} value={answer} className="peer sr-only" />
          <span className={`inline-flex min-w-[72px] items-center justify-center rounded-lg border px-4 py-1.5 text-xs font-semibold transition border-violet-200 bg-white text-slate-600 hover:bg-violet-50 ${answer === "Yes" ? "peer-checked:border-[#35126d] peer-checked:bg-[#35126d] peer-checked:text-white" : "peer-checked:border-slate-600 peer-checked:bg-slate-600 peer-checked:text-white"} peer-focus-visible:ring-2 peer-focus-visible:ring-violet-300`}>{answer}</span>
        </label>
      ))}
    </div>
  );

  const renderQuestion = (q: typeof questions[0], index: number) => {
    const isConditional = q.conditional && q.conditionalValue;
    return (
      <div key={q.id} className="rounded-xl border border-violet-100 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-[#35126d]">{String.fromCharCode(97 + index)}</span>
          <div className="flex-1">
            <p className="text-sm leading-6 text-slate-700">{q.text}</p>
            {isConditional ? <p className="mt-0.5 text-[11px] font-medium text-violet-500">Only if the previous answer is Yes</p> : null}
          </div>
        </div>
        {q.id === "q3" ? (
          <div className="mt-3 space-y-2 pl-10">
            <div className="grid grid-cols-[1fr_90px] gap-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <span>Driver Name</span>
              <span>Age</span>
            </div>
            {[1, 2].map((row) => (
              <div key={row} className="grid grid-cols-[1fr_90px] gap-2">
                <input type="text" name={`${q.id}_name_${row}`} placeholder="Driver name" className={fieldClass} />
                <input type="number" name={`${q.id}_age_${row}`} min="18" max="100" placeholder="Age" className={fieldClass} />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 pl-10">{yesNo(q.id)}</div>
        )}
      </div>
    );
  };

  const accidentsSection = (
    <div className="space-y-4">
      {questions.filter((q) => q.section === "accidents").map((q, idx) => renderQuestion(q, idx))}
      <div className="overflow-hidden rounded-xl border border-violet-100 bg-white shadow-sm">
        <p className="border-b border-violet-100 bg-violet-50/60 px-4 py-2.5 text-xs font-semibold text-slate-600">Give details of accidents or claims (including pending prosecution, if any)</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left text-xs">
            <thead>
              <tr className="bg-[#35126d] text-white">
                <th className="px-3 py-2.5 font-semibold">Driver Name</th>
                <th className="px-3 py-2.5 font-semibold">Date of Accident</th>
                <th className="px-3 py-2.5 font-semibold">Circumstances of Accident / Claim</th>
                <th className="px-3 py-2.5 text-right font-semibold">Loss / Cost</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2].map((row) => (
                <tr key={row} className="border-t border-violet-50">
                  <td className="px-3 py-2"><input type="text" name={`accident_driver_${row}`} placeholder="Name" className="h-9 w-full rounded-md border border-violet-100 bg-white px-2 text-xs outline-none focus:border-violet-300" /></td>
                  <td className="px-3 py-2"><input type="date" name={`accident_date_${row}`} className="h-9 w-full rounded-md border border-violet-100 bg-white px-2 text-xs outline-none focus:border-violet-300" /></td>
                  <td className="px-3 py-2"><textarea name={`accident_circumstances_${row}`} rows={2} placeholder="What happened" className="w-full resize-none rounded-md border border-violet-100 bg-white px-2 py-1.5 text-xs outline-none focus:border-violet-300" /></td>
                  <td className="px-3 py-2"><input type="number" name={`accident_cost_${row}`} min="0" step="0.01" placeholder="0.00" className="h-9 w-full rounded-md border border-violet-100 bg-white px-2 text-right text-xs outline-none focus:border-violet-300" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const previousInsuranceSection = (
    <div className="grid gap-4 rounded-xl border border-violet-100 bg-white p-4 shadow-sm sm:grid-cols-2">
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-slate-600">Insurance company previously insured with</span>
        <select className={fieldClass}>
          <option value="">Select company</option>
          <option>Company A</option>
          <option>Company B</option>
          <option>Company C</option>
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-slate-600">Details of past claims (total claims for 5 years)</span>
        <input className={fieldClass} placeholder="Enter details" />
      </label>
    </div>
  );

  return (
    <div className="border border-violet-200 bg-[#f7f5fb]">
      <div className="space-y-4 p-4 sm:p-6">
        {/* Header */}
        <div className="rounded-xl bg-gradient-to-r from-[#35126d] to-[#5b3aa4] p-4 text-white shadow-sm sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">General Information</p>
          <h3 className="mt-1 text-lg font-bold">Driver history, vehicle use and declarations</h3>
          <p className="mt-1 text-xs text-violet-100">Please answer every question truthfully; the answers form part of the proposal.</p>
        </div>

        <nav className="flex flex-wrap gap-2 rounded-xl border border-violet-100 bg-white p-1.5 shadow-sm" aria-label="General Information sections">
          {sections.map((section, index) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                activeSection === section.id
                  ? "bg-[#35126d] text-white shadow-sm"
                  : "text-slate-600 hover:bg-violet-50 hover:text-[#35126d]"
              }`}
            >
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${activeSection === section.id ? "bg-white/20" : "bg-violet-100 text-[#35126d]"}`}>{index + 1}</span>
              {section.title}
            </button>
          ))}
        </nav>

        {/* All sections stay on the page (only hidden), so answers are kept when switching tabs. */}
        <div className={activeSection === "declarations" ? "space-y-3" : "hidden"}>
          {questions.filter((q) => q.section === "declarations").map((q, idx) => renderQuestion(q, idx))}
        </div>
        <div className={activeSection === "accidents" ? "" : "hidden"}>{accidentsSection}</div>
        <div className={activeSection === "previous" ? "" : "hidden"}>{previousInsuranceSection}</div>
        <div className={activeSection === "additional" ? "space-y-3" : "hidden"}>
          {questions.filter((q) => q.section === "additional").map((q, idx) => renderQuestion(q, idx))}
        </div>

        <label className="block rounded-xl border border-violet-100 bg-white p-4 shadow-sm">
          <span className="mb-1.5 block text-xs font-semibold text-slate-600">Remarks</span>
          <textarea rows={3} className="w-full rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-[#35126d] focus:ring-2 focus:ring-violet-100" placeholder="Additional remarks..." />
        </label>
      </div>
    </div>
  );
}

// Common Det. answers (proposal declarations for commercial vehicles). Follow-up questions are only
// asked when they apply, e.g. the nature of goods only for goods-carrying vehicles.
const COMMON_PURPOSES = ["Passenger Carry", "Commercial", "Goods Carry", "Other"];
const commonYes = (values: Record<string, unknown>, field: string) => values[field] === "Yes";

function commonDetailsErrors(values: Record<string, unknown>): [string, string][] {
  const errors: [string, string][] = [];
  const answered = (field: string) => String(values[field] ?? "").trim() !== "";
  if (!answered("cdPurpose")) errors.push(["cdPurpose", "Select the purpose for which the vehicle will be used."]);
  if (values.cdPurpose === "Goods Carry" && !answered("cdGoodsNature")) errors.push(["cdGoodsNature", "Select the nature of the goods carried."]);
  if (values.cdPurpose === "Goods Carry" && values.cdGoodsNature === "Hazardous" && !answered("cdHazardous")) errors.push(["cdHazardous", "State whether explosives or petrol will be carried."]);
  if (!answered("cdRegisteredInName")) errors.push(["cdRegisteredInName", "State whether the vehicle is registered in your name."]);
  if (!answered("cdAltered")) errors.push(["cdAltered", "State whether the vehicle's design was altered."]);
  if (commonYes(values, "cdAltered") && String(values.cdAlterationDetails ?? "").trim().length < 5) errors.push(["cdAlterationDetails", "Describe the alteration or addition (at least 5 characters)."]);
  if (values.cdPurpose === "Passenger Carry") {
    const passengers = Number(values.cdPassengers);
    if (!answered("cdPassengers")) errors.push(["cdPassengers", "Enter the maximum licensed number of passengers."]);
    else if (!Number.isInteger(passengers) || passengers < 1 || passengers > 99) errors.push(["cdPassengers", "The number of passengers must be a whole number from 1 to 99."]);
  }
  if (!answered("cdOwnPremises")) errors.push(["cdOwnPremises", "State whether use is limited to your own premises."]);
  if (!answered("cdPrivateUse")) errors.push(["cdPrivateUse", "State whether the vehicle is also used for private purposes."]);
  if (commonYes(values, "cdPrivateUse") && String(values.cdPrivateUseDetails ?? "").trim().length < 5) errors.push(["cdPrivateUseDetails", "Give the details of the private use (at least 5 characters)."]);
  if (values.commonDetailsConfirmed !== true) errors.push(["commonDetailsConfirmed", "Confirm that the common vehicle details are complete."]);
  return errors;
}

function CommonDetailsForm({ values, onFieldChange, showErrors }: { values: Record<string, string | boolean>; onFieldChange: (field: string, value: string | boolean) => void; showErrors?: boolean }) {
  const errors = Object.fromEntries(commonDetailsErrors(values));
  // Errors show once a question is answered (invalid value) or after a save attempt.
  const errorFor = (field: string) => showErrors || String(values[field] ?? "") !== "" ? errors[field] : undefined;
  const isGoods = values.cdPurpose === "Goods Carry";
  const questions = ["cdPurpose", ...(isGoods ? ["cdGoodsNature"] : []), ...(isGoods && values.cdGoodsNature === "Hazardous" ? ["cdHazardous"] : []), "cdRegisteredInName", "cdAltered", ...(values.cdPurpose === "Passenger Carry" ? ["cdPassengers"] : []), "cdOwnPremises", "cdPrivateUse"];
  const answeredCount = questions.filter((field) => String(values[field] ?? "").trim() !== "" && !errors[field]).length;

  // Clearing a "parent" answer also clears the follow-up questions that no longer apply.
  const setAnswer = (field: string, value: string) => {
    onFieldChange(field, value);
    if (field === "cdPurpose" && value !== "Goods Carry") { onFieldChange("cdGoodsNature", ""); onFieldChange("cdHazardous", ""); }
    if (field === "cdPurpose" && value !== "Passenger Carry") onFieldChange("cdPassengers", "");
    if (field === "cdGoodsNature" && value !== "Hazardous") onFieldChange("cdHazardous", "");
    if (field === "cdAltered" && value !== "Yes") onFieldChange("cdAlterationDetails", "");
    if (field === "cdPrivateUse" && value !== "Yes") onFieldChange("cdPrivateUseDetails", "");
  };

  const choices = (field: string, options: string[]) => (
    <div role="radiogroup" className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = values[field] === option;
        return (
          <label key={option} className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold ring-1 transition ${selected ? "bg-[#35126d] text-white ring-[#35126d] shadow-sm" : "bg-white text-slate-600 ring-slate-200 hover:bg-violet-50 hover:text-[#35126d] hover:ring-violet-300"}`}>
            <input type="radio" name={field} value={option} checked={selected} onChange={() => setAnswer(field, option)} className="sr-only" />
            {option}
          </label>
        );
      })}
    </div>
  );
  const question = (letter: string, field: string, text: string, control: React.ReactNode, followUp?: React.ReactNode) => {
    const error = errorFor(field);
    const done = String(values[field] ?? "").trim() !== "" && !errors[field];
    return (
      <div key={field} className={`rounded-xl border bg-white p-4 transition ${error ? "border-rose-200" : done ? "border-emerald-100" : "border-violet-100"}`}>
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div className="flex items-start gap-3">
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${done ? "bg-emerald-100 text-emerald-700" : "bg-violet-100 text-[#35126d]"}`}>{done ? "✓" : letter}</span>
            <p className="pt-1 text-sm leading-5 text-slate-700">{text} <span className="text-rose-500">*</span></p>
          </div>
          <div className="md:justify-self-end">{control}</div>
        </div>
        {followUp}
        {error ? <p role="alert" className="mt-2 pl-10 text-xs font-medium text-rose-600">{error}</p> : null}
      </div>
    );
  };
  const details = (field: string, label: string) => {
    const error = errorFor(field);
    return (
      <label className="mt-3 block pl-10">
        <span className="text-xs font-semibold text-slate-600">{label} <span className="text-rose-500">*</span></span>
        <textarea name={field} rows={2} value={String(values[field] ?? "")} onChange={(e) => onFieldChange(field, e.target.value)} className={`mt-1 w-full rounded-lg border bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:bg-white focus:ring-2 focus:ring-violet-100 ${error ? "border-rose-300" : "border-slate-200 focus:border-[#5b3aa4]"}`} />
        {error ? <span role="alert" className="mt-1 block text-xs font-medium text-rose-600">{error}</span> : null}
      </label>
    );
  };

  return (
    <div className="space-y-4 rounded-2xl border border-violet-200 bg-[#f7f5fb] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-[#35126d]">Vehicle use declarations</h3>
          <p className="mt-0.5 text-xs text-slate-500">Tell us how the commercial vehicle is used. Follow-up questions appear only when they apply.</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${answeredCount === questions.length ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-white text-slate-600 ring-violet-200"}`}>{answeredCount} of {questions.length} answered</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-violet-100"><div className={`h-full rounded-full transition-all duration-300 ${answeredCount === questions.length ? "bg-emerald-500" : "bg-[#5b3aa4]"}`} style={{ width: `${(answeredCount / questions.length) * 100}%` }} /></div>

      <div className="space-y-3">
        {question("a", "cdPurpose", "Purpose for which the vehicle will be used", choices("cdPurpose", COMMON_PURPOSES),
          isGoods ? (
            <div className="mt-3 space-y-3 border-l-2 border-violet-200 pl-4 md:ml-10">
              <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                <p className="text-sm text-slate-700">b) Nature of the goods carried <span className="text-rose-500">*</span></p>
                {choices("cdGoodsNature", ["General", "Hazardous"])}
              </div>
              {errorFor("cdGoodsNature") ? <p role="alert" className="text-xs font-medium text-rose-600">{errorFor("cdGoodsNature")}</p> : null}
              {values.cdGoodsNature === "Hazardous" ? (
                <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                  <p className="text-sm text-slate-700">c) Will explosives or petrol be carried? <span className="text-rose-500">*</span></p>
                  {choices("cdHazardous", ["Yes", "No"])}
                </div>
              ) : null}
              {errorFor("cdHazardous") ? <p role="alert" className="text-xs font-medium text-rose-600">{errorFor("cdHazardous")}</p> : null}
            </div>
          ) : values.cdPurpose === "Passenger Carry" ? (
            <label className="mt-3 flex flex-wrap items-center gap-3 border-l-2 border-violet-200 pl-4 md:ml-10">
              <span className="text-sm text-slate-700">f) Maximum licensed carrying capacity (No. of passengers) <span className="text-rose-500">*</span></span>
              <input name="cdPassengers" type="number" min={1} max={99} step={1} inputMode="numeric" value={String(values.cdPassengers ?? "")} onChange={(e) => onFieldChange("cdPassengers", e.target.value.replace(/[^0-9]/g, "").slice(0, 2))} className={`h-9 w-24 rounded-lg border bg-white px-3 text-center text-sm outline-none focus:ring-2 focus:ring-violet-100 ${errorFor("cdPassengers") ? "border-rose-300" : "border-slate-200 focus:border-[#5b3aa4]"}`} />
              {errorFor("cdPassengers") ? <span role="alert" className="w-full text-xs font-medium text-rose-600">{errorFor("cdPassengers")}</span> : null}
            </label>
          ) : null)}
        {question("d", "cdRegisteredInName", "Is the vehicle registered in your name?", choices("cdRegisteredInName", ["Yes", "No"]))}
        {question("e", "cdAltered", "Has any alteration or addition been made to the manufacturer's standard design?", choices("cdAltered", ["Yes", "No"]),
          commonYes(values, "cdAltered") ? details("cdAlterationDetails", "Alteration / addition details") : null)}
        {question("g", "cdOwnPremises", "Is the use of the vehicle limited to your own premises?", choices("cdOwnPremises", ["Yes", "No"]))}
        {question("h", "cdPrivateUse", "Is the commercial vehicle also used for private purposes (excluding use for hire or reward)?", choices("cdPrivateUse", ["Yes", "No"]),
          commonYes(values, "cdPrivateUse") ? details("cdPrivateUseDetails", "Details of the private use") : null)}
      </div>

      <label className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition ${values.commonDetailsConfirmed === true ? "border-emerald-200 bg-emerald-50 text-emerald-700" : showErrors && errors.commonDetailsConfirmed ? "border-rose-200 bg-rose-50 text-rose-700" : "border-violet-200 bg-white text-[#35126d]"}`}>
        <input name="commonDetailsConfirmed" type="checkbox" checked={values.commonDetailsConfirmed === true} onChange={(e) => onFieldChange("commonDetailsConfirmed", e.target.checked)} className="h-5 w-5 accent-[#35126d]" />
        I confirm the common vehicle details are complete and correct.
      </label>
    </div>
  );
}

// Payment details entered in the "Complete payment" dialog. Card details stay in the browser:
// only the method, the payer name, the bank and the last four card digits are sent to the server.
type PaymentDetails = { method: string; name: string; cardNumber: string; expiry: string; cvv: string; bank: string };
const PAYMENT_BANKS = ["The Mauritius Commercial Bank (MCB)", "SBM Bank", "Bank of Baroda", "Absa Bank", "AfrAsia Bank", "MauBank", "Bank One", "Standard Bank", "HSBC", "Other"];
const cardDigits = (value: string) => value.replace(/\D/g, "");
function cardBrand(digits: string): "Visa" | "Mastercard" | "Amex" | "" {
  if (/^4/.test(digits)) return "Visa";
  if (/^(5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "Amex";
  return "";
}
const formatCardNumber = (value: string) => {
  const digits = cardDigits(value).slice(0, 19);
  return cardBrand(digits) === "Amex" ? digits.replace(/^(\d{0,4})(\d{0,6})(\d{0,5}).*/, (_, a, b, c) => [a, b, c].filter(Boolean).join(" ")) : digits.replace(/(\d{4})(?=\d)/g, "$1 ");
};
const formatExpiry = (value: string, previous: string) => {
  const digits = cardDigits(value).slice(0, 4);
  if (value.length < previous.length) return value; // let backspace remove the slash
  return digits.length >= 3 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits.length === 2 ? `${digits}/` : digits;
};

function PaymentForm({ payment, onChange, amount, policyNo, notice, onCancel, onContinue }: { payment: PaymentDetails; onChange: (payment: PaymentDetails) => void; amount: number; policyNo: string; notice: string; onCancel: () => void; onContinue: () => void }) {
  const set = (field: keyof PaymentDetails, value: string) => onChange({ ...payment, [field]: value });
  const brand = cardBrand(cardDigits(payment.cardNumber));
  const isCard = payment.method === "card";
  // Demo payment: the details are optional and not validated, and no card or account is charged.
  const inputClass = "mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-[#5b3aa4] focus:bg-white focus:ring-4 focus:ring-violet-100";
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onContinue();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 p-4">
      <form onSubmit={submit} noValidate className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="bg-gradient-to-r from-[#35126d] to-[#5b3aa4] px-6 py-4 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-violet-200">Demo payment</p>
              <h2 className="mt-1 text-lg font-bold">Complete payment</h2>
              {policyNo ? <p className="mt-0.5 font-mono text-xs text-violet-100">Policy {policyNo}</p> : null}
            </div>
            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-200">Amount due</p>
              <p className="font-mono text-2xl font-bold tabular-nums">Rs {amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-6">
          <div role="radiogroup" aria-label="Payment method" className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
            {[["card", "Credit / debit card"], ["bank", "Internet banking"]].map(([value, label]) => (
              <label key={value} className={`cursor-pointer rounded-lg px-3 py-2 text-center text-sm font-semibold transition ${payment.method === value ? "bg-white text-[#35126d] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                <input type="radio" name="payment-method" value={value} checked={payment.method === value} onChange={() => set("method", value)} className="sr-only" />
                {label}
              </label>
            ))}
          </div>

          <label className="block text-sm font-medium text-slate-700">{isCard ? "Name on card" : "Account holder name"}
            <input autoComplete={isCard ? "cc-name" : "name"} value={payment.name} onChange={(e) => set("name", e.target.value)} placeholder={isCard ? "As printed on the card" : "Full name"} className={inputClass} />
          </label>

          {isCard ? (
            <>
              <label className="block text-sm font-medium text-slate-700">Card number
                <span className="relative block">
                  <input inputMode="numeric" autoComplete="cc-number" value={payment.cardNumber} onChange={(e) => set("cardNumber", formatCardNumber(e.target.value))} placeholder="1234 5678 9012 3456" className={`${inputClass} pr-24 font-mono tracking-wider`} />
                  {brand ? <span className="absolute right-3 top-1/2 mt-0.5 -translate-y-1/2 rounded-md bg-[#35126d] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">{brand}</span> : null}
                </span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm font-medium text-slate-700">Expiry date
                  <input inputMode="numeric" autoComplete="cc-exp" value={payment.expiry} onChange={(e) => set("expiry", formatExpiry(e.target.value, payment.expiry))} placeholder="MM/YY" maxLength={5} className={`${inputClass} font-mono`} />
                </label>
                <label className="block text-sm font-medium text-slate-700">Security code (CVV)
                  <input type="password" inputMode="numeric" autoComplete="cc-csc" value={payment.cvv} onChange={(e) => set("cvv", cardDigits(e.target.value).slice(0, brand === "Amex" ? 4 : 3))} placeholder={brand === "Amex" ? "4 digits" : "3 digits"} className={`${inputClass} font-mono`} />
                </label>
              </div>
            </>
          ) : (
            <label className="block text-sm font-medium text-slate-700">Bank
              <select value={payment.bank} onChange={(e) => set("bank", e.target.value)} className={inputClass}>
                <option value="">Select your bank</option>
                {PAYMENT_BANKS.map((bank) => <option key={bank}>{bank}</option>)}
              </select>
            </label>
          )}

          {notice ? <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">{notice}</p> : null}
          <p className="flex items-center gap-2 text-xs text-slate-500">
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></svg>
            Demo payment: the details are optional and nothing is charged. Card numbers and security codes are never sent to our server.
          </p>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
          <button type="submit" className="rounded-xl bg-[#35126d] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#2b0f5a]">Continue to e-mail preview</button>
        </div>
      </form>
    </div>
  );
}

function PremiumForm({ values, calculating, onCalculate, error, cover, onFieldChange, restrictedRates = [], coverRules = {} }: { values: Record<string, string | boolean>; calculating?: boolean; onCalculate?: () => void; error?: string; cover?: string; onFieldChange?: (field: string, value: string | boolean) => void; restrictedRates?: number[]; coverRules?: Record<number, CoverRule> }) {
  const inputClass = "h-8 w-full border border-violet-200 bg-white px-2 text-xs text-slate-800 outline-none focus:border-[#35126d] focus:ring-2 focus:ring-violet-100";
  // Optional covers (MotorMaster Rate<n> / Amt<n>); see lib/additional-risk.ts.
  const seating = Number(values.seating) || 0;
  const errors = Object.fromEntries(coverErrors(values, seating, restrictedRates, coverRules));
  const selected = (rate: number) => values[`cover${rate}`] === true || values[`cover${rate}`] === "true";
  const additionalRisk = additionalRiskCovered({ rates: ratesFromColumns(coverColumns(values)), vehicleClass: String(values.vehicleClass || ""), cover: String(cover || values.coverRequired || ""), seating });
  const toggleCover = (rate: number, count: boolean, checked: boolean) => {
    onFieldChange?.(`cover${rate}`, checked);
    // A count cover starts at 1 person / day; clearing a cover clears its number and amount.
    if (count) onFieldChange?.(`rate${rate}`, checked ? String(values[`rate${rate}`] || "1") : "");
    if (!checked) onFieldChange?.(`amt${rate}`, "");
  };
  const coverInput = "h-7 w-full rounded-md border bg-white px-1.5 text-xs outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 disabled:border-transparent disabled:bg-slate-50 disabled:text-slate-300";

  const optionTable = (title: string) => {
    const rows = PREMIUM_COVERS.filter((c) => c.group === title);
    return (
      <div key={title} className="overflow-hidden rounded-xl border border-violet-100 bg-white shadow-sm">
        <div className="grid grid-cols-[1fr_64px_96px] gap-2 bg-[#35126d] px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-white"><span>{title}</span><span className="text-center">No</span><span className="text-right">Amount</span></div>
        {rows.map((row) => {
          const on = selected(row.rate);
          // usp_CurCoverinfo: this cover is not offered for the vehicle class.
          // Mandatory covers (Driver Only, Passenger Risk for public-use classes) are ticked and locked.
          const rule = coverRules[row.rate];
          const restricted = restrictedRates.includes(row.rate) && !rule;
          const rowErrors = [errors[`cover${row.rate}`], errors[`rate${row.rate}`], errors[`amt${row.rate}`]].filter(Boolean);
          return (
            <div key={row.rate} className={`border-t border-violet-50 px-3 py-1.5 transition ${on ? "bg-violet-50/60" : "hover:bg-violet-50/40"}`}>
              <div className="grid grid-cols-[1fr_64px_96px] items-center gap-2">
                <label title={restricted ? "Not available for this vehicle class" : undefined} className={`flex items-center gap-2 text-xs ${restricted ? "cursor-not-allowed text-slate-400" : "cursor-pointer text-slate-700"}`}><input type="checkbox" checked={on} disabled={Boolean(rule) || (restricted && !on)} onChange={(e) => toggleCover(row.rate, Boolean(row.count), e.target.checked)} className="h-4 w-4 accent-[#35126d] disabled:opacity-40" /><span className={on ? "font-semibold text-[#35126d]" : restricted ? "line-through decoration-slate-300" : ""}>{row.label}</span>{restricted ? <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-500 no-underline">N/A</span> : null}{rule ? <span title="Mandatory for this vehicle class" className="rounded-full bg-[#35126d] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">Required</span> : null}</label>
                {row.count ? (
                  <input type="number" min={1} step={1} disabled={!on} value={on ? String(values[`rate${row.rate}`] ?? "") : ""} onChange={(e) => onFieldChange?.(`rate${row.rate}`, e.target.value.replace(/[^0-9]/g, ""))} placeholder={on ? row.count : ""} title={row.count} className={`${coverInput} text-center ${errors[`rate${row.rate}`] ? "border-rose-300" : "border-violet-100"}`} aria-label={`${row.label} - number of ${row.count.toLowerCase()}`} />
                ) : <span className="text-center text-xs text-slate-300">{on ? "1" : ""}</span>}
                <input type="number" min={0} step="0.01" disabled={!on || Boolean(rule?.amountLocked)} value={on && !rule?.amountLocked ? String(values[`amt${row.rate}`] ?? "") : ""} onChange={(e) => onFieldChange?.(`amt${row.rate}`, e.target.value)} placeholder={on ? "0.00" : ""} className={`${coverInput} text-right ${errors[`amt${row.rate}`] ? "border-rose-300" : "border-violet-100"}`} aria-label={`${row.label} amount`} />
              </div>
              {rowErrors.map((message) => <p key={message} role="alert" className="mt-1 text-[11px] font-medium text-rose-600">{message}</p>)}
            </div>
          );
        })}
      </div>
    );
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

  // Calculated values (read-only inputs keep their names so they are saved with the policy).
  const valueRow = ([label, name]: string[]) => (
    <label key={name} className="flex items-center justify-between gap-3 border-t border-violet-50 px-3 py-2 first:border-t-0">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <input name={name} type={calculating ? "text" : "number"} step="0.01" value={getValue(name) as string} onChange={() => {}} readOnly className={`h-8 w-28 rounded-md border border-transparent bg-slate-50 px-2 text-right font-mono text-sm text-slate-800 outline-none ${calculating ? "animate-pulse text-slate-400" : ""}`} />
    </label>
  );
  const valueGroup = (title: string, rows: string[][]) => (
    <div className="overflow-hidden rounded-xl border border-violet-100 bg-white shadow-sm">
      <p className="border-b border-violet-100 bg-violet-50/60 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[#35126d]">{title}</p>
      <div>{rows.map(valueRow)}</div>
    </div>
  );

  return (
    <div className="border border-violet-200 bg-[#f7f5fb]">
      <div className="space-y-4 p-4 sm:p-6">
        {/* Header: total premium and invoice amount */}
        <div className="rounded-xl bg-gradient-to-r from-[#35126d] to-[#5b3aa4] p-4 text-white shadow-sm sm:p-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">Premium</p>
              <h3 className="mt-1 text-lg font-bold">Covers, charges and final premium</h3>
              <p className="mt-1 text-xs text-violet-100">The premium is recalculated automatically when the policy or vehicle details change.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="rounded-xl bg-white/10 px-4 py-2.5 text-right ring-1 ring-white/20">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-200">Total Premium</p>
                <p className={`font-mono text-2xl font-bold tabular-nums ${calculating ? "animate-pulse" : ""}`}>{getValue("premium")}</p>
              </div>
              <div className="rounded-xl bg-white px-4 py-2.5 text-right text-[#35126d] shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-500">Inv. Amount</p>
                <p className={`font-mono text-2xl font-bold tabular-nums ${calculating ? "animate-pulse" : ""}`}>{getValue("invoiceAmount")}</p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="button" onClick={onCalculate} disabled={calculating} className="inline-flex h-10 items-center gap-2 rounded-lg bg-white px-5 text-sm font-bold text-[#35126d] shadow-sm transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-70">
              <svg className={`h-4 w-4 ${calculating ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              {calculating ? "Calculating..." : "Calculate Premium"}
            </button>
            <div className="flex flex-wrap gap-1 rounded-lg bg-white/10 p-1 text-xs ring-1 ring-white/20">
              {["Annual", "Pro Rata", "Short Period"].map((period, index) => (
                <label key={period} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 ${index === 0 ? "bg-white text-[#35126d] font-semibold" : "text-violet-200"}`}>
                  <input type="radio" name="premium-period" defaultChecked={index === 0} disabled className="sr-only" />{period}
                </label>
              ))}
            </div>
          </div>
        </div>

        {error ? <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p> : null}

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Calculated premium breakdown */}
          <div className="space-y-4">
            {valueGroup("Premium", [["Total Premium (Incl. Tow)", "premium"], ["Basic Rate", "basicRate"], ["Basic Amount", "basicAmt"], ["Additional Charge", "addCharge"], ["Min Premium", "minPremium"], ["Fix Premium", "fixPremium"]])}
            {valueGroup("Tariff details", [["Loading %", "loadingPer"], ["TP Premium", "tpPremium"], ["MGW Rate", "mgwRate"]])}
            {valueGroup("Excesses", [["Excess", "excess"], ["Young Driver Excess", "youngExcess"], ["TPF Excess", "tpfExcess"]])}
            {valueGroup("Charges", [["Doc. Charges", "documentCharge"], ["Levy Charge", "levy"], ["Hit & Run Charge", "hitAndRun"], ["Inv. Amount", "invoiceAmount"]])}
          </div>

          {/* Optional covers */}
          <div className="space-y-4">
            {["Additional Cover", "Add Extra Perils", "Additional Cover (Extensions)"].map(optionTable)}
            {/* usp_GetAdditionalRiskCovered: the text printed on the policy schedule */}
            <div className="overflow-hidden rounded-xl border border-violet-100 bg-white shadow-sm">
              <p className="border-b border-violet-100 bg-violet-50/60 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[#35126d]">Additional Risk Covered</p>
              <p className="px-3 py-2.5 text-xs leading-5 text-slate-700">{additionalRisk || <span className="text-slate-400">No additional cover selected.</span>}</p>
            </div>
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-violet-200 bg-white px-4 py-3 text-sm font-semibold text-[#35126d] shadow-sm">
          <input name="premiumConfirmed" type="checkbox" className="h-5 w-5 accent-[#35126d]" /> I confirm the premium and charges are complete.
        </label>
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

// Result of "Save and continue": a checklist of what to fix (each item jumps to its field), or a success note.
type SaveIssue = { field: string; message: string };
function SaveNotice({ error, message, issues, onDismiss, onOpenSection }: { error: boolean; message: string; issues: SaveIssue[]; onDismiss: () => void; onOpenSection?: (title: string) => void }) {
  const noticeRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (error) noticeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); }, [error, message, issues]);
  const goTo = (field: string) => {
    const element = document.querySelector<HTMLElement>(`#new-business-fields [name="${CSS.escape(field)}"]`);
    if (!element) return;
    const focus = () => { element.scrollIntoView({ behavior: "smooth", block: "center" }); element.focus({ preventScroll: true }); };
    // The field may be in another (hidden) section: open it first.
    const section = element.closest<HTMLElement>("section[data-section]");
    if (section?.hidden && onOpenSection) { onOpenSection(section.dataset.section || ""); setTimeout(focus, 50); } else focus();
  };
  if (!message) return null;
  if (!error) {
    return (
      <div ref={noticeRef} role="status" className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white"><svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></span>
        <span className="flex-1">{message}</span>
        <button type="button" onClick={onDismiss} aria-label="Dismiss" className="rounded-md p-1 text-emerald-600 hover:bg-emerald-100">✕</button>
      </div>
    );
  }
  return (
    <div ref={noticeRef} role="alert" className="overflow-hidden rounded-xl border border-rose-200 bg-white shadow-[0_10px_30px_rgba(225,29,72,0.12)]">
      <div className="flex items-start gap-3 border-l-4 border-rose-500 bg-rose-50 px-4 py-3">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-500 text-sm font-bold text-white">!</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-rose-800">{message}</p>
          {issues.length ? <p className="mt-0.5 text-xs text-rose-700">Click an item to go to the field.</p> : null}
        </div>
        <button type="button" onClick={onDismiss} aria-label="Dismiss" className="rounded-md p-1 text-rose-500 hover:bg-rose-100">✕</button>
      </div>
      {issues.length ? (
        <ul className="divide-y divide-rose-50">
          {issues.map((issue) => (
            <li key={issue.message}>
              <button type="button" onClick={() => goTo(issue.field)} className="group flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-rose-50/60">
                <span className="h-2 w-2 shrink-0 rounded-full bg-rose-500" />
                <span className="flex-1">{issue.message}</span>
                <span className="text-xs font-semibold text-rose-600 opacity-0 transition group-hover:opacity-100">Go to field →</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function AttachedDocumentForm({ policyNo, documents: pendingDocuments, onDocumentsChange, stored, uploadMessage }: { policyNo: string; documents: PendingDocument[]; onDocumentsChange: (documents: PendingDocument[]) => void; stored: StoredDocumentList | null; uploadMessage: { text: string; error: boolean } | null }) {
  // docType is the "Document Type" used in the stored file name. Cards (licence, NID / passport,
  // horsepower) need a picture of the front and of the back; every file goes to the policy folder.
  const requiredDocuments = [
    { id: "licence", name: "Driver's Licence", docType: "Licence", sides: true },
    { id: "nid_passport", name: "NID / Passport", docType: "NID Passport", sides: true },
    { id: "sale_deed", name: "Sale Deed / HorsePower", docType: "Sale Deed", sides: true },
    { id: "address_proof", name: "Address Proof", docType: "Address Proof", sides: false },
  ];
  const documentSlots = (doc: (typeof requiredDocuments)[number]) => doc.sides
    ? [{ slot: `${doc.id}_front`, label: "Front", docType: `${doc.docType} Front` }, { slot: `${doc.id}_back`, label: "Back", docType: `${doc.docType} Back` }]
    : [{ slot: doc.id, label: "Document", docType: doc.docType }];
  const requiredSlots = requiredDocuments.flatMap(documentSlots);
  const extraSlots = ["extra_1", "extra_2", "extra_3"];
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState<string | null>(null);
  const bySlot = (slot: string) => pendingDocuments.find((d) => d.slot === slot);
  const extras = pendingDocuments.filter((d) => d.slot.startsWith("extra_")).sort((a, b) => a.slot.localeCompare(b.slot));
  const nextExtraSlot = extraSlots.find((slot) => !bySlot(slot));
  const uploadedCount = requiredSlots.filter((d) => bySlot(d.slot)).length;
  const allRequiredUploaded = uploadedCount === requiredSlots.length;

  const setDocument = (slot: string, document: PendingDocument | null) => {
    onDocumentsChange([...pendingDocuments.filter((d) => d.slot !== slot), ...(document ? [document] : [])]);
  };
  // Validates the file (extension, type, 5 MB) and keeps it until the payment is confirmed.
  const attach = (slot: string, file: File | undefined, docType: string, kyc: boolean) => {
    setDragActive(null);
    if (!file) return;
    const error = documentFileError(file);
    setFileErrors((prev) => ({ ...prev, [slot]: error }));
    if (!error) setDocument(slot, { slot, docType, kyc, file });
  };
  const remove = (slot: string) => { setDocument(slot, null); setFileErrors((prev) => ({ ...prev, [slot]: "" })); };
  const renameExtra = (slot: string, name: string) => {
    const existing = bySlot(slot);
    if (existing) setDocument(slot, { ...existing, docType: name.trim() ? name : "OTHER" });
  };
  const dropProps = (slot: string, onFile: (file: File) => void) => ({
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); setDragActive(slot); },
    onDragLeave: (e: React.DragEvent) => { e.preventDefault(); if (dragActive === slot) setDragActive(null); },
    onDrop: (e: React.DragEvent) => { e.preventDefault(); const file = e.dataTransfer.files[0]; setDragActive(null); if (file) onFile(file); },
  });
  const fileInput = (slot: string, onFile: (file: File | undefined) => void) => (
    <input id={`file_${slot}`} type="file" accept={ACCEPTED_DOCUMENT_EXTENSIONS.join(",")} className="sr-only" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
  );
  const icon = (path: string, className = "h-5 w-5") => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={path} /></svg>;
  const FILE_PATH = "M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z";
  const UPLOAD_PATH = "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12";
  const CHECK_PATH = "M5 13l4 4L19 7";
  const buttonClass = "inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition";

  return (
    <div className="space-y-4 rounded-2xl border border-violet-200 bg-[#f7f5fb] p-4 sm:p-5">
      {/* Summary: documents are stored on the server under the policy number once the payment is confirmed */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-[#35126d]">Upload your documents</h3>
          <p className="mt-0.5 text-xs text-slate-500">Upload a clear photo or scan of the front and the back of each card. PDF, JPG, PNG, DOC or DOCX, up to 5 MB each.</p>
        </div>
        <div className="flex items-center gap-2">
          {policyNo ? <span className="rounded-full bg-white px-3 py-1 font-mono text-xs font-semibold text-[#35126d] ring-1 ring-violet-200">{policyNo}</span> : null}
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${allRequiredUploaded ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-white text-slate-600 ring-violet-200"}`}>{uploadedCount} of {requiredSlots.length} files</span>
        </div>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-violet-100"><div className={`h-full rounded-full transition-all duration-300 ${allRequiredUploaded ? "bg-emerald-500" : "bg-[#5b3aa4]"}`} style={{ width: `${(uploadedCount / requiredSlots.length) * 100}%` }} /></div>

      {/* Required documents: one tile per side (front / back) */}
      <ul className="space-y-3">
        {requiredDocuments.map((doc) => {
          const slots = documentSlots(doc);
          const done = slots.filter((side) => bySlot(side.slot)).length;
          return (
            <li key={doc.id} className={`rounded-xl border bg-white p-4 transition ${done === slots.length ? "border-emerald-200" : "border-slate-200"}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${done === slots.length ? "bg-emerald-100 text-emerald-600" : "bg-violet-50 text-[#5b3aa4]"}`}>{icon(done === slots.length ? CHECK_PATH : FILE_PATH, "h-4 w-4")}</span>
                  {doc.name}
                </p>
                <span className="text-xs text-slate-500">{doc.sides ? `Front and back · ${done} of 2 uploaded` : done ? "Uploaded" : "1 file"}</span>
              </div>
              <div className={`mt-3 grid gap-3 ${doc.sides ? "sm:grid-cols-2" : ""}`}>
                {slots.map((side) => {
                  const attached = bySlot(side.slot);
                  const onFile = (picked: File | undefined) => attach(side.slot, picked, side.docType, false);
                  return (
                    <div key={side.slot} {...dropProps(side.slot, onFile)} className={`rounded-xl border-2 border-dashed px-3 py-3 transition ${dragActive === side.slot ? "border-[#5b3aa4] bg-violet-50" : attached ? "border-emerald-200 bg-emerald-50/50" : "border-violet-200 bg-[#faf9fd] hover:border-violet-400"}`}>
                      {fileInput(side.slot, onFile)}
                      <div className="flex items-center gap-3">
                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${attached ? "bg-emerald-600 text-white" : "bg-violet-100 text-[#35126d]"}`}>{side.label}</span>
                        <p className={`min-w-0 flex-1 truncate text-xs ${attached ? "font-medium text-emerald-700" : "text-slate-400"}`}>{attached ? `${attached.file.name} · ${formatFileSize(attached.file.size)}` : doc.sides ? `Upload the ${side.label.toLowerCase()} side` : "No file chosen"}</p>
                        {attached ? (
                          <span className="flex shrink-0 items-center gap-1">
                            <label htmlFor={`file_${side.slot}`} className={`${buttonClass} text-[#412484] ring-1 ring-violet-200 hover:bg-white`}>Replace</label>
                            <button type="button" onClick={() => remove(side.slot)} className={`${buttonClass} text-rose-600 hover:bg-rose-50`}>Remove</button>
                          </span>
                        ) : (
                          <label htmlFor={`file_${side.slot}`} className={`${buttonClass} shrink-0 bg-[#35126d] text-white hover:bg-[#2b0f5a]`}>{icon(UPLOAD_PATH, "h-4 w-4")} Choose</label>
                        )}
                      </div>
                      {fileErrors[side.slot] ? <p role="alert" className="mt-2 text-xs font-medium text-rose-600">{fileErrors[side.slot]}</p> : null}
                    </div>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ul>

      {/* Optional extra documents (up to three); the name is used as the Document Type */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Other documents <span className="font-normal normal-case tracking-normal text-slate-400">(optional, up to {extraSlots.length})</span></p>
        {extras.map((doc) => (
          <div key={doc.slot} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">{icon(CHECK_PATH)}</span>
              <div className="min-w-0 flex-1">
                <input aria-label="Document name" placeholder="Document name" value={doc.docType === "OTHER" ? "" : doc.docType} onChange={(e) => renameExtra(doc.slot, e.target.value)} className="h-8 w-full max-w-xs rounded-lg border border-slate-200 bg-slate-50 px-2 text-sm text-slate-800 outline-none focus:border-[#5b3aa4] focus:bg-white focus:ring-2 focus:ring-violet-100" />
                <p className="mt-1 truncate text-xs font-medium text-emerald-700">{doc.file.name} · {formatFileSize(doc.file.size)}</p>
              </div>
              <button type="button" onClick={() => remove(doc.slot)} className={`${buttonClass} text-rose-600 hover:bg-rose-50`}>Remove</button>
            </div>
            {fileErrors[doc.slot] ? <p role="alert" className="mt-2 text-xs font-medium text-rose-600">{fileErrors[doc.slot]}</p> : null}
          </div>
        ))}
        {nextExtraSlot ? (
          <div {...dropProps(nextExtraSlot, (file) => attach(nextExtraSlot, file, "OTHER", false))}>
            {fileInput(nextExtraSlot, (file) => attach(nextExtraSlot, file, "OTHER", false))}
            <label htmlFor={`file_${nextExtraSlot}`} className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-4 text-sm font-semibold transition ${dragActive === nextExtraSlot ? "border-[#5b3aa4] bg-violet-50 text-[#35126d]" : "border-violet-200 bg-white/60 text-[#5b3aa4] hover:border-violet-400 hover:bg-white"}`}>
              {icon("M12 4v16m8-8H4", "h-4 w-4")} Add another document
            </label>
            {fileErrors[nextExtraSlot] ? <p role="alert" className="mt-2 text-xs font-medium text-rose-600">{fileErrors[nextExtraSlot]}</p> : null}
          </div>
        ) : null}
      </div>

      {/* Kept for the saved proposal payload: true once every required document is chosen */}
      <input name="documentsConfirmed" type="checkbox" checked={allRequiredUploaded} readOnly className="sr-only" tabIndex={-1} aria-hidden="true" />
      <p className={`flex items-start gap-2 rounded-xl px-3 py-2 text-xs ${allRequiredUploaded ? "bg-emerald-50 text-emerald-700" : "bg-white text-slate-500 ring-1 ring-slate-200"}`}>
        {icon(allRequiredUploaded ? CHECK_PATH : "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", "h-4 w-4 shrink-0")}
        {allRequiredUploaded ? "All required files are ready. After the policy e-mail is sent, they are uploaded to the folder named after the policy number." : "After the payment is confirmed and the policy e-mail is sent, every file is uploaded to the folder named after the policy number."}
      </p>

      {/* Upload result and documents stored for this policy (GetDocList) */}
      {uploadMessage ? <p role={uploadMessage.error ? "alert" : "status"} className={`rounded-xl border px-3 py-2 text-xs font-medium ${uploadMessage.error ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{uploadMessage.text}</p> : null}
      {stored && (stored.policyDocuments.length > 0 || stored.kycDocuments.length > 0) ? (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Stored on the server</p>
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {[...stored.policyDocuments.map((d) => ({ ...d, folder: "Policy" })), ...stored.kycDocuments.map((d) => ({ ...d, folder: "KYC" }))].map((d) => (
              <li key={`${d.folder}-${d.fullPath}`} className="flex items-center gap-3 px-4 py-2 text-xs" title={d.fullPath}>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${d.folder === "KYC" ? "bg-sky-50 text-sky-700" : "bg-violet-50 text-[#412484]"}`}>{d.folder}</span>
                <span className="min-w-0 flex-1 truncate text-slate-700">{d.fileName}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <label className="grid gap-1.5">
        <span className="text-xs font-semibold text-slate-600">Remarks <span className="font-normal text-slate-400">(optional)</span></span>
        <textarea rows={2} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#5b3aa4] focus:ring-2 focus:ring-violet-100" placeholder="Anything we should know about these documents?" />
      </label>
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
  const [saveIssues, setSaveIssues] = useState<SaveIssue[]>([]);
  // Outline the fields listed in saveIssues; a field loses its outline as soon as it is changed.
  useEffect(() => {
    const root = document.getElementById("new-business-fields");
    if (!root) return;
    const marked = saveIssues.flatMap((issue) => Array.from(root.querySelectorAll<HTMLElement>(`[name="${CSS.escape(issue.field)}"]`)));
    marked.forEach((element) => { element.style.boxShadow = "0 0 0 2px #fb7185"; element.setAttribute("aria-invalid", "true"); });
    return () => marked.forEach((element) => { element.style.boxShadow = ""; element.removeAttribute("aria-invalid"); });
  }, [saveIssues]);
  const showSaveIssues = (issues: SaveIssue[], section: string) => {
    const unique = issues.filter((issue, index) => issues.findIndex((other) => other.message === issue.message) === index);
    setSaveError(true);
    setSaveIssues(unique);
    setSaveMessage(unique.length === 1 ? `1 thing to fix in ${section} before saving` : `${unique.length} things to fix in ${section} before saving`);
  };
  const clearSaveNotice = () => { setSaveMessage(""); setSaveIssues([]); setSaveError(false); };
  const [saveError, setSaveError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [proposalDraft, setProposalDraft] = useState<Record<string, string | boolean>>({});
  const [savedSections, setSavedSections] = useState<Set<string>>(new Set());
  const [kycMissing, setKycMissing] = useState<string[]>(["Category", "Title", "Name", "Mobile or residential phone"]);
  const [policyMissing, setPolicyMissing] = useState(3);
  const [vehicleMissing, setVehicleMissing] = useState(6);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [payment, setPayment] = useState<PaymentDetails>({ method: "card", name: "", cardNumber: "", expiry: "", cvv: "", bank: "" });
  // Covers that cannot be selected for the vehicle class / country (usp_CurCoverinfo).
  const [coverRestrictions, setCoverRestrictions] = useState<{ available: boolean; coverNames: string[]; restrictedRates: number[] }>({ available: false, coverNames: [], restrictedRates: [] });
  const restrictionClass = String(proposalDraft.vehicleClass || "");
  const restrictionCountry = String(proposalDraft.country || "Mauritius");
  const premiumCoverRules = useMemo(() => mandatoryCoverRules(restrictionClass, restrictionCountry), [restrictionClass, restrictionCountry]);
  useEffect(() => {
    if (!restrictionClass) return;
    let cancelled = false;
    fetch(`/api/motor/cover-restrictions?vehicleClass=${encodeURIComponent(restrictionClass)}&country=${encodeURIComponent(restrictionCountry)}`)
      .then((response) => response.json())
      .then((data: { available?: boolean; coverNames?: string[]; restrictedRates?: number[] }) => {
        if (cancelled) return;
        const restrictedRates = data.restrictedRates || [];
        setCoverRestrictions({ available: Boolean(data.available), coverNames: data.coverNames || [], restrictedRates });
        // Unselect covers that are not available for the new vehicle class.
        if (restrictedRates.length) setProposalDraft((prev) => {
          if (!restrictedRates.some((rate) => prev[`cover${rate}`] === true || prev[`cover${rate}`] === "true")) return prev;
          const next = { ...prev };
          restrictedRates.forEach((rate) => { next[`cover${rate}`] = false; next[`rate${rate}`] = ""; next[`amt${rate}`] = ""; });
          return next;
        });
      })
      .catch(() => { if (!cancelled) setCoverRestrictions({ available: false, coverNames: [], restrictedRates: [] }); });
    return () => { cancelled = true; };
  }, [restrictionClass, restrictionCountry]);
  // Shows every Common Det. error once the user has tried to save the section.
  const [commonDetailsAttempted, setCommonDetailsAttempted] = useState(false);
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
    // Inputs used by usp_GetPremiumRateMotor. The sum insured is needed for comprehensive cover
    // (premium = rate x sum insured / 100); third party uses the tariff TP premium.
    const isComprehensive = /COMP/i.test(String(proposalDraft.coverRequired || policyCover));
    const fieldLabels: Record<string, string> = { vehicleClass: "vehicle class", vehicleType: "vehicle type", vehicleStatus: "vehicle status", issueDate: "issue date", manufactureDate: "year of manufacture", sumInsured: "sum insured", gvw: "gross vehicle weight", trailerFeet: "trailer feet" };
    const requiredFields = ["vehicleClass", "vehicleType", "vehicleStatus", "issueDate", "manufactureDate", ...(isComprehensive ? ["sumInsured"] : [])];
    if (/GOODS VEHICLE\(PRIVATE\)|GOODS VEHICLE\(PUBLIC\)/.test(vehicleClass)) requiredFields.push("gvw");
    if (/TANKER|TRAILER|TRACTOR/.test(vehicleClass)) requiredFields.push("trailerFeet");
    const missing = requiredFields.filter((f) => !proposalDraft[f] || String(proposalDraft[f]).trim() === "");
    if (missing.length > 0) {
      setPremiumError(`Enter the ${missing.map((f) => fieldLabels[f] || f).join(", ")} to calculate the premium.`);
      clearPremiumOutputs();
      return;
    }
    if (isComprehensive && !(Number(proposalDraft.sumInsured) > 0)) {
      setPremiumError("The sum insured must be greater than 0 for comprehensive cover.");
      clearPremiumOutputs();
      return;
    }
    if (/GOODS VEHICLE\(PRIVATE\)|GOODS VEHICLE\(PUBLIC\)/.test(vehicleClass) && !(Number(proposalDraft.gvw) > 0)) {
      setPremiumError("The gross vehicle weight (GVW) must be greater than 0 for goods vehicles.");
      clearPremiumOutputs();
      return;
    }
    if (/TANKER|TRAILER|TRACTOR/.test(vehicleClass) && !(Number(proposalDraft.trailerFeet) > 0)) {
      setPremiumError("The trailer feet must be greater than 0 for tanker / trailer / tractor.");
      clearPremiumOutputs();
      return;
    }
    // Same rule as the procedure: seating OR CC / kW is enough (TRAILER / MOTOR TRADE use a fixed CC).
    const seats = Number(String(proposalDraft.seating ?? "").replace(/[^0-9]/g, "")) || 0;
    const ccValue = Number(String(proposalDraft.cc ?? "").replace(/[^0-9.]/g, "")) || 0;
    if (!ccOverridden && seats <= 0 && ccValue <= 0) {
      setPremiumError("Missing Seating and CC: enter the seating capacity or the CC / kW in Vehicle Details.");
      clearPremiumOutputs();
      return;
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
        seating: String(seats),
        cylCapacity: String(ccValue),
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

  // Outcome of the last payment attempt, shown inside the email preview dialog.
  const [paymentResult, setPaymentResult] = useState<{ ok: boolean; recorded: boolean; lines: string[] } | null>(null);
  const payableAmount = Number(String(proposalDraft.invoiceAmount || proposalDraft.premium || "").replace(/,/g, "")) || 0;

  const showEmailPreview = async () => {
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
    // The payment route rejects a zero amount, so stop here with a clear reason instead.
    if (!payableAmount) {
      setPaymentError(true);
      setPaymentMessage("The premium has not been calculated yet. Open the Premium section, calculate the premium and save it, then try again.");
      return;
    }

    setPaymentError(false);
    setPaymentMessage("");
    setPaymentResult(null);
    setEmailPreviewData({ policyNo, clientCode, fullName, email, title, firstName, surname });
    setPaymentOpen(false);
    setEmailPreviewOpen(true);
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
    setPaymentResult(null);
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
        method: payment.method,
        payerName: payment.name.trim(),
        bank: payment.method === "bank" ? payment.bank : "",
        cardLast4: payment.method === "card" ? cardDigits(payment.cardNumber).slice(-4) : "",
        clientCode: emailPreviewData.clientCode === "WEB" ? "" : emailPreviewData.clientCode,
        policyNo: emailPreviewData.policyNo,
        amount: payableAmount,
        title: emailPreviewData.title,
        firstName: emailPreviewData.firstName,
        surname: emailPreviewData.surname,
        email: emailPreviewData.email,
        documents,
      }) });
      const data = await response.json() as { error?: string; message?: string; clientCode?: string; paymentProcessed?: boolean; invoiceNo?: number; emailSent?: boolean; emailMessage?: string; storageMessage?: string };
      if (!response.ok && !data.paymentProcessed) throw new Error(data.error || "Payment could not be submitted.");
      // Payment confirmed: push the attached documents to the server (policy folder / KYC folder).
      const code = response.ok ? data.clientCode || (emailPreviewData.clientCode === "WEB" ? "" : emailPreviewData.clientCode) : "";
      const upload = await uploadPendingDocuments(emailPreviewData.policyNo, code);
      setPaymentResult({
        ok: response.ok && data.emailSent === true && !upload.failed,
        recorded: true,
        lines: [
          response.ok ? `Payment recorded (Invoice No. ${data.invoiceNo}).` : `Payment recorded (Invoice No. ${data.invoiceNo}), but: ${data.error}`,
          data.emailMessage || "No policy email was sent.",
          data.storageMessage || "",
          upload.text,
        ].filter(Boolean),
      });
    } catch (error) { setPaymentResult({ ok: false, recorded: false, lines: [error instanceof Error ? error.message : "Payment could not be submitted."] }); }
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

  const saveProposal = async () => {
    const root = document.getElementById("new-business-fields");
    if (!root) return false;
    const payload: Record<string, string | boolean> = { ...proposalDraft };
    root.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("[name]").forEach((field) => {
      if (!field.name || ["gender", "category"].includes(field.name)) return;
      if ((field.type === "radio" || field.type === "checkbox") && !field.checked) return;
      payload[field.name] = field.type === "checkbox" ? field.checked : field.value;
    });
    // Link the policy to the client saved in the KYC form (MotorMaster.ClientCode), so the client,
    // the policy documents and later visits can find each other.
    const kycCode = kycValue("Code");
    if (kycCode && kycCode.toUpperCase() !== "WEB") payload.clientCode = kycCode;
    setSaving(true); clearSaveNotice();
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
        if (data.errors && Object.keys(data.errors).length) { showSaveIssues(Object.entries(data.errors).map(([field, message]) => ({ field, message })), "the policy"); return false; }
        throw new Error(data.error || "Policy could not be saved.");
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
    clearSaveNotice();
    // Read the live controls before validating. Vehicle fields are controlled
    // inside their form component and React state updates may be asynchronous.
    // The calculated premium fields are read-only displays ("0.00" / "Calculating..."), so they are never
    // copied back from the screen: doing so wiped the invoice amount and the payment had no amount to charge.
    const domValues: Record<string, string | boolean> = {};
    const root = document.getElementById("new-business-fields");
    root?.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("[name]").forEach((field) => {
      const checked = (field as HTMLInputElement).checked;
      if (!field.name || (field.type === "radio" || field.type === "checkbox") && !checked) return;
      if (premiumOutputFields.includes(field.name)) return;
      domValues[field.name] = field.type === "checkbox" ? checked : field.value;
    });
    const currentDraft: Record<string, string | boolean> = { ...proposalDraft, ...domValues };
    setProposalDraft((prev) => ({ ...prev, ...domValues }));

    // For Premium section, ensure calculation is complete (it stores its results in the draft itself).
    if (openSection === "Premium" && !premiumCalculated) await calculatePremium();
    
    const missing = (sectionRequirements[openSection] || []).filter(([name]) => {
      const value = currentDraft[name];
      return value === undefined || value === "" || value === false;
    });
    if (openSection === "Vechicle Details" && String(currentDraft.coverRequired || "").toUpperCase().includes("COMP") && Number(currentDraft.sumInsured || 0) <= 0) {
      missing.push(["sumInsured", "Enter the sum insured for comprehensive cover."]);
    }
    // Inputs usp_GetMotorExcess needs to find the excess for this vehicle.
    if (openSection === "Vechicle Details") {
      const filled = (name: string) => String(currentDraft[name] ?? "").trim() !== "";
      const vehicleClassName = String(currentDraft.vehicleClass || "").toUpperCase();
      if (!filled("manufactureDate")) missing.push(["manufactureDate", "Enter the year of manufacture and date of registration."]);
      if (!(Number(currentDraft.pricePaid) > 0)) missing.push(["pricePaid", "Enter the price paid for the vehicle."]);
      if (!filled("seating") && !filled("cc")) missing.push(["seating", "Enter the seating capacity or the CC / kW."]);
      if (/GOODS VEHICLE\(PRIVATE\)|GOODS VEHICLE\(PUBLIC\)/.test(vehicleClassName) && !(Number(currentDraft.gvw) > 0)) missing.push(["gvw", "Enter the gross vehicle weight for goods vehicles."]);
      if (/TANKER|TRAILER|TRACTOR/.test(vehicleClassName) && !(Number(currentDraft.trailerFeet) > 0)) missing.push(["trailerFeet", "Enter the trailer feet for tanker / trailer / tractor."]);
      if (Number(currentDraft.sumInsured) > 10000000) missing.push(["sumInsured", "Sum insured above 10,000,000 must be referred to Head Office for review (HO REVIEW-10M)."]);
      else if (Number(currentDraft.sumInsured) > 0 && !filled("compulsoryExcess")) missing.push(["compulsoryExcess", "The compulsory excess could not be found for these details. See the message under Cover & excess."]);
    }
    if (openSection === "Premium") missing.push(...coverErrors(applyCoverRules(currentDraft, premiumCoverRules), Number(currentDraft.seating) || 0, coverRestrictions.restrictedRates, premiumCoverRules));
    // Accessories: every accessory with an amount needs its make & model (letters, numbers and spaces).
    if (openSection === "Accessories") {
      const makeModels = Object.keys(currentDraft).filter((key) => /^accessoryAmount_d+$/.test(key) && Number(currentDraft[key]) > 0)
        .map((key) => String(currentDraft[key.replace("Amount", "MakeModel")] ?? "").trim());
      if (makeModels.some((value) => !value)) missing.push(["accessoryMakeModel", "Enter the make & model of every accessory that has an amount."]);
      if (makeModels.some((value) => value && !/^[A-Za-z0-9 ]+$/.test(value))) missing.push(["accessoryMakeModel", "Make & model can contain letters, numbers and spaces only."]);
    }
    if (openSection === "Common Det.") { setCommonDetailsAttempted(true); missing.push(...commonDetailsErrors(currentDraft)); }
    // Skip validation for Attached Document - allow proceeding to payment without all documents
    if (missing.length && openSection !== "Attached Document") { showSaveIssues(missing.map(([field, message]) => ({ field, message })), openSection); return; }
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
              <div id="new-business-fields" onChangeCapture={(event) => { const field = event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement; field.style.boxShadow = ""; field.removeAttribute("aria-invalid"); if (field.name && ((field.type !== "radio" && field.type !== "checkbox") || field.checked)) { setProposalDraft((current) => ({ ...current, [field.name]: field.type === "checkbox" ? field.checked : field.value })); if (openSection) { const changedIndex = newVehicleSections.findIndex((section) => section.title === openSection); setSavedSections((current) => new Set([...current].filter((title) => newVehicleSections.findIndex((section) => section.title === title) < changedIndex))); } } }} className="bg-[#f8f9fc] p-3 sm:p-4">
                {saveMessage && !openSection ? <div className="mb-3"><SaveNotice error={saveError} message={saveMessage} issues={saveIssues} onDismiss={clearSaveNotice} onOpenSection={setOpenSection} /></div> : null}
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
                    <section key={section.title} data-section={section.title} hidden={openSection !== section.title} className="min-w-0 overflow-hidden border border-violet-100 bg-white shadow-sm">
                      <div className="flex flex-col gap-3 border-b border-violet-100 bg-gradient-to-r from-violet-50/80 to-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                        <div className="flex items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center bg-white text-[#35126d] shadow-sm ring-1 ring-violet-100"><SectionIcon title={section.title} /></span><div><h3 className="font-semibold text-slate-900 sm:text-lg">{section.title}</h3><p className="mt-0.5 text-xs text-slate-500 sm:text-sm">{section.title === "KYC" && kycMissing.length ? `Missing: ${kycMissing.join(", ")}` : sectionDescriptions[section.title]}</p></div></div>
                        {section.title === "KYC" ? <span className="self-start bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 ring-1 ring-red-100 sm:self-auto">{kycMissing.length ? `${kycMissing.length} mandatory field${kycMissing.length === 1 ? "" : "s"} pending` : "Complete"}</span> : section.title === "Policy Details" ? <span className={`self-start px-3 py-1.5 text-xs font-bold ring-1 sm:self-auto ${policyMissing ? "bg-red-50 text-red-700 ring-red-100" : "bg-emerald-50 text-emerald-700 ring-emerald-100"}`}>{policyMissing ? `${policyMissing} mandatory fields pending` : "Complete"}</span> : section.title === "Vechicle Details" ? <span className={`self-start px-3 py-1.5 text-xs font-bold ring-1 sm:self-auto ${vehicleMissing ? "bg-red-50 text-red-700 ring-red-100" : "bg-emerald-50 text-emerald-700 ring-emerald-100"}`}>{vehicleMissing ? `${vehicleMissing} mandatory fields pending` : "Complete"}</span> : section.pending ? <span className="self-start bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 ring-1 ring-red-100 sm:self-auto">{section.pending}</span> : <span className="self-start bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100 sm:self-auto">Ready to complete</span>}
                      </div>
<div className="overflow-x-auto p-3 sm:p-4">
                        {section.title === "KYC" ? <ClientDetailsForm onKycStatus={setKycMissing} onClientSelected={(client) => setProposalDraft((current) => ({ ...current, clientCode: String(client.Code || ""), title: String(client.Title || ""), firstName: String(client.Name || ""), surname: String(client.Surname || ""), email: String(client.EMail || "") }))} onSaved={() => markSectionSaved("KYC")} onClientChange={setKycClient} /> : section.title === "Policy Details" ? <MotorProposalForm clientCode={String(proposalDraft.clientCode || "")} onStatusChange={setPolicyMissing} coverRequired={policyCover} onValuesChange={(vals) => setProposalDraft((prev) => ({ ...prev, ...vals }))} /> : section.title === "Vechicle Details" ? <VehicleProposalForm policyCover={policyCover} onPolicyCoverChange={setPolicyCover} onStatusChange={setVehicleMissing} onValuesChange={(vals) => setProposalDraft((prev) => ({ ...prev, ...vals }))} vehicleClass={proposalDraft.vehicleClass} vehicleType={proposalDraft.vehicleType} fuelType={proposalDraft.fuelType} issueDate={proposalDraft.issueDate} country={String(proposalDraft.country || "Mauritius")} /> : section.title === "Accessories" ? <AccessoriesForm /> : section.title === "General Information" ? <GeneralInformationForm /> : section.title === "Common Det." ? <CommonDetailsForm values={proposalDraft as Record<string, string | boolean>} onFieldChange={(field, value) => setProposalDraft((prev) => ({ ...prev, [field]: value }))} showErrors={commonDetailsAttempted} /> : section.title === "Premium" ? <PremiumForm values={applyCoverRules(proposalDraft, premiumCoverRules) as Record<string, string | boolean>} calculating={premiumCalculating} onCalculate={calculatePremium} error={premiumError} cover={policyCover || String(proposalDraft.coverRequired || "")} onFieldChange={(field, value) => setProposalDraft((prev) => ({ ...prev, [field]: value }))} restrictedRates={coverRestrictions.restrictedRates} coverRules={premiumCoverRules} /> : <AttachedDocumentForm policyNo={policyNo} documents={pendingDocuments} onDocumentsChange={setPendingDocuments} stored={storedDocuments} uploadMessage={documentUploadMessage} />}
                        {section.title !== "KYC" && openSection === section.title && saveMessage ? <div className="mt-4"><SaveNotice error={saveError} message={saveMessage} issues={saveIssues} onDismiss={clearSaveNotice} onOpenSection={setOpenSection} /></div> : null}
                        {section.title !== "KYC" ? <div className="mt-4 flex justify-end border-t border-violet-100 pt-4"><button type="button" disabled={saving} onClick={() => void saveCurrentSection()} className="bg-[#35126d] px-6 py-3 text-sm font-bold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:bg-slate-400">{saving ? "Saving..." : section.title === "Attached Document" ? "Save policy and continue" : "Save and continue"}</button></div> : null}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            ) : null}

            {currentStep === 1 ? (
              <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_300px]">
                <div className="space-y-5">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">How would you like to pay?</p>
                    <div role="radiogroup" className="mt-3 grid gap-3 sm:grid-cols-2">
                      {[
                        ["card", "Credit or debit card", "Visa, Mastercard or American Express", "M3 10h18M7 15h2m4 0h4M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z"],
                        ["bank", "Internet banking", "Pay from your bank account", "M3 10l9-6 9 6M5 10v8m4-8v8m6-8v8m4-8v8M3 20h18"],
                      ].map(([value, title, text, icon]) => {
                        const selected = payment.method === value;
                        return (
                          <label key={value} className={`relative flex cursor-pointer items-start gap-4 rounded-2xl border-2 p-5 transition ${selected ? "border-[#35126d] bg-violet-50 shadow-sm" : "border-slate-200 bg-white hover:border-violet-300"}`}>
                            <input type="radio" name="payment" value={value} checked={selected} onChange={() => setPayment((current) => ({ ...current, method: value }))} className="sr-only" />
                            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${selected ? "bg-[#35126d] text-white" : "bg-violet-100 text-[#412484]"}`}>
                              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={icon} /></svg>
                            </span>
                            <span className="min-w-0"><span className="block font-semibold text-slate-900">{title}</span><span className="mt-0.5 block text-xs text-slate-500">{text}</span></span>
                            <span className={`absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border-2 ${selected ? "border-[#35126d] bg-[#35126d]" : "border-slate-300"}`}>{selected ? <span className="h-2 w-2 rounded-full bg-white" /> : null}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <ol className="grid gap-3 sm:grid-cols-3">
                    {[["1", "Enter payment details", "Card or bank details are checked before you continue."], ["2", "Review the e-mail", "Check the recipient and the policy number."], ["3", "Receive your documents", "Certificate, schedule, debit note and vignette as PDFs."]].map(([step, title, text]) => (
                      <li key={step} className="rounded-xl border border-violet-100 bg-[#faf9fd] p-4">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#35126d] text-xs font-bold text-white">{step}</span>
                        <p className="mt-2 text-sm font-semibold text-slate-800">{title}</p>
                        <p className="mt-0.5 text-xs leading-5 text-slate-500">{text}</p>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="self-start overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm">
                  <p className="border-b border-violet-100 bg-violet-50/60 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#35126d]">Order summary</p>
                  <dl className="space-y-2 px-4 py-3 text-sm">
                    {[["Policy No", policyNo || "Not saved yet"], ["Vehicle", draftValue("vehicleNo") || "-"], ["Cover", policyCover || draftValue("coverRequired") || "-"]].map(([label, value]) => (
                      <div key={label} className="flex justify-between gap-3"><dt className="text-slate-500">{label}</dt><dd className="truncate text-right font-medium text-slate-800">{value}</dd></div>
                    ))}
                    <div className="my-2 h-px bg-slate-100" />
                    {[["Premium", draftValue("premium")], ["Document charges", draftValue("documentCharge")]].map(([label, value]) => (
                      <div key={label} className="flex justify-between gap-3"><dt className="text-slate-500">{label}</dt><dd className="font-mono text-slate-800">{(Number(value) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</dd></div>
                    ))}
                  </dl>
                  <div className="flex items-end justify-between gap-3 bg-gradient-to-r from-[#35126d] to-[#5b3aa4] px-4 py-3 text-white">
                    <span className="text-xs font-semibold uppercase tracking-wider text-violet-200">Total payable</span>
                    <span className="font-mono text-xl font-bold tabular-nums">Rs {payableAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  {!payableAmount ? <p role="alert" className="px-4 py-3 text-xs font-medium text-amber-700">The premium has not been calculated yet. Go back to the Premium section first.</p> : null}
                </div>
              </div>
            ) : null}

            <div className="flex items-center justify-between border-t border-violet-100 bg-[#faf9fd] px-6 py-4">
              <button type="button" disabled={currentStep === 0} onClick={() => setCurrentStep((step) => Math.max(0, step - 1))} className="border border-violet-300 px-6 py-3 text-sm font-semibold text-[#35126d] transition hover:bg-violet-50 disabled:invisible">Back</button>
              <button type="button" disabled={saving || (currentStep === 0 && !allSectionsSaved)} onClick={currentStep === 0 ? advanceStep : () => setPaymentOpen(true)} className="bg-[#35126d] px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-violet-900/15 transition hover:-translate-y-0.5 hover:bg-violet-800 disabled:cursor-not-allowed disabled:bg-slate-300">{saving ? "Saving..." : currentStep === 0 ? "Continue to payment" : "Proceed to pay"}</button>
            </div>
          </div>
        </section>

        <aside className="self-start overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-[0_12px_35px_rgba(53,18,109,0.08)] lg:sticky lg:top-3">
          {/* Promotional card: benefits of buying motor cover online */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#35126d] via-[#4a2894] to-[#6f4bb6] px-5 pb-6 pt-5 text-white">
            <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-fuchsia-400/20 blur-2xl" />
            <span className="relative inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-100 ring-1 ring-white/25">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor"><path d="M12 2l2.9 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 7.1-1.01L12 2z" /></svg>
              Trusted since 1935
            </span>
            <h2 className="relative mt-3 text-2xl font-bold leading-tight">Drive with confidence,<br />wherever the road takes you.</h2>
            <p className="relative mt-2 text-sm leading-5 text-violet-100">Buy your motor policy online and get your documents in your inbox the moment you pay.</p>
            <svg viewBox="0 0 120 48" className="relative mt-4 h-14 w-auto text-white/90" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M8 34h6m78 0h18v-8c0-3-2-5-5-6l-14-4-12-9c-2-1-4-2-6-2H38c-3 0-5 1-7 3l-9 9-9 2c-3 1-5 3-5 6v9h6" />
              <path d="M32 34h44" /><circle cx="23" cy="35" r="8" /><circle cx="85" cy="35" r="8" /><path d="M42 16h30l-8-7H48z" />
            </svg>
          </div>

          <ul className="space-y-1 p-3">
            {[
              ["M13 10V3L4 14h7v7l9-11h-7z", "Instant policy documents", "Certificate, schedule, debit note and vignette e-mailed as PDFs."],
              ["M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10h10zm0 0h5l3-3v-3h-5l-3-4", "24/7 towing service", "Breakdown or accident? Call KOUKOU TOWING on 86100."],
              ["M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", "Extend your cover", "Windscreen, waiver of excess, loss of car keys, Auto Plus and more."],
            ].map(([icon, title, text]) => (
              <li key={title} className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition hover:bg-violet-50/70">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-violet-200 text-[#412484]">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={icon} /></svg>
                </span>
                <span className="min-w-0"><span className="block text-sm font-semibold text-slate-800">{title}</span><span className="mt-0.5 block text-xs leading-5 text-slate-500">{text}</span></span>
              </li>
            ))}
          </ul>

          <div className="mx-3 mb-3 flex items-center gap-3 rounded-xl border border-violet-100 bg-gradient-to-r from-violet-50 to-white px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#35126d] text-white">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Need help with your policy?</span>
              <a href="tel:+2302081442" className="block text-sm font-bold text-[#35126d] hover:underline">(+230) 208 1442</a>
            </span>
          </div>
        </aside>
      </div>
{paymentMessage && !paymentOpen ? <p role={paymentError ? "alert" : "status"} className={`fixed bottom-4 right-4 z-50 border px-4 py-3 text-sm font-semibold ${paymentError ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{paymentMessage}</p> : null}
      {emailPreviewOpen && emailPreviewData ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="bg-gradient-to-r from-[#35126d] to-[#5b3aa4] px-6 py-4 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-violet-200">Payment confirmation</p>
              <h2 className="mt-1 text-lg font-bold">Send policy documents by e-mail</h2>
            </div>
            <div className="space-y-4 p-6 text-sm">
              <dl className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-2 rounded-xl border border-violet-100 bg-violet-50/60 p-4">
                <dt className="font-semibold text-slate-500">To</dt><dd className="font-semibold text-slate-800">{emailPreviewData.fullName}</dd>
                <dt className="font-semibold text-slate-500">E-mail</dt><dd className="break-all text-slate-800">{emailPreviewData.email}</dd>
                <dt className="font-semibold text-slate-500">Policy No</dt><dd className="font-mono text-[#35126d]">{emailPreviewData.policyNo}</dd>
                <dt className="font-semibold text-slate-500">Client Code</dt><dd className="font-mono text-[#35126d]">{emailPreviewData.clientCode}</dd>
                <dt className="font-semibold text-slate-500">Amount</dt><dd className="font-mono font-semibold text-slate-800">{payableAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</dd>
              </dl>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Attached as PDF</p>
                <ul className="mt-2 grid grid-cols-2 gap-2">
                  {["Certificate of Insurance", "Debit Note (Invoice)", "Policy Schedule", "Insurance Vignette"].map((name) => (
                    <li key={name} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700">
                      <svg className="h-4 w-4 shrink-0 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
              {saving ? <p role="status" className="flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 font-medium text-[#35126d]"><span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-violet-300 border-t-[#35126d]" /> Recording the payment, generating the documents and sending the e-mail…</p> : null}
              {paymentResult ? (
                <div role={paymentResult.ok ? "status" : "alert"} className={`rounded-xl border px-4 py-3 ${paymentResult.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
                  <p className="font-semibold">{paymentResult.ok ? "Done. The policy documents were sent." : paymentResult.recorded ? "The payment was recorded, but please check the points below." : "The payment was not submitted."}</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-xs">{paymentResult.lines.map((line) => <li key={line}>{line}</li>)}</ul>
                </div>
              ) : null}
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
              {paymentResult?.recorded ? (
                <button type="button" onClick={() => setEmailPreviewOpen(false)} className="rounded-xl bg-[#35126d] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2b0f5a]">Close</button>
              ) : (
                <>
                  <button type="button" onClick={() => setEmailPreviewOpen(false)} disabled={saving} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancel</button>
                  <button type="button" onClick={submitPayment} disabled={saving} className="rounded-xl bg-[#35126d] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2b0f5a] disabled:bg-slate-300">{saving ? "Sending…" : paymentResult ? "Try again" : "Send Email & Submit Payment"}</button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
      {paymentOpen ? <PaymentForm payment={payment} onChange={setPayment} amount={payableAmount} policyNo={policyNo} notice={paymentError ? paymentMessage : ""} onCancel={() => { setPaymentOpen(false); setPaymentMessage(""); setPaymentError(false); }} onContinue={() => void showEmailPreview()} /> : null}
    </main>
  );
}


