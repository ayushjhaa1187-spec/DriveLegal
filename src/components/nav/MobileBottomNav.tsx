'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calculator, Camera, MapPin, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const NAV_ITEMS = [
  { label: 'Home', icon: Home, href: '/' },
  { label: 'Rules', icon: Calculator, href: '/calculator' },
  { label: 'Scan', icon: Camera, href: '/scan' },
  { label: 'Traffic', icon: MapPin, href: '/hotspots' },
  { label: 'Rights', icon: MessageCircle, href: '/rights' },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] md:hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 pb-safe">
      <div className="flex items-center justify-around h-16">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-full h-full transition-all duration-300",
                isActive 
                  ? "text-brand-navy dark:text-white" 
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-all duration-300",
                isActive && "bg-brand-navy/5 dark:bg-white/10 scale-110"
              )}>
                <Icon className={cn("h-5 w-5", isActive ? "stroke-[2.5]" : "stroke-[2]")} aria-hidden="true" />
              </div>
              <span className={cn(
                "text-[10px] font-bold transition-all",
                isActive ? "opacity-100" : "opacity-70"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
