"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type OnlineService = "buy" | "renew" | "";

export default function DashboardPage() {
  const router = useRouter();
  const [sector, setSector] = useState("");
  const [product, setProduct] = useState("");
  const [onlineService, setOnlineService] = useState<OnlineService>("");
  const [showRakAlert, setShowRakAlert] = useState(false);
  const [showRenewPrompt, setShowRenewPrompt] = useState(false);
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [registrationError, setRegistrationError] = useState("");
  const canContinue = Boolean(sector && product && onlineService);

  const handleGo = () => {
    if (onlineService === "buy") {
      setShowRakAlert(true);
      return;
    }

    if (onlineService === "renew") {
      setRegistrationNumber("");
      setRegistrationError("");
      setShowRenewPrompt(true);
    }
  };

  const handleRenew = () => {
    if (!/^\d{4}$/.test(registrationNumber)) {
      setRegistrationError("Enter exactly four digits.");
      return;
    }

    router.push("/renew-online");
  };

  return (
    <div className="min-h-screen bg-[#eef0ff] font-sans text-slate-900">
      <main className="flex min-h-screen w-full items-start gap-0 p-2 sm:p-3">
        <aside className="hidden w-[270px] shrink-0 md:block">
          <div className="border border-slate-200 bg-white p-3 shadow-sm">
            <div className="mb-4 bg-slate-50 p-3">
              <div className="flex h-16 w-full items-center justify-center bg-white py-3">
                <img src="/images/logo.png" alt="New India Assurance logo" className="h-12 object-contain" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="border border-slate-200 bg-slate-50 p-3">
                <label htmlFor="sector" className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500">Sector</label>
                <select id="sector" value={sector} onChange={(event) => setSector(event.target.value)} className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-600 focus:ring-2 focus:ring-violet-100">
                  <option value="" disabled>Select sector</option>
                  <option value="motor">Motor Insurance</option>
                  <option value="health">Health Insurance</option>
                  <option value="travel">Travel Insurance</option>
                  <option value="home">Home Insurance</option>
                </select>
              </div>

              <div className="border border-slate-200 bg-slate-50 p-3">
                <label htmlFor="product-policy" className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">Product or Policy</label>
                <select id="product-policy" value={product} onChange={(event) => setProduct(event.target.value)} className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-600 focus:ring-2 focus:ring-violet-100">
                  <option value="" disabled>Select product or policy</option>
                  <option value="comprehensive">Comprehensive Cover</option>
                  <option value="third-party">Third Party Liability</option>
                  <option value="commercial">Commercial Vehicle</option>
                  <option value="two-wheeler">Two Wheeler Cover</option>
                </select>
              </div>

              <div className="border border-slate-200 bg-white p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500">Online services</p>
                <div className="mt-4 space-y-4">
                  <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-800">
                    <input
                      type="checkbox"
                      checked={onlineService === "buy"}
                      onChange={() => setOnlineService((current) => current === "buy" ? "" : "buy")}
                      className="h-5 w-5 accent-violet-600"
                    />
                    Buy Online
                  </label>
                  <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-800">
                    <input
                      type="checkbox"
                      checked={onlineService === "renew"}
                      onChange={() => setOnlineService((current) => current === "renew" ? "" : "renew")}
                      className="h-5 w-5 accent-violet-600"
                    />
                    Renew Online
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" disabled={!canContinue} onClick={handleGo} className="rounded-2xl bg-[#35126d] px-4 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:hover:bg-slate-300">
                Go
              </button>
              <button type="button" className="rounded-2xl border border-violet-600 bg-white px-3 py-3.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-50">
                Get Quote
              </button>
            </div>
          </div>
        </aside>

        <section className="flex-1 min-w-0">
          <div className="space-y-0">
            <header className="relative z-30 border border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:px-5">
              <div className="flex items-center justify-between gap-4">
                <nav className="flex min-w-0 items-center gap-1" aria-label="Main navigation">
                  <Link href="/dashboard" className="flex h-10 items-center gap-2 rounded-xl bg-[#412484] px-4 text-xs font-semibold text-white shadow-md shadow-violet-900/15">
                    <span aria-hidden="true">⌂</span> Home
                  </Link>
                  {[
                    ["About Us", "#about"],
                    ["Products", "#products"],
                    ["Register a claim", "#claim"],
                    ["Contact Us", "#contact"],
                  ].map(([item, href]) => (
                    <Link key={item} href={href} className="hidden h-10 items-center rounded-xl px-3 text-xs font-semibold text-slate-600 transition hover:bg-violet-50 hover:text-[#412484] xl:flex">
                      {item}
                    </Link>
                  ))}

                  <details className="group relative">
                    <summary className="flex h-10 cursor-pointer list-none items-center gap-2 rounded-xl px-3 text-xs font-semibold text-slate-600 transition hover:bg-violet-50 hover:text-[#412484] [&::-webkit-details-marker]:hidden">
                      More <span className="text-[10px] transition group-open:rotate-180">▼</span>
                    </summary>
                    <div className="absolute left-0 top-[calc(100%+0.6rem)] w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_50px_rgba(30,20,70,0.16)]">
                      {[
                        ["About Us", "#about", "xl:hidden"],
                        ["Products", "#products", "xl:hidden"],
                        ["Register a claim", "#claim", "xl:hidden"],
                        ["Contact Us", "#contact", "xl:hidden"],
                        ["Support Ticket", "#support", ""],
                        ["Notification", "#notifications", ""],
                        ["Talk to Expert", "#expert", ""],
                      ].map(([item, href, responsiveClass]) => (
                        <Link key={item} href={href} className={`flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-violet-50 hover:text-[#412484] ${responsiveClass}`}>
                          {item}
                        </Link>
                      ))}
                    </div>
                  </details>
                </nav>

                <details className="group relative shrink-0">
                  <summary className="flex cursor-pointer list-none items-center gap-3 rounded-xl p-1.5 pr-2 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-100 [&::-webkit-details-marker]:hidden">
                    <span className="hidden text-right sm:block">
                      <span className="block text-xs font-semibold text-slate-800">Alex Rawles</span>
                      <span className="mt-0.5 block text-[10px] text-slate-400">My account</span>
                    </span>
                    <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border-2 border-white bg-violet-100 shadow-md ring-1 ring-slate-200">
                      <img src="/images/car_white.jpg" alt="Alex Rawles profile" className="h-full w-full object-cover" />
                    </span>
                    <span className="text-[10px] text-slate-400 transition group-open:rotate-180">▼</span>
                  </summary>
                  <div className="absolute right-0 top-[calc(100%+0.6rem)] w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_60px_rgba(30,20,70,0.18)]">
                    <div className="mb-2 rounded-xl bg-gradient-to-br from-[#412484] to-[#6f4bb6] px-4 py-3 text-white">
                      <p className="text-sm font-semibold">Alex Rawles</p>
                      <p className="mt-0.5 text-xs text-violet-100">alexrawles@gmail.com</p>
                    </div>
                    {[
                      ["PROFILE", "/profile", "◎"],
                      ["MY PRODUCTS", "#products", "◇"],
                      ["KYC", "#kyc", "✓"],
                      ["SETTINGS", "#settings", "⚙"],
                    ].map(([item, href, icon]) => (
                      <Link key={item} href={href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold tracking-wide text-slate-600 transition hover:bg-violet-50 hover:text-[#412484]">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-sm text-[#5b3aa4]">{icon}</span>
                        {item}
                      </Link>
                    ))}
                    <div className="my-2 h-px bg-slate-100" />
                    <Link href="/login" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold tracking-wide text-rose-600 transition hover:bg-rose-50">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-base">↪</span>
                      LOGOUT
                    </Link>
                  </div>
                </details>
              </div>
            </header>

            <div className="relative overflow-hidden rounded-none border-x border-b border-violet-100 bg-white p-4 sm:p-5">
              <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-violet-100/60 blur-3xl" />
              <div className="hidden">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-500">Your insurance dashboard</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                    Welcome back, Alex
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">Everything looks good. Your main policy is active.</p>
                </div>
                <div className="flex items-center gap-3 border border-violet-100 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-white">👤</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Alex Rawles</p>
                    <p className="text-xs text-slate-500">Premium Member</p>
                  </div>
                </div>
              </div>

              <div className="relative grid gap-0 overflow-hidden border border-slate-200 bg-slate-200 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
                <div className="min-w-0">
                  <div className="h-full bg-white p-4 transition hover:bg-violet-50/20">
                    <div className="relative overflow-hidden bg-gradient-to-br from-slate-100 to-violet-50 p-3">
                      <span className="absolute left-4 top-4 z-10 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">Protected</span>
                      <div className="absolute inset-x-6 bottom-6 h-24 rounded-full bg-violet-100/80 blur-3xl" />
                      <img
                        src="/images/car_white.jpg"
                        alt="Blue car"
                        className="relative mx-auto h-40 w-full max-w-full object-cover sm:h-48 lg:h-40 xl:h-36"
                      />
                    </div>

                    <div className="mt-4 text-center sm:text-left">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-500">Primary vehicle</p>
                      <h3 className="mt-1 text-2xl font-semibold text-slate-950">Your Vehicle Overview</h3>
                      <p className="mt-3 text-sm text-slate-500">Your car is protected with the latest coverage and active policy status.</p>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="border border-slate-100 bg-slate-50 p-3 text-center">
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Policy</p>
                        <p className="mt-3 text-lg font-semibold text-slate-950">Comprehensive</p>
                      </div>
                      <div className="border border-emerald-100 bg-emerald-50 p-3 text-center">
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Status</p>
                        <p className="mt-3 text-lg font-semibold text-violet-600">Active</p>
                      </div>
                      <div className="border border-violet-100 bg-violet-50 p-3 text-center">
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Renewal</p>
                        <p className="mt-3 text-lg font-semibold text-slate-950">Aug 2026</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="min-w-0 grid gap-0">
                  <div className="border-t border-slate-200 bg-white p-4 transition hover:bg-violet-50/20 lg:border-l lg:border-t-0">
                    <p className="text-sm uppercase tracking-[0.35em] text-slate-500">History</p>
                    <div className="mt-4 bg-slate-50 p-4">
                      <div className="grid grid-cols-7 gap-1 items-end">
                        {[
                          { day: "Mon", height: 40 },
                          { day: "Tue", height: 56 },
                          { day: "Wed", height: 100, active: true },
                          { day: "Thu", height: 72 },
                          { day: "Fri", height: 64 },
                          { day: "Sat", height: 84 },
                          { day: "Sun", height: 56 },
                        ].map((item) => (
                          <div key={item.day} className="flex flex-col items-center gap-3">
                            <div className="flex h-24 items-end justify-center w-full">
                              <div
                                className={`w-full rounded-t-lg transition hover:bg-violet-500 ${item.active ? "bg-gradient-to-t from-[#412484] to-violet-500" : "bg-violet-200"}`}
                                style={{ height: `${item.height}%` }}
                              />
                            </div>
                            <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500">{item.day}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 rounded-lg bg-white p-2 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Weekly driver score overview
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 bg-white p-4 transition hover:bg-violet-50/20 lg:border-l">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-500">Notification center</p>
                        <h3 className="mt-1 text-xl font-semibold text-slate-950">Notifications</h3>
                      </div>
                      <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600">2 new</span>
                    </div>
                    <div className="mt-4 grid gap-2">
                      <div className="border border-amber-100 bg-amber-50/70 p-3 transition hover:border-amber-200 hover:bg-amber-50">
                        <p className="text-sm font-semibold text-slate-950">Policy renewal reminder</p>
                        <p className="mt-1 text-sm text-slate-600">Your car cover renews on 12 Aug 2026.</p>
                      </div>
                      <div className="border border-sky-100 bg-sky-50/70 p-3 transition hover:border-sky-200 hover:bg-sky-50">
                        <p className="text-sm font-semibold text-slate-950">Claim update</p>
                        <p className="mt-1 text-sm text-slate-600">Your claim #1087 is currently under review.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="border-x border-b border-slate-200 bg-white p-4 shadow-sm transition sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-500">Products</p>
                    <h3 className="mt-1 text-xl font-semibold text-slate-950">My Policies</h3>
                  </div>
                  <Link href="#" className="text-sm font-semibold text-violet-600 hover:text-violet-700">
                    View All
                  </Link>
                </div>

                <div className="mt-4 overflow-hidden border border-violet-100 bg-slate-50 text-sm text-slate-900">
                  <div className="grid grid-cols-1 gap-4 border-b border-violet-100 bg-gradient-to-r from-violet-50 to-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 sm:grid-cols-[1.6fr_0.8fr_0.9fr]">
                    <span>Policy</span>
                    <span>Status</span>
                    <span>Renewal</span>
                  </div>
                  <div className="grid grid-cols-1 items-center gap-4 border-b border-slate-100 bg-white px-5 py-4 text-sm transition hover:bg-violet-50/60 sm:grid-cols-[1.6fr_0.8fr_0.9fr]">
                    <span className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 font-bold text-violet-700">C</span><span><span className="block font-semibold">Comprehensive Car Cover</span><span className="text-xs text-slate-400">Policy #MI-1087</span></span></span>
                    <span><span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Active</span></span>
                    <span><span className="block font-medium">12 Aug 2026</span><span className="text-xs text-slate-400">12 months left</span></span>
                  </div>
                  <div className="grid grid-cols-1 items-center gap-4 bg-white px-5 py-4 text-sm transition hover:bg-violet-50/60 sm:grid-cols-[1.6fr_0.8fr_0.9fr]">
                    <span className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 font-bold text-sky-700">T</span><span><span className="block font-semibold">Third Party Liability</span><span className="text-xs text-slate-400">Policy #TPL-2042</span></span></span>
                    <span><span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">Pending</span></span>
                    <span><span className="block font-medium">03 Sep 2026</span><span className="text-xs text-slate-400">Awaiting approval</span></span>
                  </div>
                </div>
              </div>

              <div className="hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-500">Notifications</p>
                    <h3 className="mt-1 text-xl font-semibold text-slate-950">What&apos;s new</h3>
                  </div>
                  <span className="text-xs uppercase tracking-[0.25em] text-slate-500">New</span>
                </div>
                <div className="mt-4 grid gap-2">
                  <div className="rounded-xl border border-amber-100 bg-white p-3 shadow-sm">
                    <p className="text-sm font-semibold text-slate-950">Policy renewal reminder</p>
                    <p className="mt-1 text-sm text-slate-600">Your car cover renews on 12 Aug 2026.</p>
                  </div>
                  <div className="rounded-xl border border-sky-100 bg-white p-3 shadow-sm">
                    <p className="text-sm font-semibold text-slate-950">Claim update</p>
                    <p className="mt-1 text-sm text-slate-600">Your claim #1087 is currently under review.</p>
                  </div>
                  <div className="rounded-xl border border-violet-100 bg-violet-50/70 p-3">
                    <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Interesting</p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                      <li>✔️ New partner discounts available</li>
                      <li>✔️ Save extra with safe driver rewards</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {showRakAlert ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="rak-alert-title">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto bg-white shadow-[0_30px_100px_rgba(15,23,42,0.35)]">
            <div className="sticky top-0 flex items-center justify-between border-b border-violet-100 bg-[#35126d] px-6 py-5 text-white sm:px-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-200">Important notice</p>
                <h2 id="rak-alert-title" className="mt-1 text-2xl font-bold">Alert</h2>
              </div>
              <button type="button" onClick={() => setShowRakAlert(false)} className="flex h-10 w-10 items-center justify-center border border-white/25 text-xl transition hover:bg-white/10" aria-label="Close alert">×</button>
            </div>

            <div className="space-y-5 px-6 py-7 text-sm leading-7 text-slate-700 sm:px-8">
              <p><strong className="text-slate-950">Dear Customer,</strong> Now you can also purchase RAK (Raasta Aapatti Kavach) Policy for your <strong>PERSONAL ACCIDENT</strong> compensation and reimbursement of hospitalization expenses incurred due to an accident.</p>
              <div className="border-l-4 border-violet-600 bg-violet-50 p-5">
                <h3 className="font-bold uppercase tracking-wide text-[#35126d]">Raasta Aapatti (Road Safety Insurance)</h3>
                <p className="mt-2">The policy offers PERSONAL ACCIDENT compensation cover including reimbursement of hospitalization expenses incurred due to an accident.</p>
              </div>
              <div>
                <h3 className="font-bold text-slate-950">Section I:</h3>
                <p className="mt-1">The policy offers Personal Accident compensation cover for Sum Insured ranging from Rs 25,000 to Rs 1 lac and in further multiples of Rs 1 lac up to Rs 10 lac.</p>
              </div>
              <div>
                <h3 className="font-bold text-slate-950">Section II:</h3>
                <p className="mt-1">Hospitalization expenses for bodily injury caused by and arising out of an accident:</p>
                <ol className="mt-2 space-y-1 pl-5" type="a">
                  <li>Road Accident (at additional premium)</li>
                  <li>Arising out of and during the course of employment (if opted for at additional premium)</li>
                  <li>Any other accident other than (a) and (b) above—wider cover (if opted for at an additional premium)</li>
                </ol>
              </div>
              <p>There is also an option to cover, at an additional premium, hospitalization expenses for bodily injury caused by and arising out of an accident to Third Parties arising out of a motor accident.</p>
            </div>

            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-white px-6 py-5 sm:px-8">
              <button type="button" onClick={() => setShowRakAlert(false)} className="border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={() => router.push("/buy-online")} className="bg-[#35126d] px-8 py-3 text-sm font-semibold text-white transition hover:bg-violet-800">OK</button>
            </div>
          </div>
        </div>
      ) : null}

      {showRenewPrompt ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="renew-prompt-title">
          <div className="w-full max-w-md bg-white shadow-[0_30px_100px_rgba(15,23,42,0.35)]">
            <div className="flex items-center justify-between bg-[#35126d] px-6 py-5 text-white">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-200">Renew Online</p>
                <h2 id="renew-prompt-title" className="mt-1 text-2xl font-bold">Registration number</h2>
              </div>
              <button type="button" onClick={() => setShowRenewPrompt(false)} className="flex h-10 w-10 items-center justify-center border border-white/25 text-xl transition hover:bg-white/10" aria-label="Close registration number prompt">×</button>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleRenew();
              }}
              className="px-6 py-7"
            >
              <label htmlFor="registration-number" className="text-sm font-semibold text-slate-900">Enter the four-digit registration number</label>
              <input
                id="registration-number"
                value={registrationNumber}
                onChange={(event) => {
                  setRegistrationNumber(event.target.value.replace(/\D/g, "").slice(0, 4));
                  setRegistrationError("");
                }}
                inputMode="numeric"
                pattern="[0-9]{4}"
                maxLength={4}
                autoFocus
                aria-invalid={Boolean(registrationError)}
                aria-describedby={registrationError ? "registration-error" : undefined}
                className="mt-3 w-full border border-slate-300 px-4 py-3 text-lg tracking-[0.35em] outline-none transition focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
                placeholder="0000"
              />
              {registrationError ? <p id="registration-error" className="mt-2 text-sm font-medium text-rose-600">{registrationError}</p> : null}

              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowRenewPrompt(false)} className="border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancel</button>
                <button type="submit" className="bg-[#35126d] px-8 py-3 text-sm font-semibold text-white transition hover:bg-violet-800">Continue</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
