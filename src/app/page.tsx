import Link from "next/link";
import { Calculator, MessageSquare, ScanLine, Scale, ShieldCheck, Globe } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Hero */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Scale className="h-10 w-10 text-amber-400" />
            <h1 className="text-5xl font-bold text-white">DriveLegal</h1>
          </div>
          <p className="text-xl text-slate-300">
            Know your traffic rights. Calculate correct fines. Challenge overcharging.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-sm font-medium">
              📴 Works Offline
            </span>
            <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-sm font-medium">
              🌐 10 Languages
            </span>
            <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-sm font-medium">
              🗺️ All 36 States
            </span>
          </div>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/calculator"
              className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-8 py-3 rounded-xl transition-colors"
            >
              Calculate Fine
            </Link>
            <Link
              href="/ask"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3 rounded-xl border border-white/20 transition-colors"
            >
              Ask Legal AI
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {[
            {
              href: "/calculator",
              icon: <Calculator className="h-8 w-8 text-amber-400" />,
              title: "Fine Calculator",
              desc: "Instant fine lookup. State-specific rates. Works offline. No guessing.",
            },
            {
              href: "/ask",
              icon: <MessageSquare className="h-8 w-8 text-amber-400" />,
              title: "Ask Legal AI",
              desc: "Ask in Hindi, Tamil, or English. Get answers with MVA 2019 citations.",
            },
            {
              href: "/scan",
              icon: <ScanLine className="h-8 w-8 text-amber-400" />,
              title: "Scan & Verify",
              desc: "Upload challan photo. Detect overcharging. Generate dispute letter instantly.",
            },
            {
              href: "/rights",
              icon: <ShieldCheck className="h-8 w-8 text-amber-400" />,
              title: "Know Your Rights",
              desc: "What can police check? How to contest? Lok Adalat guide.",
            },
            {
              href: "/laws",
              icon: <Scale className="h-8 w-8 text-amber-400" />,
              title: "Browse Laws",
              desc: "All 150+ violations. Searchable. Filterable by category and vehicle type.",
            },
            {
              href: "/laws",
              icon: <Globe className="h-8 w-8 text-amber-400" />,
              title: "Global Mode",
              desc: "USA, UK, UAE, Australia and 6 more countries covered.",
            },
          ].map((card) => (
            <Link
              key={card.href + card.title}
              href={card.href}
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-6 transition-all hover:border-amber-400/50 group"
            >
              <div className="mb-4">{card.icon}</div>
              <h3 className="font-bold text-white text-lg mb-2 group-hover:text-amber-300 transition-colors">
                {card.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">{card.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 text-center">
        <p className="text-slate-500 text-sm">
          ⚠️ DriveLegal provides legal information, not legal advice. Always verify with official sources.
        </p>
      </footer>
    </main>
  );
}
