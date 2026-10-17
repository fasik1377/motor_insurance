"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const inputStyles = "mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-[#5b3aa4] focus:bg-white focus:ring-4 focus:ring-[#5b3aa4]/10";
type Profile = { title: string; firstName: string; surname: string; gender: string; dateOfBirth: string };

const icon = (path: string, className = "h-5 w-5") => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={path} /></svg>;
const PATHS = {
  user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  contact: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  mail: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  phone: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z",
  check: "M5 13l4 4L19 7",
  back: "M10 19l-7-7m0 0l7-7m-7 7h18",
};

export default function ProfilePage() {
    const router = useRouter(), [profile, setProfile] = useState<Profile>({ title: "Mr.", firstName: "", surname: "", gender: "", dateOfBirth: "" }), [contact, setContact] = useState({ email: "", mobile: "", emailVerified: false, mobileVerified: false }), [status, setStatus] = useState(""), [loading, setLoading] = useState(true), [saving, setSaving] = useState(false), [isExisting, setIsExisting] = useState(false);
    useEffect(() => { void (async () => { const response = await fetch("/api/profile"), data = await response.json(); if (response.status === 401) return router.replace("/login"); setLoading(false); if (!response.ok) return setStatus(data.error || "Unable to load your profile."); const p = data.profile; setContact({ email: p.Email ?? "", mobile: p.Mobile ?? "", emailVerified: Boolean(p.EmailVerified), mobileVerified: Boolean(p.MobileVerified) }); if (p.FirstName) { setIsExisting(true); setProfile({ title: p.Title, firstName: p.FirstName, surname: p.Surname, gender: p.Gender, dateOfBirth: p.DateOfBirth }); } })(); }, [router]);
    const update = (key: keyof Profile, value: string) => setProfile(current => ({ ...current, [key]: value }));
    // A failed save shows the error but keeps the button enabled, so the user can correct and retry.
    const submit = async (event: React.FormEvent) => { event.preventDefault(); setSaving(true); setStatus(""); const response = await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) }), data = await response.json(); if (!response.ok) { setStatus(data.error || "Unable to save your profile."); setSaving(false); return; } router.push("/dashboard"); };
    const initials = `${profile.firstName.charAt(0)}${profile.surname.charAt(0)}`.toUpperCase();
    const fullName = [profile.title, profile.firstName, profile.surname].filter(Boolean).join(" ");

    return <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#f4efff_0,_#f5f7fb_45%,_#eef1f7_100%)] p-2 font-sans text-slate-900 sm:p-4">
        <header className="mx-auto mb-4 flex max-w-5xl items-center justify-between gap-4 rounded-2xl border border-white bg-white/90 px-4 py-3 shadow-sm backdrop-blur sm:px-6">
            <Image src="/images/logo.png" alt="New India Assurance logo" width={220} height={88} priority className="h-11 w-auto object-contain" />
            {isExisting ? <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-xl border border-violet-200 px-3 py-2 text-xs font-semibold text-[#412484] transition hover:bg-violet-50">{icon(PATHS.back, "h-4 w-4")} Dashboard</Link> : null}
        </header>

        <section className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-white bg-white shadow-[0_24px_70px_rgba(53,18,109,0.10)]">
            {/* Banner with avatar */}
            <div className="relative bg-gradient-to-r from-[#35126d] to-[#5b3aa4] px-5 pb-16 pt-6 text-white sm:px-8">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-200">{isExisting ? "My profile" : "Final step"}</p>
                <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{isExisting ? "Your profile" : "Create your profile"}</h1>
                <p className="mt-1 text-sm text-violet-100">Enter your details as they appear on your official documents.</p>
            </div>
            <div className="relative -mt-10 flex flex-wrap items-end gap-4 px-5 sm:px-8">
                <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-violet-200 text-2xl font-bold text-[#35126d] shadow-lg ring-4 ring-white">{initials || icon(PATHS.user, "h-9 w-9")}</span>
                <div className="pb-1">
                    <p className="text-lg font-bold text-slate-900">{fullName || "Your name"}</p>
                    <p className="text-xs text-slate-500">{contact.email || contact.mobile || " "}</p>
                </div>
            </div>

            <div className="px-5 py-6 sm:px-8 sm:py-8">
                {loading ? <div className="space-y-3">{[1, 2, 3].map((row) => <div key={row} className="h-11 animate-pulse rounded-xl bg-slate-100" />)}</div> : (
                <form onSubmit={submit} className="space-y-6">
                    <fieldset className="rounded-2xl border border-violet-100 p-4 sm:p-5">
                        <legend className="flex items-center gap-2 px-2 text-sm font-bold text-[#35126d]"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#35126d] text-white">{icon(PATHS.user, "h-4 w-4")}</span> Basic information</legend>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[0.55fr_1fr_1fr]">
                            <label className="text-sm font-medium text-slate-700">Title<select className={inputStyles} value={profile.title} onChange={e => update("title", e.target.value)}><option>Mr.</option><option>Mrs.</option><option>Miss</option><option>Dr.</option></select></label>
                            <label className="text-sm font-medium text-slate-700">First name <span className="text-rose-600">*</span><input required value={profile.firstName} onChange={e => update("firstName", e.target.value)} className={inputStyles} /></label>
                            <label className="text-sm font-medium text-slate-700">Surname <span className="text-rose-600">*</span><input required value={profile.surname} onChange={e => update("surname", e.target.value)} className={inputStyles} /></label>
                            <label className="text-sm font-medium text-slate-700">Gender <span className="text-rose-600">*</span><select required className={inputStyles} value={profile.gender} onChange={e => update("gender", e.target.value)}><option value="" disabled>Select gender</option><option>Male</option><option>Female</option><option>Other</option></select></label>
                            <label className="text-sm font-medium text-slate-700 lg:col-span-2">Date of birth <span className="text-rose-600">*</span><input required type="date" max={new Date().toISOString().slice(0, 10)} value={profile.dateOfBirth} onChange={e => update("dateOfBirth", e.target.value)} className={inputStyles} /></label>
                        </div>
                    </fieldset>
                    <fieldset className="rounded-2xl border border-violet-100 p-4 sm:p-5">
                        <legend className="flex items-center gap-2 px-2 text-sm font-bold text-[#35126d]"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#35126d] text-white">{icon(PATHS.contact, "h-4 w-4")}</span> Verified contact details</legend>
                        <div className="grid gap-3 sm:grid-cols-2"><Contact label="Email address" value={contact.email} verified={contact.emailVerified} iconPath={PATHS.mail} /><Contact label="Mobile number" value={contact.mobile} verified={contact.mobileVerified} iconPath={PATHS.phone} /></div>
                    </fieldset>
                    {status ? <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{status}</p> : null}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                        <p className="text-xs text-slate-500"><span className="text-rose-600">*</span> Required field</p>
                        <button disabled={saving} className="h-11 rounded-xl bg-gradient-to-r from-[#35126d] to-[#5b3aa4] px-7 text-sm font-semibold text-white shadow-lg shadow-violet-900/20 transition hover:from-[#2b0f5a] hover:to-[#4c2f8f] disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none">{saving ? "Saving..." : "Save profile"}</button>
                    </div>
                </form>)}
            </div>
        </section>
    </main>;
}

function Contact({ label, value, verified, iconPath }: { label: string; value: string; verified: boolean; iconPath: string }) {
    return <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white text-[#412484] shadow-sm ring-1 ring-violet-100">{icon(iconPath)}</span>
        <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
            <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">{value || "Not provided"}</p>
        </div>
        {verified ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">{icon(PATHS.check, "h-3 w-3")} Verified</span> : value ? <span className="rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200">Not verified</span> : null}
    </div>;
}
