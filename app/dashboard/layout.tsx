import type { Metadata } from "next";
import { requirePageUser } from "@/lib/require-auth";

export const metadata: Metadata = {
  title: "New India Assurance | Dashboard",
  description: "Dashboard view for New India Assurance motor insurance users.",
};

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requirePageUser();
  return children;
}
