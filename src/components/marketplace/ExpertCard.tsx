export interface LegalExpert {
  id: string;
  name: string;
  city: string;
  specialty: string[];
  experience: number;
  phone: string;
  rating: number;
  verified: boolean;
  photoUrl?: string;
}

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Star, ShieldCheck, MapPin, Briefcase } from "lucide-react";

interface ExpertCardProps {
  expert: LegalExpert;
  onContact: (expert: LegalExpert) => void;
}

export function ExpertCard({ expert, onContact }: ExpertCardProps) {
  return (
    <Card className="p-5 flex flex-col gap-4 border-slate-800 bg-slate-900/50 backdrop-blur-md hover:border-blue-500/50 transition-all group">
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-xl bg-slate-800 overflow-hidden relative border border-slate-700">
            {expert.photoUrl ? (
              <img src={expert.photoUrl} alt={expert.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-xl font-bold">
                {expert.name.charAt(0)}
              </div>
            )}
            {expert.verified && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-0.5 rounded-full border-2 border-slate-900">
                <ShieldCheck size={12} />
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{expert.name}</h3>
            <div className="flex items-center gap-1 text-slate-400 text-sm">
              <MapPin size={14} />
              <span>{expert.city}</span>
            </div>
            <div className="flex items-center gap-1 text-amber-400 mt-1">
              <Star size={14} fill="currentColor" />
              <span className="text-sm font-semibold">{expert.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {expert.specialty.map((s: string) => (
          <span key={s} className="px-2 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider rounded border border-blue-500/20">
            {s}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2 text-slate-300 text-sm">
        <Briefcase size={14} className="text-slate-500" />
        <span>{expert.experience}+ Years Experience</span>
      </div>

      <Button 
        className="mt-2 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-6 rounded-xl transition-all active:scale-95"
        onClick={() => onContact(expert)}
      >
        CONTACT EXPERT
      </Button>
    </Card>
  );
}
