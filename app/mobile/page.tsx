"use client";

import Image from "next/image";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function MobileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobile, setMobile] = useState("");
  const contact = searchParams.get("contact") ?? "your email";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!mobile.trim()) return;
    router.push(`/profile?contact=${encodeURIComponent(contact)}`);
  };

  return (
    <div className="min-h-screen bg-[#eef0ff]">
      <main className="mx-auto grid min-h-screen max-w-350 grid-cols-1 items-start gap-10 px-4 py-10 lg:grid-cols-[0.95fr_0.65fr] lg:px-8">
        <section className="relative overflow-hidden rounded-4xl bg-[#412484] shadow-2xl">
          <div className="relative flex h-full min-h-130 items-center justify-center overflow-hidden rounded-4xl px-6 py-8 md:px-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.24),rgba(255,255,255,0)_35%)]" />
            <div className="relative z-10 flex w-full max-w-3xl flex-col gap-10 text-white">
              <div className="rounded-4xl bg-white/10 p-8 shadow-[0_40px_120px_rgba(0,0,0,0.14)] ring-1 ring-white/20 sm:p-10">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/80">
                  Motor Insurance Service
                </p>
                <h1 className="mt-6 text-4xl font-semibold leading-tight text-white sm:text-5xl">
                  Continue with your mobile number in a clean verification flow.
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">
                  This final screen previews the mobile sign-up or log-in step following the email and OTP experience.
                </p>
              </div>
              <div className="rounded-4xl bg-white/10 p-6 text-white shadow-inner shadow-white/10">
                <p className="text-xl font-semibold">Step 3 preview</p>
                <p className="mt-3 text-sm leading-6 text-white/75">
                  The form is intentionally visual only and does not submit any real data.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-start justify-start">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 shadow-xl shadow-slate-200/60">
            <div className="mb-8 flex justify-center">
              <div className="w-full max-w-70">
                <Image src="/images/logo.png" alt="New India Assurance logo" width={280} height={120} className="object-contain" />
              </div>
            </div>
            <div className="mb-8 rounded-4xl border border-slate-200 bg-slate-50 p-5 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#412484]">Step 3</p>
              <h2 className="mt-4 text-3xl font-semibold text-slate-900">Sign up or log in with mobile</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                You have completed the email and OTP part. This is the mobile step for your front-end experience.
              </p>
              <p className="mt-4 text-sm text-slate-500">
                Previous contact: <span className="font-semibold text-slate-700">{contact}</span>
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <label className="block text-sm font-medium text-slate-700">
                Mobile number
                <input
                  type="tel"
                  value={mobile}
                  onChange={(event) => setMobile(event.target.value)}
                  placeholder="+601234765890"
                  className="mt-3 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#412484] focus:ring-2 focus:ring-[#412484]/20"
                />
              </label>
              <button
                type="submit"
                className="w-full rounded-3xl bg-[#412484] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2f1b75]"
              >
                Continue
              </button>
            </form>
            <button
              type="button"
              onClick={() => router.back()}
              className="mt-4 w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-[#412484] hover:text-[#412484]"
            >
              Back to OTP
            </button>
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
