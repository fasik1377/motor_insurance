import { requirePageUser } from "@/lib/require-auth";

export default async function BuyOnlineLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requirePageUser();
  return children;
}
