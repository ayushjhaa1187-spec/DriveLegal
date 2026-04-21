"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowRight, Calculator, MessageSquare, ScanLine, Scale, 
  ShieldCheck, Globe, Sparkles, WifiOff, Languages 
} from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { playFeedback } from "@/lib/utils/feedback";
import { SpeechNarrator } from "@/components/ui/SpeechNarrator";
import { Magnetic } from "@/components/ui/Magnetic";
import { useTranslation } from "@/hooks/useTranslation";

// Animation Variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 30, filter: "blur(4px)" },
  show: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { type: "spring" as const, stiffness: 100, damping: 15 }
  }
};

export default function HomePage() {
  const { t } = useTranslation();
  
  const handleCtaClick = () => {
    playFeedback("success");
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* ═══════════════════════════════════════════════ */}
      {/* HERO SECTION                                     */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-slate-900 bg-mesh text-white min-h-[85vh] flex items-center">
        {/* Background pattern - refined for Delight */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Floating background glows - animated for premium feel */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-20 w-80 h-80 bg-amber-500/20 rounded-full blur-[120px] pointer-events-none" 
        />
        <motion.div 
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" 
        />

        <div className="relative max-w-7xl mx-auto px-4 lg:px-6 py-16 lg:py-24 w-full">
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="max-w-3xl"
          >
            {/* Trust badges */}
            <motion.div variants={item} className="flex flex-wrap gap-2 mb-8">
              <Badge icon={<WifiOff className="h-3 w-3" />} text={t("home.badge_offline") || "Works Offline"} />
              <Badge icon={<Languages className="h-3 w-3" />} text={t("home.badge_langs") || "10 Languages"} />
              <Badge icon={<Sparkles className="h-3 w-3" />} text={t("home.badge_ai") || "AI-Powered"} />
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={item} className="text-5xl lg:text-8xl font-black leading-[1] mb-6 tracking-tight">
              {t("home.hero_title")}
            </motion.h1>

            <motion.p variants={item} className="text-xl lg:text-3xl text-slate-300 mb-10 max-w-2xl leading-relaxed font-medium">
              {t("home.hero_subtitle")}
            </motion.p>

            {/* CTAs */}
            <motion.div variants={item} className="flex flex-wrap gap-4">
              <Link href="/calculator" onClick={handleCtaClick}>
                <Magnetic>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="primary" size="xl" className="shadow-2xl shadow-amber-500/20" rightIcon={<ArrowRight className="h-5 w-5" />}>
                      {t("home.calculate")}
                    </Button>
                  </motion.div>
                </Magnetic>
              </Link>
              <Link href="/ask" onClick={() => playFeedback("click")}>
                <Magnetic>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" size="xl" className="bg-white/5 border-white/10 text-white hover:bg-white/10 backdrop-blur-md">
                      {t("home.ask")}
                    </Button>
                  </motion.div>
                </Magnetic>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div variants={item} className="mt-16 flex flex-wrap gap-8 lg:gap-16 text-sm text-slate-400">
              <Stat value="150+" label="Violations Covered" />
              <Stat value="36" label="States & UTs" />
              <Stat value="10" label="Languages" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* FEATURE GRID                                     */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 lg:px-6 py-16 lg:py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            {t("home.features_title")}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {t("home.features_subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          <FeatureCard
            href="/calculator"
            icon={Calculator}
            title="Challan Calculator"
            description="Instant fine lookup with state-specific rates. Works completely offline with verified data."
            highlight="Most Used"
          />
          <FeatureCard
            href="/ask"
            icon={MessageSquare}
            title="Ask Legal AI"
            description="Get answers in Hindi, Tamil, Telugu and more. Always cites specific legal sections and acts."
          />
          <FeatureCard
            href="/scan"
            icon={ScanLine}
            title="Scan & Verify"
            description="Upload your challan photo. Detect overcharging errors. Get a dispute letter in seconds."
            highlight="New"
          />
          <FeatureCard
            href="/rights"
            icon={ShieldCheck}
            title="Know Your Rights"
            description="What can police check? How to contest a spot fine? Plain-language guides for everyone."
          />
          <FeatureCard
            href="/laws"
            icon={Scale}
            title="Browse All Laws"
            description="Search 150+ violations from MVA 2019 with original source links and citations."
          />
          <FeatureCard
            href="/global"
            icon={Globe}
            title="Global Mode"
            description="Traveling abroad? Get traffic rules for USA, UK, UAE and 7 more countries instantly."
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* TRUST SECTION                                    */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
            <TrustItem icon="🏛️" label="Sources from" value="indiacode.nic.in" />
            <TrustItem icon="📅" label="Last updated" value="Weekly auto-check" />
            <TrustItem icon="🔒" label="Privacy first" value="Zero data tracking" />
            <TrustItem icon="🆓" label="Free forever" value="For all citizens" />
          </div>
        </div>
      </section>

      {/* Footer Disclaimer */}
      <footer className="bg-slate-50 dark:bg-slate-950 py-12 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed italic">
            ⚠️ <strong>Legal Disclaimer:</strong> DriveLegal provides information for educational purposes only. 
            It is not a substitute for legal advice from a qualified advocate or attorney. 
            All law data is sourced from official government publications with citations.
          </p>
          <div className="mt-8 text-xs text-slate-400 uppercase tracking-widest">
            © 2026 DriveLegal — Built for Road Users
          </div>
        </div>
      </footer>
    </div>
  );
}

function Badge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
      {icon}
      {text}
    </span>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="group cursor-default">
      <div className="text-3xl font-black text-amber-500 group-hover:scale-110 transition-transform origin-left">{value}</div>
      <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-600 dark:text-slate-400 mt-1">{label}</div>
    </div>
  );
}

function FeatureCard({
  href, icon: Icon, title, description, highlight,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  highlight?: string;
}) {
  return (
    <Link href={href} className="block group">
      <Card variant="interactive" className="h-full p-8 relative flex flex-col">
        {highlight && (
          <span className="absolute top-6 right-6 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-[0.1em]">
            {highlight}
          </span>
        )}
        <div className="h-14 w-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-6 group-hover:rotate-6 group-hover:scale-110 transition-all duration-300">
          <Icon className="h-7 w-7 text-amber-600 dark:text-amber-400" aria-hidden="true" />
        </div>
        <CardTitle className="text-xl mb-3 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
          {title}
        </CardTitle>
        <CardDescription className="text-base leading-relaxed grow">
          {description}
        </CardDescription>
        <div className="mt-6 flex items-center text-sm font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-2 transition-transform">
          Get Started <ArrowRight className="h-4 w-4 ml-1.5" aria-hidden="true" />
        </div>
      </Card>
    </Link>
  );
}

function TrustItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-4xl mb-4 grayscale hover:grayscale-0 transition-all cursor-default" role="img" aria-label={label}>
        {icon}
      </div>
      <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] font-bold mb-1">{label}</div>
      <div className="text-base font-bold text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}
