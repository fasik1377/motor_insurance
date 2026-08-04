import Link from "next/link";

export const metadata = {
  title: "New India Assurance | Dashboard",
  description: "Dashboard view for New India Assurance motor insurance users.",
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#eef0ff] font-sans text-slate-900">
      <main className="mx-auto flex min-h-screen max-w-[1440px] gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <aside className="hidden w-[280px] shrink-0 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] xl:block">
          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <div className="flex items-center gap-3 rounded-[1.75rem] border border-slate-200 bg-white px-4 py-4">
              <div className="h-11 w-11 rounded-3xl bg-violet-600 text-white grid place-items-center font-semibold">N</div>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">New India</p>
                <p className="text-sm font-semibold text-slate-950">Assurance</p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <label className="block text-sm text-slate-700">
                <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Sector</span>
                <select className="mt-3 h-12 w-full rounded-3xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-violet-600 focus:ring-2 focus:ring-violet-600/10">
                  <option>Motor Insurance</option>
                  <option>Vehicle Coverage</option>
                </select>
              </label>
              <label className="block text-sm text-slate-700">
                <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Product or Policy</span>
                <select className="mt-3 h-12 w-full rounded-3xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-violet-600 focus:ring-2 focus:ring-violet-600/10">
                  <option>My Policies</option>
                  <option>Claim History</option>
                </select>
              </label>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <button className="rounded-3xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700">
                Buy Online
              </button>
              <button className="rounded-3xl border border-violet-600 bg-white px-4 py-3 text-sm font-semibold text-violet-600 transition hover:bg-slate-100">
                Get Quote
              </button>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3 rounded-[1.75rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <span className="grid h-10 w-10 place-items-center rounded-3xl bg-white text-slate-700">⚙️</span>
            <span>Settings</span>
          </div>
        </aside>

        <section className="flex-1">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
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

              <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
                <div className="rounded-[2rem] bg-slate-50 p-6">
                  <div className="flex flex-col items-center justify-center gap-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="relative mx-auto h-[320px] w-[320px] overflow-hidden rounded-[2rem] bg-white p-6 shadow-lg shadow-slate-200/40 sm:h-[380px] sm:w-[380px]">
                      <div className="absolute inset-x-10 bottom-10 h-16 rounded-full bg-violet-100/70 blur-2xl" />
                      <img
                        src="https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1280&q=80"
                        alt="Blue car"
                        className="relative mx-auto h-full w-full object-contain"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Motor Insurance</p>
                      <h3 className="mt-3 text-2xl font-semibold text-slate-950">Your Vehicle Overview</h3>
                      <p className="mt-3 text-sm text-slate-500">Your car is protected with the latest coverage and active policy status.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6">
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-500">History</p>
                  <div className="mt-6 rounded-[1.75rem] bg-white p-5">
                    <div className="flex items-end justify-between gap-3">
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
                          <div className="flex h-48 items-end justify-center">
                            <div
                              className={`w-10 rounded-t-3xl ${item.active ? "bg-violet-600" : "bg-violet-200"}`}
                              style={{ height: `${item.height}%` }}
                            />
                          </div>
                          <span className="text-xs uppercase tracking-[0.3em] text-slate-500">{item.day}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 rounded-3xl bg-slate-100 p-3 text-center text-xs uppercase tracking-[0.25em] text-slate-500">
                      Highest on Wednesday
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.85fr_0.45fr]">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Products</p>
                    <h3 className="mt-3 text-2xl font-semibold text-slate-950">My Policies</h3>
                  </div>
                  <Link href="#" className="text-sm font-semibold text-violet-600 hover:text-violet-700">
                    View All
                  </Link>
                </div>

                <div className="mt-8 grid gap-4">
                  {[
                    { title: "Comprehensive Car Cover", subtitle: "Active until Aug 2026" },
                    { title: "Third Party Liability", subtitle: "Renewal due in 42 days" },
                  ].map((plan) => (
                    <div key={plan.title} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                      <p className="text-sm font-semibold text-slate-900">{plan.title}</p>
                      <p className="mt-2 text-sm text-slate-600">{plan.subtitle}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Notifications</p>
                      <h3 className="mt-3 text-2xl font-semibold text-slate-950">Recent Alerts</h3>
                    </div>
                    <span className="text-xs uppercase tracking-[0.25em] text-slate-500">2 new</span>
                  </div>
                  <div className="mt-6 space-y-4">
                    {[
                      { title: "Policy renewal reminder", message: "Your plan renews on 12 Aug 2026." },
                      { title: "Claim submitted", message: "Your claim #1087 is under review." },
                    ].map((note) => (
                      <div key={note.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-950">{note.title}</p>
                        <p className="mt-1 text-sm text-slate-600">{note.message}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
                  <div className="flex items-center justify-between">
                    <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Quick Actions</p>
                    <span className="text-xs uppercase tracking-[0.25em] text-slate-500">Today</span>
                  </div>
                  <div className="mt-6 space-y-4">
                    {[
                      "View Policy", 
                      "Register a Claim",
                      "Talk to Expert"
                    ].map((action) => (
                      <button key={action} className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-left text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                        {action}
                      </button>
                    ))}
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
