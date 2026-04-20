"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LegalExpert } from "./ExpertCard";
import { useAuth } from "@/components/AuthProvider";
import { CheckCircle2, Loader2, Send } from "lucide-react";

interface LeadModalProps {
  expert: LegalExpert | null;
  isOpen: boolean;
  onClose: () => void;
}

export function LeadModal({ expert, isOpen, onClose }: LeadModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: expert?.phone || "",
    message: "I need assistance with a traffic violation dispute."
  });

  if (!expert) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/legal-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           expert_id: expert.id,
           case_summary: formData.message
        })
      });

      if (!res.ok) throw new Error("Submission failed");
      setSubmitted(true);
    } catch (error) {
      console.error("Error saving lead:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-white">
        {!submitted ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                Connect with {expert.name}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Send your details to the expert. They will contact you shortly to discuss your case.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Your Name</label>
                <Input 
                  required
                  placeholder="John Doe"
                  className="bg-slate-800 border-slate-700"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Phone Number</label>
                <Input 
                  required
                  type="tel"
                  placeholder="+91 98765 43210"
                  className="bg-slate-800 border-slate-700"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Message (Optional)</label>
                <textarea 
                  className="w-full min-h-[80px] p-3 rounded-md bg-slate-800 border border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                />
              </div>
              
              <DialogFooter className="mt-6">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 h-12 text-sm font-bold tracking-tight"
                >
                  {loading ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2" size={16} />}
                  {loading ? "SENDING..." : "CONFIRM REQUEST"}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <div className="py-8 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Request Sent!</h3>
              <p className="text-slate-400 mt-2">
                {expert.name} has been notified. Expect a call or message within 24 hours.
              </p>
            </div>
            <Button onClick={handleReset} variant="outline" className="mt-4 border-slate-700 hover:bg-slate-800">
              CLOSE
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
