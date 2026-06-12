import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatisticsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  variant?: "default" | "success" | "danger" | "warning" | "info";
  className?: string;
}

export function StatisticsCard({
  title,
  value,
  description,
  icon,
  variant = "default",
  className,
}: StatisticsCardProps) {
  const variantStyles = {
    default: "border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 text-primary",
    success: "border-green-500/20 bg-gradient-to-br from-green-500/5 to-green-500/10 text-green-700",
    danger: "border-red-500/20 bg-gradient-to-br from-red-500/5 to-red-500/10 text-red-700",
    warning: "border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-amber-500/10 text-amber-700",
    info: "border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-blue-500/10 text-blue-700",
  };

  const textColors = {
    default: "text-primary",
    success: "text-green-700",
    danger: "text-red-700",
    warning: "text-amber-700",
    info: "text-blue-700",
  };

  return (
    <Card className={cn("overflow-hidden border transition-all duration-300 hover:shadow-md", variantStyles[variant], className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-extrabold tracking-tight", textColors[variant])}>
          {value}
        </div>
        {description && (
          <p className="text-[11px] text-muted-foreground mt-1 font-medium">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
