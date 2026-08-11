"use client";

import Image from "next/image";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function MobileContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [mobile, setMobile] = useState("");
  const [robotChecked, setRobotChecked] = useState(false);
  const previousContact = params.get("contact") ?? "your verified contact";

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = mobile.trim();
    if (!robotChecked || !value) return;
    router.push(`/otp?type=mobile&contact=${encodeURIComponent(value)}&next=profile`);
  };

  return (
    <main className="grid h-dvh overflow-hidden bg-[#eef0ff] lg:grid-cols-[1.15fr_0.85fr]">
      <section className="relative hidden overflow-hidden bg-[#27105f] text-white lg:block">
        <Image src="/images/login_car.jpg" alt="Insured car on the road" fill priority className="auth-hero-image object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#28135f]/95 via-[#35126d]/78 to-slate-950/45" />
        <div className="relative flex h-full flex-col justify-center px-[8%]">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-violet-200">Mobile verification</p>
          <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-tight xl:text-5xl">Keep your policy within easy reach.</h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-white/75 xl:text-base">Add your mobile number for secure policy updates and quick access whenever you need it.</p>
          <div className="mt-8 border-l-2 border-violet-300/70 pl-4 text-sm text-white/80">Next: verify your mobile with a one-time passcode</div>
        </div>
      </section>

      <section className="flex h-full items-center justify-center px-5 py-4 sm:px-10">
        <div className="w-full max-w-md border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.1)] sm:p-8">
          <Image src="/images/logo.png" alt="New India Assurance logo" width={220} height={70} priority className="mx-auto h-14 w-auto object-contain" />
          <div className="mt-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#412484]">Add mobile number</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Mobile sign-in</h2>
            <p className="mt-2 text-sm leading-5 text-slate-500">Enter the mobile number you want linked to your account.</p>
            <p className="mt-2 truncate text-xs text-slate-400">Verified: {previousContact}</p>
          </div>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-slate-700">Mobile number
              <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+60 12 345 6789" className="mt-2 h-12 w-full border border-slate-300 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-[#412484] focus:ring-2 focus:ring-[#412484]/15" />
            </label>
            <label className="flex cursor-pointer items-center gap-3 border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 hover:border-[#412484]">
              <input type="checkbox" checked={robotChecked} onChange={(e) => setRobotChecked(e.target.checked)} className="h-5 w-5 accent-[#412484]" />
              <span><span className="block font-semibold text-slate-900">I am not a robot</span><span className="text-xs text-slate-500">Confirm your identity to continue.</span></span>
            </label>
            <button type="submit" disabled={!robotChecked || !mobile.trim()} className="h-12 w-full bg-[#412484] text-sm font-semibold text-white transition hover:bg-[#321b70] disabled:cursor-not-allowed disabled:bg-slate-300">Send mobile OTP</button>
          </form>
          <p className="mt-4 text-center text-xs text-slate-400">We’ll verify this number before creating your profile.</p>
        </div>
      </section>
    </main>
  );
}

export default function MobilePage() {
  return <Suspense fallback={<div className="flex h-dvh items-center justify-center bg-[#eef0ff] text-slate-700">Loading…</div>}><MobileContent /></Suspense>;
}
