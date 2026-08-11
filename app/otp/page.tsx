"use client";

import Image from "next/image";
import { Suspense, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function OTPContent() {
  const router = useRouter();
  const params = useSearchParams();
  const contact = params.get("contact") ?? "your contact";
  const isEmail = params.get("type") === "email";
  const isMobileConfirmation = params.get("next") === "profile";
  const [otp, setOtp] = useState(Array(6).fill("") as string[]);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  const changeDigit = (value: string, index: number) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setOtp((current) => current.map((item, position) => position === index ? digit : item));
    if (digit && index < 5) inputs.current[index + 1]?.focus();
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (otp.join("").length !== 6) return;
    router.push(isMobileConfirmation ? `/profile?mobile=${encodeURIComponent(contact)}` : `/mobile?contact=${encodeURIComponent(contact)}`);
  };

  return (
    <main className="grid h-dvh overflow-hidden bg-[#eef0ff] lg:grid-cols-[1.15fr_0.85fr]">
      <section className="relative hidden overflow-hidden bg-[#27105f] text-white lg:block">
        <Image src="/images/login_car.jpg" alt="Insured car on the road" fill priority className="auth-hero-image object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#28135f]/95 via-[#412484]/80 to-slate-950/45" />
        <div className="relative flex h-full flex-col justify-center px-[8%]">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-violet-200">Secure verification</p>
          <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-tight xl:text-5xl">One quick check. Complete peace of mind.</h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-white/75 xl:text-base">Use the six-digit code sent to your {isEmail ? "email address" : "mobile number"} to continue safely.</p>
          <div className="mt-8 border-l-2 border-violet-300/70 pl-4 text-sm text-white/80">{isMobileConfirmation ? "Final verification before profile setup" : "Identity verification in progress"}</div>
        </div>
      </section>

      <section className="flex h-full items-center justify-center px-5 py-4 sm:px-10">
        <div className="w-full max-w-md border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.1)] sm:p-8">
          <Image src="/images/logo.png" alt="New India Assurance logo" width={220} height={70} priority className="mx-auto h-14 w-auto object-contain" />
          <div className="mt-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#412484]">{isMobileConfirmation ? "Mobile verification" : "Verification"}</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">{isEmail ? "Verify your email" : "Verify your mobile"}</h2>
            <p className="mt-2 text-sm leading-5 text-slate-500">Enter the six-digit code sent to <span className="font-semibold text-slate-700">{contact}</span>.</p>
          </div>
          <form onSubmit={submit} className="mt-6">
            <label className="text-sm font-medium text-slate-700">Enter OTP</label>
            <div className="mt-2 grid grid-cols-6 gap-2">
              {otp.map((digit, index) => <input key={index} ref={(node) => { inputs.current[index] = node; }} aria-label={`OTP digit ${index + 1}`} inputMode="numeric" maxLength={1} value={digit} onChange={(e) => changeDigit(e.target.value, index)} onKeyDown={(e) => { if (e.key === "Backspace" && !digit && index > 0) inputs.current[index - 1]?.focus(); }} className="h-12 min-w-0 border border-slate-300 bg-slate-50 text-center text-lg font-semibold text-slate-900 outline-none focus:border-[#412484] focus:ring-2 focus:ring-[#412484]/15" />)}
            </div>
            <button type="submit" disabled={otp.join("").length !== 6} className="mt-5 h-12 w-full bg-[#412484] text-sm font-semibold text-white transition hover:bg-[#321b70] disabled:cursor-not-allowed disabled:bg-slate-300">Verify and continue</button>
          </form>
          <p className="mt-4 text-center text-xs text-slate-400">Didn’t receive it? You can request a new code in 30 seconds.</p>
        </div>
      </section>
    </main>
  );
}

export default function OTPPage() {
  return <Suspense fallback={<div className="flex h-dvh items-center justify-center bg-[#eef0ff] text-slate-700">Loading…</div>}><OTPContent /></Suspense>;
}
