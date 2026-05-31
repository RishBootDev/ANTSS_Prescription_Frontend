"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

type VoiceMicFieldProps = {
  isListening: boolean
  isProcessing: boolean
  isActive: boolean
  onMicToggle: () => void
  /**
   * Wrap a single Input/Textarea element.
   * The component will add right padding to make room for the mic button.
   * NOTE: We render children directly without cloneElement to preserve refs.
   * The parent should add pr-9 class to the child if needed.
   */
  children: React.ReactElement<{ className?: string }>
}

export function VoiceMicField({
  isListening,
  isProcessing,
  isActive,
  onMicToggle,
  children,
}: VoiceMicFieldProps) {
  const icon = isProcessing ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : isListening && isActive ? (
    <MicOff className="h-4 w-4" />
  ) : (
    <Mic className="h-4 w-4" />
  )

  return (
    <div className="relative w-full">
      {children}

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onMicToggle}
        disabled={isProcessing}
        className={cn(
          "absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0",
          isListening && isActive ? "text-destructive" : "text-muted-foreground hover:text-accent-foreground"
        )}
        aria-label={isListening && isActive ? "Stop voice input" : "Start voice input"}
      >
        {icon}
      </Button>
    </div>
  )
}
