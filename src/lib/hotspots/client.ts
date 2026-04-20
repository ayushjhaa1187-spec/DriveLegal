import { createClient } from "@/lib/supabase/client";

export interface HotspotUI {
  id: string;
  lat: number;
  lng: number;
  type: "enforcement" | "fine" | "danger" | "other";
  description: string;
  reporter_id: string;
  trust_score: number;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
}

export async function fetchActiveHotspots(): Promise<HotspotUI[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('v_hotspots_public')
    .select('*')
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching hotspots:', error);
    return [];
  }

  return (data || []) as HotspotUI[];
}

export async function submitHotspot(data: {
  lat: number;
  lng: number;
  type: string;
  description: string;
}) {
  const supabase = createClient();
  const { data: result, error } = await supabase.functions.invoke('hotspot-create', {
    body: data
  });

  if (error) throw error;
  return result;
}

export async function voteOnHotspot(hotspotId: string, isUpvote: boolean) {
  const supabase = createClient();
  const { error } = await supabase
    .from('hotspot_votes')
    .upsert({
      hotspot_id: hotspotId,
      vote_type: isUpvote ? 1 : -1
    });

  if (error) throw error;
}

