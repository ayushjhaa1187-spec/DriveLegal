"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home, Calculator, MessageSquare, ScanLine, ShieldCheck,
  Menu, X, Globe, Settings, Scale, WifiOff, MapPin,
  Gavel, Gamepad2, Landmark
} from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { StateBadge } from "./StateBadge";
import { PWAInstallPrompt } from "@/components/shared/PWAInstallPrompt";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/components/AuthProvider";
import { User, LogOut, UserCircle } from "lucide-react";

const PRIMARY_NAV = [
  { href: "/", label: "Home", icon: Home, mobile: true },
  { href: "/calculator", label: "Calculator", icon: Calculator, mobile: true },
  { href: "/dashboard", label: "Vault", icon: ShieldCheck, mobile: true },
  { href: "/hotspots", label: "Hotspots", icon: MapPin, mobile: true },
  { href: "/legal-experts", label: "Experts", icon: Gavel, mobile: true },
  { href: "/simulate", label: "Practice", icon: Gamepad2, mobile: true },
  { href: "/ask", label: "Ask AI", icon: MessageSquare, mobile: true, requiresNetwork: true },
  { href: "/scan", label: "Scan", icon: ScanLine, mobile: true, requiresNetwork: true },
] as const;


const SECONDARY_NAV = [
  { href: "/rights", label: "Rights Guide", icon: ShieldCheck },
  { href: "/laws", label: "Browse Laws", icon: Scale },
  { href: "/global", label: "Global Mode", icon: Globe },
  { href: "/portal", label: "Transparency", icon: Landmark },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isOnline } = useOfflineStatus();

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans">
      {/* Offline Banner */}
      {!isOnline && (
        <div
          role="status"
          className="bg-amber-500 text-slate-900 px-4 py-2 flex items-center justify-center gap-2 text-sm font-semibold z-[70] sticky top-0"
        >
          <WifiOff className="h-4 w-4" />
          <span>You're offline — Calculator and Rights still work</span>
        </div>
      )}

      {/* ═══════════════════════════════════════════════ */}
      {/* TOP BAR (Mobile + Desktop)                       */}
      {/* ═══════════════════════════════════════════════ */}
      <header className={cn(
        "sticky z-[60] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800",
        !isOnline ? "top-9" : "top-0"
      )}>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 lg:px-6 h-14 lg:h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 lg:h-10 lg:w-10 bg-amber-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Scale className="h-5 w-5 lg:h-6 lg:w-6 text-slate-900" />
            </div>
            <span className="font-bold text-lg lg:text-xl text-slate-900 dark:text-white">
              DriveLegal
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {PRIMARY_NAV.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              const isDisabled = (item as any).requiresNetwork && !isOnline;
              
              return (
                <Link
                  key={item.href}
                  href={isDisabled ? "#" : item.href}
                  onClick={(e) => isDisabled && e.preventDefault()}
                  aria-current={isActive ? "page" : undefined}
                  aria-disabled={isDisabled}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
                    isDisabled && "opacity-40 cursor-not-allowed"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:block">
              <StateBadge />
            </div>
            <LanguageSwitcher />

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden lg:block" />

            {user ? (
              <button 
                onClick={() => signOut()}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors group"
              >
                <div className="h-7 w-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold text-xs">
                  {user.phone?.slice(-2) || user.user_metadata?.full_name?.charAt(0) || "U"}
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 hidden lg:block">
                  {user.phone || "Account"}
                </span>
                <LogOut className="h-3.5 w-3.5 text-slate-400 group-hover:text-red-500 transition-colors" />
              </button>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:scale-105 transition-transform"
              >
                <UserCircle className="h-4 w-4" />
                <span>Login</span>
              </button>
            )}
            
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════ */}
      {/* MOBILE SLIDE-OUT MENU                            */}
      {/* ═══════════════════════════════════════════════ */}
      {mobileMenuOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-[80] backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <aside
            className="lg:hidden fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-slate-900 z-[90] shadow-2xl overflow-y-auto"
            aria-label="Mobile menu"
          >
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              {[...PRIMARY_NAV, ...SECONDARY_NAV].map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium",
                      isActive
                        ? "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </>
      )}

      {/* ═══════════════════════════════════════════════ */}
      {/* MAIN CONTENT                                     */}
      {/* ═══════════════════════════════════════════════ */}
      <main className="flex-1 pb-20 lg:pb-0 relative z-10" id="main-content">
        {children}
      </main>

      {/* ═══════════════════════════════════════════════ */}
      {/* MOBILE BOTTOM TAB BAR                            */}
      {/* ═══════════════════════════════════════════════ */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800"
        aria-label="Mobile bottom navigation"
      >
        <div className="grid grid-cols-5 h-16">
          {PRIMARY_NAV.filter((item) => item.mobile).map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const isDisabled = (item as any).requiresNetwork && !isOnline;
            
            return (
              <Link
                key={item.href}
                href={isDisabled ? "#" : item.href}
                onClick={(e) => isDisabled && e.preventDefault()}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 transition-colors relative",
                  isActive
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-slate-500 dark:text-slate-400",
                  isDisabled && "opacity-40"
                )}
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 bg-amber-500 rounded-b" />
                )}
                <item.icon className={cn("h-5 w-5", isActive && "scale-110")} />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <PWAInstallPrompt />
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
