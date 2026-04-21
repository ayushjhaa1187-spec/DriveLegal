"use client";

import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface SpeechNarratorProps {
  text: string;
  label?: string;
  className?: string;
}

export function SpeechNarrator({ text, label, className = "" }: SpeechNarratorProps) {
  const { t } = useTranslation();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  const displayLabel = label || t("common.listen");

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setSupported(true);
    }
  }, []);

  const toggleSpeak = () => {
    if (!supported) return;
    
    playFeedback("click");

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      // Attempt to find a natural-sounding voice
      const voices = window.speechSynthesis.getVoices();
      const premiumVoice = voices.find(v => v.name.includes("Google") || v.name.includes("Premium")) || voices[0];
      if (premiumVoice) utterance.voice = premiumVoice;
      
      utterance.rate = 0.95; // Slightly slower for clarity
      utterance.pitch = 1.0;

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  if (!supported) return null;

  return (
    <button
      onClick={toggleSpeak}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-sm font-medium transition-all active:scale-95 ${className}`}
      title={isSpeaking ? "Stop Reading" : "Read Aloud"}
    >
      {isSpeaking ? (
        <>
          <VolumeX className="w-4 h-4 animate-pulse" />
          <span>{t("common.stop")}</span>
        </>
      ) : (
        <>
          <Volume2 className="w-4 h-4" />
          <span>{displayLabel}</span>
        </>
      )}
    </button>
  );
}
