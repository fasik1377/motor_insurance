import { requirePageUser } from "@/lib/require-auth";

export default async function RenewOnlineLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requirePageUser();
  return children;
}
