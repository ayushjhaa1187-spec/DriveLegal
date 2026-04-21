"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export function SplashScreen({ children, isReady }: { children: React.ReactNode; isReady: boolean }) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (isReady) {
      // Small buffer for ultimate smoothness
      const timer = setTimeout(() => setShowSplash(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isReady]);

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] bg-[#020617] flex flex-col items-center justify-center"
          >
            <div className="relative w-full h-full">
              <Image 
                src="/splash.png" 
                alt="DriveLegal Splash" 
                fill
                priority
                className="object-cover"
              />
              {/* Subtle Loading Progress indicator */}
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="h-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className={showSplash ? "hidden" : "block"}>
        {children}
      </div>
    </>
  );
}
