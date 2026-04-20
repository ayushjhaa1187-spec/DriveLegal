"use client";

import { useState, useEffect } from "react";
import { 
  ShieldCheck, Briefcase, Star, MapPin, 
  Phone, MessageSquare, ChevronRight, 
  Search, Filter, CheckCircle2, AlertCircle,
  X, Scale, Gavel
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils/cn";
import { animations } from "@/lib/animations";
import { useAuth } from "@/components/AuthProvider";
import { AuthModal } from "@/components/auth/AuthModal";
export interface LegalExpert {
  id: string;
  name: string;
  city: string;
  state_code?: string;
  specialty: string[];
  experience: number;
  phone: string;
  rating: number;
  verified: boolean;
}

const CITIES = ["All Cities", "Delhi", "Mumbai", "Kolkata", "Hyderabad", "Ahmedabad", "Jaipur", "Pune", "Bangalore"];

const PLACEHOLDER_EXPERTS: LegalExpert[] = [
  {
    id: "e1",
    name: "Adv. Rahul Sharma",
    city: "Delhi",
    specialty: ["Challan Disputes", "DUI Defense"],
    experience: 12,
    phone: "+91 99887 76655",
    rating: 4.9,
    verified: true,
  },
  {
    id: "e2",
    name: "Adv. Priya Patel",
    city: "Ahmedabad",
    specialty: ["Vehicle Seizure", "High-Speeding"],
    experience: 8,
    phone: "+91 91234 56789",
    rating: 4.8,
    verified: true,
  },
  {
    id: "e3",
    name: "Adv. Anirudh Singh",
    city: "Jaipur",
    specialty: ["Commercial Vehicles", "Permit Issues"],
    experience: 15,
    phone: "+91 98765 43210",
    rating: 5.0,
    verified: true,
  }
];

export default function ProMarketplacePage() {
  const { user } = useAuth();
  const [experts, setExperts] = useState<LegalExpert[]>(PLACEHOLDER_EXPERTS);
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExpert, setSelectedExpert] = useState<LegalExpert | null>(null);
  
  useEffect(() => {
    fetch('/api/legal-experts')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
           const mapped = data.map((d: any) => ({
             id: d.id,
             name: d.name,
             city: d.state_code, // using state_code proxy for city for now
             specialty: d.specialization,
             experience: 10,
             phone: "Call via portal",
             rating: d.rating,
             verified: d.is_verified
           }));
           setExperts([...PLACEHOLDER_EXPERTS, ...mapped]);
        }
      })
      .catch(console.error);
  }, []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Lead Gen Form State
  const [name, setName] = useState(user?.user_metadata?.first_name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [reason, setReason] = useState("");

  const filteredExperts = experts.filter(e => 
    (selectedCity === "All Cities" || e.city === selectedCity) &&
    (e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     e.specialty.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    if (!selectedExpert) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/legal-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           expert_id: selectedExpert.id,
           case_summary: reason
        })
      });

      if (!res.ok) throw new Error("Failed to submit lead");
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setSelectedExpert(null);
        setReason("");
      }, 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 lg:py-16 space-y-12">
      {/* Hero */}
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="h-16 w-16 bg-slate-900 dark:bg-white rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl rotate-3">
          <Gavel className="h-8 w-8 text-white dark:text-slate-900" />
        </div>
        <h1 className="text-4xl lg:text-6xl font-black text-slate-900 dark:text-white leading-tight">
          Talk to a <span className="text-indigo-600">Verified Pro</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
          Connect with India's top traffic lawyers to resolve complex challans, vehicle seizures, and licensing issues.
        </p>
      </div>

      {/* Filters */}
      <div className="sticky top-[7.5rem] lg:top-[9rem] z-30 bg-slate-50 dark:bg-slate-950 pb-4">
         <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
               <Input 
                 placeholder="Search by name or specialty (e.g. 'DUI', 'Seizure')..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 leftIcon={<Search className="h-5 w-5 text-slate-400" />}
                 className="h-14 shadow-lg border-none"
               />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide md:overflow-visible">
               {CITIES.map(city => (
                 <button
                   key={city}
                   onClick={() => setSelectedCity(city)}
                   className={cn(
                     "whitespace-nowrap px-6 py-3 rounded-2xl text-xs font-bold transition-all border-2",
                     selectedCity === city 
                       ? "bg-slate-900 text-white border-slate-900 shadow-xl" 
                       : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-indigo-500"
                   )}
                 >
                   {city}
                 </button>
               ))}
            </div>
         </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {filteredExperts.map((expert) => (
           <motion.div key={expert.id} layout {...animations.pageEnter}>
             <Card className="p-0 overflow-hidden border-none shadow-2xl hover:shadow-indigo-500/10 transition-all group">
                <div className="h-32 bg-gradient-to-br from-slate-900 to-indigo-900 relative">
                   <div className="absolute -bottom-8 left-6 h-20 w-20 bg-white dark:bg-slate-800 rounded-2xl p-1 shadow-xl">
                      <div className="h-full w-full bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-2xl font-black text-slate-400">
                         {expert.name.split(" ")[1].charAt(0)}
                      </div>
                   </div>
                   {expert.verified && (
                     <div className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-emerald-500/30">
                        <ShieldCheck className="h-3 w-3" /> DriveLegal Verified
                     </div>
                   )}
                </div>
                
                <div className="p-8 pt-12 space-y-6">
                   <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">{expert.name}</h3>
                      <div className="flex items-center gap-2">
                         <div className="flex items-center gap-1 text-amber-500">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            <span className="text-xs font-black">{expert.rating}</span>
                         </div>
                         <span className="text-slate-300">•</span>
                         <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {expert.city}
                         </span>
                         <span className="text-slate-300">•</span>
                         <span className="text-xs font-bold text-slate-500">{expert.experience} yrs EXP</span>
                      </div>
                   </div>

                   <div className="flex flex-wrap gap-2">
                      {expert.specialty.map(s => (
                        <span key={s} className="px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
                           {s}
                        </span>
                      ))}
                   </div>

                   <Button 
                     fullWidth 
                     variant="primary" 
                     className="h-12 rounded-xl group-hover:bg-indigo-600 transition-all font-bold"
                     onClick={() => setSelectedExpert(expert)}
                   >
                     Talk to Expert
                   </Button>
                </div>
             </Card>
           </motion.div>
         ))}
      </div>

      {/* Referral Modal */}
      <AnimatePresence>
        {selectedExpert && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
               onClick={() => setSelectedExpert(null)}
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 lg:p-10 relative z-[80] shadow-2xl border border-white/10"
             >
                <button onClick={() => setSelectedExpert(null)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600">
                   <X className="h-6 w-6" />
                </button>

                <div className="text-center mb-8">
                   <div className="h-14 w-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
                      <Phone className="h-7 w-7" />
                   </div>
                   <h2 className="text-2xl font-black text-slate-900 dark:text-white">Request Consultation</h2>
                   <p className="text-sm text-slate-500 mt-1 uppercase tracking-tight font-black">Connection with {selectedExpert.name}</p>
                </div>

                {isSuccess ? (
                  <div className="py-12 text-center space-y-4">
                     <div className="h-20 w-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                        <CheckCircle2 className="h-10 w-10" />
                     </div>
                     <h3 className="text-xl font-bold">Request Sent!</h3>
                     <p className="text-sm text-slate-500">The expert will contact you at your provided number within 2 business hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleLeadSubmit} className="space-y-6">
                     <div className="space-y-4">
                        <div className="space-y-1.5">
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Your Full Name</p>
                           <Input 
                             required
                             placeholder="Type your name"
                             value={name}
                             onChange={(e) => setName(e.target.value)}
                             className="h-12 bg-slate-50 dark:bg-slate-950 border-none shadow-inner"
                           />
                        </div>
                        <div className="space-y-1.5">
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">WhatsApp / Phone Number</p>
                           <Input 
                             required
                             placeholder="+91 XXXXX XXXXX"
                             value={phone}
                             onChange={(e) => setPhone(e.target.value)}
                             className="h-12 bg-slate-50 dark:bg-slate-950 border-none shadow-inner"
                           />
                        </div>
                        <div className="space-y-1.5">
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">How can they help?</p>
                           <textarea 
                             required
                             rows={3}
                             placeholder="Briefly describe your legal issue (e.g. Challenging a wrong DUI challan)..."
                             value={reason}
                             onChange={(e) => setReason(e.target.value)}
                             className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border-none shadow-inner resize-none text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                           />
                        </div>
                     </div>

                     <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/20 flex gap-4">
                        <ShieldCheck className="h-5 w-5 text-indigo-600" />
                        <p className="text-[10px] text-indigo-900/70 dark:text-indigo-300/70 font-medium leading-relaxed italic">
                          <strong>Privacy Notice:</strong> Your details will be shared only with this specific expert for consultation purposes.
                        </p>
                     </div>

                     <Button 
                       fullWidth 
                       size="lg" 
                       type="submit"
                       className="h-16 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-lg font-bold"
                       disabled={isSubmitting}
                       leftIcon={isSubmitting ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <MessageSquare className="h-5 w-5" />}
                     >
                        {isSubmitting ? "Sending Request..." : "Request Call Now"}
                     </Button>
                  </form>
                )}
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
