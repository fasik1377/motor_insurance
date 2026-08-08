import Image from "next/image";
import Link from "next/link";

const inputStyles =
  "mt-2.5 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#5b3aa4] focus:ring-4 focus:ring-[#5b3aa4]/10";

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M4 6.5h16v11H4v-11Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="m5 7.5 7 5 7-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M8.2 3.8 10 7.9 7.8 9.6c1.2 2.8 3.8 5.4 6.6 6.6l1.7-2.2 4.1 1.8-.7 3.5c-.2.9-1 1.5-1.9 1.5C10 20.4 3.6 14 3.2 6.4c0-.9.6-1.7 1.5-1.9l3.5-.7Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#f4efff_0,_#f5f7fb_40%,_#eef1f7_100%)] font-sans text-slate-900">
      <main className="mx-auto min-h-screen max-w-[1280px] px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <header className="mb-6 flex items-center justify-between rounded-2xl border border-white/70 bg-white/80 px-5 py-4 shadow-sm backdrop-blur sm:px-7">
          <Image
            src="/images/logo.png"
            alt="New India Assurance logo"
            width={220}
            height={88}
            priority
            className="h-12 w-auto object-contain sm:h-14"
          />
          <div className="hidden items-center gap-2 text-sm font-medium text-slate-500 sm:flex">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">✓</span>
            Secure profile setup
          </div>
        </header>

        <section className="overflow-hidden rounded-[1.75rem] border border-white/80 bg-white shadow-[0_24px_70px_rgba(31,20,72,0.10)]">
          <div className="grid lg:grid-cols-[0.72fr_1.8fr]">
            <aside className="relative overflow-hidden bg-[#35206f] px-7 py-9 text-white sm:px-10 lg:min-h-[700px] lg:py-12">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[45px] border-white/[0.04]" />
              <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-[#7959bd]/30 blur-2xl" />
              <div className="relative">
                <span className="inline-flex rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-violet-100 ring-1 ring-white/15">
                  Welcome aboard
                </span>
                <h1 className="mt-6 max-w-sm text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                  Let&apos;s get to know you
                </h1>
                <p className="mt-4 max-w-sm text-sm leading-6 text-violet-100/80">
                  Complete your personal details to create your account and enjoy a smoother insurance experience.
                </p>

                <div className="mt-10 hidden space-y-4 lg:block">
                  {[
                    ["✓", "Simple and quick", "Only the essentials, all in one place."],
                    ["◆", "Secure by design", "Your personal information stays protected."],
                    ["♡", "Made for you", "A smoother, more personal insurance experience."],
                  ].map(([icon, label, description]) => (
                    <div key={label} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-sm text-violet-100">
                        {icon}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{label}</p>
                        <p className="mt-1 text-xs leading-5 text-violet-200/70">{description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            <div className="px-6 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-12">
              <div className="mb-8">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6a4aae]">Personal details</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Create your profile</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">Please enter your details exactly as they appear on your official documents.</p>
              </div>

              <form className="space-y-8">
                <fieldset>
                  <legend className="mb-5 flex w-full items-center gap-3 text-sm font-semibold text-slate-800">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0ebfb] text-[#5b3aa4]">01</span>
                    Basic information
                    <span className="h-px flex-1 bg-slate-100" />
                  </legend>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-[0.55fr_1fr_1fr]">
                    <label className="block text-sm font-medium text-slate-700">
                      Title
                      <select className={inputStyles} defaultValue="Mr.">
                        <option>Mr.</option><option>Mrs.</option><option>Miss</option><option>Dr.</option>
                      </select>
                    </label>
                    <label className="block text-sm font-medium text-slate-700">
                      First name
                      <input type="text" placeholder="e.g. Alex" className={inputStyles} />
                    </label>
                    <label className="block text-sm font-medium text-slate-700 sm:col-span-2 lg:col-span-1">
                      Surname
                      <input type="text" placeholder="e.g. Rawles" className={inputStyles} />
                    </label>
                    <label className="block text-sm font-medium text-slate-700 lg:col-span-1">
                      Gender
                      <select className={inputStyles} defaultValue="">
                        <option value="" disabled>Select gender</option><option>Male</option><option>Female</option><option>Other</option>
                      </select>
                    </label>
                    <label className="block text-sm font-medium text-slate-700 sm:col-span-1 lg:col-span-2">
                      Date of birth
                      <input type="date" className={inputStyles} />
                    </label>
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="mb-5 flex w-full items-center gap-3 text-sm font-semibold text-slate-800">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f0ebfb] text-[#5b3aa4]">02</span>
                    Verified contact details
                    <span className="h-px flex-1 bg-slate-100" />
                  </legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#5b3aa4] shadow-sm ring-1 ring-slate-200"><MailIcon /></span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Email address</p>
                        <p className="mt-1 truncate text-sm font-semibold text-slate-700">alexrawles@gmail.com</p>
                      </div>
                      <span className="ml-auto text-emerald-500" title="Verified">✓</span>
                    </div>
                    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#5b3aa4] shadow-sm ring-1 ring-slate-200"><PhoneIcon /></span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Mobile number</p>
                        <p className="mt-1 truncate text-sm font-semibold text-slate-700">+60 12 345 68709</p>
                      </div>
                      <span className="ml-auto text-emerald-500" title="Verified">✓</span>
                    </div>
                  </div>
                </fieldset>

                <div className="flex flex-col-reverse gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs leading-5 text-slate-400">Your information is encrypted and securely stored.</p>
                  <Link href="/dashboard" className="group inline-flex h-12 items-center justify-center gap-3 rounded-xl bg-[#412484] px-7 text-sm font-semibold text-white shadow-lg shadow-[#412484]/20 transition hover:-translate-y-0.5 hover:bg-[#321b70] hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#412484]/20">
                    Create account
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
