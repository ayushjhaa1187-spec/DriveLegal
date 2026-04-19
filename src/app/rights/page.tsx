'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Shield, FileText, Scale, Siren, Info, Car } from "lucide-react";
import Markdown from "react-markdown";

type TopicId = string;

interface Topic {
  id: TopicId;
  title: string;
  icon: React.ReactNode;
  prompt: string;
}

const TOPICS: Topic[] = [
  {
    id: "digilocker",
    title: "Valid Documents (DigiLocker)",
    icon: <FileText className="w-5 h-5 text-blue-600" />,
    prompt: "Is showing documents in DigiLocker or mParivahan valid under Indian law? Can police insist on physical copies? Mention the relevant IT Act / Motor Vehicle rules.",
  },
  {
    id: "police-authority",
    title: "Police Checks & Keys",
    icon: <Shield className="w-5 h-5 text-indigo-600" />,
    prompt: "Can traffic police take away car or bike keys during a check in India? What is the official protocol they must follow? What is the rank required to issue a challan?",
  },
  {
    id: "lok-adalat",
    title: "Lok Adalat & Contesting",
    icon: <Scale className="w-5 h-5 text-emerald-600" />,
    prompt: "How can I contest a wrong e-challan in India? How does Lok Adalat help in reducing or settling traffic fines? What is the procedure?",
  },
  {
    id: "drunk-driving",
    title: "Testing & Drunk Driving",
    icon: <Siren className="w-5 h-5 text-red-600" />,
    prompt: "What are my rights when stopped for a breathalyzer test in India? Do I have the right to a blood test? What happens if I refuse?",
  },
  {
    id: "impounding",
    title: "Vehicle Impounding",
    icon: <Car className="w-5 h-5 text-amber-600" />,
    prompt: "Under what specific traffic offenses can the traffic police in India legally impound my vehicle?",
  }
];

export default function RightsPage() {
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

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

  async function handleTopicClick(topic: Topic) {
    if (isOffline) {
      setError("AI assistance requires an internet connection.");
      return;
    }
    setActiveTopic(topic);
    setResponse(null);
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/rights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: topic.prompt }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch response.");

      setResponse(data.text);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
       <div className="border-b border-zinc-100 bg-white px-4 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/" className="p-1 text-zinc-400 hover:text-brand-navy transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-zinc-900">Know Your Rights</h1>
            <p className="text-xs text-zinc-400">Guardrailed AI legal insights</p>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-8">
        
        <div className="mb-6 bg-brand-navy rounded-2xl p-6 text-white shadow-sm">
          <h2 className="text-xl font-bold mb-2">Empower Yourself on the Road</h2>
          <p className="text-sm text-blue-100 mb-4">Select a topic below to get clear, factual information about your rights as a driver according to the Motor Vehicles Act.</p>
          <div className="flex items-center gap-2 text-xs text-blue-200">
            <Info className="w-4 h-4" /> Keep these rules in mind during traffic stops.
          </div>
        </div>

        {isOffline && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
             <h3 className="font-bold text-amber-900 mb-1">You are offline</h3>
             <p className="text-sm text-amber-700">AI insights require an internet connection. Reconnect to chat.</p>
          </div>
        )}

        {!activeTopic ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TOPICS.map((t) => (
              <button
                key={t.id}
                onClick={() => handleTopicClick(t)}
                className="flex items-center gap-4 bg-white border border-zinc-200 hover:border-brand-navy p-5 rounded-2xl text-left transition-colors shadow-sm"
              >
                <div className="p-3 bg-slate-50 rounded-xl">
                  {t.icon}
                </div>
                <span className="font-semibold text-zinc-800 leading-snug">{t.title}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => setActiveTopic(null)}
              className="text-sm font-medium text-zinc-500 hover:text-zinc-800 flex items-center gap-1"
            >
              ← Back to topics
            </button>
            
            <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-100">
                 {activeTopic.icon}
                 <h2 className="text-lg font-bold text-zinc-900">{activeTopic.title}</h2>
              </div>

              {isLoading && (
                <div className="flex items-center justify-center py-12">
                   <div className="w-8 h-8 rounded-full border-4 border-zinc-100 border-t-brand-navy animate-spin" />
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {response && (
                <div className="prose prose-sm prose-zinc max-w-none prose-p:leading-relaxed prose-li:marker:text-blue-500">
                  <Markdown>{response}</Markdown>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
