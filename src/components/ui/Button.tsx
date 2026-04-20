"use client";

import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  // Base styles — accessibility & focus management
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-semibold transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
    "active:scale-[0.98] touch-manipulation",
    "select-none",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-amber-500 hover:bg-amber-600 text-slate-900",
          "shadow-md hover:shadow-lg",
          "ring-1 ring-amber-600/20",
        ],
        secondary: [
          "bg-slate-900 dark:bg-white text-white dark:text-slate-900",
          "hover:bg-slate-800 dark:hover:bg-slate-100",
          "shadow-md",
        ],
        outline: [
          "border-2 border-slate-300 dark:border-slate-700",
          "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800",
          "text-slate-900 dark:text-slate-100",
        ],
        ghost: [
          "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800",
          "text-slate-700 dark:text-slate-300",
        ],
        danger: [
          "bg-red-600 hover:bg-red-700 text-white",
          "shadow-md hover:shadow-lg",
        ],
        link: [
          "bg-transparent text-amber-600 dark:text-amber-400",
          "hover:underline underline-offset-4",
          "p-0 h-auto",
        ],
      },
      size: {
        xs: "h-8 px-3 text-xs rounded-md",
        sm: "h-9 px-4 text-sm rounded-lg",
        md: "h-11 px-5 text-sm rounded-xl",   // Default — 44px tap target
        lg: "h-12 px-6 text-base rounded-xl",
        xl: "h-14 px-8 text-lg rounded-2xl",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : leftIcon}
        <span>{children}</span>
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";
