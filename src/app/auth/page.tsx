"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sendOTP, verifyOTP } from "@/lib/auth/otp";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Shield, Smartphone, Lock, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { animations } from "@/lib/animations";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextTarget = searchParams.get("next") || "/dashboard";

  const [step, setStep] = useState<"phone" | "token">("phone");
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { error } = await sendOTP(phone);
      if (error) {
        setError(error);
      } else {
        setStep("token");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (token.length < 6) {
      setError("Please enter the 6-digit code.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { error } = await verifyOTP(phone, token);
      if (error) {
        setError(error);
      } else {
        router.push(nextTarget);
      }
    } catch (err) {
      setError("Verification failed. Please check the code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <motion.div 
        {...animations.fadeIn} 
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 bg-slate-900 rounded-2xl items-center justify-center text-white shadow-xl mb-6">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Secure Access
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">
            DriveLegal Verification Gateway
          </p>
        </div>

        <Card className="p-8 border-none shadow-2xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden relative">
          <AnimatePresence mode="wait">
            {step === "phone" ? (
              <motion.div
                key="phone-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                    Mobile Number
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-slate-400 font-bold text-sm">+91</span>
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="9876543210"
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl py-4 pl-14 pr-4 text-slate-900 dark:text-white font-bold outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-950/30 p-3 rounded-xl text-xs font-bold">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleSendOTP}
                  disabled={loading}
                  fullWidth
                  size="lg"
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl py-6"
                >
                  {loading ? "Sending..." : "Send Verification Code"}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>

                <p className="text-[10px] text-center text-slate-400 font-medium">
                  By proceeding, you agree to receive a secure SMS code for authentication.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="token-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl">
                  <Smartphone className="h-5 w-5 text-indigo-500" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sent to</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">+91 {phone}</p>
                  </div>
                  <button 
                    onClick={() => setStep("phone")}
                    className="ml-auto text-[10px] font-black text-indigo-500 uppercase hover:underline"
                  >
                    Change
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                    Enter 6-Digit Code
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={token}
                      onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000000"
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-white font-bold tracking-[0.5em] outline-none transition-all placeholder:tracking-normal"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-950/30 p-3 rounded-xl text-xs font-bold">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleVerifyOTP}
                  disabled={loading}
                  fullWidth
                  size="lg"
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl py-6"
                >
                  {loading ? "Verifying..." : "Verify & Continue"}
                  {!loading && <CheckCircle2 className="ml-2 h-4 w-4" />}
                </Button>

                <div className="text-center">
                  <button
                    onClick={handleSendOTP}
                    className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-indigo-500 transition-colors"
                  >
                    Resend Code
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        <div className="mt-8 flex justify-center gap-6">
          <button 
            onClick={() => router.push("/")}
            className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-600 transition-colors"
          >
            ← Back to Home
          </button>
          <button 
            onClick={() => router.push(nextTarget)}
            className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors"
          >
            Skip for now (Guest)
          </button>
        </div>
      </motion.div>
    </div>
  );
}
