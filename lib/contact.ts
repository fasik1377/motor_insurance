import "server-only";

import type { ContactType } from "@/lib/otp";

export type NormalizedContact = {
  type: ContactType;
  value: string;
};

export function normalizeContact(type: ContactType, input: unknown): NormalizedContact | null {
  if (typeof input !== "string") return null;

  if (type === "email") {
    const value = input.trim().toLowerCase();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254
      ? { type, value }
      : null;
  }

  const compact = input.trim().replace(/[\s()-]/g, "");
  const value = compact.startsWith("00") ? `+${compact.slice(2)}` : compact;
  return /^\+[1-9]\d{7,14}$/.test(value) ? { type, value } : null;
}
