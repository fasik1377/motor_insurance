"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LogoutButton from "./logout-button";

type OnlineService = "buy" | "renew" | "";
type Profile = { FirstName?: string; Surname?: string };
type Policy = { policyNumber?: string; registrationNumber?: string; cover?: string; status?: string; endDate?: string };

const TabIcon = ({ name, className = "w-4 h-4" }: { name: string; className?: string }) => {
  switch (name) {
    case "home":
      return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
    case "info":
      return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    case "products":
      return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
    case "claims":
      return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
    case "contact":
      return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h4M8 12l2-2m-2 2l-2-2m2 2v4m-2-4h8M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    case "support":
      return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
    case "bell":
      return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
    case "expert":
      return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
    default:
      return null;
  }
};

const UserMenuIcon = ({ name, className = "w-5 h-5" }: { name: string; className?: string }) => {
  switch (name) {
    case "profile":
      return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
    case "products":
      return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
    case "kyc":
      return <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
    case "settings":
      return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
    default:
      return null;
  }
};

export default function DashboardPage() {
  const router = useRouter();
  const [sector, setSector] = useState("");
  const [product, setProduct] = useState("");
  const [onlineService, setOnlineService] = useState<OnlineService>("");
  const [showRakAlert, setShowRakAlert] = useState(false);
  const [hasAcceptedRakNotice, setHasAcceptedRakNotice] = useState(false);
  const [showRenewPrompt, setShowRenewPrompt] = useState(false);
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [registrationError, setRegistrationError] = useState("");
  const [profile, setProfile] = useState<Profile>({});
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [policyMessage, setPolicyMessage] = useState("Loading current policies…");
  const [activeTab, setActiveTab] = useState<"home" | "about" | "products" | "claims" | "contact" | "support" | "notifications" | "expert">("home");
  const canContinue = sector === "motor" && onlineService === "buy";
  const displayName = [profile.FirstName, profile.Surname].filter(Boolean).join(" ") || "Your account";
  const primaryPolicy = policies[0];

  const tabs = [
    { id: "home", label: "Home", icon: "home" },
    { id: "about", label: "About Us", icon: "info" },
    { id: "products", label: "Products", icon: "products" },
    { id: "claims", label: "Register a claim", icon: "claims" },
    { id: "contact", label: "Contact Us", icon: "contact" },
    { id: "support", label: "Support Ticket", icon: "support" },
    { id: "notifications", label: "Notifications", icon: "bell" },
    { id: "expert", label: "Talk to Expert", icon: "expert" },
  ] as const;

  useEffect(() => {
    void Promise.all([
      fetch("/api/profile").then(async (response) => response.ok ? response.json() : null),
      fetch("/api/motor/policies").then(async (response) => ({ ok: response.ok, data: await response.json() })),
    ]).then(([profileData, policyResult]) => {
      if (profileData?.profile) setProfile(profileData.profile);
      if (policyResult.ok) {
        setPolicies(policyResult.data.policies || []);
        setPolicyMessage(policyResult.data.warning || (policyResult.data.policies?.length ? "" : "No current policies found."));
      } else {
        setPolicyMessage(policyResult.data.error || "Current policies are unavailable.");
      }
    }).catch(() => setPolicyMessage("Current policies are unavailable."));
  }, []);

  const handleGo = () => {
    if (onlineService === "buy") {
      setHasAcceptedRakNotice(false);
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

  const renderTabContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className="space-y-4 p-4 sm:p-5">
            <div className="relative overflow-hidden rounded-none border-x border-b border-violet-100 bg-white">
              <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-violet-100/60 blur-3xl" />
              <div className="relative grid gap-0 overflow-hidden border border-slate-200 bg-slate-200 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
                <div className="min-w-0">
                  <div className="h-full bg-white p-4 transition hover:bg-violet-50/20">
                    <div className="relative overflow-hidden bg-gradient-to-br from-slate-100 to-violet-50 p-3">
                      <span className="absolute left-4 top-4 z-10 bg-emerald-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">Protected</span>
                      <div className="absolute inset-x-6 bottom-6 h-24 rounded-full bg-violet-100/80 blur-3xl" />
                      <img
                        src="/images/car.jpg"
                        alt="Insured car"
                        className="relative mx-auto aspect-video h-auto w-full max-w-full object-cover object-center"
                      />
                    </div>

                    <div className="mt-4 text-center sm:text-left">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-500">Primary vehicle</p>
                      <h3 className="mt-1 text-2xl font-semibold text-slate-950">Your Vehicle Overview</h3>
                      <p className="mt-3 text-sm text-slate-500">{primaryPolicy ? `Policy ${primaryPolicy.policyNumber || "record"} is loaded from your current motor-policy records.` : policyMessage}</p>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="border border-slate-100 bg-slate-50 p-3 text-center">
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Policy</p>
                        <p className="mt-3 text-lg font-semibold text-slate-950">{primaryPolicy?.cover || "—"}</p>
                      </div>
                      <div className="border border-emerald-100 bg-emerald-50 p-3 text-center">
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Status</p>
                        <p className="mt-3 text-lg font-semibold text-violet-600">{primaryPolicy?.status || "—"}</p>
                      </div>
                      <div className="border border-violet-100 bg-violet-50 p-3 text-center">
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Renewal</p>
                        <p className="mt-3 text-lg font-semibold text-slate-950">{primaryPolicy?.endDate ? new Date(primaryPolicy.endDate).toLocaleDateString(undefined, { month: "short", year: "numeric" }) : "—"}</p>
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
                                className={`w-full transition hover:bg-violet-500 ${item.active ? "bg-gradient-to-t from-[#412484] to-violet-500" : "bg-violet-200"}`}
                                style={{ height: `${item.height}%` }}
                              />
                            </div>
                            <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500">{item.day}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 bg-white p-2 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
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
                      <span className="bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600">2 new</span>
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
                  <a href="#" className="text-sm font-semibold text-violet-600 hover:text-violet-700">
                    View All
                  </a>
                </div>

                <div className="mt-4 overflow-hidden border border-violet-100 bg-slate-50 text-sm text-slate-900">
                  <div className="grid grid-cols-1 gap-4 border-b border-violet-100 bg-gradient-to-r from-violet-50 to-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 sm:grid-cols-[1.6fr_0.8fr_0.9fr]">
                    <span>Policy</span>
                    <span>Status</span>
                    <span>Renewal</span>
                  </div>
                  <div className="grid grid-cols-1 items-center gap-4 border-b border-slate-100 bg-white px-5 py-4 text-sm transition hover:bg-violet-50/60 sm:grid-cols-[1.6fr_0.8fr_0.9fr]">
                    <span className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center bg-violet-100 font-bold text-violet-700">C</span><span><span className="block font-semibold">Comprehensive Car Cover</span><span className="text-xs text-slate-400">Policy #MI-1087</span></span></span>
                    <span><span className="inline-flex bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Active</span></span>
                    <span><span className="block font-medium">12 Aug 2026</span><span className="text-xs text-slate-400">12 months left</span></span>
                  </div>
                  <div className="grid grid-cols-1 items-center gap-4 bg-white px-5 py-4 text-sm transition hover:bg-violet-50/60 sm:grid-cols-[1.6fr_0.8fr_0.9fr]">
                    <span className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center bg-sky-100 font-bold text-sky-700">T</span><span><span className="block font-semibold">Third Party Liability</span><span className="text-xs text-slate-400">Policy #TPL-2042</span></span></span>
                    <span><span className="inline-flex bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">Pending</span></span>
                    <span><span className="block font-medium">03 Sep 2026</span><span className="text-xs text-slate-400">Awaiting approval</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "about":
        return (
          <div className="p-4 sm:p-5 space-y-6">
            <div className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-[#35126d]">About Us</h2>
              <div className="space-y-4 text-slate-700">
                <p>New India Assurance Co. Ltd. is a leading general insurance company with a strong presence in Mauritius. We have been providing reliable insurance solutions for decades, helping individuals and businesses protect what matters most.</p>
                <p>Our mission is to deliver comprehensive insurance coverage with exceptional customer service, innovative products, and competitive pricing. We believe in building long-term relationships based on trust, transparency, and mutual benefit.</p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm">
                    <h3 className="font-semibold text-[#35126d] mb-2">Our Vision</h3>
                    <p className="text-sm">To be the preferred insurance partner in Mauritius, recognized for excellence in service and innovation.</p>
                  </div>
                  <div className="rounded-xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm">
                    <h3 className="font-semibold text-[#35126d] mb-2">Our Mission</h3>
                    <p className="text-sm">To provide comprehensive insurance solutions that protect our customers&apos; assets and give them peace of mind.</p>
                  </div>
                  <div className="rounded-xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm">
                    <h3 className="font-semibold text-[#35126d] mb-2">Our Values</h3>
                    <p className="text-sm">Integrity, Customer Focus, Innovation, Excellence, and Teamwork guide everything we do.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "products":
        return (
          <div className="p-4 sm:p-5 space-y-6">
            <div className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-[#35126d]">Our Products</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { name: "Comprehensive Motor", desc: "Full coverage for your vehicle including own damage, third party, theft, and fire.", icon: "car" },
                  { name: "Third Party Only", desc: "Basic legal requirement coverage for third party liability.", icon: "document" },
                  { name: "Third Party Fire & Theft", desc: "Third party liability plus protection against fire and theft.", icon: "fire" },
                  { name: "Commercial Vehicle", desc: "Specialized coverage for trucks, buses, and commercial fleet vehicles.", icon: "truck" },
                  { name: "Two Wheeler", desc: "Affordable coverage for motorcycles and scooters.", icon: "motorcycle" },
                  { name: "Personal Accident", desc: "Financial protection against accidental death and disability.", icon: "shield" },
                ].map((product) => (
                  <div key={product.name} className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-lg">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-violet-50 ring-1 ring-violet-100">
                      {product.icon === "car" && (
                        <svg className="w-6 h-6 text-[#35126d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 16l1.5-6h11l1.5 6M4 16h16v4h-3v-2H7v2H4zM7 13h.01M17 13h.01" />
                        </svg>
                      )}
                      {product.icon === "document" && (
                        <svg className="w-6 h-6 text-[#35126d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                      {product.icon === "fire" && (
                        <svg className="w-6 h-6 text-[#35126d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                        </svg>
                      )}
                      {product.icon === "truck" && (
                        <svg className="w-6 h-6 text-[#35126d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      )}
                      {product.icon === "motorcycle" && (
                        <svg className="w-6 h-6 text-[#35126d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      )}
                      {product.icon === "shield" && (
                        <svg className="w-6 h-6 text-[#35126d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      )}
                    </div>
                    <h3 className="font-semibold text-slate-950 mb-2">{product.name}</h3>
                    <p className="text-sm text-slate-600">{product.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case "claims":
        return (
          <div className="p-4 sm:p-5 space-y-6">
            <div className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-[#35126d]">Register a Claim</h2>
              <div className="space-y-4">
                <p className="text-slate-700">To register a claim, please provide the following information:</p>
                <div className="space-y-4 max-w-2xl">
                  <div className="grid gap-2 sm:grid-cols-[max-content_1fr]">
                    <label className="text-sm font-medium text-slate-700">Policy Number</label>
                    <input type="text" placeholder="Enter your policy number" className="h-10 rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#35126d] focus:ring-4 focus:ring-violet-100" />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-[max-content_1fr]">
                    <label className="text-sm font-medium text-slate-700">Vehicle Registration</label>
                    <input type="text" placeholder="Enter vehicle registration number" className="h-10 rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#35126d] focus:ring-4 focus:ring-violet-100" />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-[max-content_1fr]">
                    <label className="text-sm font-medium text-slate-700">Date of Incident</label>
                    <input type="date" className="h-10 rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#35126d] focus:ring-4 focus:ring-violet-100" />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-[max-content_1fr]">
                    <label className="text-sm font-medium text-slate-700">Type of Claim</label>
                    <select className="h-10 rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#35126d] focus:ring-4 focus:ring-violet-100">
                      <option value="">Select claim type</option>
                      <option value="own-damage">Own Damage</option>
                      <option value="third-party">Third Party</option>
                      <option value="theft">Theft</option>
                      <option value="fire">Fire</option>
                    </select>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-[max-content_1fr]">
                    <label className="text-sm font-medium text-slate-700">Description</label>
                    <textarea rows={4} placeholder="Describe the incident..." className="h-10 rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#35126d] focus:ring-4 focus:ring-violet-100" />
                  </div>
                  <button className="rounded-xl bg-gradient-to-r from-[#35126d] to-[#5b3aa4] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-violet-900/20 transition hover:from-[#2b0f5a] hover:to-[#4c2f8f]">Submit Claim</button>
                </div>
              </div>
            </div>
          </div>
        );
      case "contact":
        return (
          <div className="p-4 sm:p-5 space-y-6">
            <div className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-[#35126d]">Contact Us</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="font-semibold text-slate-950 mb-3">Get in Touch</h3>
                  <div className="space-y-3 text-slate-700">
                    <p><strong>New India Assurance Co. Ltd.</strong></p>
                    <p>Port Louis, Mauritius</p>
                    <p>Phone: +230 123 4567</p>
                    <p>Email: info@newindia.mu</p>
                    <p>Website: www.newindia.mu</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-950 mb-3">Send a Message</h3>
                  <div className="space-y-4 max-w-md">
                    <div className="grid gap-2 sm:grid-cols-[max-content_1fr]">
                      <label className="text-sm font-medium text-slate-700">Name</label>
                      <input type="text" placeholder="Your name" className="h-10 rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#35126d] focus:ring-4 focus:ring-violet-100" />
                    </div>
                    <div className="grid gap-2 sm:grid-cols-[max-content_1fr]">
                      <label className="text-sm font-medium text-slate-700">Email</label>
                      <input type="email" placeholder="your@email.com" className="h-10 rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#35126d] focus:ring-4 focus:ring-violet-100" />
                    </div>
                    <div className="grid gap-2 sm:grid-cols-[max-content_1fr]">
                      <label className="text-sm font-medium text-slate-700">Subject</label>
                      <select className="h-10 rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#35126d] focus:ring-4 focus:ring-violet-100">
                        <option value="">Select subject</option>
                        <option value="general">General Inquiry</option>
                        <option value="claims">Claims</option>
                        <option value="policy">Policy Questions</option>
                        <option value="complaints">Complaints</option>
                      </select>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-[max-content_1fr]">
                      <label className="text-sm font-medium text-slate-700">Message</label>
                      <textarea rows={4} placeholder="Your message..." className="h-10 rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#35126d] focus:ring-4 focus:ring-violet-100" />
                    </div>
                    <button className="rounded-xl bg-gradient-to-r from-[#35126d] to-[#5b3aa4] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-violet-900/20 transition hover:from-[#2b0f5a] hover:to-[#4c2f8f]">Send Message</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "support":
        return (
          <div className="p-4 sm:p-5 space-y-6">
            <div className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-[#35126d]">Support Ticket</h2>
              <div className="space-y-4 max-w-2xl">
                <p className="text-slate-700">Create a support ticket for any issues or questions you may have.</p>
                <div className="space-y-4">
                  <div className="grid gap-2 sm:grid-cols-[max-content_1fr]">
                    <label className="text-sm font-medium text-slate-700">Subject</label>
                    <input type="text" placeholder="Brief description of the issue" className="h-10 rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#35126d] focus:ring-4 focus:ring-violet-100" />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-[max-content_1fr]">
                    <label className="text-sm font-medium text-slate-700">Priority</label>
                    <select defaultValue="medium" className="h-10 rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#35126d] focus:ring-4 focus:ring-violet-100">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-[max-content_1fr]">
                    <label className="text-sm font-medium text-slate-700">Category</label>
                    <select className="h-10 rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#35126d] focus:ring-4 focus:ring-violet-100">
                      <option value="">Select category</option>
                      <option value="technical">Technical Issue</option>
                      <option value="billing">Billing</option>
                      <option value="policy">Policy Management</option>
                      <option value="claims">Claims</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-[max-content_1fr]">
                    <label className="text-sm font-medium text-slate-700">Description</label>
                    <textarea rows={5} placeholder="Describe the issue in detail..." className="h-10 rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#35126d] focus:ring-4 focus:ring-violet-100" />
                  </div>
                  <button className="rounded-xl bg-gradient-to-r from-[#35126d] to-[#5b3aa4] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-violet-900/20 transition hover:from-[#2b0f5a] hover:to-[#4c2f8f]">Create Ticket</button>
                </div>
              </div>
            </div>
          </div>
        );
      case "notifications":
        return (
          <div className="p-4 sm:p-5 space-y-6">
            <div className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-[#35126d]">Notifications</h2>
              <div className="space-y-4">
                <div className="border border-amber-100 bg-amber-50/70 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </span>
                    <div>
                      <p className="font-semibold text-slate-950">Policy Renewal Reminder</p>
                      <p className="mt-1 text-sm text-slate-600">Your car cover renews on 12 Aug 2026. Renew early to avoid coverage gaps.</p>
                      <p className="mt-2 text-xs text-slate-400">2 days ago</p>
                    </div>
                  </div>
                </div>
                <div className="border border-sky-100 bg-sky-50/70 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </span>
                    <div>
                      <p className="font-semibold text-slate-950">Claim Update</p>
                      <p className="mt-1 text-sm text-slate-600">Your claim #1087 is currently under review. We&apos;ll notify you once a decision is made.</p>
                      <p className="mt-2 text-xs text-slate-400">1 week ago</p>
                    </div>
                  </div>
                </div>
                <div className="border border-violet-100 bg-violet-50/70 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.759 1.074a10.105 10.105 0 0110.718 10.718c.672.679 1.074 1.649 1.074 2.759s-.402 2.08-1.074 2.759A10.105 10.105 0 0112 22c-5.523 0-10-4.477-10-10S6.477 2 12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10z" />
                      </svg>
                    </span>
                    <div>
                      <p className="font-semibold text-slate-950">New Partner Discounts</p>
                      <p className="mt-1 text-sm text-slate-600">Exclusive discounts available from our partner garages and service centers.</p>
                      <p className="mt-2 text-xs text-slate-400">2 weeks ago</p>
                    </div>
                  </div>
                </div>
                <div className="border border-emerald-100 bg-emerald-50/70 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <div>
                      <p className="font-semibold text-slate-950">Payment Confirmed</p>
                      <p className="mt-1 text-sm text-slate-600">Your premium payment of Rs. 15,000 has been successfully processed.</p>
                      <p className="mt-2 text-xs text-slate-400">3 weeks ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "expert":
        return (
          <div className="p-4 sm:p-5 space-y-6">
            <div className="rounded-2xl border border-violet-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-[#35126d]">Talk to an Expert</h2>
              <div className="space-y-4">
                <p className="text-slate-700">Our insurance experts are available to help you choose the right coverage, answer questions about your policy, or assist with claims.</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="border border-violet-100 bg-violet-50 p-5 rounded-lg text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-[#35126d] rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-slate-950 mb-2">Call Us</h3>
                    <p className="text-sm text-slate-600 mb-2">Speak directly with an advisor</p>
                    <p className="text-lg font-semibold text-[#35126d]">+230 123 4567</p>
                    <p className="text-xs text-slate-500 mt-1">Mon-Fri: 9am-5pm</p>
                  </div>
                  <div className="border border-violet-100 bg-violet-50 p-5 rounded-lg text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-[#35126d] rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h4M8 12l2-2m-2 2l-2-2m2 2v4m-2-4h8M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-slate-950 mb-2">Live Chat</h3>
                    <p className="text-sm text-slate-600 mb-2">Chat with our support team online</p>
                    <button className="rounded-xl bg-gradient-to-r from-[#35126d] to-[#5b3aa4] px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:from-[#2b0f5a] hover:to-[#4c2f8f]">Start Chat</button>
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-4">
                  <h3 className="font-semibold text-slate-950 mb-3">Schedule a Callback</h3>
                  <div className="space-y-3 max-w-md">
                    <div className="grid gap-2 sm:grid-cols-[max-content_1fr]">
                      <label className="text-sm font-medium text-slate-700">Preferred Date</label>
                      <input type="date" className="h-10 rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#35126d] focus:ring-4 focus:ring-violet-100" />
                    </div>
                    <div className="grid gap-2 sm:grid-cols-[max-content_1fr]">
                      <label className="text-sm font-medium text-slate-700">Preferred Time</label>
                      <select className="h-10 rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#35126d] focus:ring-4 focus:ring-violet-100">
                        <option value="">Select time</option>
                        <option value="morning">Morning (9am-12pm)</option>
                        <option value="afternoon">Afternoon (12pm-3pm)</option>
                        <option value="late">Late Afternoon (3pm-5pm)</option>
                      </select>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-[max-content_1fr]">
                      <label className="text-sm font-medium text-slate-700">Phone Number</label>
                      <input type="tel" placeholder="Your contact number" className="h-10 rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#35126d] focus:ring-4 focus:ring-violet-100" />
                    </div>
                    <div className="grid gap-2 sm:grid-cols-[max-content_1fr]">
                      <label className="text-sm font-medium text-slate-700">Topic</label>
                      <select className="h-10 rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#35126d] focus:ring-4 focus:ring-violet-100">
                        <option value="">Select topic</option>
                        <option value="new-policy">New Policy Quote</option>
                        <option value="renewal">Policy Renewal</option>
                        <option value="claims">Claims Assistance</option>
                        <option value="general">General Inquiry</option>
                      </select>
                    </div>
                    <button className="rounded-xl bg-gradient-to-r from-[#35126d] to-[#5b3aa4] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-violet-900/20 transition hover:from-[#2b0f5a] hover:to-[#4c2f8f]">Schedule Callback</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-4 sm:p-5">
            <div className="border border-slate-200 bg-white p-6 text-center">
              <p className="text-slate-600">Select a tab to view content</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#f4efff_0,_#f5f7fb_42%,_#eef1f7_100%)] font-sans text-slate-900">
      <main className="flex min-h-screen w-full items-start gap-3 p-2 sm:p-3">
        <aside className="sticky top-3 hidden w-[280px] shrink-0 md:block">
          <div className="overflow-hidden rounded-2xl border border-white bg-white shadow-[0_18px_50px_rgba(53,18,109,0.10)]">
            <div className="flex h-20 items-center justify-center border-b border-violet-100 bg-gradient-to-br from-white to-violet-50 px-4">
              <img src="/images/logo.png" alt="New India Assurance logo" className="h-12 object-contain" />
            </div>

            <div className="space-y-3 p-4">
              <div className="rounded-xl bg-gradient-to-br from-[#35126d] to-[#5b3aa4] p-4 text-white shadow-md">
                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-violet-200">Get covered</p>
                <p className="mt-1 text-sm font-semibold leading-5">Buy or renew your motor insurance online in minutes.</p>
              </div>

              <div className="rounded-xl border border-violet-100 bg-slate-50/70 p-3">
                <label htmlFor="sector" className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Sector</label>
                <select id="sector" value={sector} onChange={(event) => setSector(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-violet-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-violet-600 focus:ring-2 focus:ring-violet-100">
                  <option value="" disabled>Select sector</option>
                  <option value="motor">Motor Insurance</option>
                </select>
              </div>

              <div className="rounded-xl border border-violet-100 bg-white p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Online services</p>
                <div className="mt-3 grid gap-2">
                  {([["buy", "Buy Online", "M12 4v16m8-8H4"], ["renew", "Renew Online", "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"]] as const).map(([service, label, path]) => (
                    <label key={service} className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm font-medium transition ${onlineService === service ? "border-[#35126d] bg-violet-50 text-[#35126d]" : "border-slate-200 text-slate-700 hover:border-violet-300 hover:bg-violet-50/50"}`}>
                      <input
                        type="checkbox"
                        checked={onlineService === service}
                        onChange={() => setOnlineService((current) => current === service ? "" : service)}
                        className="h-4 w-4 accent-violet-600"
                      />
                      <span className={`flex h-7 w-7 items-center justify-center rounded-md ${onlineService === service ? "bg-[#35126d] text-white" : "bg-violet-100 text-[#35126d]"}`}><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} /></svg></span>
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button type="button" disabled={!canContinue} onClick={handleGo} className="h-11 rounded-xl bg-gradient-to-r from-[#35126d] to-[#5b3aa4] px-4 text-sm font-semibold uppercase tracking-[0.12em] text-white shadow-md shadow-violet-900/20 transition hover:from-[#2b0f5a] hover:to-[#4c2f8f] disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300 disabled:text-slate-500 disabled:shadow-none">
                  Go
                </button>
                <button type="button" className="h-11 rounded-xl border border-violet-300 bg-white px-3 text-sm font-semibold text-violet-700 transition hover:bg-violet-50">
                  Get Quote
                </button>
              </div>
              {!canContinue ? <p className="text-center text-[11px] text-slate-400">Select Motor Insurance and Buy Online to continue.</p> : null}
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1 space-y-3">
          <header className="relative z-30 rounded-2xl border border-white bg-white/95 px-3 py-2.5 shadow-[0_10px_30px_rgba(53,18,109,0.08)] backdrop-blur sm:px-4">
            <div className="flex items-center justify-between gap-4">
              <nav className="flex min-w-0 items-center gap-1" aria-label="Main navigation">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-[#35126d] to-[#5b3aa4] text-white shadow-md shadow-violet-900/20"
                        : "text-slate-600 hover:bg-violet-50 hover:text-[#412484]"
                    } hidden xl:flex`}
                    aria-current={activeTab === tab.id ? "page" : undefined}
                  >
                    <TabIcon name={tab.icon} className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}

                <details className="group relative xl:hidden">
                  <summary className="flex h-10 cursor-pointer list-none items-center gap-2 rounded-xl px-3 text-xs font-semibold text-slate-600 transition hover:bg-violet-50 hover:text-[#412484] [&::-webkit-details-marker]:hidden">
                    Menu
                    <svg className="h-4 w-4 transition group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="absolute left-0 top-[calc(100%+0.6rem)] w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_50px_rgba(30,20,70,0.16)]">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-violet-50 hover:text-[#412484] ${activeTab === tab.id ? "bg-violet-50 text-[#412484]" : "text-slate-600"}`}
                      >
                        <TabIcon name={tab.icon} className="h-4 w-4" />
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </details>
              </nav>

              <details className="group relative shrink-0">
                <summary className="flex cursor-pointer list-none items-center gap-3 rounded-xl p-1.5 pr-2 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-100 [&::-webkit-details-marker]:hidden">
                  <span className="hidden text-right sm:block">
                    <span className="block text-xs font-semibold text-slate-800">{displayName}</span>
                    <span className="mt-0.5 block text-[10px] text-slate-400">My account</span>
                  </span>
                  <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#35126d] to-[#5b3aa4] text-sm font-bold text-white shadow-md ring-2 ring-white">
                    {([profile.FirstName, profile.Surname].map((part) => part?.charAt(0) || "").join("").toUpperCase()) || <img src="/images/car_white.jpg" alt={`${displayName} profile`} className="h-full w-full object-cover" />}
                  </span>
                  <svg className="h-4 w-4 text-slate-400 transition group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="absolute right-0 top-[calc(100%+0.6rem)] w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_60px_rgba(30,20,70,0.18)]">
                  <div className="mb-2 rounded-xl bg-gradient-to-br from-[#412484] to-[#6f4bb6] px-4 py-3 text-white">
                    <p className="text-sm font-semibold">{displayName}</p>
                    <p className="mt-0.5 text-xs text-violet-100">Your account</p>
                  </div>
                  {[
                    ["PROFILE", "/profile", "profile"],
                    ["MY PRODUCTS", "#products", "products"],
                    ["KYC", "#kyc", "kyc"],
                    ["SETTINGS", "#settings", "settings"],
                  ].map(([item, href, icon]) => (
                    <Link key={item} href={href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold tracking-wide text-slate-600 transition hover:bg-violet-50 hover:text-[#412484]">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-[#5b3aa4]">
                        <UserMenuIcon name={icon} />
                      </span>
                      {item}
                    </Link>
                  ))}
                  <div className="my-2 h-px bg-slate-100" />
                  <LogoutButton />
                </div>
              </details>
            </div>
          </header>

          {/* Welcome banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#35126d] via-[#4a2894] to-[#6f4bb6] px-5 py-5 text-white shadow-[0_18px_50px_rgba(53,18,109,0.20)] sm:px-6">
            <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-200">Welcome back</p>
                <h2 className="mt-1 text-xl font-bold sm:text-2xl">{displayName}</h2>
                <p className="mt-1 text-sm text-violet-100">{primaryPolicy ? `Policy ${primaryPolicy.policyNumber || ""} is active on your account.` : "Manage your motor policies, claims and documents in one place."}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => { setSector("motor"); setOnlineService("buy"); setHasAcceptedRakNotice(false); setShowRakAlert(true); }} className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#35126d] shadow-sm transition hover:bg-violet-50">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Buy Online
                </button>
                <button type="button" onClick={() => { setSector("motor"); setOnlineService("renew"); setRegistrationNumber(""); setRegistrationError(""); setShowRenewPrompt(true); }} className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/15 px-4 text-sm font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/25">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> Renew Online
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white bg-white/60 shadow-sm">
          {renderTabContent()}
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

            <div className="sticky bottom-0 flex flex-col gap-4 border-t border-slate-200 bg-white px-6 py-5 sm:px-8">
              <label className="flex cursor-pointer items-start gap-3 text-sm font-medium leading-6 text-slate-700">
                <input
                  type="checkbox"
                  checked={hasAcceptedRakNotice}
                  onChange={(event) => setHasAcceptedRakNotice(event.target.checked)}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-violet-700"
                />
                I have read and understood this important notice.
              </label>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowRakAlert(false)} className="border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancel</button>
                <button type="button" disabled={!hasAcceptedRakNotice} onClick={() => router.push("/buy-online")} className="bg-[#35126d] px-8 py-3 text-sm font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:hover:bg-slate-300">OK</button>
              </div>
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
