import Link from "next/link";

export function InitiativeHeader() {
  return (
    <>
      {/* Skip to main content (accessibility) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-amber-500 focus:text-slate-900 focus:rounded-lg focus:font-bold focus:text-sm"
      >
        Skip to main content
      </a>

      {/* ── Tricolor strip ── */}
      <div className="flex w-full h-1.5" aria-hidden="true">
        <div className="flex-1" style={{ background: "#FF9933" }} />
        <div className="flex-1" style={{ background: "#FFFFFF" }} />
        <div className="flex-1" style={{ background: "#138808" }} />
      </div>

      {/* ── Top utility bar ── */}
      <div
        className="w-full py-1.5 px-4"
        style={{ background: "#0B1A3A" }}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="text-amber-400 font-semibold uppercase tracking-widest">
              Road Safety Initiative
            </span>
            <span className="hidden sm:inline text-slate-400">|</span>
            <span className="hidden sm:inline text-slate-300">
              Hackathon Submission &mdash; Road Safety Hackathon 2026, IIT Madras
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/about"
              className="text-slate-400 hover:text-amber-400 transition-colors"
            >
              About this initiative
            </Link>
            <span className="text-slate-600">|</span>
            <span className="text-slate-500 italic">
              Not an official Government of India website
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
