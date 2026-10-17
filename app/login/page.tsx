"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthError, AuthIcon, AuthShell, RobotCheck, authButtonClass, authInputClass } from "../_components/auth-shell";

export default function LoginPage() {
  const router = useRouter();
  const [contact, setContact] = useState("");
  const [robotChecked, setRobotChecked] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = contact.trim();
    if (!robotChecked || !value) return;
    const type=value.includes("@")?"email":"mobile"; setSending(true); setError("");
    try { const response=await fetch("/api/auth/otp",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contact:value,type})}),data=await response.json();if(!response.ok)throw new Error(data.error||"Unable to send code.");router.push(`/otp?type=${type}&contact=${encodeURIComponent(value)}`); } catch(reason){setError(reason instanceof Error?reason.message:"Unable to send code.");setSending(false);}
  };

  // Shows an e-mail or phone icon depending on what the user types.
  const looksLikeEmail = contact.includes("@") || /[a-z]/i.test(contact);

  return (
    <AuthShell
      eyebrow="Welcome"
      title="Sign in or sign up"
      description="Enter your email or mobile number and we’ll send you a secure code."
      heroTitle="Insurance built around every journey."
      heroText="Sign in securely to manage your policy, renew your cover, and keep moving with confidence."
      step={{ current: 1, total: 4, label: "Your contact" }}
      footnote="Your information is encrypted and securely handled."
    >
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-slate-700">Email or mobile number
          <span className="relative mt-2 block">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><AuthIcon name={looksLikeEmail || !contact ? "mail" : "phone"} /></span>
            <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="example@gmail.com" autoComplete="email" className={authInputClass} />
          </span>
        </label>
        <RobotCheck checked={robotChecked} onChange={setRobotChecked} />
        <AuthError message={error} />
        <button type="submit" disabled={sending || !robotChecked || !contact.trim()} className={authButtonClass}>
          {sending ? "Sending code..." : <>Continue securely <AuthIcon name="arrow" className="h-4 w-4 transition group-hover:translate-x-0.5" /></>}
        </button>
      </form>
    </AuthShell>
  );
}
