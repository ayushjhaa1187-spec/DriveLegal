import Image from "next/image";
import { cn } from "@/lib/utils/cn";

interface DriveLegalShieldProps {
  size?: number;
  className?: string;
}

export function DriveLegalShield({ size = 40, className }: DriveLegalShieldProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-2 select-none", className)}
      aria-label="DriveLegal"
    >
      <Image
        src="/brand/drivelegal-shield.svg"
        alt="DriveLegal Shield Logo"
        width={size}
        height={size}
        priority
        className="shrink-0"
      />
      <span
        className="font-extrabold tracking-tight leading-none"
        style={{
          fontSize: size * 0.55,
          fontFamily: "var(--font-manrope), Manrope, sans-serif",
          color: "#f59e0b",
          letterSpacing: "-0.02em",
        }}
      >
        Drive<span style={{ color: "#ffffff" }}>Legal</span>
      </span>
    </span>
  );
}
