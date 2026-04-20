"use client";

import { Share2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

interface WhatsAppShareProps {
  title: string;
  text: string;
  url?: string;
  className?: string;
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export function WhatsAppShare({ 
  title, 
  text, 
  url, 
  className,
  variant = "primary",
  size = "md",
  fullWidth
}: WhatsAppShareProps) {
  
  const handleShare = () => {
    const shareUrl = url || window.location.href;
    const fullText = `${text}\n\nCheck it out here: ${shareUrl}`;
    const encodedText = encodeURIComponent(fullText);
    window.open(`https://wa.me/?text=${encodedText}`, "_blank");
  };

  return (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      onClick={handleShare}
      className={cn(
        "bg-[#25D366] hover:bg-[#128C7E] text-white border-none shadow-lg shadow-emerald-500/20",
        className
      )}
      leftIcon={<MessageCircle className="h-5 w-5" />}
    >
      Share on WhatsApp
    </Button>
  );
}
