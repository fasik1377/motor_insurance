"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AuthError, AuthIcon, AuthShell, RobotCheck, authButtonClass, authInputClass } from "../_components/auth-shell";

function MobileContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [mobile, setMobile] = useState("");
  const [robotChecked, setRobotChecked] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const previousContact = params.get("contact") ?? "your verified contact";

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = mobile.trim();
    if (!robotChecked || !value) return;
    setSending(true); setError("");
    try { const response=await fetch("/api/auth/otp",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contact:value,type:"mobile"})}),data=await response.json();if(!response.ok)throw new Error(data.error||"Unable to send code.");router.push(`/otp?type=mobile&contact=${encodeURIComponent(value)}&next=profile`); } catch(reason){setError(reason instanceof Error?reason.message:"Unable to send code.");setSending(false);}
  };

  return (
    <AuthShell
      eyebrow="Add mobile number"
      title="Mobile sign-in"
      description={<>
        Enter the mobile number you want linked to your account.
        <span className="mx-auto mt-3 flex w-fit max-w-full items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
          <AuthIcon name="check" className="h-3.5 w-3.5 flex-shrink-0" /><span className="truncate">Verified: {previousContact}</span>
        </span>
      </>}
      heroTitle="Keep your policy within easy reach."
      heroText="Add your mobile number for secure policy updates and quick access whenever you need it."
      step={{ current: 3, total: 4, label: "Mobile number" }}
      footnote="We’ll verify this number before creating your profile."
    >
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-slate-700">Mobile number
          <span className="relative mt-2 block">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><AuthIcon name="phone" /></span>
            <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+60 12 345 6789" autoComplete="tel" className={authInputClass} />
          </span>
        </label>
        <RobotCheck checked={robotChecked} onChange={setRobotChecked} />
        <AuthError message={error} />
        <button type="submit" disabled={sending || !robotChecked || !mobile.trim()} className={authButtonClass}>
          {sending ? "Sending code..." : <>Send mobile OTP <AuthIcon name="arrow" className="h-4 w-4 transition group-hover:translate-x-0.5" /></>}
        </button>
      </form>
    </AuthShell>
  );
}

export default function MobilePage() {
  return <Suspense fallback={<div className="flex h-dvh items-center justify-center bg-[#eef0ff] text-slate-700">Loading…</div>}><MobileContent /></Suspense>;
}
