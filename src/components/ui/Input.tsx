"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils/cn";
import { AlertCircle, Check } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  success?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      label,
      hint,
      error,
      success,
      leftIcon,
      rightIcon,
      id: providedId,
      type = "text",
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId ?? generatedId;
    const hintId = `${id}-hint`;
    const errorId = `${id}-error`;
    
    const ariaDescribedBy = [
      hint && hintId,
      error && errorId,
    ].filter(Boolean).join(" ");

    return (
      <div className={cn("w-full", containerClassName)}>
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
          >
            {label}
            {props.required && (
              <span className="text-red-500 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={id}
            type={type}
            aria-invalid={!!error}
            aria-describedby={ariaDescribedBy || undefined}
            className={cn(
              // Base
              "w-full h-11 rounded-xl border bg-white dark:bg-slate-800",
              "text-base text-slate-900 dark:text-white",
              "placeholder:text-slate-400",
              "transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-offset-1",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              // Padding
              leftIcon ? "pl-10" : "pl-4",
              rightIcon ? "pr-10" : "pr-4",
              // States
              error
                ? "border-red-400 focus:border-red-500 focus:ring-red-500/30"
                : success
                ? "border-green-400 focus:border-green-500 focus:ring-green-500/30"
                : "border-slate-300 dark:border-slate-700 focus:border-amber-500 focus:ring-amber-500/30",
              className
            )}
            {...props}
          />
          
          {rightIcon && !error && !success && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {rightIcon}
            </div>
          )}
          
          {error && (
            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
          )}
          
          {success && (
            <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
          )}
        </div>
        
        {hint && !error && (
          <p id={hintId} className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            {hint}
          </p>
        )}
        
        {error && (
          <p
            id={errorId}
            role="alert"
            className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1"
          >
            <AlertCircle className="h-3 w-3 flex-shrink-0" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
