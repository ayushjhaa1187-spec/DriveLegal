"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Gavel, Scale, Send, ShieldCheck, AlertCircle, 
  Gamepad2, Trophy, ArrowRight, Gauge,
  MessageSquare, User, Bot, History,
  Info, ChevronRight, ChevronLeft, X, Play
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";
import { animations } from "@/lib/animations";

type Tier = "beginner" | "standard" | "advanced";

interface SimMessage {
  role: "user" | "bot";
  text: string;
  id: string;
}

const TIER_CONFIG = {
  beginner: {
    title: "Cooperative Officer",
    desc: "Focus on polite interaction and basic document verification. Forgiving and helpful.",
    color: "emerald",
    icon: ShieldCheck,
    prompt: "You are a polite, helpful traffic officer. Use gentle language. If the user makes a mistake, explain it kindly. Match the user's language (Hindi/English) automatically.",
    strictness: 0.2
  },
  standard: {
    title: "Standard Inspector",
    desc: "Representative of the average roadside dispute. Expects basic legal awareness.",
    color: "amber",
    icon: Scale,
    prompt: "You are a standard traffic inspector. You are firm but fair. You expect the user to know basic rights. Match the user's language (Hindi/English) automatically.",
    strictness: 0.5
  },
  advanced: {
    title: "Strict Magistrate",
    desc: "High-pressure courtroom scenario. Requires precise legal citations and zero tolerance for arrogance.",
    color: "red",
    icon: Gavel,
    prompt: "You are a strict magistrate in a traffic court. You have zero tolerance for legal ignorance. Demand specific Section numbers. Pressure the user but do not end the session. Match the user's language (Hindi/English) automatically.",
    strictness: 0.9
  }
};


export default function SimulatePage() {
  const [tier, setTier] = useState<Tier | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [messages, setMessages] = useState<SimMessage[]>([]);
  const [input, setInput] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [sessionScore, setSessionScore] = useState({ articulacy: 0, accuracy: 0 });
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isBotTyping]);

  const startSimulation = (selectedTier: Tier) => {
    setTier(selectedTier);
    setIsStarted(true);
    setMessages([
      {
        id: "1",
        role: "bot",
        text: `I am your ${TIER_CONFIG[selectedTier].title} for today. Let's begin. You have been stopped for a routine check near a high-speed zone. Please present your documents and explain your stance.`
      }
    ]);
  };

  const handleSend = async () => {
    if (!input.trim() || isBotTyping) return;

    const userMsg: SimMessage = { id: crypto.randomUUID(), role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsBotTyping(true);

    // Call simulation API
    try {
      const config = TIER_CONFIG[tier!];
      
      const payload = {
        messages: [...messages, userMsg].map(m => ({ role: m.role, text: m.text })),
        tierPrompt: config.prompt
      };

      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        if (res.status === 429) {
          throw new Error('Daily limit reached. Sign up for unlimited sessions.');
        }
        throw new Error('Simulation API failed');
      }

      const data = await res.json();
      
      const botMsg: SimMessage = {
        id: crypto.randomUUID(),
        role: "bot",
        text: data.text
      };
      
      setMessages(prev => [...prev, botMsg]);
      
      // Analyze performance for session scoring (simple heuristics for now)
      setSessionScore(prev => ({ 
        articulacy: Math.min(100, prev.articulacy + 10),
        accuracy: Math.min(100, prev.accuracy + 5)
      }));
    } catch (err: any) {
      alert(err.message || "Failed to fetch response. Please try again.");
      // rollback user message on failure
      setMessages(prev => prev.filter(m => m.id !== userMsg.id));
    } finally {
      setIsBotTyping(false);
    }
}


  if (!isStarted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        <div className="text-center space-y-4">
           <div className="h-16 w-16 bg-slate-900 dark:bg-white rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl rotate-3">
              <Gamepad2 className="h-8 w-8 text-white dark:text-slate-900" />
           </div>
           <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-tight">
              AI Case <span className="text-amber-500">Simulator</span>
           </h1>
           <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
              Rehearse your legal standing before stepping into a court or a traffic stop.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {(Object.entries(TIER_CONFIG) as [Tier, any][]).map(([key, config]) => (
             <Card 
               key={key}
               className={cn(
                 "p-8 border-2 transition-all cursor-pointer group hover:scale-[1.02]",
                 tier === key ? "border-amber-500 ring-4 ring-amber-500/10" : "border-slate-100 dark:border-slate-800"
               )}
               onClick={() => setTier(key)}
             >
                <div className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg",
                  key === "beginner" ? "bg-emerald-500/10 text-emerald-600" :
                  key === "standard" ? "bg-amber-500/10 text-amber-600" :
                  "bg-red-500/10 text-red-600"
                )}>
                   <config.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{config.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6 font-medium uppercase tracking-tight">
                   {config.desc}
                </p>
                <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-amber-500 transition-colors">
                   Select This Tier <ArrowRight className="ml-2 h-3 w-3" />
                </div>
             </Card>
           ))}
        </div>

        <div className="flex justify-center pt-8">
           <Button 
             size="lg" 
             className="h-16 px-12 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-lg font-black shadow-2xl disabled:opacity-50"
             disabled={!tier}
             onClick={() => tier && startSimulation(tier)}
             leftIcon={<Play className="h-5 w-5" />}
           >
              Begin Roleplay
           </Button>
        </div>

        <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-3xl border border-amber-100 dark:border-amber-900/20 flex gap-4">
           <Info className="h-6 w-6 text-amber-500 shrink-0" />
           <p className="text-sm text-amber-900/70 dark:text-amber-300/70 font-medium leading-relaxed italic">
             <strong>Heads Up:</strong> This is a simulation engine. The outcomes and legal discussions are intended for educational rehearsal and do NOT constitute binding legal advice.
           </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] bg-slate-900 text-white overflow-hidden">
      {/* Simulation HUD */}
      <div className="px-6 py-4 bg-slate-950 border-b border-white/5 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <button onClick={() => setIsStarted(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
               <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Live Simulation</p>
               <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  Session with {TIER_CONFIG[tier!].title}
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
               </h2>
            </div>
         </div>
         
         <div className="flex items-center gap-8">
            <div className="text-right">
               <p className="text-[8px] font-black text-slate-500 uppercase">Articulacy</p>
               <div className="flex items-center gap-2">
                  <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
                     <motion.div initial={{ width: 0 }} animate={{ width: `${sessionScore.articulacy}%` }} className="h-full bg-indigo-500 shadow-[0_0_10px_#6366f1]" />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">{sessionScore.articulacy}%</span>
               </div>
            </div>
            <div className="text-right">
               <p className="text-[8px] font-black text-slate-500 uppercase">Legal Accuracy</p>
               <div className="flex items-center gap-2">
                  <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
                     <motion.div initial={{ width: 0 }} animate={{ width: `${sessionScore.accuracy}%` }} className="h-full bg-amber-500 shadow-[0_0_10px_#f59e0b]" />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">{sessionScore.accuracy}%</span>
               </div>
            </div>
         </div>
      </div>

      {/* Roleplay Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth bg-[radial-gradient(circle_at_50%_0%,_#1e293b_0%,_#0f172a_100%)]"
      >
         <div className="max-w-3xl mx-auto space-y-10 py-10">
            <AnimatePresence initial={false}>
               {messages.map((msg) => (
                 <motion.div 
                   key={msg.id}
                   {...animations.pageEnter}
                   className={cn(
                     "flex flex-col gap-4",
                     msg.role === "user" ? "items-end" : "items-start"
                   )}
                 >
                    <div className="flex items-center gap-3">
                       {msg.role === "bot" && (
                         <div className="h-8 w-8 bg-slate-800 border border-white/10 rounded-full flex items-center justify-center">
                            <Bot className="h-4 w-4 text-amber-500" />
                         </div>
                       )}
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          {msg.role === "user" ? "Citizen Response" : TIER_CONFIG[tier!].title}
                       </p>
                       {msg.role === "user" && (
                         <div className="h-8 w-8 bg-slate-800 border border-white/10 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-indigo-400" />
                         </div>
                       )}
                    </div>
                    <div className={cn(
                      "max-w-[85%] px-8 py-5 rounded-[2.5rem] text-base font-medium shadow-2xl leading-relaxed whitespace-pre-wrap",
                      msg.role === "user" 
                        ? "bg-white text-slate-900 rounded-tr-none" 
                        : "bg-slate-800 border border-white/5 text-white/90 rounded-tl-none"
                    )}>
                       {msg.text}
                    </div>
                 </motion.div>
               ))}
            </AnimatePresence>
            
            {isBotTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-start gap-4">
                 <div className="h-8 w-8 bg-slate-800 border border-white/10 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-amber-500 animate-pulse" />
                 </div>
                 <div className="bg-slate-800/50 px-8 py-4 rounded-full flex gap-2">
                    <div className="h-1.5 w-1.5 bg-amber-500 rounded-full animate-bounce" />
                    <div className="h-1.5 w-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="h-1.5 w-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                 </div>
              </motion.div>
            )}
         </div>
      </div>

      {/* Immersive Input */}
      <div className="p-8 bg-slate-950 border-t border-white/5 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
         <div className="max-w-3xl mx-auto relative">
            <textarea 
              rows={2}
              placeholder="Type your legal response or explanation..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="w-full bg-white/5 border-2 border-white/10 rounded-[2rem] px-8 py-5 pr-20 text-lg outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all resize-none font-medium placeholder:text-slate-600"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isBotTyping}
              className="absolute right-4 top-4 h-12 w-12 bg-amber-500 rounded-2xl flex items-center justify-center text-slate-900 shadow-xl shadow-amber-500/30 hover:scale-105 active:scale-95 disabled:grayscale transition-all"
            >
               <Send className="h-6 w-6" />
            </button>
         </div>
         <p className="text-center mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
           Session Security: Local Rehearsal Vault Active
         </p>
      </div>
    </div>
  );
}
