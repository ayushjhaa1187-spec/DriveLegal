import { FileText, Calculator, Sparkles, Clock, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";

interface Activity {
  id: string;
  type: "scan" | "calc" | "ask";
  title: string;
  subtitle: string;
  time: string;
  status?: "done" | "flagged" | "saving";
}

export function RecentActivity({ activities }: { activities: Activity[] }) {
  const icons = {
    scan: { icon: FileText, bg: "bg-indigo-50", text: "text-indigo-600" },
    calc: { icon: Calculator, bg: "bg-emerald-50", text: "text-emerald-600" },
    ask: { icon: Sparkles, bg: "bg-amber-50", text: "text-amber-600" },
  };

  return (
    <Card className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Recent Activity</h3>
        <button className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:underline flex items-center gap-1">
          View History <ChevronRight className="h-3 w-3" />
        </button>
      </div>

      <div className="space-y-6">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-4 group">
            <div className={cn(
              "h-10 w-10 shrink-0 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
              icons[activity.type].bg,
              icons[activity.type].text
            )}>
              {(() => {
                const Icon = icons[activity.type].icon;
                return <Icon className="h-5 w-5" />;
              })()}
            </div>
            
            <div className="flex-1 pb-6 border-b border-slate-100 dark:border-slate-800 last:border-0 group-hover:border-indigo-100 transition-colors">
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{activity.title}</h4>
                <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase">
                  <Clock className="h-3 w-3" /> {activity.time}
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium">{activity.subtitle}</p>
            </div>
          </div>
        ))}

        {activities.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">No recent activity yet</p>
          </div>
        )}
      </div>
    </Card>
  );
}
