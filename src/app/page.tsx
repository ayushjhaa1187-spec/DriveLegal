import Image from "next/image";
import Link from "next/link";
import { Search, Mic, Calculator, MessageSquareText, Scan, ShieldCheck, ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-bg.png"
            alt="Modern Highway"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/80 via-brand-navy/40 to-background" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-4xl px-6 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold font-headings tracking-tight mb-4">
            Drive <span className="text-brand-amber">Legal</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-200 mb-8 max-w-2xl mx-auto">
            Your offline-first AI companion for traffic laws, fine calculation, and legal rights.
          </p>

          {/* Giant Search Bar */}
          <form 
            action="/ask" 
            method="GET"
            className="relative max-w-2xl mx-auto group"
          >
            <div className="absolute inset-0 bg-brand-amber/20 blur-xl group-focus-within:bg-brand-amber/40 transition-all rounded-full" />
            <div className="relative flex items-center bg-white rounded-full shadow-2xl overflow-hidden p-2">
              <div className="pl-4 pr-2 text-zinc-400">
                <Search className="w-6 h-6" />
              </div>
              <input
                type="text"
                name="q"
                placeholder="How much fine if I don't wear helmet in Pune?"
                className="flex-1 bg-transparent py-3 md:py-4 px-2 text-zinc-900 focus:outline-none text-lg"
                required
              />
              <div className="flex items-center gap-2 pr-2">
                 <div className="hidden md:flex items-center px-3 py-1 bg-zinc-100 rounded-full text-xs font-semibold text-zinc-500 uppercase tracking-widest border border-zinc-200">
                  Powered by AI
                </div>
                <button type="submit" className="p-3 bg-brand-navy text-white rounded-full hover:bg-brand-navy/90 transition-all">
                  <Mic className="w-6 h-6" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Features Grid */}
      <section className="flex-1 bg-background px-6 py-16 -mt-12 relative z-20">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Link 
              key={feature.title}
              href={feature.href}
              className="group relative bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none hover:border-brand-amber/50 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${feature.iconBg}`}>
                <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
              </div>
              <h3 className="text-xl font-bold font-headings mb-2 text-zinc-900 dark:text-zinc-50 flex items-center">
                {feature.title}
                <ChevronRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-sm">
                {feature.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer / Status */}
      <footer className="py-8 px-6 border-t border-zinc-100 dark:border-zinc-800 text-center">
        <p className="text-zinc-400 text-xs font-medium uppercase tracking-widest">
          Offline Enabled • Central Law v2019.4 • MH/DL/KA Active
        </p>
      </footer>
    </div>
  );
}

const features = [
  {
    title: "Calculator",
    description: "Check official fine amounts for 150+ violations across all states.",
    href: "/calculator",
    icon: Calculator,
    iconBg: "bg-blue-50 dark:bg-blue-900/20",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    title: "Ask AI",
    description: "Natural language legal Q&A powered by Google Gemini (Flash).",
    href: "/ask",
    icon: MessageSquareText,
    iconBg: "bg-amber-50 dark:bg-amber-900/20",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    title: "Scan Receipt",
    description: "OCR scan of challan receipts to verify accuracy and detect overcharging.",
    href: "/scan",
    icon: Scan,
    iconBg: "bg-emerald-50 dark:bg-emerald-900/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "Your Rights",
    description: "Know exactly what to do when stopped by traffic police.",
    href: "/rights",
    icon: ShieldCheck,
    iconBg: "bg-indigo-50 dark:bg-indigo-900/20",
    iconColor: "text-indigo-600 dark:text-indigo-400",
  },
];
