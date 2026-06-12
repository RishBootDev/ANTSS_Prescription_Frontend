import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  description?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function DashboardCard({
  title,
  description,
  headerAction,
  children,
  className,
}: DashboardCardProps) {
  return (
    <Card className={cn("overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-all duration-300", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-base font-bold text-foreground">{title}</CardTitle>
          {description && <CardDescription className="text-xs">{description}</CardDescription>}
        </div>
        {headerAction && <div className="flex-shrink-0">{headerAction}</div>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
