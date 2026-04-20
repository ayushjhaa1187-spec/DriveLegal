/**
 * DriveLegal — Advanced Design Tokens
 * ═══════════════════════════════════════════════════
 * These tokens form the foundation of our design system.
 * Based on the spec provided in PART 1.2
 */

export const tokens = {
  // ═══════════════════════════════════════════════════
  // COLOR SYSTEM (HSL-tailored for consistency)
  // ═══════════════════════════════════════════════════
  colors: {
    navy: {
      50: "#f0f4f9",
      100: "#dde6f0",
      200: "#b9cce0",
      300: "#8ba8c9",
      400: "#5d83b0",
      500: "#3d6798",
      600: "#2e527e",
      700: "#264266",
      800: "#1e3553",
      900: "#0f1d33",  // Primary background
      950: "#070d1c",  // Darkest
    },
    amber: {
      50: "#fffbeb",
      100: "#fef3c7",
      200: "#fde68a",
      300: "#fcd34d",
      400: "#fbbf24",
      500: "#f59e0b",  // Primary CTA
      600: "#d97706",
      700: "#b45309",
      800: "#92400e",
      900: "#78350f",
    },
    success: {
      light: "#d1fae5",
      DEFAULT: "#10b981",
      dark: "#047857",
    },
    danger: {
      light: "#fee2e2",
      DEFAULT: "#ef4444",
      dark: "#b91c1c",
    },
    warning: {
      light: "#fef3c7",
      DEFAULT: "#f59e0b",
      dark: "#b45309",
    },
    info: {
      light: "#dbeafe",
      DEFAULT: "#3b82f6",
      dark: "#1d4ed8",
    },
    slate: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
      950: "#020617",
    },
    severity: {
      1: "#10b981",  // Minor — Green
      2: "#84cc16",  // Light — Lime
      3: "#f59e0b",  // Moderate — Amber
      4: "#f97316",  // Serious — Orange
      5: "#dc2626",  // Critical — Red
    },
  },

  // ═══════════════════════════════════════════════════
  // TYPOGRAPHY
  // ═══════════════════════════════════════════════════
  typography: {
    fontFamily: {
      sans: ["Inter", "system-ui", "sans-serif"],
      heading: ["Manrope", "Inter", "sans-serif"],
      mono: ["JetBrains Mono", "monospace"],
      devanagari: ["Noto Sans Devanagari", "sans-serif"],
      tamil: ["Noto Sans Tamil", "sans-serif"],
      bengali: ["Noto Sans Bengali", "sans-serif"],
      gujarati: ["Noto Sans Gujarati", "sans-serif"],
    },
    fontSize: {
      xs: ["0.75rem", { lineHeight: "1rem" }],         // 12px
      sm: ["0.875rem", { lineHeight: "1.25rem" }],    // 14px
      base: ["1rem", { lineHeight: "1.5rem" }],        // 16px
      lg: ["1.125rem", { lineHeight: "1.75rem" }],    // 18px
      xl: ["1.25rem", { lineHeight: "1.75rem" }],     // 20px
      "2xl": ["1.5rem", { lineHeight: "2rem" }],       // 24px
      "3xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30px
      "4xl": ["2.25rem", { lineHeight: "2.5rem" }],   // 36px
      "5xl": ["3rem", { lineHeight: "1" }],            // 48px
      "6xl": ["3.75rem", { lineHeight: "1" }],         // 60px
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
    },
  },

  // ═══════════════════════════════════════════════════
  // SPACING (8px base scale)
  // ═══════════════════════════════════════════════════
  spacing: {
    px: "1px",
    0: "0",
    1: "0.25rem",   // 4px
    2: "0.5rem",    // 8px
    3: "0.75rem",   // 12px
    4: "1rem",      // 16px  ← base
    5: "1.25rem",   // 20px
    6: "1.5rem",    // 24px
    8: "2rem",      // 32px
    10: "2.5rem",   // 40px
    12: "3rem",     // 48px
    16: "4rem",     // 64px
    20: "5rem",     // 80px
    24: "6rem",     // 96px
  },

  // ═══════════════════════════════════════════════════
  // RESPONSIVE BREAKPOINTS
  // ═══════════════════════════════════════════════════
  breakpoints: {
    xs: "320px",
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },

  // ═══════════════════════════════════════════════════
  // BORDER RADIUS
  // ═══════════════════════════════════════════════════
  borderRadius: {
    none: "0",
    sm: "0.25rem",
    DEFAULT: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
    "2xl": "2rem",
    full: "9999px",
  },

  // ═══════════════════════════════════════════════════
  // SHADOWS
  // ═══════════════════════════════════════════════════
  boxShadow: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    glow: "0 0 0 4px rgb(245 158 11 / 0.2)",
  },

  // ═══════════════════════════════════════════════════
  // ANIMATION
  // ═══════════════════════════════════════════════════
  transitions: {
    fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
    DEFAULT: "200ms cubic-bezier(0.4, 0, 0.2, 1)",
    slow: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
    bounce: "400ms cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  },

  // ═══════════════════════════════════════════════════
  // Z-INDEX SCALE
  // ═══════════════════════════════════════════════════
  zIndex: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    fixed: 30,
    modalBackdrop: 40,
    modal: 50,
    popover: 60,
    toast: 70,
    tooltip: 80,
  },
} as const;
