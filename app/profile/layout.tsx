import { requirePageUser } from "@/lib/require-auth";

export default async function ProfileLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requirePageUser();
  return children;
}
