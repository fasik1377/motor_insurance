import Image from "next/image";

// Shared layout of the sign-in pages (e-mail / mobile sign-in and OTP verification).
// The folder name starts with "_" so Next.js does not treat it as a route.

const icons = {
  shield: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  bolt: "M13 10V3L4 14h7v7l9-11h-7z",
  document: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  mail: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  phone: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z",
  lock: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  arrow: "M13 7l5 5m0 0l-5 5m5-5H6",
  check: "M5 13l4 4L19 7",
};
export type AuthIconName = keyof typeof icons;

export function AuthIcon({ name, className = "h-5 w-5" }: { name: AuthIconName; className?: string }) {
  return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={icons[name]} /></svg>;
}

const highlights: { icon: AuthIconName; title: string; text: string }[] = [
  { icon: "shield", title: "Secure sign-in", text: "One-time passcodes, no passwords to remember." },
  { icon: "bolt", title: "Cover in minutes", text: "Buy or renew your motor policy online." },
  { icon: "document", title: "Documents by e-mail", text: "Certificate, schedule and vignette sent instantly." },
];

export function AuthShell({ eyebrow, title, description, heroTitle, heroText, step, children, footnote }: {
  eyebrow: string;
  title: string;
  description: React.ReactNode;
  heroTitle: string;
  heroText: string;
  step?: { current: number; total: number; label: string };
  children: React.ReactNode;
  footnote?: string;
}) {
  return (
    <main className="grid min-h-dvh bg-[#eef0ff] lg:h-dvh lg:grid-cols-[1.1fr_0.9fr] lg:overflow-hidden">
      <section className="relative hidden overflow-hidden bg-[#27105f] text-white lg:block">
        <Image src="/images/login_car.jpg" alt="Insured car on the road" fill priority className="auth-hero-image object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#241052]/95 via-[#35126d]/80 to-slate-950/40" />
        <div className="relative flex h-full flex-col justify-center px-[8%]">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-violet-100 ring-1 ring-white/20">
            <AuthIcon name="shield" className="h-4 w-4" /> Motor Insurance
          </span>
          <h1 className="mt-5 max-w-xl text-4xl font-semibold leading-tight xl:text-5xl">{heroTitle}</h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-white/75 xl:text-base">{heroText}</p>
          <ul className="mt-10 grid max-w-lg gap-4">
            {highlights.map((item) => (
              <li key={item.title} className="flex items-start gap-4 rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/15 backdrop-blur-sm">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-300 to-violet-500 text-[#27105f] shadow-lg shadow-violet-900/30"><AuthIcon name={item.icon} /></span>
                <span><span className="block text-sm font-semibold">{item.title}</span><span className="text-xs text-white/70">{item.text}</span></span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-8 sm:px-10">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-white bg-white/90 p-6 shadow-[0_30px_80px_rgba(53,18,109,0.16)] backdrop-blur sm:p-8">
            <Image src="/images/logo.png" alt="New India Assurance logo" width={220} height={70} priority className="mx-auto h-14 w-auto object-contain" />
            {step ? (
              <div className="mt-5">
                <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <span>Step {step.current} of {step.total}</span><span className="text-[#412484]">{step.label}</span>
                </div>
                <div className="mt-2 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${step.total}, minmax(0, 1fr))` }}>
                  {Array.from({ length: step.total }, (_, index) => <span key={index} className={`h-1.5 rounded-full ${index < step.current ? "bg-gradient-to-r from-[#35126d] to-violet-500" : "bg-slate-200"}`} />)}
                </div>
              </div>
            ) : null}
            <div className="mt-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#412484]">{eyebrow}</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">{title}</h2>
              <div className="mt-2 text-sm leading-5 text-slate-500">{description}</div>
            </div>
            {children}
          </div>
          {footnote ? <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-slate-500"><AuthIcon name="lock" className="h-4 w-4 text-[#412484]" />{footnote}</p> : null}
        </div>
      </section>
    </main>
  );
}

// "I am not a robot" confirmation card.
export function RobotCheck({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${checked ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50 hover:border-[#412484]"}`}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border-2 transition peer-focus-visible:ring-2 peer-focus-visible:ring-violet-300 ${checked ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 bg-white text-transparent"}`}><AuthIcon name="check" className="h-4 w-4" /></span>
      <span><span className="block font-semibold text-slate-900">I am not a robot</span><span className="text-xs text-slate-500">{checked ? "Thanks, you are verified." : "Confirm to continue."}</span></span>
    </label>
  );
}

export function AuthError({ message }: { message: string }) {
  if (!message) return null;
  const positive = /new code has been sent/i.test(message);
  return <p role={positive ? "status" : "alert"} className={`rounded-xl border px-3 py-2 text-sm font-medium ${positive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>{message}</p>;
}

export const authInputClass = "h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#412484] focus:bg-white focus:ring-4 focus:ring-[#412484]/10";
export const authButtonClass = "group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#35126d] to-[#5b3aa4] px-5 text-sm font-semibold text-white shadow-lg shadow-violet-900/20 transition hover:from-[#2b0f5a] hover:to-[#4c2f8f] disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none";
