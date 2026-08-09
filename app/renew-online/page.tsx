import Link from "next/link";

export default function RenewOnlinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef0ff] px-4 py-12 font-sans text-slate-900">
      <section className="w-full max-w-2xl overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
        <div className="bg-gradient-to-br from-[#35126d] to-[#6f4bb6] px-6 py-10 text-white sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-200">
            Motor Insurance
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Renew Online</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-violet-100 sm:text-base">
            Your vehicle registration was received. The online policy renewal journey will be available here.
          </p>
        </div>

        <div className="px-6 py-8 sm:px-10">
          <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5">
            <h2 className="text-lg font-semibold text-[#35126d]">Sample renewal page</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This is a temporary page confirming that the Renew Online navigation is working correctly.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="rounded-xl bg-[#35126d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-800"
            >
              Back to Dashboard
            </Link>
            <Link
              href="/buy-online"
              className="rounded-xl border border-violet-600 bg-white px-6 py-3 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
            >
              Buy a New Policy
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
