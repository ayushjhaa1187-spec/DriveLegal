import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/portal/AdminDashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | DriveLegal",
  description: "Researcher and administrator portal for forensic data review and system management.",
};

export default async function AdminPortalPage() {
  const supabase = await createClient();

  // 1. Auth check
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect("/auth?next=/portal/admin");
  }

  // 2. Role check (fetch from join)
  const { data: roleData } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", session.user.id);

  const roles = roleData?.map((r: any) => r.roles?.name) || [];
  const isAdmin = roles.includes("admin");
  const isResearcher = roles.includes("researcher");

  if (!isAdmin && !isResearcher) {
    redirect("/portal?error=unauthorized");
  }

  // 3. Fetch raw data for dashboard using server client
  // We fetch a larger sample for forensic review
  const [
    { data: recentScans },
    { data: recentCalcs },
    { data: activeHotspots }
  ] = await Promise.all([
    supabase.from("scan_events").select("*").order("created_at", { ascending: false }).limit(100),
    supabase.from("calc_events").select("*").order("created_at", { ascending: false }).limit(100),
    supabase.from("hotspots").select("*").order("created_at", { ascending: false }).limit(50)
  ]);

  // Aggregate stats
  const stats = {
    totalScans: recentScans?.length || 0,
    overchargedCount: recentScans?.filter(s => s.status === 'overcharged').length || 0,
    totalOverchargeINR: recentScans?.reduce((acc, s) => acc + (s.overcharge_total_inr || 0), 0) || 0,
    complianceRate: recentScans?.length ? 
      (recentScans.filter(s => s.status === 'correct').length / recentScans.length) * 100 : 0
  };

  return (
    <AdminDashboard 
      initialScans={recentScans || []}
      initialCalcs={recentCalcs || []}
      initialHotspots={activeHotspots || []}
      stats={stats}
      isAdmin={isAdmin}
    />
  );
}
