"use client";

import { Suspense, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AuthError, AuthIcon, AuthShell, authButtonClass } from "../_components/auth-shell";

function OTPContent() {
  const router = useRouter();
  const params = useSearchParams();
  const contact = (params.get("contact") ?? "your contact").replace(params.get("type") === "email" ? /$^/ : /[\s()-]/g, "");
  const isEmail = params.get("type") === "email";
  const isMobileConfirmation = params.get("next") === "profile";
  const [otp, setOtp] = useState(Array(6).fill("") as string[]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  const changeDigit = (value: string, index: number) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setOtp((current) => current.map((item, position) => position === index ? digit : item));
    if (digit && index < 5) inputs.current[index + 1]?.focus();
  };

  // Pasting the whole 6-digit code fills every box.
  const pasteCode = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const digits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (digits.length < 2) return;
    event.preventDefault();
    setOtp(Array.from({ length: 6 }, (_, index) => digits[index] ?? ""));
    inputs.current[Math.min(digits.length, 5)]?.focus();
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (otp.join("").length !== 6) return;
    setSaving(true); setError("");
    try {
      const response = await fetch("/api/auth/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contact, type: isEmail ? "email" : "mobile", code: otp.join("") }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Verification failed.");
      router.push(isMobileConfirmation ? "/profile" : `/mobile?contact=${encodeURIComponent(contact)}`);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Verification failed."); setSaving(false); }
  };

  return (
    <AuthShell
      eyebrow={isMobileConfirmation ? "Mobile verification" : "Verification"}
      title={isEmail ? "Verify your email" : "Verify your mobile"}
      description={<>
        <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-violet-200 text-[#412484] ring-1 ring-violet-200"><AuthIcon name={isEmail ? "mail" : "phone"} className="h-7 w-7" /></span>
        Enter the six-digit code sent to <span className="font-semibold text-slate-700">{contact}</span>.
      </>}
      heroTitle="One quick check. Complete peace of mind."
      heroText={`Use the six-digit code sent to your ${isEmail ? "email address" : "mobile number"} to continue safely.`}
      step={{ current: isMobileConfirmation ? 4 : 2, total: 4, label: isMobileConfirmation ? "Verify mobile" : "Verify code" }}
      footnote={isMobileConfirmation ? "Final verification before profile setup." : "Codes expire after 10 minutes."}
    >
      <form onSubmit={submit} className="mt-6">
        <label className="text-sm font-medium text-slate-700">Enter OTP</label>
        <div className="mt-2 grid grid-cols-6 gap-2">
          {otp.map((digit, index) => <input key={index} ref={(node) => { inputs.current[index] = node; }} aria-label={`OTP digit ${index + 1}`} inputMode="numeric" autoComplete={index === 0 ? "one-time-code" : "off"} maxLength={1} value={digit} onPaste={pasteCode} onChange={(e) => changeDigit(e.target.value, index)} onKeyDown={(e) => { if (e.key === "Backspace" && !digit && index > 0) inputs.current[index - 1]?.focus(); }} className={`h-14 min-w-0 rounded-xl border text-center text-xl font-bold text-slate-900 outline-none transition focus:border-[#412484] focus:bg-white focus:ring-4 focus:ring-[#412484]/10 ${digit ? "border-[#412484]/40 bg-violet-50" : "border-slate-200 bg-slate-50"}`} />)}
        </div>
        <div className="mt-4"><AuthError message={error} /></div>
        <button type="submit" disabled={saving || otp.join("").length !== 6} className={`mt-4 ${authButtonClass}`}>
          {saving ? "Saving..." : <>Verify and continue <AuthIcon name="arrow" className="h-4 w-4 transition group-hover:translate-x-0.5" /></>}
        </button>
      </form>
      <button type="button" onClick={async()=>{setError("");const response=await fetch("/api/auth/otp",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contact,type:isEmail?"email":"mobile"})});const data=await response.json();setError(response.ok?"A new code has been sent.":data.error);}} className="mt-4 w-full text-center text-xs font-semibold text-[#412484] hover:underline">Didn’t receive it? Send a new code</button>
    </AuthShell>
  );
}

export default function OTPPage() {
  return <Suspense fallback={<div className="flex h-dvh items-center justify-center bg-[#eef0ff] text-slate-700">Loading…</div>}><OTPContent /></Suspense>;
}
