"use client";

import { useState, useEffect } from "react";
import { Download, X, Sparkles, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";
import { animations } from "@/lib/animations";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Check if user already dismissed it recently
      const lastDismissed = localStorage.getItem("pwa-prompt-dismissed");
      const oneDay = 24 * 60 * 60 * 1000;
      
      if (!lastDismissed || Date.now() - parseInt(lastDismissed) > oneDay) {
        setIsVisible(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
    setIsVisible(false);
  };

  const dismiss = () => {
    setIsVisible(false);
    localStorage.setItem("pwa-prompt-dismissed", Date.now().toString());
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed bottom-20 lg:bottom-6 right-4 left-4 lg:left-auto lg:w-96 z-[100]">
          <motion.div
            {...animations.modalContent}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
          >
            <Card className="p-6 shadow-2xl border-2 border-amber-500/30 overflow-hidden relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl" />
              
              <button
                onClick={dismiss}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                aria-label="Dismiss prompt"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>

              <div className="flex gap-4 items-start mb-6">
                <div className="h-12 w-12 bg-amber-500 rounded-2xl flex items-center justify-center flex-shrink-0 animate-bounce shadow-lg">
                  <Smartphone className="h-6 w-6 text-slate-900" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    Add to Homescreen
                    <Sparkles className="h-4 w-4 text-amber-500" />
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Get instant offline access to traffic laws and fine calculator.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button fullWidth variant="primary" onClick={handleInstall} leftIcon={<Download className="h-4 w-4" />}>
                  Install App
                </Button>
                <Button variant="ghost" onClick={dismiss}>Maybe later</Button>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
