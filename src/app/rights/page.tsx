"use client";

import { useState, useEffect } from "react";
import { 
  Shield, FileText, Scale, Siren, Info, Car, 
  ChevronLeft, ArrowRight, CheckCircle2, History,
  BookOpen, Lock, Gavel, Smartphone, Globe, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Markdown from "react-markdown";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils/cn";
import { animations } from "@/lib/animations";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";

interface Topic {
  id: string;
  title: string;
  description: string;
  icon: any;
  prompt: string;
  color: string;
}

const TOPICS: Topic[] = [
  {
    id: "digilocker",
    title: "Document Protocols",
    description: "DigiLocker & mParivahan validity rules.",
    icon: FileText,
    color: "blue",
    prompt: "Is showing documents in DigiLocker or mParivahan valid under Indian law? Can police insist on physical copies? Mention the relevant IT Act / Motor Vehicle rules.",
  },
  {
    id: "police-authority",
    title: "Police Checks",
    description: "Your rights during roadside stops.",
    icon: Shield,
    color: "indigo",
    prompt: "Can traffic police take away car or bike keys during a check in India? What is the official protocol they must follow? What is the rank required to issue a challan?",
  },
  {
    id: "drunk-driving",
    title: "Testing Rights",
    description: "Drunk driving & test protocols.",
    icon: Siren,
    color: "red",
    prompt: "What are my rights when stopped for a breathalyzer test in India? Do I have the right to a blood test? What happens if I refuse?",
  },
  {
    id: "impounding",
    title: "Vehicle Seizure",
    description: "When can they legally impound?",
    icon: Car,
    color: "amber",
    prompt: "Under what specific traffic offenses can the traffic police in India legally impound my vehicle?",
  }
];

export default function RightsPage() {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isOnline = useOfflineStatus();

  const handleTopicSelect = async (topic: Topic) => {
    setSelectedTopic(topic);
    setInsight(null);
    setError(null);
    setIsLoading(true);

    try {
      if (!isOnline) throw new Error("AI insights require an internet connection.");

      const res = await fetch("/api/rights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: topic.prompt }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load insight.");
      setInsight(data.text);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 lg:py-12">
      {/* Header */}
      <div className="mb-10 flex flex-col items-center text-center">
        <div className="h-16 w-16 bg-emerald-500 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20 rotate-3">
          <Gavel className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mb-3">Know Your Rights</h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
           Empowering Indian drivers with factual legal knowledge. resolved from the Motor Vehicles Act 1988 (2019 Amendment).
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!selectedTopic ? (
          <motion.div key="grid" {...animations.pageEnter} className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            {TOPICS.map((topic) => (
              <Card 
                key={topic.id}
                variant="interactive"
                className="p-6 overflow-hidden relative group"
                onClick={() => handleTopicSelect(topic)}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-${topic.color}-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-${topic.color}-500/10 transition-colors`} />
                <div className="flex items-start gap-4 lg:gap-6 relative z-10">
                   <div className={cn(
                     "h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-500",
                     topic.color === "blue" ? "bg-blue-500 text-white" :
                     topic.color === "indigo" ? "bg-indigo-500 text-white" :
                     topic.color === "red" ? "bg-red-500 text-white" :
                     "bg-amber-500 text-white"
                   )}>
                     <topic.icon className="h-7 w-7" />
                   </div>
                   <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{topic.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{topic.description}</p>
                      <div className="flex items-center gap-1 text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-amber-500 transition-colors">
                        Learn Rights <ArrowRight className="h-3 w-3" />
                      </div>
                   </div>
                </div>
              </Card>
            ))}
          </motion.div>
        ) : (
          <motion.div key="insight" {...animations.pageEnter} className="space-y-6">
            <button 
              onClick={() => setSelectedTopic(null)}
              className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" /> Back to Topics
            </button>

            <Card className="p-8 lg:p-10 border-2 border-emerald-500/20 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-10">
                  <selectedTopic.icon className="h-32 w-32" />
               </div>

               <div className="flex items-center gap-4 mb-8">
                  <div className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center text-white",
                    selectedTopic.color === "blue" ? "bg-blue-500" :
                    selectedTopic.color === "indigo" ? "bg-indigo-500" :
                    selectedTopic.color === "red" ? "bg-red-500" :
                    "bg-amber-500"
                  )}>
                    <selectedTopic.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">{selectedTopic.title}</h2>
                    <p className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Verified Legal Insight</p>
                  </div>
               </div>

               <div className="prose dark:prose-invert prose-slate max-w-none prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:leading-loose prose-li:text-slate-700 dark:prose-li:text-slate-300 prose-strong:text-slate-900 dark:prose-strong:text-white">
                 {isLoading ? (
                   <div className="space-y-4 py-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-4/6" />
                      <div className="pt-8">
                         <Skeleton className="h-24 w-full rounded-2xl" />
                      </div>
                   </div>
                 ) : error ? (
                    <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-3xl text-center">
                       <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
                       <h4 className="font-bold text-red-900 dark:text-red-400">Insight Failed</h4>
                       <p className="text-sm text-red-700 dark:text-red-500 mb-6">{error}</p>
                       <Button variant="outline" onClick={() => handleTopicSelect(selectedTopic)}>Try Reconnecting</Button>
                    </div>
                 ) : (
                   <Markdown>{insight}</Markdown>
                 )}
               </div>

               {!isLoading && insight && (
                 <div className="mt-10 pt-10 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="h-10 w-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center text-emerald-600">
                          <CheckCircle2 className="h-5 w-5" />
                       </div>
                       <p className="text-xs text-slate-500 font-medium max-w-[200px]">
                         This insight is stabilized in our local reference for offline access.
                       </p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                       <Button size="sm" variant="ghost" leftIcon={<History className="h-4 w-4" />}>Legal History</Button>
                       <Button size="sm" variant="primary" leftIcon={<Globe className="h-4 w-4" />}>Official Gazette</Button>
                    </div>
                 </div>
               )}
            </Card>

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-3xl p-6 border border-amber-200 dark:border-amber-800 flex gap-4">
               <Smartphone className="h-8 w-8 text-amber-600 flex-shrink-0" />
               <p className="text-xs text-amber-900/80 dark:text-amber-200/80 leading-relaxed italic">
                 <strong>Pro-tip:</strong> In many states, traffic police do not have the right to take your vehicle keys before a challan is issued. 
                 Knowing these nuances can prevent harassment on the road.
               </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
