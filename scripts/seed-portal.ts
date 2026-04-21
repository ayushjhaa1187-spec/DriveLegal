import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const METROS = [
  { state: "MH", city: "Mumbai", geohash: "te7ud" },
  { state: "DL", city: "Delhi", geohash: "tdr5v" },
  { state: "KA", city: "Bangalore", geohash: "tdr1v" }
];

async function seed() {
  console.log("🌱 Seeding High-Fidelity Transparency Portal Data (1000+ entries)...");

  // 1. Clear existing scan_events for clean demo state (Optional)
  // await supabase.from("scan_events").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  const events = [];
  const now = new Date();

  for (let i = 0; i < 1100; i++) {
    const metro = METROS[Math.floor(Math.random() * METROS.length)];
    
    // Weighted status: 70% correct, 20% overcharged, 10% unverified
    const rand = Math.random();
    let status = "correct";
    let overcharge_total_inr = 0;
    let charged_total_inr = 1000;
    let legal_total_inr = 1000;
    
    if (rand > 0.7 && rand <= 0.9) {
      status = "overcharged";
      overcharge_total_inr = Math.floor(Math.random() * 20) * 100 + 500; // 500 - 2500 INR
      charged_total_inr = legal_total_inr + overcharge_total_inr;
    } else if (rand > 0.9) {
      status = "unverified";
    }

    // Historical timestamp (last 30 days)
    const daysAgo = Math.floor(Math.random() * 30);
    const created_at = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000)).toISOString();

    events.push({
      state_code: metro.state,
      geohash_5: metro.geohash,
      status,
      charged_total_inr,
      legal_total_inr,
      overcharge_total_inr,
      created_at
    });

    // Batch inserts for efficiency
    if (events.length >= 200) {
      const { error } = await supabase.from("scan_events").insert(events);
      if (error) console.error("❌ Batch insert failed:", error.message);
      events.length = 0;
      process.stdout.write(".");
    }
  }

  // Insert remaining
  if (events.length > 0) {
    await supabase.from("scan_events").insert(events);
  }

  console.log("\n✅ Seeded 1,100 forensic events across Mumbai, Delhi, and Bangalore.");
  console.log("✨ Portal data is now high-fidelity and analytics-ready.");
}

seed().catch(console.error);
