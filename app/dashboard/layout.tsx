import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New India Assurance | Dashboard",
  description: "Dashboard view for New India Assurance motor insurance users.",
};

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
