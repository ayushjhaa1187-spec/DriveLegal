"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { 
  Send, Mic, MicOff, Search, Sparkles, 
  ChevronLeft, AlertCircle, Scale, ExternalLink,
  MessageSquare, History, CheckCircle2, ShieldCheck,
  Smartphone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils/cn";
import { animations } from "@/lib/animations";
import { dataLoader } from "@/lib/data/data-loader";
import { resolveViolation } from "@/lib/law-engine/resolver";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { WhatsAppShare } from "@/components/shared/WhatsAppShare";
import type { Violation } from "@/lib/law-engine/schema";
import type { ResolvedViolation } from "@/lib/law-engine/types";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  results?: ResolvedViolation[];
  isOffline?: boolean;
}

const EXAMPLE_QUERIES = [
  "Helmet fine in Delhi?",
  "Penalty for drunk driving?",
  "Is DigiLocker DL valid?",
  "How much fine for no insurance?",
];

export default function AskPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [stateCode, setStateCode] = useState<string>("central");
  const isOnline = useOfflineStatus();
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load user state
  useEffect(() => {
    const cached = localStorage.getItem("user-state");
    if (cached) {
      try {
        const { code } = JSON.parse(cached);
        setStateCode(code.toLowerCase());
      } catch {}
    }
  }, []);

  // Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (query = input) => {
    const q = query.trim();
    if (!q || isLoading) return;
    setInput("");

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", text: q };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      let resolvedResults: ResolvedViolation[] = [];
      let isOfflineMode = !isOnline;

      if (isOnline) {
        // 1. Get Intent from AI
        const res = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: q }),
        });
        
        if (res.ok) {
          const { intent } = await res.json();
          
          if (intent) {
            const targetState = intent.stateCode?.toLowerCase() || stateCode;
            
            // 2. Load Local Data
            const [centralLaws, stateLaws] = await Promise.all([
              dataLoader.loadViolations("central"),
              dataLoader.loadViolations(targetState)
            ]);

            // 3. Resolve locally if intent found
            if (intent.category) {
              const matchedInCentral = centralLaws.filter(v => 
                v.category === intent.category && 
                (intent.vehicleType === "all" || v.applies_to.includes("all") || (intent.vehicleType && v.applies_to.includes(intent.vehicleType as any)))
              );

              resolvedResults = matchedInCentral.map(v => 
                resolveViolation(v, stateLaws, {
                  stateCode: targetState,
                  vehicleType: intent.vehicleType || "all",
                  isRepeatOffender: false
                })
              );
            }
          }
        }
      }

      // 4. Keyword Fallback if no structured result
      if (resolvedResults.length === 0) {
        const centralLaws = await dataLoader.loadViolations("central");
        const stateLaws = await dataLoader.loadViolations(stateCode);
        
        const keywords = q.toLowerCase().split(" ");
        const matched = centralLaws.filter(v => 
          keywords.some(k => 
            v.title.en.toLowerCase().includes(k) || 
            v.plain_english_summary.toLowerCase().includes(k) ||
            v.section?.toLowerCase().includes(k)
          )
        ).slice(0, 3);

        resolvedResults = matched.map(v => 
          resolveViolation(v, stateLaws, {
            stateCode,
            vehicleType: "all",
            isRepeatOffender: false
          })
        );
      }

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: resolvedResults.length > 0 
          ? `I've found ${resolvedResults.length} relevant legal citation(s) for you.`
          : "I couldn't find a direct legal match for that query. You might want to try searching by category in the Calculator.",
        results: resolvedResults,
        isOffline: isOfflineMode
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(),
        role: "assistant",
        text: "I encountered an error while processing your request. Please try again or use the manual calculator."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const rec = new SR();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.onresult = (e: any) => setInput(e.results[0][0].transcript);
    rec.onend = () => setIsListening(false);
    rec.start();
    recognitionRef.current = rec;
    setIsListening(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] lg:h-[calc(100vh-theme(spacing.16))] bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="px-4 py-3 lg:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Sparkles className="h-6 w-6 text-slate-900" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-white">Legal Assistant</h1>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-black uppercase tracking-widest">Powered by AI + Law Books</p>
          </div>
        </div>
        {!isOnline && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300">OFFLINE MODE</span>
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 scroll-smooth"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="py-12 flex flex-col items-center text-center">
              <div className="h-20 w-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6">
                <MessageSquare className="h-10 w-10 text-slate-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">How can I help you today?</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mb-8">
                Ask about traffic fines, legal rights, or procedure in plain English.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {EXAMPLE_QUERIES.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSubmit(q)}
                    className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-left hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-md transition-all group"
                  >
                    <p className="text-xs font-bold text-slate-400 group-hover:text-amber-500 transition-colors mb-1">Try asking</p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{q}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                {...animations.pageEnter}
                className={cn(
                  "flex flex-col gap-2",
                  msg.role === "user" ? "items-end" : "items-start"
                )}
              >
                <div className={cn(
                  "max-w-[85%] px-5 py-3 rounded-3xl text-sm shadow-sm",
                  msg.role === "user"
                    ? "bg-slate-900 text-white rounded-br-none"
                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none"
                )}>
                  {msg.text}
                </div>

                {msg.results && msg.results.length > 0 && (
                  <div className="w-full max-w-[95%] space-y-3 mt-1">
                    {msg.results.map((res, i) => (
                      <Card key={i} className="p-5 border-l-4 border-amber-500">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                              {res.ruleSource === "state_override" ? `${res.appliedStateCode} State Law` : "Central MVA Law"}
                            </span>
                            <h3 className="font-bold text-slate-900 dark:text-white">{res.violation.title.en}</h3>
                          </div>
                          <div className="text-right">
                             <p className="text-xl font-black text-slate-900 dark:text-white">{res.resolvedFine.displayText}</p>
                             <p className="text-[10px] text-slate-500">Fine Amount</p>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                          {res.violation.plain_english_summary}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                           <span className="text-[10px] font-mono text-slate-400">{res.citation.section}</span>
                           <div className="flex gap-2">
                             <WhatsAppShare 
                                size="sm"
                                variant="ghost"
                                title="Legal Advice"
                                text={`Bhai, legal advice from DriveLegal: ${res.violation.title.en} ka fine ${res.resolvedFine.displayText} hai.`}
                                className="h-7 text-[10px] bg-transparent hover:bg-emerald-50 text-emerald-600 border border-emerald-100"
                             />
                             <Button size="sm" variant="ghost" className="h-7 text-[10px]" leftIcon={<ExternalLink className="h-3 w-3" />}>
                               View Details
                             </Button>
                           </div>
                        </div>
                      </Card>
                    ))}
                    {msg.isOffline && (
                      <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> Showing results from local cache
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <div className="flex flex-col items-start gap-2">
              <div className="max-w-[70%] px-5 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl rounded-bl-none shadow-sm w-full">
                <div className="flex gap-1.5 items-center mb-3">
                   <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" />
                   <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                   <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 lg:p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 group">
            <div className="flex-1 relative">
              <Input
                placeholder="Ask about traffic laws..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="pr-12 h-14"
                disabled={isLoading}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  onClick={toggleVoice}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    isListening ? "bg-red-500 text-white animate-pulse" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <Button
              className="h-14 w-14 p-0 shadow-lg shadow-amber-500/20"
              onClick={() => handleSubmit()}
              disabled={!input.trim() || isLoading}
              leftIcon={<Send className="h-6 w-6 ml-1" />}
            />
          </div>
          <p className="text-[10px] text-center text-slate-400 mt-3 font-medium uppercase tracking-widest flex items-center justify-center gap-2">
            <ShieldCheck className="h-3 w-3" /> Verified Indian Legal records
          </p>
        </div>
      </div>
    </div>
  );
}
