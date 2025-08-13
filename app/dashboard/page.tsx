import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard/dashboard-layout";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Check if Supabase is properly configured
  if (!supabase.auth) {
    // If Supabase is not configured, redirect to login
    redirect("/auth/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return <DashboardLayout user={user} />;
}
