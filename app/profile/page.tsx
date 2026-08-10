import Image from "next/image";
import Link from "next/link";

const inputStyles =
  "mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#5b3aa4] focus:ring-2 focus:ring-[#5b3aa4]/10";

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-slate-100 p-2 font-sans text-slate-900 sm:p-3">
      <header className="mb-3 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-6">
        <Image src="/images/logo.png" alt="New India Assurance logo" width={220} height={88} priority className="h-11 w-auto object-contain" />
        <Link href="/dashboard" className="text-sm font-semibold text-[#412484] hover:underline">Back to dashboard</Link>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-5xl px-5 py-6 sm:px-8 sm:py-8">
          <div className="mb-6 border-b border-slate-100 pb-5">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Create your profile</h1>
            <p className="mt-1 text-sm text-slate-500">Enter your details as they appear on your official documents.</p>
          </div>

          <form className="space-y-6">
            <fieldset>
              <legend className="mb-4 flex w-full items-center gap-3 text-sm font-semibold text-slate-800">
                Basic information <span className="h-px flex-1 bg-slate-100" />
              </legend>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[0.55fr_1fr_1fr]">
                <label className="text-sm font-medium text-slate-700">Title
                  <select className={inputStyles} defaultValue="Mr."><option>Mr.</option><option>Mrs.</option><option>Miss</option><option>Dr.</option></select>
                </label>
                <label className="text-sm font-medium text-slate-700">First name
                  <input type="text" placeholder="e.g. Alex" className={inputStyles} />
                </label>
                <label className="text-sm font-medium text-slate-700 sm:col-span-2 lg:col-span-1">Surname
                  <input type="text" placeholder="e.g. Rawles" className={inputStyles} />
                </label>
                <label className="text-sm font-medium text-slate-700">Gender
                  <select className={inputStyles} defaultValue=""><option value="" disabled>Select gender</option><option>Male</option><option>Female</option><option>Other</option></select>
                </label>
                <label className="text-sm font-medium text-slate-700 lg:col-span-2">Date of birth
                  <input type="date" className={inputStyles} />
                </label>
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-4 flex w-full items-center gap-3 text-sm font-semibold text-slate-800">
                Verified contact details <span className="h-px flex-1 bg-slate-100" />
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Email address</p>
                  <p className="mt-1 truncate text-sm font-semibold text-slate-700">alexrawles@gmail.com <span className="text-emerald-600">✓</span></p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Mobile number</p>
                  <p className="mt-1 truncate text-sm font-semibold text-slate-700">+60 12 345 68709 <span className="text-emerald-600">✓</span></p>
                </div>
              </div>
            </fieldset>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-400">Your information is encrypted and securely stored.</p>
              <Link href="/dashboard" className="inline-flex h-11 items-center justify-center rounded-lg bg-[#412484] px-6 text-sm font-semibold text-white transition hover:bg-[#321b70]">Create account</Link>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
