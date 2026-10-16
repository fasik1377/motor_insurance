import "server-only";

import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth";

export async function requirePageUser() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  return userId;
}
