"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const [sector, setSector] = useState("");
  const [product, setProduct] = useState("");
  const [showRakAlert, setShowRakAlert] = useState(false);
  const canContinue = Boolean(sector && product);

  return (
    <div className="min-h-screen bg-[#eef0ff] font-sans text-slate-900">
      <main className="w-full mx-auto flex min-h-screen max-w-[1440px] items-start gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <aside className="hidden w-[290px] shrink-0 md:block">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-3 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
            <div className="mb-4 rounded-[1.75rem] bg-slate-50 p-3">
              <div className="flex h-16 w-full items-center justify-center rounded-[1.5rem] bg-white py-3">
                <img src="/images/logo.png" alt="New India Assurance logo" className="h-12 object-contain" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-3">
                <label htmlFor="sector" className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500">Sector</label>
                <select id="sector" value={sector} onChange={(event) => setSector(event.target.value)} className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-600 focus:ring-2 focus:ring-violet-100">
                  <option value="" disabled>Select sector</option>
                  <option value="motor">Motor Insurance</option>
                  <option value="health">Health Insurance</option>
                  <option value="travel">Travel Insurance</option>
                  <option value="home">Home Insurance</option>
                </select>
              </div>

              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-3">
                <label htmlFor="product-policy" className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">Product or Policy</label>
                <select id="product-policy" value={product} onChange={(event) => setProduct(event.target.value)} className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-600 focus:ring-2 focus:ring-violet-100">
                  <option value="" disabled>Select product or policy</option>
                  <option value="comprehensive">Comprehensive Cover</option>
                  <option value="third-party">Third Party Liability</option>
                  <option value="commercial">Commercial Vehicle</option>
                  <option value="two-wheeler">Two Wheeler Cover</option>
                </select>
              </div>

              <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500">Online services</p>
                <div className="mt-4 space-y-4">
                  <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-800">
                    <input type="checkbox" className="h-5 w-5 accent-violet-600" />
                    Buy Online
                  </label>
                  <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-800">
                    <input type="checkbox" className="h-5 w-5 accent-violet-600" />
                    Renew Online
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button type="button" disabled={!canContinue} onClick={() => setShowRakAlert(true)} className="rounded-2xl bg-[#35126d] px-4 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:hover:bg-slate-300">
                Go
              </button>
              <button type="button" className="rounded-2xl border border-violet-600 bg-white px-3 py-3.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-50">
                Get Quote
              </button>
            </div>
          </div>
        </aside>

        <section className="flex-1 min-w-0">
          <div className="space-y-6">
            <header className="rounded-[2rem] bg-white px-5 py-5 shadow-sm shadow-slate-200/50">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-700">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 font-semibold uppercase tracking-[0.25em] text-slate-500">
                    Home
                  </span>
                  {[
                    "About Us",
                    "Products",
                    "Register a claim",
                    "Contact Us",
                    "Support Ticket",
                    "Notification",
                    "Talk to Expert",
                  ].map((item) => (
                    <span key={item} className="rounded-full border border-slate-200 bg-white px-2 py-2 font-semibold text-slate-700 shadow-sm">
                      {item}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <img src="/images/car_white.jpg" alt="Profile avatar" className="h-10 w-10 object-cover" />
                  </span>
                </div>
              </div>
            </header>

            <div className="rounded-[2rem] bg-white p-6 shadow-sm shadow-slate-200/50 sm:p-8">
              <div className="mb-6 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Motor Insurance</p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                    Welcome back, Alex
                  </h2>
                </div>
                <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-white">👤</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Alex Rawles</p>
                    <p className="text-xs text-slate-500">Premium Member</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
                <div className="min-w-0 rounded-[2rem] bg-slate-50 p-6 shadow-sm shadow-slate-200/40">
                  <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/40">
                    <div className="relative overflow-hidden rounded-[2rem] bg-slate-100 p-6">
                      <div className="absolute inset-x-6 bottom-6 h-24 rounded-full bg-violet-100/80 blur-3xl" />
                      <img
                        src="/images/car_white.jpg"
                        alt="Blue car"
                        className="relative mx-auto h-40 w-full max-w-full rounded-[1.75rem] object-cover sm:h-48 lg:h-40 xl:h-36"
                      />
                    </div>

                    <div className="mt-6 text-center sm:text-left">
                      <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Motor Insurance</p>
                      <h3 className="mt-3 text-3xl font-semibold text-slate-950">Your Vehicle Overview</h3>
                      <p className="mt-3 text-sm text-slate-500">Your car is protected with the latest coverage and active policy status.</p>
                    </div>

                    <div className="mt-8 grid gap-4 sm:grid-cols-3">
                      <div className="rounded-[1.75rem] bg-slate-50 p-4 text-center">
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Policy</p>
                        <p className="mt-3 text-lg font-semibold text-slate-950">Comprehensive</p>
                      </div>
                      <div className="rounded-[1.75rem] bg-slate-50 p-4 text-center">
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Status</p>
                        <p className="mt-3 text-lg font-semibold text-violet-600">Active</p>
                      </div>
                      <div className="rounded-[1.75rem] bg-slate-50 p-4 text-center">
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Renewal</p>
                        <p className="mt-3 text-lg font-semibold text-slate-950">Aug 2026</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="min-w-0 grid gap-5">
                  <div className="rounded-[2rem] bg-white p-6 shadow-sm shadow-slate-200/40">
                    <p className="text-sm uppercase tracking-[0.35em] text-slate-500">History</p>
                    <div className="mt-5 rounded-[1.75rem] bg-slate-50 p-5">
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
                            <div className="flex h-36 items-end justify-center w-full">
                              <div
                                className={`w-full rounded-t-3xl ${item.active ? "bg-violet-600" : "bg-violet-200"}`}
                                style={{ height: `${item.height}%` }}
                              />
                            </div>
                            <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500">{item.day}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-5 rounded-3xl bg-white p-3 text-center text-xs uppercase tracking-[0.25em] text-slate-500">
                        Weekly driver score overview
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[2rem] bg-white p-6 shadow-sm shadow-slate-200/40">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Alerts</p>
                        <h3 className="mt-3 text-2xl font-semibold text-slate-950">Quick updates</h3>
                      </div>
                      <span className="text-xs uppercase tracking-[0.25em] text-slate-500">New</span>
                    </div>
                    <div className="mt-6 grid gap-4">
                      <div className="rounded-[1.75rem] bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-950">Policy renewal reminder</p>
                        <p className="mt-1 text-sm text-slate-600">Your car cover renews on 12 Aug 2026.</p>
                      </div>
                      <div className="rounded-[1.75rem] bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-950">Claim update</p>
                        <p className="mt-1 text-sm text-slate-600">Your claim #1087 is currently under review.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.85fr_0.45fr]">
              <div className="rounded-[2rem] bg-white p-6 shadow-sm shadow-slate-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Products</p>
                    <h3 className="mt-3 text-2xl font-semibold text-slate-950">My Policies</h3>
                  </div>
                  <Link href="#" className="text-sm font-semibold text-violet-600 hover:text-violet-700">
                    View All
                  </Link>
                </div>

                <div className="mt-8 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50 text-sm text-slate-900">
                  <div className="grid grid-cols-1 gap-4 border-b border-slate-200 bg-white px-5 py-4 font-semibold text-slate-700 sm:grid-cols-[1.6fr_0.8fr_0.9fr]">
                    <span>Policy</span>
                    <span>Status</span>
                    <span>Renewal</span>
                  </div>
                  <div className="grid grid-cols-1 gap-4 border-b border-slate-200 px-5 py-4 bg-white text-sm sm:grid-cols-[1.6fr_0.8fr_0.9fr]">
                    <span>Comprehensive Car Cover</span>
                    <span className="text-violet-600">Active</span>
                    <span>Aug 2026</span>
                  </div>
                  <div className="grid grid-cols-1 gap-4 px-5 py-4 bg-white text-sm sm:grid-cols-[1.6fr_0.8fr_0.9fr]">
                    <span>Third Party Liability</span>
                    <span className="text-slate-600">Pending</span>
                    <span>Sep 2026</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] bg-white p-6 shadow-sm shadow-slate-200/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Notifications</p>
                    <h3 className="mt-3 text-2xl font-semibold text-slate-950">Alerts</h3>
                  </div>
                  <span className="text-xs uppercase tracking-[0.25em] text-slate-500">New</span>
                </div>
                <div className="mt-6 grid gap-4">
                  <div className="rounded-[1.75rem] bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-950">Policy renewal reminder</p>
                    <p className="mt-1 text-sm text-slate-600">Your car cover renews on 12 Aug 2026.</p>
                  </div>
                  <div className="rounded-[1.75rem] bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-950">Claim update</p>
                    <p className="mt-1 text-sm text-slate-600">Your claim #1087 is currently under review.</p>
                  </div>
                  <div className="rounded-[1.75rem] bg-slate-50 p-4">
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
              <button type="button" onClick={() => router.push("/rak-policy")} className="bg-[#35126d] px-8 py-3 text-sm font-semibold text-white transition hover:bg-violet-800">OK</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
