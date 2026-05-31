"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, MicOff, Loader2, AlertCircle, Activity } from "lucide-react"
import { cn } from "@/lib/utils"

interface VoiceControlProps {
  isListening: boolean
  isProcessing: boolean
  isSupported: boolean
  transcript: string
  error: string | null
  onStartListening: () => void
  onStopListening: () => void
}

export function VoiceControl({
  isListening,
  isProcessing,
  isSupported,
  transcript,
  error,
  onStartListening,
  onStopListening,
}: VoiceControlProps) {
  if (!isSupported) {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="flex items-center gap-3 p-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-sm text-destructive">
            Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-primary/20 bg-card shadow-md">
      <CardContent className="p-2">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          {/* Microphone Button */}
          <div className="flex flex-col items-center gap-2">
            <Button
              size="lg"
              variant={isListening ? "destructive" : "default"}
              className={cn(
                "h-16 w-16 rounded-full transition-all duration-300",
                isListening && "animate-pulse shadow-lg shadow-destructive/30",
                isProcessing && "opacity-50 cursor-not-allowed"
              )}
              onClick={isListening ? onStopListening : onStartListening}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-7 w-7 animate-spin" />
              ) : isListening ? (
                <MicOff className="h-7 w-7" />
              ) : (
                <Mic className="h-7 w-7" />
              )}
            </Button>
            <span className="text-xs font-medium text-muted-foreground">
              {isProcessing
                ? "AI responding..."
                : isListening
                  ? "Listening..."
                  : "Click to start"}
            </span>
          </div>

          {/* Status and Transcript */}
          <div className="flex-1 text-center sm:text-left">
            <div className="mb-2 flex items-center justify-center gap-2 sm:justify-start">
              {isListening && !isProcessing && (
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-primary"></span>
                </span>
              )}
              {isProcessing && (
                <Activity className="h-4 w-4 text-primary animate-pulse" />
              )}
              <h3 className="text-lg font-semibold">
                {isProcessing
                  ? "AI is responding..."
                  : isListening
                    ? "Listening..."
                    : "Voice Input Ready"}
              </h3>
            </div>

            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : transcript ? (
              <div className={cn(
                "rounded-lg p-3 transition-all duration-300",
                isProcessing ? "bg-primary/10" : "bg-muted/50"
              )}>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Heard: </span>
                  {transcript}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Start speaking patient information like: "Patient
                name is John Smith, age 45, male, weight 75 kg, blood pressure
                120 over 80, pulse 72"
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
