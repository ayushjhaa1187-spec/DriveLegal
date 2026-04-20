import { cn } from "@/lib/utils/cn";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "rectangular" | "circular";
}

export function Skeleton({ className, variant = "rectangular", ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-slate-200 dark:bg-slate-800",
        {
          "h-4 rounded": variant === "text",
          "rounded-xl": variant === "rectangular",
          "rounded-full": variant === "circular",
        },
        className
      )}
      {...props}
    />
  );
}

// Calculator result skeleton
export function CalculatorResultSkeleton() {
  return (
    <div className="space-y-4">
      <div className="p-6 border-2 border-amber-200 dark:border-amber-900 rounded-2xl">
        <Skeleton variant="text" className="w-24 mb-2" />
        <Skeleton className="h-12 w-40 mb-3" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-11" />
        <Skeleton className="h-11" />
      </div>
    </div>
  );
}
