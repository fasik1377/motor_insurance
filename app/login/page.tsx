"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [contact, setContact] = useState("");
  const [robotChecked, setRobotChecked] = useState(false);
  const [selectedPuzzle, setSelectedPuzzle] = useState<string | null>(null);

  const puzzleOptions = [
    { id: "red", icon: "🔴", label: "Red light", description: "Stop signal" },
    { id: "yellow", icon: "🟡", label: "Yellow light", description: "Caution signal" },
    { id: "green", icon: "🟢", label: "Green light", description: "Go signal" },
  ];

  const handlePuzzleSelect = (id: string) => {
    setSelectedPuzzle(id);
    setRobotChecked(id === "green");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!robotChecked) return;

    const trimmedContact = contact.trim();
    if (!trimmedContact) return;

    const type = trimmedContact.includes("@") ? "email" : "mobile";
    router.push(`/otp?type=${type}&contact=${encodeURIComponent(trimmedContact)}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.3fr_1fr]">
        <section className="relative bg-[#3b2d92] px-6 py-12 text-white sm:px-10 lg:px-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.15),transparent_45%)]" />
          <div className="absolute -right-24 top-10 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="relative mx-auto flex h-full max-w-4xl flex-col justify-between gap-10">
            <div className="mt-6 max-w-xl rounded-[2rem] bg-white/10 p-8 shadow-2xl shadow-black/20 backdrop-blur-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#cdb8ff]">Motor Insurance Service</p>
              <h1 className="mt-6 text-3xl font-semibold leading-tight text-white sm:text-4xl">
                Introducing new features
              </h1>
              <p className="mt-4 text-sm leading-7 text-white/80 sm:text-base">
                Analyzing previous trends ensures that businesses always make the right decision. And as the scale of the decision and its impact magnifies...
              </p>
              <button className="mt-8 inline-flex rounded-full bg-[#281b5d] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-black/20 transition hover:bg-[#1e1549]">
                Learn more
              </button>
            </div>

            <div className="relative grid gap-3 rounded-[2rem] border border-white/10 bg-white/10 p-6 text-white shadow-inner shadow-white/10 backdrop-blur-sm sm:grid-cols-[auto_1fr] sm:items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 text-2xl">
                🔒
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-[#cdb8ff]">Secure setup</p>
                <p className="mt-2 text-sm text-white/80">Use your email or mobile number to receive a one-time passcode.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center bg-slate-50 px-6 py-12 sm:px-10 lg:px-16">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-10 shadow-[0_40px_120px_rgba(15,23,42,0.12)]">
            <div className="mb-10 text-center">
              <div className="mx-auto mb-6 inline-flex h-20 w-56 items-center justify-center rounded-3xl border border-slate-200 bg-slate-100 p-3">
                <Image src="/images/logo.png" alt="New India Assurance logo" width={220} height={48} className="h-auto w-auto object-contain" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900">Sign in / Sign up</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Enter your email or mobile number to receive a secure one-time passcode for your account to sign in or sign up.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <label className="block text-sm font-medium text-slate-700">
                E-mail or Mobile Number
                <input
                  type="text"
                  value={contact}
                  onChange={(event) => setContact(event.target.value)}
                  placeholder="example@gmail.com"
                  className="mt-3 w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#412484] focus:ring-2 focus:ring-[#412484]/20"
                />
              </label>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">I am not a robot</p>
                    <p className="text-xs text-slate-500">Select the green traffic light to continue.</p>
                  </div>
                  <span className={`inline-flex h-9 items-center rounded-full px-3 text-xs font-semibold ${robotChecked ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {robotChecked ? "Verified" : "Select green"}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {puzzleOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handlePuzzleSelect(option.id)}
                      className={`rounded-3xl border px-4 py-5 text-center transition ${selectedPuzzle === option.id ? "border-violet-600 bg-violet-50 shadow-sm" : "border-slate-200 bg-white hover:border-violet-500"}`}
                    >
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-100 text-2xl">
                        {option.icon}
                      </div>
                      <p className="text-sm font-semibold text-slate-900">{option.label}</p>
                      <p className="mt-1 text-xs text-slate-500">{option.description}</p>
                    </button>
                  ))}
                </div>

                <p className={`mt-4 text-sm ${robotChecked ? "text-emerald-700" : selectedPuzzle ? "text-rose-600" : "text-slate-500"}`}>
                  {robotChecked
                    ? "Great! You selected the correct piece. Tap continue to proceed."
                    : selectedPuzzle
                    ? "Not quite. Try the other shape to complete the pattern."
                    : "Select the puzzle piece that completes the pattern."}
                </p>
              </div>

              <button
                type="submit"
                disabled={!robotChecked}
                className="w-full rounded-full bg-[#35126d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2d1765] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
              >
                Sign in or Sign up
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-slate-400">
              We’ll send a one-time passcode to your email or mobile number, then move you to OTP verification to finish sign in.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
