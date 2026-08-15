"use client";

import { useState } from "react";

type PolicyCover = "" | "Comprehensive" | "Third Party Fire & Theft" | "Third Party Only";

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
  { label: "Additional Details", icon: "details" },
  { label: "Summary", icon: "summary" },
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
    ["Country", "Mauritius"], ["Vehicle Type", "Selected vehicle type"], ["Fuel Type", "Vehicle fuel type"], ["Class", "Motor policy class"], ["Vehicle Status", "New or existing vehicle"], ["Issue Date", "Policy issue date and time"], ["From", "Policy commencement date"], ["To", "Policy expiry date"], ["Agent", "Issuing agent details"], ["Client", "Client master record"], ["Lien", "Lienholder details, if applicable"], ["Policy Risk", "Standard or selected risk"],
  ] },
  { title: "Trailers & Others", rows: [
    ["Radio", "Electrical selection, make/model, rate, amount and premium"], ["Cassette Player", "Electrical selection, make/model and value"], ["Sunvisor", "Accessory selection and value"], ["Roof Rack", "Accessory selection and value"], ["Aerial", "Accessory selection and value"], ["Special Petrol Cap", "Accessory selection and value"], ["Spot and/or Foglights", "Electrical selection, make/model and value"], ["Cushion Cover & Mats", "Accessory selection and value"], ["Back Sensor", "Electrical selection, make/model and value"], ["Body Kit", "Front/rear body-kit protection"], ["Cassette and CD Player", "Electrical selection, make/model and value"], ["CD Player", "Electrical selection, make/model and value"], ["Ceramic Coating", "Accidental damage protection"], ["DVD Player", "Electrical selection, make/model and value"], ["Electrical Central Door Locking", "Electrical selection, make/model and value"], ["Exhaust Pipe", "Accessory selection and value"], ["Fender", "Accessory selection and value"],
  ] },
  { title: "Accessories", rows: [
    ["No Claim Bonus", "Rate percentage and discount amount"], ["Fleet Discount", "Rate percentage and discount amount"], ["Special Discount", "Rate percentage and discount amount"], ["Claim Loading", "Rate percentage and loading amount"], ["Get Discount %", "Calculate and apply eligible discount"], ["Policy Remarks for Agent", "Agent discount remarks"], ["Remarks for Other Loading", "Additional loading remarks"],
  ] },
  { title: "General Information", rows: [
    ["Passenger Risk", "Optional passenger-risk cover"], ["Personal Accident", "Personal accident protection"], ["PA (Conductor)", "Personal accident cover for conductor"], ["PA (Employee)", "Personal accident cover for employee"], ["PA (Family Members)", "Personal accident cover for family members"], ["Auto Plus", "Optional Auto Plus cover"], ["Driver Only", "Named-driver protection"], ["Loss of Use", "Loss-of-use benefit"], ["Towing", "Towing expense cover"], ["Strike, Riot and Civil Commotion", "Additional peril protection"], ["Earthquake", "Earthquake protection"], ["Cyclone", "Cyclone protection"], ["Windscreen Extension", "Extended windscreen cover"], ["Waiver of Excess", "Optional excess waiver"], ["Loss of Car Keys", "Replacement car-key cover"], ["Airfreight Expenses", "Airfreight expense protection"], ["Personal Belongings", "Personal belongings in vehicle"], ["Damage by Rodents", "Rodent-damage protection"], ["Accidental Misfuelling", "Misfuelling expense cover"], ["Enhanced Personal Accidental", "Enhanced personal accident benefit"], ["Funeral Expenses", "Funeral expense benefit"],
  ] },
  { title: "Common Det.", rows: [] },
  { title: "Premium", rows: [] },
  { title: "Attached Document", rows: [] },
];

function StepIcon({ type }: { type: string }) {
  if (type === "payment") {
    return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="6" width="18" height="12" rx="1" /><path d="M3 10h18M7 15h4" /></svg>;
  }
  if (type === "summary") {
    return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 4h8M9 2h6v4H9z" /><rect x="5" y="4" width="14" height="18" rx="1" /><path d="M8 10h8M8 14h8M8 18h5" /></svg>;
  }
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 3h11l3 3v15H5z" /><path d="M8 8h8M8 12h8M8 16h5" />{type === "details" ? <circle cx="17" cy="18" r="3" fill="white" /> : null}</svg>;
}

function ClientDetailsForm() {
  const inputClass = "w-full border border-violet-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-[#35126d] focus:ring-2 focus:ring-violet-100";
  const labelClass = "text-xs font-semibold text-slate-600";

  return (
    <div className="border border-violet-200 bg-[#f7f5fb]">
      <div className="space-y-3 p-4 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-[130px_minmax(0,1fr)_100px_minmax(0,0.45fr)] sm:items-center">
          <label className={labelClass}>Client Code</label><div className="flex gap-2"><input className={inputClass} /><button type="button" className="border border-violet-300 bg-white px-3 text-[#35126d]">Search</button></div>
          <label className={`${labelClass} flex items-center gap-2`}><input type="checkbox" className="accent-[#35126d]" /> OLD</label><input className={inputClass} placeholder="Agent" />
        </div>

        <div className="grid gap-3 sm:grid-cols-[130px_minmax(0,1fr)] sm:items-center">
          <label className={labelClass}>Category</label>
          <div className="flex flex-wrap gap-5 text-sm"><label className="flex items-center gap-2"><input type="radio" name="category" className="accent-[#35126d]" /> Company</label><label className="flex items-center gap-2"><input type="radio" name="category" defaultChecked className="accent-[#35126d]" /> Individual</label></div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[130px_minmax(0,1fr)] sm:items-center"><label className={labelClass}>Name</label><div className="grid grid-cols-[110px_1fr] gap-2"><select className={inputClass}><option>Title</option><option>Mr</option><option>Mrs</option><option>Ms</option></select><input className={inputClass} /></div></div>
        <div className="grid gap-3 sm:grid-cols-[130px_minmax(0,1fr)] sm:items-center"><label className={labelClass}>Surname</label><input className={inputClass} /></div>
        <div className="grid gap-3 sm:grid-cols-[130px_minmax(0,1fr)]"><label className={labelClass}>UBO (Ultimate beneficial owner)</label><textarea rows={2} className={inputClass} /></div>
        <div className="grid gap-3 sm:grid-cols-[130px_minmax(0,1fr)]"><label className={labelClass}>Address</label><textarea rows={2} className={inputClass} /></div>
        <div className="grid gap-3 sm:grid-cols-[130px_minmax(0,1fr)] sm:items-center"><label className={labelClass}>City</label><input className={inputClass} /></div>

        {[
          ["VAT", "Tel Res / Abroad"], ["Tel Off", "Fax"], ["Mobile", "Qualification"],
        ].map(([left, right]) => (
          <div key={left} className="grid gap-3 sm:grid-cols-[130px_1fr_145px_1fr] sm:items-center"><label className={labelClass}>{left}</label><input className={inputClass} /><label className={labelClass}>{right}</label><input className={inputClass} /></div>
        ))}
        <div className="grid gap-3 sm:grid-cols-[130px_minmax(0,1fr)] sm:items-center"><label className={labelClass}>E-Mail</label><input type="email" className={inputClass} /></div>

        <div className="grid gap-3 sm:grid-cols-[130px_1fr_145px_1fr] sm:items-center"><label className={labelClass}>Occupation</label><select className={inputClass}><option>Select occupation</option></select><div className="col-span-2 flex flex-wrap gap-4 text-sm"><label className="flex items-center gap-2"><input type="radio" name="residence" defaultChecked className="accent-[#35126d]" /> Resident</label><label className="flex items-center gap-2"><input type="radio" name="residence" className="accent-[#35126d]" /> Non Resident</label></div></div>
        <div className="grid gap-3 sm:grid-cols-[130px_1fr_145px_1fr] sm:items-center"><label className={labelClass}>Nationality</label><select className={inputClass}><option>Select nationality</option></select><label className={labelClass}>Country Code</label><select className={inputClass}><option>MUS — Mauritius</option></select></div>
        <div className="grid gap-3 sm:grid-cols-[130px_1fr_145px_1fr] sm:items-center"><label className={labelClass}>Passport No.</label><input className={inputClass} /><label className={labelClass}>NID</label><input className={inputClass} /></div>
        <div className="grid gap-3 sm:grid-cols-[130px_1fr_145px_1fr] sm:items-center"><label className={labelClass}>BRN</label><input className={inputClass} /><label className={labelClass}>Gender</label><select className={inputClass}><option>Select gender</option><option>Female</option><option>Male</option></select></div>
        <div className="grid gap-3 sm:grid-cols-[130px_1fr_145px_1fr] sm:items-center"><label className={labelClass}>DOB</label><input type="date" className={inputClass} /><label className={labelClass}>Credit Limit</label><input type="number" className={inputClass} /></div>
        <div className="grid gap-3 sm:grid-cols-[130px_minmax(0,1fr)]"><label className={labelClass}>Other Remarks</label><textarea rows={3} className={inputClass} /></div>

        <div className="grid gap-3 sm:grid-cols-2"><label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-[#35126d]" /> Decline</label><label className="text-sm">Decline Remarks<input className={`mt-1 ${inputClass}`} /></label><label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-[#35126d]" /> Special Client</label><label className="text-sm">Decline Date<input type="date" className={`mt-1 ${inputClass}`} /></label></div>
      </div>

      
      <div className="grid gap-4 p-4 sm:grid-cols-[1fr_1.3fr] sm:items-end">
        <p className="text-xs leading-5 text-slate-600">Enter Name / National ID / Passport No / BRN to verify the prospective client is in ICAC/ARD/UNSC list.</p>
        <div><textarea rows={3} className={inputClass} /><button type="button" className="mt-2 w-full bg-[#35126d] px-4 py-3 text-sm font-bold text-white transition hover:bg-violet-800">CLICK HERE TO VERIFY</button></div>
      </div>
    </div>
  );
}

function MotorProposalForm() {
  const inputClass = "w-full border border-violet-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-[#35126d] focus:ring-2 focus:ring-violet-100";
  const labelClass = "text-xs font-semibold text-slate-600";
  const documents = ["Certificate", "Vignette", "Sch", "Inv", "Premium", "Com", "PSSA", "Acc. Gen", "ICAC", "MIE", "AML", "AMCCU", "MRA", "PSEA", "BOM", "EWF", "Pro Note", "Summary", "Policy-wording", "KYC", "Scarcity", "Proposal"];
  const actions = ["Insert & Save", "Edit & Save", "View", "Print", "Not approved", "Approve", "Insert 2 NTA", "Reports in PDF", "Exit"];

  return (
    <div className="border border-violet-200 bg-[#f7f5fb]">
      <div>
        <div className="space-y-3 p-4 sm:p-6 lg:border-r lg:border-violet-200">
          <div className="grid gap-3 sm:grid-cols-[130px_1fr_130px_1fr] sm:items-center"><label className={labelClass}>Policy No.</label><input className={inputClass} /><span /><span /></div>
          <div className="grid gap-3 sm:grid-cols-[130px_1fr_130px_1fr] sm:items-center"><label className={labelClass}>Country</label><select defaultValue="mauritius" className={inputClass}><option value="mauritius">Mauritius</option></select><label className={labelClass}>Certificate No.</label><input className={inputClass} /></div>
          <div className="grid gap-3 sm:grid-cols-[130px_1fr_130px_1fr] sm:items-center"><label className={labelClass}>Vehicle Type</label><select className={inputClass}><option>Select vehicle type</option><option>Private Car</option><option>Commercial Vehicle</option><option>Two Wheeler</option></select><label className={labelClass}>Fuel Type</label><select className={inputClass}><option>Select fuel</option><option>Petrol</option><option>Diesel</option><option>Electric</option><option>Hybrid</option></select></div>
          <div className="grid gap-3 sm:grid-cols-[130px_1fr] sm:items-center"><label className={labelClass}>Class</label><select className={inputClass}><option>Select policy class</option></select></div>
          <div className="grid gap-3 sm:grid-cols-[130px_1fr_130px_1fr] sm:items-center"><label className={labelClass}>Vehicle Status</label><select className={inputClass}><option>Select status</option><option>New</option><option>Used</option></select><label className={labelClass}>Issue Date</label><input type="datetime-local" className={inputClass} /></div>
          <div className="grid gap-3 sm:grid-cols-[130px_1fr_130px_1fr] sm:items-center"><label className={labelClass}>From</label><input type="datetime-local" className={inputClass} /><label className={labelClass}>To</label><input type="datetime-local" className={inputClass} /></div>
          <div className="grid gap-3 pt-3 sm:grid-cols-[130px_1fr] sm:items-start"><label className={labelClass}>Agent</label><div><div className="flex"><input className={inputClass} /><button type="button" className="border border-l-0 border-violet-200 bg-white px-3 text-[#35126d]">Search</button></div><textarea rows={3} className={`mt-2 ${inputClass}`} /></div></div>
          <div className="grid gap-3 sm:grid-cols-[130px_1fr] sm:items-start"><label className={labelClass}>Client</label><div><div className="flex"><input className={inputClass} /><button type="button" className="border border-l-0 border-violet-200 bg-white px-3 text-[#35126d]">Search</button></div><button type="button" className="mt-1 border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-semibold text-[#35126d]">Client Master</button><textarea rows={3} className={`mt-2 ${inputClass}`} /></div></div>
          <div className="grid gap-3 sm:grid-cols-[130px_1fr] sm:items-start"><label className={`${labelClass} flex items-center gap-2`}><input type="checkbox" className="accent-[#35126d]" /> Lien</label><div><div className="grid grid-cols-2 gap-2"><select className={inputClass}><option>Select lien type</option></select><select className={inputClass}><option>Select lienholder</option></select></div><textarea rows={3} className={`mt-2 ${inputClass}`} /></div></div>
          <div className="grid gap-3 sm:grid-cols-[130px_1fr] sm:items-center"><label className={labelClass}>Policy Risk</label><select defaultValue="standard" className={inputClass}><option value="standard">Standard</option><option value="high">High Risk</option></select></div>
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
  "Trailers & Others": "Trailer and additional equipment information",
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

function VehicleProposalForm({ policyCover, onPolicyCoverChange }: { policyCover: PolicyCover; onPolicyCoverChange: (cover: PolicyCover) => void }) {
  const inputClass = "h-9 w-full border border-violet-200 bg-white px-2 text-sm text-slate-800 outline-none focus:border-[#35126d] focus:ring-2 focus:ring-violet-100";
  const labelClass = "text-xs font-semibold text-slate-600";
  const documents = ["Certificate", "Vignette", "Sch", "Inv", "Premium", "Com", "PSSA", "Acc. Gen", "ICAC", "MIE", "AML", "AMCCU", "MRA", "PSEA", "BOM", "EWF", "Pro Note", "Summary", "Policy-wording", "KYC", "Scarcity", "Proposal"];
  const actions = ["Insert & Save", "Edit & Save", "View", "Print", "Not approved", "Approve", "Insert 2 NTA", "Reports in PDF", "Exit"];

  const field = (label: string, type: "input" | "select" = "input") => (
    <label key={label} className="grid grid-cols-[135px_1fr] items-center gap-2">
      <span className={labelClass}>{label}</span>
      {type === "select" ? <select className={inputClass}><option>Select</option></select> : <input className={inputClass} />}
    </label>
  );

  return (
    <div className="border border-violet-200 bg-[#f7f5fb]">
      <div>
        <div className="p-4 sm:p-5 lg:border-r lg:border-violet-200">
          <div className="grid gap-x-5 gap-y-3 sm:grid-cols-2">
            <div className="space-y-3">{field("Reg No")}{field("Make", "select")}{field("Model", "select")}{field("Eng No")}{field("Chassis No")}</div>
            <div className="space-y-3">{field("Colour")}{field("Year Mfg. & Date of Reg.")}{field("Seating")}{field("CC / kW")}{field("Trailer Ft.")}</div>
            <label className="grid grid-cols-[135px_1fr] items-center gap-2"><span className={labelClass}>Gross Vehicle Weight</span><input className={inputClass} /></label>
            <label className="grid grid-cols-[135px_1fr] items-center gap-2"><span className={labelClass}>Remarks</span><input className={inputClass} /></label>
          </div>

          <fieldset className="mt-5 border-t border-violet-200 pt-4">
            <legend className="pr-3 text-sm font-bold text-[#35126d]">Cover Details</legend>
            <label className="mb-4 flex items-start gap-2 text-xs font-semibold text-[#35126d]"><input type="checkbox" className="mt-0.5 accent-[#35126d]" />Calculate from basic Tariff, instead of Extended Comprehensive Cover for Old Vehicles.</label>
            <div className="grid gap-x-5 gap-y-3 sm:grid-cols-2">
              <div className="space-y-3">
                <label className="grid grid-cols-[135px_1fr] items-center gap-2"><span className={labelClass}>Cover Required</span><select value={policyCover} onChange={(event) => onPolicyCoverChange(event.target.value as PolicyCover)} className={inputClass}><option value="">Select cover</option><option>Comprehensive</option><option>Third Party Fire &amp; Theft</option><option>Third Party Only</option></select></label>
                {field("Vol. Excess Amount")}{field("Young Driver Excess", "select")}{field("TPF Excess", "select")}{field("Additional Excess", "select")}{field("Total Loss Excess")}
              </div>
              <div className="space-y-3">{field("Add. Excess Remarks")}{field("Sum Insured")}{field("Compulsory Excess", "select")}{field("TPPD Excess")}{field("Theft Excess")}</div>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="grid flex-1 grid-cols-[185px_1fr] items-center gap-2"><span className={labelClass}>Approved discount request</span><select className={inputClass}><option>Select request</option></select></label>
              <button type="button" className="h-9 border border-violet-300 bg-white px-4 text-xs font-semibold text-[#35126d]">Update</button>
              <button type="button" className="h-9 bg-[#35126d] px-5 text-xs font-bold text-white">Calculate Premium</button>
            </div>
          </fieldset>

          <div className="mt-12">
            <h3 className="mb-2 text-sm font-bold text-[#35126d]">Vehicle Details</h3>
            <div className="overflow-x-auto"><table className="w-full min-w-[560px] border-collapse text-left text-xs"><thead><tr className="bg-violet-50 text-[#35126d]"><th className="border border-violet-200 px-3 py-2">Policy No</th><th className="border border-violet-200 px-3 py-2">Name</th><th className="border border-violet-200 px-3 py-2">Claim Amount</th><th className="border border-violet-200 px-3 py-2">Status</th></tr></thead><tbody><tr className="bg-amber-50"><td className="h-8 border border-violet-100" /><td className="border border-violet-100" /><td className="border border-violet-100" /><td className="border border-violet-100" /></tr><tr className="bg-emerald-50"><td className="h-8 border border-violet-100" /><td className="border border-violet-100" /><td className="border border-violet-100" /><td className="border border-violet-100" /></tr></tbody></table></div>
          </div>
        </div>
        <aside className="hidden">
          <div className="mt-4 grid grid-cols-3 gap-x-3 gap-y-4">{documents.map((document, index) => <label key={document} className="flex items-center gap-2 text-xs text-violet-700"><input type="radio" name="vehicle-print-document" defaultChecked={index === 0} className="accent-[#35126d]" />{document}</label>)}</div>
          <div className="mt-6 grid grid-cols-3 gap-2">{actions.map((action) => <button key={action} type="button" className="min-h-16 border border-violet-200 bg-violet-50 px-2 py-3 text-xs font-semibold text-[#35126d] hover:bg-violet-100">{action}</button>)}</div>
          <label className="mt-5 block text-xs font-bold uppercase tracking-wider text-red-600">Remarks<textarea rows={4} className={`mt-2 ${inputClass}`} /></label>
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
  const accessories = ["Radio", "Cassette Player", "Sunvisor", "Roof Rack", "Aerial", "Special Petrol Cap", "Spot and / or Foglights", "Cushion Cover & Mats", "Any other accessories", "Back Sensor", "Body Kit", "Body Kit Front", "Bumper Design", "Carpet Jackets", "Cassette and CD Player", "CD Player", "Ceramic Coating (Accidental Damage)", "Door Visor", "DVD Player", "Economical Rep.", "Electrical Cables & Accessories", "Electrical Central Door Locking", "Emblem Design Front", "Exhaust Pipe", "Exhaust tip", "Fender"];

  return (
    <div className="border border-violet-200 bg-[#f7f5fb]">

      <div>
        <div className="p-4 sm:p-5 lg:border-r lg:border-violet-200">
          <div className="max-h-[520px] overflow-auto border border-violet-200">
            <table className="w-full min-w-[720px] border-collapse text-left text-xs">
              <thead className="sticky top-0 z-10"><tr className="bg-violet-100 text-[#35126d]"><th className="border-r border-violet-200 px-2 py-2">Description</th><th className="border-r border-violet-200 px-2 py-2 text-center">Electrical</th><th className="border-r border-violet-200 px-2 py-2">Make &amp; Model</th><th className="border-r border-violet-200 px-2 py-2">Rate</th><th className="border-r border-violet-200 px-2 py-2">Amount</th><th className="px-2 py-2">Premium</th></tr></thead>
              <tbody>{accessories.map((accessory, index) => <tr key={accessory} className={index % 2 === 0 ? "bg-white" : "bg-emerald-50"}><td className="border-b border-r border-violet-100 px-2 py-1.5 font-medium text-slate-700">{accessory}</td><td className="border-b border-r border-violet-100 text-center"><input type="checkbox" defaultChecked={accessory === "CD Player"} className="accent-[#35126d]" aria-label={`${accessory} electrical`} /></td><td className="border-b border-r border-violet-100 p-1"><input className="h-7 w-full border border-transparent bg-transparent px-1 outline-none focus:border-violet-300 focus:bg-white" aria-label={`${accessory} make and model`} /></td><td className="border-b border-r border-violet-100 p-1"><input type="number" defaultValue="4" className="h-7 w-16 bg-transparent px-1 text-right outline-none focus:bg-white" aria-label={`${accessory} rate`} /></td><td className="border-b border-r border-violet-100 p-1"><input type="number" className="h-7 w-full bg-transparent px-1 outline-none focus:bg-white" aria-label={`${accessory} amount`} /></td><td className="border-b border-violet-100 p-1"><input type="number" className="h-7 w-full bg-transparent px-1 outline-none focus:bg-white" aria-label={`${accessory} premium`} /></td></tr>)}</tbody>
            </table>
          </div>
          <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" className="h-9 border border-violet-300 bg-white px-5 text-xs font-bold text-[#35126d] hover:bg-violet-50">SMS TEST</button>
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
          <label className="grid gap-3 sm:grid-cols-[290px_1fr]"><span className="text-xs text-slate-700">Price paid by you</span><input type="number" className={inputClass} /></label>
          <label className="grid gap-3 sm:grid-cols-[290px_1fr]"><span className="text-xs text-slate-700">Date of purchase of vehicle</span><input type="date" className={inputClass} /></label>
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
              <div className="space-y-2">{[["Total Premium (Incl. Tow)", ""], ["Doc. Charges", "150"], ["Levy Charge", "0.39"], ["Hit & Run Charge", ""], ["Inv. Amount", "150"], ["Agent Comm %", ""], ["Comm. Amt", "0.00"]].map(([label, value]) => <label key={label} className="grid grid-cols-[1fr_70px] items-center gap-2 text-xs font-semibold"><span>{label}</span><input defaultValue={value} className={inputClass} /></label>)}</div>
              <div className="space-y-2">{["Currency", "Ex. Rate", "Sum Insured", "Premium", "Doc.", "Levy", "Inv. Amount", "Com. Amt"].map((label) => <label key={label} className="grid grid-cols-[1fr_70px] items-center gap-2 text-xs"><span>{label}</span>{label === "Currency" ? <select className={inputClass}><option>MUR</option></select> : <input type="number" defaultValue="0" className={inputClass} />}</label>)}</div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-semibold">Policy remarks for Agent<textarea rows={3} className="mt-1 w-full border border-violet-200 bg-white p-2 font-normal outline-none focus:border-[#35126d]" /></label><label className="text-xs font-semibold">Remarks for Other Loading<textarea rows={3} className="mt-1 w-full border border-violet-200 bg-white p-2 font-normal outline-none focus:border-[#35126d]" /></label></div>
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
  const [currentStep, setCurrentStep] = useState(0);
  const [registration, setRegistration] = useState("");
  const [fullName, setFullName] = useState("");
  const [policyCover, setPolicyCover] = useState<PolicyCover>("");
  const [openSection, setOpenSection] = useState<string | null>("KYC");
  const detailsComplete = Boolean(registration.trim() && fullName.trim());
  const availableDownloads = policyCover ? [...policyDownloads[policyCover], ...generalDownloads] : generalDownloads;

  const advanceStep = () => {
    if (currentStep === 0) setCurrentStep(1);
    if (currentStep === 1 && detailsComplete) setCurrentStep(2);
    if (currentStep === 2) setCurrentStep(3);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#f4efff_0,_#f5f7fb_42%,_#eef1f7_100%)] font-sans text-slate-700">
      <div className="grid w-full gap-3 p-2 sm:p-3 lg:grid-cols-[minmax(0,2.2fr)_minmax(280px,0.65fr)]">
        <section>
          <div className="relative mb-3 grid grid-cols-4 overflow-x-auto rounded-xl border border-violet-100 bg-white px-2 py-3 shadow-[0_8px_24px_rgba(53,18,109,0.06)] sm:px-4">
            <div className="absolute left-[12.5%] right-[12.5%] top-8 h-0.5 bg-violet-200" />
            <div className="absolute left-[12.5%] top-8 h-0.5 bg-[#35126d] transition-all duration-500" style={{ width: `${currentStep * 25}%` }} />
            {steps.map((step, index) => (
              <button key={step.label} type="button" disabled={index > currentStep} onClick={() => index < currentStep && setCurrentStep(index)} className="relative z-10 flex min-w-[110px] flex-col items-center text-center disabled:cursor-default">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition ${index === currentStep ? "border-[#35126d] bg-[#35126d] text-white ring-4 ring-violet-100" : index < currentStep ? "border-violet-500 bg-violet-500 text-white" : "border-violet-200 bg-white text-violet-300"}`}>
                  <StepIcon type={step.icon} />
                </div>
                <p className={`mt-2 whitespace-nowrap text-xs font-semibold sm:text-sm ${index === currentStep ? "text-[#35126d]" : index < currentStep ? "text-violet-600" : "text-slate-400"}`}>{step.label}</p>
              </button>
            ))}
          </div>

          <div className="overflow-hidden rounded-xl border border-violet-100 bg-white shadow-[0_12px_35px_rgba(53,18,109,0.07)]">
            <div className="relative border-b border-violet-100 bg-gradient-to-r from-white via-white to-violet-50 px-4 py-4 sm:px-5">
              <div className="absolute inset-y-0 left-0 w-1 bg-[#35126d]" />
              <h1 className="text-xl font-semibold tracking-tight text-[#35126d]">
              {currentStep === 0 && "Complete your insurance details"}
              {currentStep === 1 && "Tell us about you and your vehicle"}
              {currentStep === 2 && "Review your quote information"}
              {currentStep === 3 && "Choose your payment method"}
              </h1>
            </div>

            {currentStep === 0 ? (
              <div className="bg-[#f8f9fc] p-3 sm:p-4">
                <div className="mb-4 overflow-hidden rounded-2xl bg-[#35126d] text-white shadow-lg shadow-violet-950/10">
                  <div className="grid gap-4 bg-[radial-gradient(circle_at_85%_10%,_rgba(167,139,250,0.55),_transparent_35%)] p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
                    <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-200">Your application journey</p><h2 className="mt-2 text-xl font-semibold">Build your cover, one clear step at a time</h2><p className="mt-1 max-w-xl text-sm leading-6 text-violet-100">Choose a section from the journey map. Your information stays visible in one focused workspace.</p></div>
                    <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/15"><span className="text-3xl font-semibold">0%</span><span className="text-xs leading-4 text-violet-100">Application<br />completed</span></div>
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-[270px_minmax(0,1fr)]">
                  <nav aria-label="Insurance detail sections" className="relative rounded-2xl border border-violet-100 bg-white p-2 shadow-sm">
                    <div className="absolute bottom-8 left-[29px] top-8 hidden w-px bg-violet-100 xl:block" />
                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                      {newVehicleSections.map((section, index) => {
                        const isActive = openSection === section.title;
                        return <button key={section.title} type="button" onClick={() => setOpenSection(section.title)} aria-current={isActive ? "step" : undefined} className={`group relative flex items-center gap-3 rounded-xl p-3 text-left transition ${isActive ? "bg-[#35126d] text-white shadow-md shadow-violet-900/15" : "text-slate-600 hover:bg-violet-50 hover:text-[#35126d]"}`}>
                          <span className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${isActive ? "bg-white/15 text-white" : "bg-violet-50 text-violet-600 ring-1 ring-violet-100 group-hover:bg-white"}`}><SectionIcon title={section.title} /></span>
                          <span className="min-w-0 flex-1"><span className={`block text-[10px] font-bold uppercase tracking-widest ${isActive ? "text-violet-200" : "text-slate-400"}`}>Section {String(index + 1).padStart(2, "0")}</span><span className="mt-0.5 block truncate text-sm font-semibold">{section.title}</span></span>
                          {section.alert ? <span className={`h-2 w-2 shrink-0 rounded-full ${isActive ? "bg-amber-300" : "bg-red-500"}`} /> : <svg viewBox="0 0 20 20" className={`h-4 w-4 shrink-0 ${isActive ? "text-violet-200" : "text-slate-300"}`} fill="none" stroke="currentColor" strokeWidth="2"><path d="m7 4 6 6-6 6" /></svg>}
                        </button>;
                      })}
                    </div>
                  </nav>

                  {newVehicleSections.map((section) => openSection === section.title ? (
                    <section key={section.title} className="min-w-0 overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm">
                      <div className="flex flex-col gap-3 border-b border-violet-100 bg-gradient-to-r from-violet-50/80 to-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                        <div className="flex items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#35126d] shadow-sm ring-1 ring-violet-100"><SectionIcon title={section.title} /></span><div><h3 className="font-semibold text-slate-900 sm:text-lg">{section.title}</h3><p className="mt-0.5 text-xs text-slate-500 sm:text-sm">{sectionDescriptions[section.title]}</p></div></div>
                        {section.pending ? <span className="self-start rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 ring-1 ring-red-100 sm:self-auto">{section.pending}</span> : <span className="self-start rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100 sm:self-auto">Ready to complete</span>}
                      </div>
                      <div className="overflow-x-auto p-3 sm:p-4">
                        {section.title === "KYC" ? <ClientDetailsForm /> : section.title === "Policy Details" ? <MotorProposalForm /> : section.title === "Vechicle Details" ? <VehicleProposalForm policyCover={policyCover} onPolicyCoverChange={setPolicyCover} /> : section.title === "Trailers & Others" ? <TrailersAndOthersForm /> : section.title === "Accessories" ? <AccessoriesForm /> : section.title === "General Information" ? <GeneralInformationForm /> : section.title === "Common Det." ? <CommonDetailsForm /> : section.title === "Premium" ? <PremiumForm /> : <AttachedDocumentForm />}
                      </div>
                    </section>
                  ) : null)}
                </div>
              </div>
            ) : null}

            {currentStep === 1 ? (
              <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6">
                <label className="text-sm font-semibold text-slate-700">Full name
                  <input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Enter policyholder name" className="mt-2 w-full border border-slate-300 bg-violet-50/30 px-4 py-3 font-normal outline-none transition focus:border-[#35126d] focus:ring-2 focus:ring-violet-100" />
                </label>
                <label className="text-sm font-semibold text-slate-700">Vehicle registration number
                  <input value={registration} onChange={(event) => setRegistration(event.target.value)} placeholder="Enter registration number" className="mt-2 w-full border border-slate-300 bg-violet-50/30 px-4 py-3 font-normal uppercase outline-none transition focus:border-[#35126d] focus:ring-2 focus:ring-violet-100" />
                </label>
              </div>
            ) : null}

            {currentStep === 2 ? (
              <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-6">
                {[{ label: "Insurance type", value: "New vehicle" }, { label: "Policyholder", value: fullName }, { label: "Registration", value: registration.toUpperCase() }].map((item) => (
                  <div key={item.label} className="border-l-4 border-[#35126d] bg-violet-50 p-5"><p className="text-xs font-bold uppercase tracking-wider text-violet-500">{item.label}</p><p className="mt-2 font-semibold text-slate-900">{item.value}</p></div>
                ))}
              </div>
            ) : null}

            {currentStep === 3 ? (
              <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6">
                <label className="flex cursor-pointer items-center gap-4 border border-violet-200 bg-violet-50 p-5"><input type="radio" name="payment" defaultChecked className="h-5 w-5 accent-[#35126d]" /><span className="font-semibold text-[#35126d]">Credit or debit card</span></label>
                <label className="flex cursor-pointer items-center gap-4 border border-violet-200 p-5"><input type="radio" name="payment" className="h-5 w-5 accent-[#35126d]" /><span className="font-semibold text-[#35126d]">Internet banking</span></label>
              </div>
            ) : null}

            <div className="flex items-center justify-between border-t border-violet-100 bg-[#faf9fd] px-6 py-4">
              <button type="button" disabled={currentStep === 0} onClick={() => setCurrentStep((step) => Math.max(0, step - 1))} className="border border-violet-300 px-6 py-3 text-sm font-semibold text-[#35126d] transition hover:bg-violet-50 disabled:invisible">Back</button>
              <button type="button" disabled={currentStep === 1 && !detailsComplete} onClick={currentStep < 3 ? advanceStep : undefined} className="rounded-xl bg-[#35126d] px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-lg shadow-violet-900/15 transition hover:-translate-y-0.5 hover:bg-violet-800 disabled:cursor-not-allowed disabled:bg-slate-300">{currentStep === 3 ? "Proceed to pay" : "Continue"}</button>
            </div>
          </div>
        </section>

        <aside className="self-start overflow-hidden rounded-xl border border-violet-100 bg-white shadow-[0_12px_35px_rgba(53,18,109,0.06)] lg:sticky lg:top-3">
          <div className="border-b border-violet-100 bg-gradient-to-br from-violet-50 to-white px-4 py-4">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#5b3aa4] shadow-sm ring-1 ring-violet-100">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3v11m0 0 4-4m-4 4-4-4M5 19h14" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-500">Resources</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">Policy downloads</h2>
              </div>
            </div>
            <p className="mt-2 text-sm leading-5 text-slate-500">Forms, policy documents and helpful motor insurance guides.</p>
            <div className={`mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${policyCover ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100" : "bg-amber-50 text-amber-700 ring-1 ring-amber-100"}`}>
              <span className={`h-2 w-2 rounded-full ${policyCover ? "bg-emerald-500" : "bg-amber-500"}`} />
              {policyCover || "Select a cover in Vehicle Details"}
            </div>
          </div>
          <ul className="space-y-1 p-2">
            {availableDownloads.map((item, index) => (
              <li key={item.href}>
                <a href={item.href} download className="group flex items-start gap-3 rounded-lg px-3 py-2.5 transition hover:bg-violet-50">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-[10px] font-bold text-[#5b3aa4] ring-1 ring-slate-200 transition group-hover:bg-white group-hover:ring-violet-200">PDF</span>
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
    </main>
  );
}
