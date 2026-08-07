"use client";

import Image from "next/image";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function MobileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobile, setMobile] = useState("");
  const [robotChecked, setRobotChecked] = useState(false);
  const contact = searchParams.get("contact") ?? "your email";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!robotChecked) return;
    if (!mobile.trim()) return;
    router.push(`/profile?contact=${encodeURIComponent(contact)}`);
  };

  return (
    <div className="min-h-screen bg-[#eef0ff]">
      <main className="mx-auto grid min-h-screen max-w-[1200px] grid-cols-1 items-start gap-10 px-4 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#412484] via-[#3a2394] to-[#1d1051] shadow-2xl">
          <Image src="/images/login_car.jpg" alt="Insured car on the road" fill priority className="auth-hero-image object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#28135f]/95 via-[#35126d]/75 to-slate-950/45" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.2),transparent_45%)]" />
          <div className="relative z-10 flex min-h-[620px] flex-col justify-between gap-8 p-8 md:p-10">
            <div className="rounded-[2rem] bg-white/10 p-8 shadow-[0_40px_120px_rgba(0,0,0,0.18)] ring-1 ring-white/10 sm:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/80">
                New India Assurance
              </p>
              <h1 className="mt-6 text-4xl font-semibold leading-tight text-white sm:text-5xl">
                Secure mobile verification for your policy.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">
                A consistent and polished mobile sign-in experience, designed to align with the email login flow and keep every step clear.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[0.9fr_1fr]">
              <div className="rounded-[2rem] border border-white/15 bg-white/10 p-6 shadow-inner shadow-white/10">
                <span className="inline-flex rounded-full bg-white/10 px-3 py-2 text-xs uppercase tracking-[0.3em] text-white/70">
                  Step 3 • Mobile
                </span>
                <p className="mt-4 text-xl font-semibold text-white">Ready to confirm your number</p>
                <p className="mt-3 text-sm leading-6 text-white/75">
                  Enter your phone number and verify your identity with a single checkbox before continuing to profile setup.
                </p>
              </div>
              <div className="rounded-[2rem] bg-[#5d47bf] p-6 text-white shadow-lg shadow-[#1b0f4d]/30 ring-1 ring-white/10">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-violet-100/90">
                  Brand promise
                </p>
                <h2 className="mt-4 text-3xl font-semibold">Trusted for every journey</h2>
                <p className="mt-4 text-sm leading-6 text-violet-100/85">
                  We keep your mobile sign-in flow seamless, secure, and consistent with the same trusted professionalism as our core services.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-violet-100/90">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-white">✓</span>
                    Secure step-by-step verification
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-white">✓</span>
                    Clean mobile card layout
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/15 text-white">✓</span>
                    Fast continuation to profile setup
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-start justify-center">
          <div className="w-full max-w-3xl rounded-[2rem] bg-white p-10 shadow-[0_40px_120px_rgba(15,23,42,0.12)]">
            <div className="mb-8 flex justify-center">
              <div className="w-full max-w-72">
                <Image src="/images/logo.png" alt="New India Assurance logo" width={280} height={120} className="object-contain" />
              </div>
            </div>
            <div className="mb-8 rounded-[2rem] border border-slate-200 bg-slate-50 p-7 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#412484]">Step 3</p>
              <h2 className="mt-4 text-3xl font-semibold text-slate-900">Mobile sign-in</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Continue your authentication flow with a wide, modern mobile entry card and trusted brand styling.
              </p>
              <p className="mt-4 text-sm text-slate-500">
                Previous contact: <span className="font-semibold text-slate-700">{contact}</span>
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4 rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <label className="block text-sm font-medium text-slate-700">
                  Mobile number
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(event) => setMobile(event.target.value)}
                    placeholder="+601234765890"
                    className="mt-3 w-full rounded-[1.75rem] border border-slate-200 bg-white px-4 py-4 text-sm text-slate-900 outline-none transition focus:border-[#412484] focus:ring-2 focus:ring-[#412484]/20"
                  />
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-[1.75rem] border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700 transition hover:border-[#412484]">
                  <input
                    type="checkbox"
                    checked={robotChecked}
                    onChange={(event) => setRobotChecked(event.target.checked)}
                    className="h-5 w-5 rounded border-slate-300 text-[#412484] focus:ring-[#412484]"
                  />
                  <div>
                    <p className="font-semibold text-slate-900">I am not a robot</p>
                    <p className="text-xs text-slate-500">Check this box to confirm your identity.</p>
                  </div>
                </label>
              </div>
              <button
                type="submit"
                disabled={!robotChecked}
                className="w-full rounded-full bg-[#412484] px-4 py-4 text-sm font-semibold text-white transition hover:bg-[#2f1b75] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
              >
                Continue
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function MobilePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#eef0ff] text-slate-700">Loading...</div>}>
      <MobileContent />
    </Suspense>
  );
}
