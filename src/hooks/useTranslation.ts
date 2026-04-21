"use client";

import { useState, useEffect } from "react";
import { getLanguageCookie, DEFAULT_LANGUAGE } from "@/lib/i18n/locales";

// This is a simple client-side translation hook
// In a full Next.js project, this might be handled by next-intl or similar
export function useTranslation() {
  const [locale, setLocale] = useState(DEFAULT_LANGUAGE);
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMessages() {
      const currentLocale = getLanguageCookie();
      setLocale(currentLocale);
      
      try {
        // Dynamic import of the locale JSON
        const mod = await import(`@/lib/i18n/messages/${currentLocale}.json`);
        setMessages(mod.default);
      } catch (err) {
        console.error(`Failed to load locale: ${currentLocale}`, err);
        // Fallback to English
        const fallback = await import(`@/lib/i18n/messages/${DEFAULT_LANGUAGE}.json`);
        setMessages(fallback.default);
      } finally {
        setIsLoading(false);
      }
    }

    loadMessages();
  }, []);

  const t = (key: string) => {
    return messages[key] || key;
  };

  return { t, locale, isLoading };
}
