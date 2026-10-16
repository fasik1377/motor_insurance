"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return <button type="button" disabled={busy} onClick={async () => {
    setBusy(true);
    try { await fetch("/api/auth/logout", { method: "POST" }); } finally {
      router.replace("/login");
      router.refresh();
    }
  }} className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-xs font-semibold tracking-wide text-rose-600 transition hover:bg-rose-50 disabled:opacity-60">
    <span className="flex h-8 w-8 items-center justify-center bg-rose-50 text-base" aria-hidden="true">&#8617;</span>
    {busy ? "SIGNING OUT..." : "LOGOUT"}
  </button>;
}
