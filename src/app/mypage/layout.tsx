import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabaseServer";

export default async function MyPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/mypage");
  }

  return <>{children}</>;
}
