import { ShieldCheck, Scale, FileText, AlertCircle } from "lucide-react";
import Link from "next/link";

const TOPICS = [
  {
    icon: "🚔",
    title: "What can police check at a traffic stop?",
    items: [
      "Driving licence (original or DigiLocker)",
      "Vehicle registration certificate (RC)",
      "Insurance certificate",
      "Pollution Under Control (PUC) certificate",
      "Permit (for transport vehicles)",
    ],
  },
  {
    icon: "📋",
    title: "How to contest a wrong challan",
    items: [
      "Note down challan number, date, and officer badge number",
      "Collect evidence (photos, witnesses)",
      "File a complaint at the nearest traffic police station",
      "Approach Motor Accident Claims Tribunal if needed",
      "Use Lok Adalat for quick resolution (free, binding)",
    ],
  },
  {
    icon: "⚖️",
    title: "Lok Adalat — Free dispute resolution",
    items: [
      "Lok Adalats are held monthly in most districts",
      "Proceedings are free of cost",
      "Awards are final and binding",
      "Contact your District Legal Services Authority (DLSA)",
    ],
  },
  {
    icon: "📱",
    title: "Your rights during a traffic stop",
    items: [
      "You have the right to know the reason for stopping",
      "Officers must be in uniform and display badge",
      "You can show documents via DigiLocker (legally valid)",
      "You cannot be asked to pay on the spot without a receipt",
      "Demand an official challan slip for any fine",
    ],
  },
];

export default function RightsPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 py-4">
          <ShieldCheck className="h-7 w-7 text-amber-500" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Know Your Rights
          </h1>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            This page provides general legal information based on the Motor Vehicles Act 2019. 
            It is not legal advice. For your specific situation, consult a qualified advocate.
          </p>
        </div>

        {/* Topics */}
        {TOPICS.map((topic) => (
          <div
            key={topic.title}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6"
          >
            <h2 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">{topic.icon}</span>
              {topic.title}
            </h2>
            <ul className="space-y-2">
              {topic.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <span className="text-amber-500 font-bold mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Ask AI CTA */}
        <Link
          href="/ask"
          className="block bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl p-6 text-center font-bold hover:opacity-90 transition-opacity"
        >
          Have a specific question? Ask the Legal AI →
        </Link>
      </div>
    </main>
  );
}
