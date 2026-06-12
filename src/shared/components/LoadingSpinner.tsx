import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
}

export function LoadingSpinner({
  className,
  size = "md",
  label = "Loading...",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center p-6 gap-3", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-t-transparent border-primary",
          sizeClasses[size]
        )}
      />
      {label && <p className="text-xs font-semibold text-muted-foreground">{label}</p>}
    </div>
  );
}
