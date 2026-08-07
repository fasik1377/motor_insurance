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

export default function RakPolicyPage() {
  const [choice, setChoice] = useState<"new" | "renew" | "">("");
  const [currentStep, setCurrentStep] = useState(0);
  const [registration, setRegistration] = useState("");
  const [fullName, setFullName] = useState("");
  const detailsComplete = Boolean(registration.trim() && fullName.trim());

  const advanceStep = () => {
    if (currentStep === 0 && choice) setCurrentStep(1);
    if (currentStep === 1 && detailsComplete) setCurrentStep(2);
    if (currentStep === 2) setCurrentStep(3);
  };

  return (
    <main className="min-h-screen bg-white font-sans text-slate-700">
      <div className="border-b border-slate-300 px-5 py-3">
        <nav className="flex flex-wrap items-center gap-4 text-sm font-semibold">
          <Link href="/dashboard" className="text-[#175b9d] hover:underline">My Dashboard</Link>
          <span className="text-slate-500">&gt;</span>
          <span className="text-[#175b9d]">Private Car</span>
          <span className="text-slate-500">&gt;</span>
          <span className="font-normal text-[#6d2c7d]">Detailed Quote</span>
        </nav>
      </div>

      <div className="mx-auto grid max-w-[1500px] gap-10 px-4 py-10 lg:grid-cols-[minmax(0,2.1fr)_minmax(320px,1fr)] lg:px-5">
        <section>
          <div className="relative mb-9 grid grid-cols-4 overflow-x-auto rounded-xl border border-violet-100 bg-[#f8f6fc] px-2 py-5 shadow-sm sm:px-5">
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

          <div className="overflow-hidden border border-violet-100 bg-white shadow-[0_20px_60px_rgba(53,18,109,0.1)]">
            <div className="bg-[#35126d] px-5 py-3 text-center text-lg font-medium text-white">
              {currentStep === 0 && "Choose your insurance journey"}
              {currentStep === 1 && "Tell us about you and your vehicle"}
              {currentStep === 2 && "Review your quote information"}
              {currentStep === 3 && "Choose your payment method"}
            </div>

            {currentStep === 0 ? (
              <div className="grid min-h-[260px] grid-cols-2">
                <label className={`group flex cursor-pointer flex-col items-center justify-center gap-4 border-r border-violet-100 px-3 py-8 text-center transition sm:flex-row sm:gap-6 sm:px-5 ${choice === "new" ? "bg-violet-50 ring-2 ring-inset ring-[#35126d]" : "hover:bg-violet-50/50"}`}>
                  <input type="radio" name="policy-choice" value="new" checked={choice === "new"} onChange={() => setChoice("new")} className="h-6 w-6 shrink-0 accent-[#35126d]" />
                  <VehicleIcon />
                  <span className="text-sm font-semibold text-[#35126d] sm:text-lg">Buy insurance for a new vehicle</span>
                </label>
                <label className={`group flex cursor-pointer flex-col items-center justify-center gap-4 px-3 py-8 text-center transition sm:flex-row sm:gap-6 sm:px-5 ${choice === "renew" ? "bg-violet-50 ring-2 ring-inset ring-[#35126d]" : "hover:bg-violet-50/50"}`}>
                  <input type="radio" name="policy-choice" value="renew" checked={choice === "renew"} onChange={() => setChoice("renew")} className="h-6 w-6 shrink-0 accent-[#35126d]" />
                  <VehicleIcon renewal />
                  <span className="text-sm font-semibold text-[#35126d] sm:text-lg">Renew existing policy from any insurer</span>
                </label>
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
                {[{ label: "Insurance type", value: choice === "new" ? "New vehicle" : "Policy renewal" }, { label: "Policyholder", value: fullName }, { label: "Registration", value: registration.toUpperCase() }].map((item) => (
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
              <button type="button" disabled={(currentStep === 0 && !choice) || (currentStep === 1 && !detailsComplete)} onClick={currentStep < 3 ? advanceStep : undefined} className="bg-[#35126d] px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:bg-slate-300">{currentStep === 3 ? "Proceed to pay" : "Continue"}</button>
            </div>
          </div>
        </section>

        <aside className="self-start border border-[#aebbd0] bg-white px-6 py-4">
          <div className="flex items-center gap-4 border-b border-amber-100 pb-3">
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-sky-500" fill="currentColor"><path d="M5 20h14v-2H5v2zm14-9h-4V3H9v8H5l7 7 7-7z" /></svg>
            <h2 className="text-2xl font-normal text-[#8a5b08]">Downloads</h2>
          </div>
          <ul className="space-y-4 py-4">
            {downloads.map((item) => (
              <li key={item}><a href="#" className="text-sm leading-6 text-[#2876c7] transition hover:text-[#174e88] hover:underline">{item}</a></li>
            ))}
          </ul>
        </aside>
      </div>
    </main>
  );
}
