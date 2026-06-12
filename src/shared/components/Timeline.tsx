import React from "react";
import { cn } from "@/lib/utils";

export interface TimelineEvent {
  id: string | number;
  title: string;
  description?: string;
  date: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  content?: React.ReactNode;
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export function Timeline({ events, className }: TimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No records to display on timeline.
      </div>
    );
  }

  return (
    <div className={cn("relative border-l border-border/80 pl-6 ml-3 space-y-8", className)}>
      {events.map((event, index) => (
        <div key={event.id || index} className="relative group">
          {/* Visual Dot/Icon */}
          <span className="absolute -left-[35px] top-1 flex items-center justify-center w-[18px] h-[18px] rounded-full bg-background border-2 border-primary group-hover:bg-primary transition-all duration-300">
            {event.icon ? (
              <span className="text-[10px] text-primary group-hover:text-primary-foreground">
                {event.icon}
              </span>
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-primary group-hover:bg-primary-foreground" />
            )}
          </span>

          {/* Event Card */}
          <div className="bg-card border border-border/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div>
                <h4 className="font-semibold text-sm text-foreground">{event.title}</h4>
                <span className="text-xs text-muted-foreground">{event.date}</span>
              </div>
              {event.badge && <div className="text-xs">{event.badge}</div>}
            </div>

            {event.description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {event.description}
              </p>
            )}

            {event.content && <div className="mt-3 text-xs">{event.content}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
