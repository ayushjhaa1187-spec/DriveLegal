import { Clock, AlertCircle, Calendar, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";

interface ReminderCardProps {
  type: "PUC" | "Insurance" | "RC" | "Licence";
  expiryDate: string;
  onEdit?: () => void;
}

export function ReminderCard({ type, expiryDate, onEdit }: ReminderCardProps) {
  const expiry = new Date(expiryDate);
  const today = new Date();
  const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  const isExpired = diffDays <= 0;
  const isUrgent = diffDays > 0 && diffDays <= 30;

  return (
    <Card 
      onClick={onEdit}
      className={cn(
        "p-6 flex items-center justify-between group h-24",
        isExpired ? "border-rose-500 bg-rose-50/50" : isUrgent ? "border-amber-500 bg-amber-50/50" : "hover:border-indigo-500",
        onEdit && "cursor-pointer hover:shadow-lg transition-shadow"
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "h-12 w-12 rounded-xl flex items-center justify-center transition-all",
          isExpired ? "bg-rose-500 text-white" : isUrgent ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-indigo-500 group-hover:text-white"
        )}>
          {isExpired ? <AlertCircle className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
        </div>
        
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-slate-900 dark:text-white">{type}</h4>
            {!isExpired && !isUrgent && <ShieldCheck className="h-3 w-3 text-emerald-500" />}
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {isExpired ? "Expired" : `Expires in ${diffDays} days`}
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Expiry Date</p>
        <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 justify-end">
           <Calendar className="h-3 w-3 text-indigo-500" /> {expiry.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>
    </Card>
  );
}
