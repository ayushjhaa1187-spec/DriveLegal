"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  BarChart3, Users, MapPin, Download, RefreshCcw, 
  Search, ShieldCheck, AlertCircle, LayoutDashboard,
  Calendar, FileText, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { animations } from "@/lib/animations";

interface AdminDashboardProps {
  initialScans: any[];
  initialCalcs: any[];
  initialHotspots: any[];
  stats: {
    totalScans: number;
    overchargedCount: number;
    totalOverchargeINR: number;
    complianceRate: number;
  };
  isAdmin: boolean;
}

export function AdminDashboard({ 
  initialScans, 
  initialCalcs, 
  initialHotspots, 
  stats,
  isAdmin 
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "scans" | "hotspots">("overview");
  const [refreshing, setRefreshing] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleRefreshViews = async () => {
    setRefreshing(true);
    setMsg(null);
    try {
      const res = await fetch("/api/portal/refresh-views", { method: "POST" });
      if (res.ok) {
        setMsg({ type: 'success', text: 'Materialized views refreshed successfully.' });
      } else {
        const d = await res.json();
        setMsg({ type: 'error', text: d.error || 'Refresh failed.' });
      }
    } catch (e) {
      setMsg({ type: 'error', text: 'Network error.' });
    } finally {
      setRefreshing(false);
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map(obj => Object.values(obj).map(v => 
      typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v
    ).join(","));
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col fixed inset-y-0 z-50">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="h-10 w-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg">
              <LayoutDashboard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">DriveLegal</p>
              <h2 className="text-sm font-black text-white tracking-widest uppercase">Forensic Admin</h2>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'scans', label: 'Raw Scan Logs', icon: FileText },
              { id: 'hotspots', label: 'Community Feed', icon: MapPin },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === item.id 
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Connection</span>
          </div>
          {isAdmin && (
            <Button 
              onClick={handleRefreshViews}
              disabled={refreshing}
              variant="outline"
              fullWidth
              className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 rounded-xl py-6"
            >
              <RefreshCcw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh Views'}
            </Button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 p-12">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Analysis
            </h1>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest flex items-center gap-2">
              <Calendar className="h-3 w-3" /> Last sync: {new Date().toLocaleTimeString()}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                placeholder="Search database..."
                className="bg-white dark:bg-slate-900 border-none rounded-xl py-3 pl-12 pr-6 text-xs font-bold outline-none shadow-sm focus:ring-2 ring-indigo-500 transition-all w-64"
              />
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
              <Users className="h-5 w-5 text-slate-500" />
            </div>
          </div>
        </header>

        {msg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-8 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold ${
              msg.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}
          >
            {msg.type === 'success' ? <ShieldCheck className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {msg.text}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" {...animations.fadeIn} className="space-y-12">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Community Scans", val: stats.totalScans, icon: BarChart3, color: "indigo" },
                  { label: "Overcharged", val: stats.overchargedCount, icon: AlertCircle, color: "rose" },
                  { label: "Financial Impact", val: `₹${stats.totalOverchargeINR}`, icon: Users, color: "amber" },
                  { label: "Compliance Rate", val: `${Math.round(stats.complianceRate)}%`, icon: ShieldCheck, color: "emerald" },
                ].map((stat, i) => (
                  <Card key={i} className="p-6 border-none shadow-xl bg-white dark:bg-slate-900 rounded-3xl group hover:scale-105 transition-transform cursor-default">
                    <div className={`h-10 w-10 bg-${stat.color}-500/10 rounded-xl flex items-center justify-center text-${stat.color}-500 mb-4`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{stat.label}</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{stat.val}</p>
                  </Card>
                ))}
              </div>

              {/* Recent Activity Mini-Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-8 border-none shadow-2xl bg-white dark:bg-slate-900 rounded-3xl">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Recent Violations</h3>
                    <button onClick={() => setActiveTab('scans')} className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:underline flex items-center gap-1">
                      View All <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {initialScans.slice(0, 5).map((scan, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                        <div className="flex items-center gap-4">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-black ${
                            scan.status === 'overcharged' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
                          }`}>
                            {scan.state_code}
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900 dark:text-white uppercase truncate max-w-[120px]">
                              {scan.violation_ids?.[0]?.split('::').pop()?.replace(/-/g, ' ') || 'Traffic violation'}
                            </p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{new Date(scan.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-slate-900 dark:text-white">₹{scan.charged_total_inr}</p>
                          <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">
                            {scan.overcharge_total_inr > 0 ? `+₹${scan.overcharge_total_inr}` : 'Correct'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-8 border-none shadow-2xl bg-white dark:bg-slate-900 rounded-3xl">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Live Hotspots</h3>
                    <button onClick={() => setActiveTab('hotspots')} className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:underline flex items-center gap-1">
                      Moderate <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {initialHotspots.slice(0, 5).map((hs, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                         <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                           <MapPin className="h-5 w-5" />
                         </div>
                         <div className="flex-1">
                           <p className="text-xs font-black text-slate-900 dark:text-white">Zone {hs.geohash_6}</p>
                           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate max-w-[200px]">{hs.description || 'No description provided'}</p>
                         </div>
                         <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                           hs.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-200 text-slate-500'
                         }`}>
                           {hs.is_active ? 'Active' : 'Hidden'}
                         </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </motion.div>
          )}

          {activeTab === 'scans' && (
            <motion.div key="scans" {...animations.fadeIn} className="space-y-8">
              <div className="flex justify-between items-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Showing diagnostic logs for forensic review
                </p>
                <Button onClick={() => exportToCSV(initialScans, 'drivelegal_scans')} size="sm" className="rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 hover:bg-slate-50 transition-all">
                  <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
              </div>

              <Card className="overflow-hidden bg-white dark:bg-slate-900 border-none shadow-2xl rounded-3xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50">
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Timestamp</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Geo</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Violation</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Amounts</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {initialScans.map((scan, i) => (
                        <tr key={i} className="border-t border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="p-6 text-xs font-bold text-slate-500">
                            {new Date(scan.created_at).toLocaleString()}
                          </td>
                          <td className="p-6">
                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-[10px] font-black uppercase text-slate-600 dark:text-slate-400">
                              {scan.state_code}-{scan.geohash_5}
                            </span>
                          </td>
                          <td className="p-6 text-xs font-black text-slate-900 dark:text-white uppercase">
                            {scan.violation_ids?.[0] || 'Unknown'}
                          </td>
                          <td className="p-6">
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-slate-900 dark:text-white">₹{scan.charged_total_inr}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Leg: ₹{scan.legal_total_inr}</span>
                            </div>
                          </td>
                          <td className="p-6">
                             <div className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                               scan.status === 'overcharged' ? 'bg-rose-500/10 text-rose-500' : 
                               scan.status === 'correct' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'
                             }`}>
                               {scan.status}
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'hotspots' && (
            <motion.div key="hotspots" {...animations.fadeIn} className="space-y-8">
               <div className="flex justify-between items-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Active community-reported dispute zones
                </p>
                <div className="flex gap-2">
                   <Button onClick={() => exportToCSV(initialHotspots, 'drivelegal_hotspots')} size="sm" className="rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 hover:bg-slate-50 transition-all">
                    <Download className="mr-2 h-4 w-4" /> CSV
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {initialHotspots.map((hs, i) => (
                  <Card key={i} className="p-8 border-none shadow-xl bg-white dark:bg-slate-900 rounded-3xl relative overflow-hidden group">
                     {/* Confidence indicator side-bar */}
                     <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${
                        hs.trust_score > 0 ? 'bg-emerald-500' : 'bg-rose-500'
                     }`} />
                     
                     <div className="flex items-start justify-between mb-6">
                       <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500">
                             <MapPin className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">{hs.geohash_6}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{hs.type}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trust Score</p>
                          <p className={`text-xl font-black ${hs.trust_score > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {hs.trust_score.toFixed(1)}
                          </p>
                       </div>
                     </div>

                     <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-8 leading-relaxed">
                       {hs.description || "The reporter did not provide a textual description for this hotspot."}
                     </p>

                     <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800">
                        <div className="flex gap-6">
                           <div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Up</p>
                             <p className="text-xs font-black text-slate-900 dark:text-white">{hs.upvotes}</p>
                           </div>
                           <div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Down</p>
                             <p className="text-xs font-black text-slate-900 dark:text-white">{hs.downvotes}</p>
                           </div>
                           <div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Reports</p>
                             <p className={`text-xs font-black ${hs.reports_count > 0 ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>{hs.reports_count}</p>
                           </div>
                        </div>
                        <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] ${
                           hs.is_active ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                        }`}>
                           {hs.is_active ? 'Active' : 'Disabled'}
                        </div>
                     </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
