import Link from "next/link";

export const metadata = {
  title: "New India Assurance | Dashboard",
  description: "Dashboard view for New India Assurance motor insurance users.",
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#eef0ff] font-sans text-slate-900">
      <main className="w-full mx-auto flex min-h-screen max-w-[1440px] items-start gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <aside className="hidden w-[260px] shrink-0 md:block">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-3 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
            <div className="mb-4 rounded-[1.75rem] bg-slate-50 p-3">
              <div className="flex h-16 w-full items-center justify-center rounded-[1.5rem] bg-white py-3">
                <img src="/images/logo.png" alt="New India Assurance logo" className="h-12 object-contain" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Sector</p>
                <button className="mt-3 flex w-full items-center justify-between rounded-3xl border border-slate-200 bg-white px-3 py-3 text-left text-sm text-slate-900 transition hover:border-violet-600">
                  <span>Motor Insurance</span>
                  <span className="text-slate-400">▾</span>
                </button>
              </div>

              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Product or Policy</p>
                <button className="mt-3 flex w-full items-center justify-between rounded-3xl border border-slate-200 bg-white px-3 py-3 text-left text-sm text-slate-900 transition hover:border-violet-600">
                  <span>My Policies</span>
                  <span className="text-slate-400">▾</span>
                </button>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <button className="rounded-3xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700">
                Buy Online
              </button>
              <button className="rounded-3xl border border-violet-600 bg-white px-4 py-3 text-sm font-semibold text-violet-600 transition hover:bg-slate-100">
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
    </div>
  );
}
