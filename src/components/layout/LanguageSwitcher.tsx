"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { SUPPORTED_LANGUAGES, getLanguageCookie, setLanguageCookie, DEFAULT_LANGUAGE } from "@/lib/i18n/locales";

export function LanguageSwitcher() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(DEFAULT_LANGUAGE);

  useEffect(() => {
    setCurrentLang(getLanguageCookie());
  }, []);

  const handleSelect = (code: string) => {
    setLanguageCookie(code);
    setCurrentLang(code);
    setIsOpen(false);
    router.refresh();
  };

  const activeLang = SUPPORTED_LANGUAGES.find(l => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg",
          "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700",
          "text-xs font-medium transition-colors",
          "text-slate-700 dark:text-slate-300"
        )}
        aria-label="Change language"
      >
        <Globe className="h-3.5 w-3.5 text-amber-500" />
        <span>{activeLang.code.toUpperCase()}</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl rounded-xl py-2 overflow-hidden z-20 animate-in fade-in slide-in-from-top-2">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={cn(
                  "w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between",
                  currentLang === lang.code ? "text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-900/20 font-semibold" : "text-slate-600 dark:text-slate-400"
                )}
              >
                <div className="flex flex-col">
                  <span className="text-sm">{lang.nativeName}</span>
                  <span className="text-[10px] opacity-70">{lang.name}</span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
