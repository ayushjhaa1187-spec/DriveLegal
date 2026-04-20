import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  subtitle: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  color?: "indigo" | "emerald" | "amber" | "rose";
}

export function StatCard({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  trend, 
  color = "indigo" 
}: StatCardProps) {
  const colors = {
    indigo: "bg-indigo-500 shadow-indigo-500/20 text-indigo-500",
    emerald: "bg-emerald-500 shadow-emerald-500/20 text-emerald-500",
    amber: "bg-amber-500 shadow-amber-500/20 text-amber-500",
    rose: "bg-rose-500 shadow-rose-500/20 text-rose-500",
  };

  return (
    <Card className="p-6 relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-500">
      <div className="flex justify-between items-start mb-6">
        <div className={cn(
          "h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-lg",
          colors[color].split(" ")[0],
          colors[color].split(" ")[1]
        )}>
          <Icon className="h-6 w-6" />
        </div>
        {trend && (
          <div className={cn(
            "px-2 py-1 rounded-md text-[10px] font-black tracking-widest uppercase",
            trend.isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          )}>
            {trend.value}
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</h3>
        <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{value}</p>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest pt-2">{subtitle}</p>
      </div>

      <div className={cn(
        "absolute -right-4 -bottom-4 h-24 w-24 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity",
        colors[color].split(" ")[2]
      )}>
        <Icon className="h-full w-full" />
      </div>
    </Card>
  );
}
