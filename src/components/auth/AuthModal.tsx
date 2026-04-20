"use client";

import { useState } from "react";
import { 
  X, Phone, Mail, Smartphone, ShieldCheck, 
  ChevronRight, ArrowLeft, Loader2, Sparkles,
  MessageSquare, Lock, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/components/AuthProvider";
import { animations } from "@/lib/animations";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signInWithGoogle, signInWithPhone, verifyOtp } = useAuth();
  const [step, setStep] = useState<"choice" | "phone" | "otp">("choice");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handlePhoneSubmit = async () => {
    // Basic phone formatting to include country code if missing
    let formattedPhone = phone;
    if (!phone.startsWith('+')) {
      formattedPhone = `+91${phone}`;
    }

    if (formattedPhone.length < 10) {
      setError("Please enter a valid mobile number.");
      return;
    }
    
    setError(null);
    setIsLoading(true);
    
    try {
      await signInWithPhone(formattedPhone);
      setStep("otp");
    } catch (err: any) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (otp.length < 6) return;
    
    setError(null);
    setIsLoading(true);
    
    try {
      let formattedPhone = phone;
      if (!phone.startsWith('+')) {
        formattedPhone = `+91${phone}`;
      }
      await verifyOtp(formattedPhone, otp);
      onClose();
    } catch (err: any) {
      setError("Invalid OTP. Please check and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden relative border border-white/20"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
        >
          <X className="h-5 w-5 text-slate-400" />
        </button>

        <div className="p-8 lg:p-10">
          <AnimatePresence mode="wait">
            {step === "choice" && (
              <motion.div key="choice" {...animations.pageEnter} className="space-y-8">
                <div className="text-center">
                  <div className="h-16 w-16 bg-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-amber-500/20 rotate-3">
                    <ShieldCheck className="h-8 w-8 text-slate-900" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Secure Your Vault</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Join 50k+ Indian drivers securing their rights.</p>
                </div>

                <div className="space-y-4">
                  <Button 
                    fullWidth 
                    size="lg" 
                    className="h-16 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-lg font-bold shadow-xl shadow-slate-900/10 hover:scale-[1.02] transition-transform"
                    onClick={() => setStep("phone")}
                  >
                    <Smartphone className="mr-3 h-6 w-6" />
                    Login with Mobile (OTP)
                  </Button>
                  
                  <div className="flex items-center gap-4 py-2">
                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Alternative</span>
                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                  </div>

                  <Button 
                    fullWidth 
                    variant="outline" 
                    size="lg" 
                    className="h-14 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:bg-slate-50 opacity-80"
                    onClick={() => signInWithGoogle()}
                  >
                    <Mail className="mr-2 h-5 w-5" />
                    Continue with Google
                  </Button>
                </div>

                <p className="text-[10px] text-center text-slate-400 px-4 leading-relaxed font-medium uppercase tracking-tight">
                  By joining, you agree to DriveLegal's 
                  <span className="text-slate-900 dark:text-slate-200 mx-1 underline underline-offset-4">Terms</span> 
                  & <span className="text-slate-900 dark:text-slate-200 underline underline-offset-4">Privacy Policy</span>.
                </p>
              </motion.div>
            )}

            {step === "phone" && (
              <motion.div key="phone" {...animations.pageEnter} className="space-y-8">
                <button 
                  onClick={() => setStep("choice")}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>

                <div>
                   <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Verify Phone</h2>
                   <p className="text-sm text-slate-500">We'll send a secure OTP code.</p>
                </div>

                <div className="space-y-6">
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-3">
                       <span className="text-sm font-bold text-slate-400">+91</span>
                       <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
                    </div>
                    <Input 
                      placeholder="99XXXXXXXX" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    //   className="h-16 pl-20 text-lg font-bold tracking-widest bg-slate-50 dark:bg-slate-950 border-2"
                      className="h-16 pl-20 bg-slate-50 dark:bg-slate-950 border-2"
                      autoFocus
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl flex gap-3 items-center">
                       <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                       <p className="text-xs text-red-700 dark:text-red-400 font-bold">{error}</p>
                    </div>
                  )}

                  <Button 
                    fullWidth 
                    size="lg" 
                    className="h-16 rounded-2xl shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={handlePhoneSubmit}
                    disabled={isLoading || phone.length < 10}
                  >
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <MessageSquare className="mr-2 h-5 w-5" />}
                    {isLoading ? "VALIDATING..." : "SEND SECURE OTP"}
                  </Button>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-start gap-4">
                   <Lock className="h-5 w-5 text-slate-400 mt-0.5" />
                   <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                     Your mobile number is cryptographically secured. We never share your data.
                   </p>
                </div>
              </motion.div>
            )}

            {step === "otp" && (
              <motion.div key="otp" {...animations.pageEnter} className="space-y-8">
                <button 
                  onClick={() => setStep("phone")}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" /> Change Number
                </button>

                <div>
                   <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Check Messages</h2>
                   <p className="text-sm text-slate-500">Sent to <span className="font-bold text-slate-900 dark:text-slate-200">{phone}</span></p>
                </div>

                <div className="space-y-6">
                  <Input 
                    placeholder="000000" 
                    value={otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setOtp(val);
                    }}
                    className="h-20 text-center text-3xl font-black tracking-[0.5em] bg-slate-50 dark:bg-slate-950 border-2"
                    autoFocus
                  />

                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl flex gap-3 items-center">
                       <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                       <p className="text-xs text-red-700 dark:text-red-400 font-bold">{error}</p>
                    </div>
                  )}

                  <Button 
                    fullWidth 
                    size="lg" 
                    className="h-16 rounded-2xl bg-amber-500 text-slate-900 font-black shadow-lg shadow-amber-500/20"
                    onClick={handleOtpSubmit}
                    disabled={isLoading || otp.length < 6}
                  >
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                    {isLoading ? "VERIFYING..." : "SECURE MY VAULT"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
