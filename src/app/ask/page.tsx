'use client';

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Send, Mic, MicOff, WifiOff, ExternalLink } from "lucide-react";
import { queryViolations } from "@/lib/law-engine/engine";
import type { QueryResult } from "@/lib/law-engine/types";
import type { StructuredIntent } from "@/lib/llm/gemini";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  result?: QueryResult;
  isKeywordFallback?: boolean;
  isOffline?: boolean;
}

const EXAMPLE_QUERIES = [
  "What is the helmet fine in Maharashtra?",
  "Drunk driving penalty in Delhi?",
  "How much fine for no insurance?",
  "Speeding challan for a car?",
];

export default function AskPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const { getLanguageCookie } = require("@/lib/i18n/locales");
  const [lang, setLang] = useState("en");

  useEffect(() => {
    setLang(getLanguageCookie());
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const update = () => setIsOffline(!navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    update();
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  // Voice input — progressive enhancement
  function toggleVoice() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return; // Not supported — button stays hidden

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const rec = new SR();
    // Use selected language for speech recognition
    rec.lang = lang === "en" ? "en-IN" : `${lang}-IN`;
    rec.interimResults = false;
    rec.onresult = (e: any) => setInput(e.results[0][0].transcript);
    rec.onend = () => setIsListening(false);
    rec.start();
    recognitionRef.current = rec;
    setIsListening(true);
  }

  const supportsSpeech = typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  async function handleKeywordFallback(query: string): Promise<QueryResult> {
    return queryViolations({ stateCode: null, vehicleType: "all", isRepeatOffender: false, searchText: query });
  }

  async function handleSubmit(query = input) {
    const q = query.trim();
    if (!q || isLoading) return;
    setInput("");

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", text: q };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      let intent: StructuredIntent | null = null;
      let provider = "keyword";
      let offline = false;

      if (!isOffline) {
        const res = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: q, lang }),
        });
        if (res.ok) {
          const data = await res.json();
          intent = data.intent;
          provider = data.provider;
        } else {
          offline = true;
        }
      } else {
        offline = true;
      }

      // Resolve using local engine — LLM ONLY provides intent params
      const result = await queryViolations({
        stateCode: intent?.stateCode ?? null,
        vehicleType: intent?.vehicleType ?? "all",
        category: intent?.category ?? undefined,
        isRepeatOffender: false,
        searchText: !intent?.category ? q : undefined,
      });

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: result.results.length > 0
          ? `Found ${result.results.length} matching violation(s).`
          : "No matching violation found in our database. Try the calculator for a manual lookup.",
        result,
        isKeywordFallback: provider === "keyword" || result.usedKeywordFallback,
        isOffline: offline,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(),
        role: "assistant",
        text: "Something went wrong. Please try the calculator instead.",
      }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="border-b border-zinc-100 bg-white/80 backdrop-blur-sm px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-1 text-zinc-400 hover:text-brand-navy transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-zinc-900">Ask DriveLegal</h1>
              <p className="text-xs text-zinc-400">AI-parsed, legally sourced answers</p>
            </div>
          </div>
          {isOffline && (
            <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
              <WifiOff className="w-3.5 h-3.5" />
              Offline mode
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12 space-y-6">
              <div className="text-5xl">⚖️</div>
              <div>
                <h2 className="text-xl font-bold text-zinc-800 mb-1">Ask anything about traffic laws</h2>
                <p className="text-sm text-zinc-500">Your answer is resolved from official Indian legal records, not AI guesses.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {EXAMPLE_QUERIES.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSubmit(q)}
                    className="text-left p-3 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-600 hover:border-brand-navy hover:bg-blue-50 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "user" ? (
                <div className="max-w-[80%] bg-brand-navy text-white px-4 py-3 rounded-2xl rounded-br-sm text-sm">
                  {msg.text}
                </div>
              ) : (
                <div className="max-w-[90%] space-y-3 w-full">
                  {/* Offline/keyword banner */}
                  {(msg.isOffline || msg.isKeywordFallback) && (
                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700">
                      <WifiOff className="w-3.5 h-3.5 flex-shrink-0" />
                      {msg.isOffline
                        ? "Offline — showing keyword fallback results from local data"
                        : "Keyword fallback mode — AI parsing unavailable or no structured match"}
                    </div>
                  )}

                  {/* Results */}
                  {msg.result && msg.result.results.length > 0 ? (
                    <div className="space-y-3">
                      {msg.result.results.map((r) => (
                        <div key={r.violation.id} className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                          <div className="bg-gradient-to-r from-brand-navy to-blue-800 px-4 py-3">
                            <p className="text-blue-200 text-xs font-medium">{r.violation.title.en}</p>
                            <p className="text-white text-3xl font-black">{r.resolvedFine.displayText}</p>
                          </div>
                          <div className="px-4 py-3 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${r.ruleSource === "state_override" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                                {r.ruleSource === "state_override" ? `⚡ ${r.appliedStateCode} State` : "🇮🇳 Central MVA"}
                              </span>
                              {r.licenceConsequence && (
                                <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-semibold">
                                  ⚠️ Licence impact
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between text-xs text-zinc-400">
                              <span>{r.citation.section} · {r.citation.sourceDocument}</span>
                              {r.citation.sourceUrl && (
                                <a href={r.citation.sourceUrl} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-brand-navy hover:underline">
                                  Source <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="text-center">
                        <Link href={`/calculator?category=${msg.result.params.category ?? ""}&state=${msg.result.params.stateCode ?? ""}&vehicle=${msg.result.params.vehicleType}`}
                          className="text-xs text-brand-navy hover:underline">
                          Open full calculator for more options →
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white border border-zinc-200 rounded-2xl px-4 py-4 text-sm text-zinc-600">
                      {msg.text}
                      <Link href="/calculator" className="block mt-2 text-brand-navy text-xs hover:underline">
                        Try the manual calculator →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-zinc-200 rounded-2xl px-5 py-4 flex items-center gap-2">
                <div className="flex gap-1">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-2 h-2 bg-brand-navy rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
                <span className="text-xs text-zinc-400">Looking up official records...</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-zinc-100 bg-white/90 backdrop-blur-sm px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 bg-zinc-50 border-2 border-zinc-200 focus-within:border-brand-navy rounded-2xl px-4 py-3 transition-colors">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit()}
              placeholder="e.g. Helmet fine in Pune?"
              className="flex-1 bg-transparent text-zinc-900 text-sm focus:outline-none placeholder:text-zinc-400"
              disabled={isLoading}
            />
            {supportsSpeech && (
              <button
                id="voice-input"
                onClick={toggleVoice}
                className={`p-1.5 rounded-lg transition-colors ${isListening ? "text-red-500 bg-red-50" : "text-zinc-400 hover:text-brand-navy"}`}
                title="Voice input (Chrome recommended)"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}
            <button
              id="ask-submit"
              onClick={() => handleSubmit()}
              disabled={!input.trim() || isLoading}
              className="p-2 bg-brand-navy text-white rounded-xl disabled:opacity-40 hover:bg-blue-900 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-zinc-400 text-center mt-2">
            Fines resolved from official Indian legal datasets · Not legal advice
          </p>
        </div>
      </div>
    </div>
  );
}
