import Image from "next/image";
import Link from "next/link";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#eef0ff] font-sans text-slate-900">
      <main className="mx-auto flex min-h-screen max-w-[1440px] flex-col px-4 py-10 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.08)] ring-1 ring-slate-200">
          <div className="px-8 py-6 sm:px-10">
            <div className="flex items-center">
              <Image
                src="/images/logo.png"
                alt="New India Assurance logo"
                width={260}
                height={104}
                className="h-auto w-auto object-contain"
              />
            </div>
          </div>

          <div className="px-6 py-8 sm:px-10 sm:py-10">
            <div className="mx-auto max-w-[1150px] rounded-[2rem] bg-slate-50 p-8 shadow-inner shadow-slate-200/30 sm:p-10">
              <div className="space-y-8 rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-500">
                      <span className="text-2xl">👤</span>
                    </div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Logo</p>
                  </div>
                  <div className="grid gap-6 lg:grid-cols-2">
                    <label className="block text-sm font-medium text-slate-700">
                      First Name
                      <input
                        type="text"
                        placeholder="Your First Name"
                        className="mt-3 h-12 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-[#412484] focus:ring-2 focus:ring-[#412484]/20"
                      />
                    </label>
                    <label className="block text-sm font-medium text-slate-700">
                      Middle Name
                      <input
                        type="text"
                        placeholder="Your Middle Name"
                        className="mt-3 h-12 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-[#412484] focus:ring-2 focus:ring-[#412484]/20"
                      />
                    </label>
                    <label className="block text-sm font-medium text-slate-700">
                      Last Name
                      <input
                        type="text"
                        placeholder="Your Last Name"
                        className="mt-3 h-12 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-[#412484] focus:ring-2 focus:ring-[#412484]/20"
                      />
                    </label>
                    <label className="block text-sm font-medium text-slate-700">
                      Gender
                      <select className="mt-3 h-12 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-[#412484] focus:ring-2 focus:ring-[#412484]/20">
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </label>
                    <label className="block text-sm font-medium text-slate-700 lg:col-span-2">
                      Date of Birth
                      <input
                        type="date"
                        defaultValue="2026-05-12"
                        className="mt-3 h-12 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-[#412484] focus:ring-2 focus:ring-[#412484]/20"
                      />
                    </label>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-500">Email Address</p>
                      <div className="mt-3 flex items-center gap-3 text-slate-700">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#412484] text-white">
                          @
                        </div>
                        <p className="text-sm font-medium">alexrawles@gmail.com</p>
                      </div>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-500">Mobile Number</p>
                      <p className="mt-3 text-sm font-medium text-slate-700">+601234568709</p>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Link
                      href="/dashboard"
                      className="inline-flex h-12 items-center justify-center rounded-3xl bg-[#412484] px-8 text-sm font-semibold text-white transition hover:bg-[#2f1b75]"
                    >
                      Next
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
