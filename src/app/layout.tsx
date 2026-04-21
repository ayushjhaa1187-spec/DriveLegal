import type { Metadata, Viewport } from "next";
import { Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { PWARegistrar } from "@/components/pwa-registrar";
import { AuthProvider } from "@/components/AuthProvider";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { MobileBottomNav } from "@/components/nav/MobileBottomNav";
import { AppShell } from "@/components/layout/AppShell";
import { InitiativeHeader } from "@/components/layout/InitiativeHeader";
import { AppBootSplash } from "@/components/shared/AppBootSplash";
import FramerLayout from "@/components/layout/FramerLayout";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "DriveLegal | Know Your Traffic Rights",
    template: "%s | DriveLegal"
  },
  description: "India's first AI-powered, offline-first legal assistant for road users. Calculate fines accurately, scan challans, and protect your rights with verified legal datasets.",
  keywords: ["traffic fines", "challan scanner", "road rights", "legal help", "India traffic laws", "RTO codes"],
  manifest: "/manifest.json",
  authors: [{ name: "DriveLegal Team" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://drivelegal.in",
    title: "DriveLegal — Your Traffic Rights, Protected",
    description: "Verify fines instantly. Protect yourself from overcharging. Built for the Indian road user.",
    siteName: "DriveLegal",
  },
  twitter: {
    card: "summary_large_image",
    title: "DriveLegal — Your Traffic Rights, Protected",
    description: "Verify fines instantly. Protect yourself from overcharging.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DriveLegal",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${mono.variable} h-full antialiased scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-amber-500/30">
        <AuthProvider>
          <PWARegistrar />
          {/* Boot splash — rendered client-side, disappears after ~900ms */}
          <AppBootSplash />
          {/* Govt-style initiative header with tricolor strip */}
          <InitiativeHeader />
          <AppShell>
            <div className="hidden md:block">
              <GlobalSearch />
            </div>
            <main id="main-content" className="md:ml-4 flex-1">
              <FramerLayout>
                {children}
              </FramerLayout>
            </main>
            <MobileBottomNav />
          </AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
