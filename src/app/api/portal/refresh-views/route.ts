import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();

  // 1. Auth check
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Role check
  const { data: roleData, error: roleError } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", session.user.id);

  if (roleError) {
    return NextResponse.json({ error: "Failed to verify roles" }, { status: 500 });
  }

  const roles = roleData?.map((r: any) => r.roles?.name) || [];
  if (!roles.includes("admin")) {
    return NextResponse.json({ error: "Admin strictly required for data refresh." }, { status: 403 });
  }

  // 3. Trigger RPC
  const { error: rpcError } = await supabase.rpc("refresh_portal_views");

  if (rpcError) {
    console.error("[api/refresh-views] RPC Error:", rpcError);
    return NextResponse.json({ error: "Materialized view refresh failed." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
