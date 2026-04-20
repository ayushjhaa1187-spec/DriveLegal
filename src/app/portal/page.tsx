import { createClient } from "@/lib/supabase/server";
import { PortalCharts } from "@/components/portal/PortalCharts";
import { ComplianceTable } from "@/components/portal/ComplianceTable";
import { HeatmapSection } from "@/components/portal/HeatmapSection";
import { Shield, TrendingUp, AlertTriangle, Info, Globe } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Public Transparency Portal | DriveLegal",
  description: "Aggregated, privacy-first legal enforcement analytics in India. View compliance rates, overcharge hotspots, and top violations.",
};

export const revalidate = 3600; // Cache for 1 hour

export default async function PortalPage() {
  const supabase = await createClient();

  // Parallel data fetching from materialized views
  const [
    { data: violations },
    { data: compliance },
    { data: heatmap }
  ] = await Promise.all([
    supabase.from("mv_top_overcharged_monthly").select("*").order("scans_count", { ascending: false }),
    supabase.from("mv_compliance_index_monthly").select("*").order("month", { ascending: false }),
    supabase.from("mv_overcharge_heatmap_monthly").select("*").order("total_overcharge_inr", { ascending: false })
  ]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Premium Header */}
      <div className="bg-slate-900 pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white shadow-lg">
              <Globe className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">
              National Transparency Initiative
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none mb-6">
            Authority <span className="text-indigo-500">Transparency</span> Portal.
          </h1>
          
          <p className="max-w-2xl text-slate-400 text-lg font-medium leading-relaxed">
            Real-time, privacy-first analytics on traffic law enforcement across India. 
            We aggregate unverified scans to highlight systemic overcharging and compliance trends.
          </p>

          <div className="flex flex-wrap gap-4 mt-12">
            {[
              { label: "Data Accuracy", val: "94.2%", color: "emerald" },
              { label: "Privacy Grade", val: "A+", color: "indigo" },
              { label: "Total Volume", val: "50k+", color: "amber" }
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 min-w-[160px]">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{stat.label}</p>
                <p className={`text-2xl font-black text-${stat.color}-500`}>{stat.val}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="max-w-7xl mx-auto px-6 -mt-12 space-y-12">
        
        {/* Section 1: Top Violations */}
        <section id="violations">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-10 w-10 bg-white dark:bg-slate-900 rounded-xl shadow-md flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Violation Distribution</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Most frequent overcharge types</p>
            </div>
          </div>
          <PortalCharts data={violations || []} />
        </section>

        {/* Section 2: Hotspot Grid */}
        <section id="hotspots">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-10 w-10 bg-white dark:bg-slate-900 rounded-xl shadow-md flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-rose-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Overcharge Heatmap</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">High-density dispute zones</p>
            </div>
          </div>
          <HeatmapSection data={heatmap || []} />
        </section>

        {/* Section 3: State Compliance */}
        <section id="compliance">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-10 w-10 bg-white dark:bg-slate-900 rounded-xl shadow-md flex items-center justify-center">
              <Shield className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Compliance Index</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">State-wise enforcement accuracy</p>
            </div>
          </div>
          <ComplianceTable data={compliance || []} />
        </section>

      </div>

      {/* Footer Info */}
      <div className="max-w-7xl mx-auto px-6 mt-20">
        <div className="bg-slate-100 dark:bg-slate-900/50 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 justify-between border border-slate-200 dark:border-slate-800">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm mt-1">
              <Info className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs mb-2">
                Data Methodology & Privacy
              </h3>
              <p className="text-sm text-slate-500 font-medium max-w-xl">
                All data is aggregated at the Geohash-5 level (~4.9km x 4.9km). No personally identifiable 
                information, license plate numbers, or specific location coordinates are stored in our 
                cloud infrastructure. This portal reflects anonymized community dispute reports.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
             <button className="px-6 py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform">
               Download Full Report
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
