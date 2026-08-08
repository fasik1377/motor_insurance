"use client";

import Link from "next/link";
import { useState } from "react";

const downloads = [
  "Revised Motor Third party premium rates, effective from 16-06-2019 (3.87 MB)",
  "Indian Motor Tariff - 2002 (1.51 MB)",
  "Claim Consent Form (287.24 KB)",
  "Proposal Form (81.92 KB)",
  "Claim Form (54.78 KB)",
  "Do's and Dont's (37.82 KB)",
  "CIS AROGYA SANJEEVANI POLICY (496.19 KB)",
];

const steps = [
  { label: "Detailed Quote", icon: "quote" },
  { label: "Additional Details", icon: "details" },
  { label: "Summary", icon: "summary" },
  { label: "Payment", icon: "payment" },
];

const newVehicleSections = [
  { title: "Client Details", pending: "7 mandatory fields pending", alert: true, rows: [
    ["Registration No.", "Vehicle registration number"], ["Make", "Vehicle manufacturer"], ["Model", "Vehicle model"], ["Engine No.", "Engine identification number"], ["Chassis No.", "Chassis identification number"], ["Colour", "Vehicle colour"], ["Year Mfg. & Date of Reg.", "Manufacturing year and registration date"], ["Seating", "Full count for seats and students"], ["CC / kW", "Engine capacity or power"], ["Gross Vehicle Weight", "Registered gross vehicle weight"], ["Trailer Ft.", "Trailer measurement, if applicable"], ["Remarks", "Additional vehicle remarks"],
  ] },
  { title: "Motor Proposal", pending: "3 mandatory fields pending", alert: true, rows: [
    ["Cover Required", "Selected motor cover"], ["Sum Insured", "Declared sum insured"], ["Voluntary Excess Amount", "Selected voluntary excess"], ["Young Driver Excess", "Applicable young driver excess"], ["Compulsory Excess", "Mandatory policy excess"], ["TPF Excess", "Third-party fire excess"], ["TPPD Excess", "Third-party property damage excess"], ["Additional Excess", "Any additional excess amount"], ["Theft Excess", "Applicable theft excess"], ["Total Loss Excess", "Applicable total-loss excess"], ["Approved Discount Request", "Approved discount reference, if available"],
  ] },
  { title: "Policy Period", rows: [
    ["Country", "Mauritius"], ["Vehicle Type", "Selected vehicle type"], ["Fuel Type", "Vehicle fuel type"], ["Class", "Motor policy class"], ["Vehicle Status", "New or existing vehicle"], ["Issue Date", "Policy issue date and time"], ["From", "Policy commencement date"], ["To", "Policy expiry date"], ["Agent", "Issuing agent details"], ["Client", "Client master record"], ["Lien", "Lienholder details, if applicable"], ["Policy Risk", "Standard or selected risk"],
  ] },
  { title: "Get Protection for Accessories", rows: [
    ["Radio", "Electrical selection, make/model, rate, amount and premium"], ["Cassette Player", "Electrical selection, make/model and value"], ["Sunvisor", "Accessory selection and value"], ["Roof Rack", "Accessory selection and value"], ["Aerial", "Accessory selection and value"], ["Special Petrol Cap", "Accessory selection and value"], ["Spot and/or Foglights", "Electrical selection, make/model and value"], ["Cushion Cover & Mats", "Accessory selection and value"], ["Back Sensor", "Electrical selection, make/model and value"], ["Body Kit", "Front/rear body-kit protection"], ["Cassette and CD Player", "Electrical selection, make/model and value"], ["CD Player", "Electrical selection, make/model and value"], ["Ceramic Coating", "Accidental damage protection"], ["DVD Player", "Electrical selection, make/model and value"], ["Electrical Central Door Locking", "Electrical selection, make/model and value"], ["Exhaust Pipe", "Accessory selection and value"], ["Fender", "Accessory selection and value"],
  ] },
  { title: "Additional Discounts", rows: [
    ["No Claim Bonus", "Rate percentage and discount amount"], ["Fleet Discount", "Rate percentage and discount amount"], ["Special Discount", "Rate percentage and discount amount"], ["Claim Loading", "Rate percentage and loading amount"], ["Get Discount %", "Calculate and apply eligible discount"], ["Policy Remarks for Agent", "Agent discount remarks"], ["Remarks for Other Loading", "Additional loading remarks"],
  ] },
  { title: "Additional Covers (Optional)", rows: [
    ["Passenger Risk", "Optional passenger-risk cover"], ["Personal Accident", "Personal accident protection"], ["PA (Conductor)", "Personal accident cover for conductor"], ["PA (Employee)", "Personal accident cover for employee"], ["PA (Family Members)", "Personal accident cover for family members"], ["Auto Plus", "Optional Auto Plus cover"], ["Driver Only", "Named-driver protection"], ["Loss of Use", "Loss-of-use benefit"], ["Towing", "Towing expense cover"], ["Strike, Riot and Civil Commotion", "Additional peril protection"], ["Earthquake", "Earthquake protection"], ["Cyclone", "Cyclone protection"], ["Windscreen Extension", "Extended windscreen cover"], ["Waiver of Excess", "Optional excess waiver"], ["Loss of Car Keys", "Replacement car-key cover"], ["Airfreight Expenses", "Airfreight expense protection"], ["Personal Belongings", "Personal belongings in vehicle"], ["Damage by Rodents", "Rodent-damage protection"], ["Accidental Misfuelling", "Misfuelling expense cover"], ["Enhanced Personal Accidental", "Enhanced personal accident benefit"], ["Funeral Expenses", "Funeral expense benefit"],
  ] },
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

function VehicleIcon({ renewal }: { renewal?: boolean }) {
  return (
    <div className="relative flex h-16 w-20 items-end justify-center">
      <svg viewBox="0 0 72 52" className={`h-14 w-20 ${renewal ? "text-[#2878ad]" : "text-[#c58a19]"}`} fill="none" stroke="currentColor" strokeWidth="2.4">
        {renewal ? <><circle cx="18" cy="14" r="7" fill="currentColor" /><path d="M10 39V27c0-5 4-9 9-9s9 4 9 9v12M14 26l5 4 5-4M19 30v7" fill="currentColor" /></> : <><path d="M3 35h7l5-12h24l9 12h8v9H3z" /><circle cx="16" cy="44" r="5" fill="white" /><circle cx="44" cy="44" r="5" fill="white" /><path d="M17 23l5-8h16l8 8" /></>}
        <path d="M38 5h23l7 7v34H38z" fill="white" stroke="#a5a5a5" />
        <path d="M61 5v8h7" stroke="#a5a5a5" />
        <circle cx="52" cy="28" r="8" stroke={renewal ? "#00a78e" : "#00a78e"} />
        {renewal ? <path d="M48 25a5 5 0 1 1 0 7M47 22v5h5M57 34v-5h-5" stroke="#00a78e" /> : <path d="m52 34-4 6-1-6-6-1 5-4M52 34l4 6 1-6 6-1-5-4" stroke="#00a78e" />}
      </svg>
    </div>
  );
}

function ClientDetailsForm() {
  const inputClass = "w-full border border-violet-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-[#35126d] focus:ring-2 focus:ring-violet-100";
  const labelClass = "text-xs font-semibold text-slate-600";

  return (
    <div className="border border-violet-200 bg-[#f7f5fb]">
      <div className="grid grid-cols-3 border-b border-violet-200 text-center text-xs font-semibold text-[#35126d]">
        <button type="button" className="border-r border-violet-200 bg-white px-3 py-3 shadow-[inset_0_-3px_0_#35126d]">Client Info (KYC)</button>
        <button type="button" className="border-r border-violet-200 px-3 py-3 hover:bg-white">AML Approval Authority</button>
        <button type="button" className="px-3 py-3 hover:bg-white">Documents</button>
      </div>

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

      <div className="grid grid-cols-2 gap-2 border-y border-violet-200 bg-white p-3 sm:grid-cols-5">
        {["Save", "Print", "Print All", "CDD", "Exit"].map((action) => <button key={action} type="button" className="border border-violet-200 bg-violet-50 px-3 py-3 text-sm font-semibold text-[#35126d] transition hover:bg-violet-100">{action}</button>)}
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
      <div className="flex overflow-x-auto border-b border-violet-200 bg-violet-50 text-xs font-semibold text-[#35126d]">
        {["Policy", "Vehicle", "Trailers & Others", "Accessory", "Gen. Info", "Comm Det", "Premium", "Attach Documents"].map((tab, index) => <button key={tab} type="button" className={`shrink-0 border-r border-violet-200 px-4 py-3 ${index === 0 ? "bg-white shadow-[inset_0_-3px_0_#35126d]" : "hover:bg-white"}`}>{tab}</button>)}
      </div>
      <div className="grid lg:grid-cols-[minmax(0,1.8fr)_minmax(300px,1fr)]">
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
        <aside className="bg-white p-4 sm:p-6">
          <h3 className="border-b border-violet-100 pb-3 text-center text-sm font-bold uppercase tracking-wider text-[#35126d]">Print New Documents</h3>
          <div className="mt-4 grid grid-cols-3 gap-x-3 gap-y-4">{documents.map((document, index) => <label key={document} className="flex items-center gap-2 text-xs text-violet-700"><input type="radio" name="print-document" defaultChecked={index === 0} className="accent-[#35126d]" />{document}</label>)}</div>
          <div className="mt-6 grid grid-cols-3 gap-2">{actions.map((action) => <button key={action} type="button" className="min-h-16 border border-violet-200 bg-violet-50 px-2 py-3 text-xs font-semibold text-[#35126d] transition hover:bg-violet-100">{action}</button>)}</div>
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
  const [openSection, setOpenSection] = useState<string | null>("Client Details");
  const detailsComplete = Boolean(registration.trim() && fullName.trim());

  const advanceStep = () => {
    if (currentStep === 0) setCurrentStep(1);
    if (currentStep === 1 && detailsComplete) setCurrentStep(2);
    if (currentStep === 2) setCurrentStep(3);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#f4efff_0,_#f5f7fb_42%,_#eef1f7_100%)] font-sans text-slate-700">
      <div className="border-b border-white/80 bg-white/90 px-5 py-4 shadow-sm backdrop-blur">
        <nav className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-3 text-sm font-semibold">
          <Link href="/dashboard" className="text-[#175b9d] hover:underline">My Dashboard</Link>
          <span className="text-slate-500">&gt;</span>
          <span className="text-[#175b9d]">Private Car</span>
          <span className="text-slate-500">&gt;</span>
          <span className="font-normal text-[#6d2c7d]">Buy Online</span>
        </nav>
      </div>

      <div className="mx-auto max-w-[1500px] px-4 pt-8 lg:px-5">
        <div className="relative overflow-hidden rounded-[2rem] border border-violet-100 bg-white px-7 py-8 text-slate-900 shadow-[0_20px_55px_rgba(53,18,109,0.10)] sm:px-10">
          <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border-[42px] border-violet-50" />
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-[#35126d] via-violet-400 to-sky-400" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#6542a4]">Motor insurance</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Protect your new vehicle</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">Build your cover online with a guided quote, clear options, and secure payment.</p>
            </div>
            <div className="hidden rounded-2xl bg-violet-50 p-3 ring-1 ring-violet-100 sm:block"><VehicleIcon /></div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1500px] gap-8 px-4 py-8 lg:grid-cols-[minmax(0,2.1fr)_minmax(300px,0.72fr)] lg:px-5">
        <section>
          <div className="relative mb-6 grid grid-cols-4 overflow-x-auto rounded-2xl border border-white bg-white/90 px-2 py-5 shadow-[0_12px_35px_rgba(53,18,109,0.08)] sm:px-5">
            <div className="absolute left-[12.5%] right-[12.5%] top-10 h-0.5 bg-violet-200" />
            <div className="absolute left-[12.5%] top-10 h-0.5 bg-[#35126d] transition-all duration-500" style={{ width: `${currentStep * 25}%` }} />
            {steps.map((step, index) => (
              <button key={step.label} type="button" disabled={index > currentStep} onClick={() => index < currentStep && setCurrentStep(index)} className="relative z-10 flex min-w-[110px] flex-col items-center text-center disabled:cursor-default">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${index <= currentStep ? "border-[#35126d] bg-[#35126d] text-white shadow-lg shadow-violet-900/20" : "border-violet-200 bg-white text-violet-300"}`}>
                  <StepIcon type={step.icon} />
                </div>
                <p className={`mt-2 whitespace-nowrap text-xs font-semibold sm:text-sm ${index === currentStep ? "text-[#35126d]" : index < currentStep ? "text-violet-600" : "text-slate-400"}`}>{step.label}</p>
              </button>
            ))}
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-white bg-white shadow-[0_20px_60px_rgba(53,18,109,0.10)]">
            <div className="border-b border-violet-100 bg-white px-6 py-5 sm:px-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-500">New vehicle cover</p>
              <h2 className="mt-1 text-xl font-semibold text-[#35126d]">
              {currentStep === 0 && "Complete your insurance details"}
              {currentStep === 1 && "Tell us about you and your vehicle"}
              {currentStep === 2 && "Review your quote information"}
              {currentStep === 3 && "Choose your payment method"}
              </h2>
            </div>

            {currentStep === 0 ? (
              <div className="space-y-3 bg-[#f8f7fc] p-3 sm:p-6">
                  {newVehicleSections.map((section) => {
                    const isOpen = openSection === section.title;
                    return (
                      <div key={section.title} className="overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm">
                        <button type="button" onClick={() => setOpenSection(isOpen ? null : section.title)} aria-expanded={isOpen} className={`flex w-full items-center gap-3 px-5 py-4 text-left transition ${isOpen ? "bg-violet-50 text-[#35126d] shadow-[inset_4px_0_0_#35126d]" : "bg-white text-slate-700 hover:bg-slate-50"}`}>
                          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold ${section.alert ? "text-red-600" : "text-emerald-600"}`}>{section.alert ? "!" : "✓"}</span>
                          <span className="min-w-0 flex-1 text-sm font-semibold sm:text-base">{section.title}</span>
                          {section.pending ? <span className="hidden rounded-full bg-red-700 px-3 py-1 text-xs font-bold text-white sm:inline-flex">{section.pending}</span> : null}
                          <span className={`text-2xl font-semibold leading-none transition-transform ${isOpen ? "rotate-45" : ""}`}>+</span>
                        </button>
                        <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                          <div className="overflow-hidden">
                            <div className="overflow-x-auto p-4">
                              {section.pending ? <p className="mb-3 text-xs font-semibold text-red-700 sm:hidden">{section.pending}</p> : null}
                              {section.title === "Client Details" ? <ClientDetailsForm /> : section.title === "Motor Proposal" ? <MotorProposalForm /> : <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                                <thead><tr className="bg-violet-50 text-[#35126d]"><th className="border border-violet-200 px-4 py-3">Field</th><th className="border border-violet-200 px-4 py-3">Information required</th><th className="border border-violet-200 px-4 py-3">Status</th></tr></thead>
                                <tbody>
                                  {section.rows.map(([field, information]) => (
                                    <tr key={field} className="transition hover:bg-violet-50/50"><td className="border border-violet-100 px-4 py-3 font-semibold text-slate-800">{field}</td><td className="border border-violet-100 px-4 py-3 text-slate-600">{information}</td><td className="border border-violet-100 px-4 py-3"><span className="inline-flex bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">To be completed</span></td></tr>
                                  ))}
                                </tbody>
                              </table>}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : null}

            {currentStep === 1 ? (
              <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-10">
                <label className="text-sm font-semibold text-slate-700">Full name
                  <input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Enter policyholder name" className="mt-2 w-full border border-slate-300 bg-violet-50/30 px-4 py-3 font-normal outline-none transition focus:border-[#35126d] focus:ring-2 focus:ring-violet-100" />
                </label>
                <label className="text-sm font-semibold text-slate-700">Vehicle registration number
                  <input value={registration} onChange={(event) => setRegistration(event.target.value)} placeholder="Enter registration number" className="mt-2 w-full border border-slate-300 bg-violet-50/30 px-4 py-3 font-normal uppercase outline-none transition focus:border-[#35126d] focus:ring-2 focus:ring-violet-100" />
                </label>
              </div>
            ) : null}

            {currentStep === 2 ? (
              <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-10">
                {[{ label: "Insurance type", value: "New vehicle" }, { label: "Policyholder", value: fullName }, { label: "Registration", value: registration.toUpperCase() }].map((item) => (
                  <div key={item.label} className="border-l-4 border-[#35126d] bg-violet-50 p-5"><p className="text-xs font-bold uppercase tracking-wider text-violet-500">{item.label}</p><p className="mt-2 font-semibold text-slate-900">{item.value}</p></div>
                ))}
              </div>
            ) : null}

            {currentStep === 3 ? (
              <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-10">
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

        <aside className="self-start overflow-hidden rounded-[2rem] border border-violet-100 bg-white shadow-[0_20px_55px_rgba(53,18,109,0.10)] lg:sticky lg:top-6">
          <div className="border-b border-slate-100 bg-gradient-to-r from-violet-50 to-white px-6 py-6">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#5b3aa4] shadow-sm ring-1 ring-violet-100">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3v11m0 0 4-4m-4 4-4-4M5 19h14" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-500">Resources</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">Policy downloads</h2>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-500">Forms, policy documents and helpful motor insurance guides.</p>
          </div>
          <ul className="space-y-2 p-3">
            {downloads.map((item) => (
              <li key={item}>
                <a href="#" className="group flex items-start gap-3 rounded-xl px-3 py-3 transition hover:bg-violet-50">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-[10px] font-bold text-[#5b3aa4] ring-1 ring-slate-200 transition group-hover:bg-white group-hover:ring-violet-200">PDF</span>
                  <span className="min-w-0 flex-1 text-sm leading-5 text-slate-600 transition group-hover:text-[#412484]">{item}</span>
                  <svg viewBox="0 0 24 24" className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-y-0.5 group-hover:text-violet-500" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 4v11m0 0 4-4m-4 4-4-4M5 20h14" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </a>
              </li>
            ))}
          </ul>
          <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-4">
            <p className="text-xs leading-5 text-slate-400">PDF documents open in a new window for easy viewing and printing.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
