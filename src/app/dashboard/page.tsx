import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  User, ShieldCheck, FileText, Calculator, 
  Sparkles, Settings, ExternalLink, LogOut,
  MapPin, Car
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { HealthStatBadge } from "@/components/dashboard/HealthStatBadge";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  const displayName = profile?.display_name || user.phone || user.email?.split('@')[0] || "User";

  // Mock activity (Phase 13 infrastructure for recent items)
  const activities: any[] = [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Header / Hero */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-8 lg:py-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 bg-indigo-500 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-indigo-500/20 ring-8 ring-indigo-500/5">
              <User className="h-10 w-10" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 mb-1">Authenticated Citizen</p>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">
                Namaste, <span className="text-slate-500 font-medium">{displayName}</span>
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-md text-[10px] font-black text-emerald-600 uppercase border border-emerald-100 dark:border-emerald-900/30">
                  <ShieldCheck className="h-3 w-3" /> Secure Profile
                </div>
                <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                   <MapPin className="h-3 w-3" /> {profile?.preferred_state_code || "Central"} • <Car className="h-3 w-3" /> LMV
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <Link href="/dashboard/profile">
               <Button variant="outline" size="lg" className="rounded-2xl border-slate-200" leftIcon={<Settings className="h-4 w-4" />}>
                 Edit Profile
               </Button>
             </Link>
             <form action="/api/auth/signout" method="POST">
                <Button variant="ghost" type="submit" size="lg" className="rounded-2xl text-rose-500 hover:bg-rose-50" leftIcon={<LogOut className="h-4 w-4" />}>
                  Sign Out
                </Button>
             </form>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Stat Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard 
            icon={FileText}
            title="Scan Integrity"
            value="12"
            subtitle="Challans Verified"
            trend={{ value: "+3 this week", isPositive: true }}
            color="indigo"
          />
          <StatCard 
            icon={Calculator}
            title="Calculations"
            value="48"
            subtitle="Fines Looked Up"
            trend={{ value: "Top 1% user", isPositive: true }}
            color="emerald"
          />
          <StatCard 
            icon={Sparkles}
            title="AI Queries"
            value="156"
            subtitle="Legal Questions"
            color="amber"
          />
          <HealthStatBadge />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-4">
              <Link href="/calculator">
                <Card className="p-6 hover:border-indigo-500 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                      <Calculator className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">Fine Calculator</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Know before you pay</p>
                    </div>
                  </div>
                </Card>
              </Link>

              <Link href="/scan">
                <Card className="p-6 hover:border-indigo-500 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">Verify Receipt</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Detect overcharging</p>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>

            <Card className="p-8 bg-slate-950 text-white relative overflow-hidden">
               <div className="relative z-10">
                  <h3 className="text-xl font-black mb-2">DriveLegal VIP</h3>
                  <p className="text-sm text-slate-400 mb-6">Upgrade to get premium legal drafting and real-time corridor alerts.</p>
                  <Button fullWidth size="lg" className="rounded-2xl bg-indigo-500 border-none">
                     Coming Soon
                  </Button>
               </div>
               <ShieldCheck className="absolute -right-4 -bottom-4 h-32 w-32 text-indigo-500/20" />
            </Card>
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-2">
            <RecentActivity activities={activities} />
          </div>
        </div>
      </main>
    </div>
  );
}
