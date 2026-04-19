'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';
import { SUPPORTED_LANGUAGES, getLanguageCookie, setLanguageCookie, DEFAULT_LANGUAGE } from '@/lib/i18n/locales';

export function LanguageSelector() {
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
    // Refresh the current route to pick up new language strings server-side or trigger re-renders
    router.refresh();
  };

  const activeLang = SUPPORTED_LANGUAGES.find(l => l.code === currentLang) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-white/90 backdrop-blur-md border border-zinc-200 shadow-sm hover:shadow-md px-3 py-2 rounded-full transition-all"
        >
          <Globe className="w-4 h-4 text-brand-navy" />
          <span className="text-sm font-medium text-zinc-700 hidden sm:inline-block">
            {activeLang.nativeName}
          </span>
          <span className="text-sm font-medium text-zinc-700 sm:hidden">
            {activeLang.code.toUpperCase()}
          </span>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-zinc-100 shadow-xl rounded-2xl py-2 overflow-hidden animate-in fade-in slide-in-from-top-2">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors flex items-center justify-between ${
                  currentLang === lang.code ? 'text-brand-navy bg-blue-50/50 font-medium' : 'text-zinc-600'
                }`}
              >
                <span>{lang.nativeName}</span>
                <span className="text-xs text-zinc-400">{lang.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {isOpen && (
        <div 
          className="fixed inset-0 z-[-1]" 
          onClick={() => setIsOpen(false)} 
        />
      )}
    </div>
  );
}
