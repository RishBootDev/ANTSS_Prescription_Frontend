"use client"

import { useMemo } from "react"

export type AssistantState = "idle" | "listening" | "thinking" | "speaking"

type UseAssistantStateMachineArgs = {
  isListening: boolean
  isProcessing: boolean
  isSpeaking: boolean
}

export default function useAssistantStateMachine({ isListening, isProcessing, isSpeaking }: UseAssistantStateMachineArgs) {
  const state = useMemo<AssistantState>(() => {
    if (isSpeaking) return "speaking"
    if (isProcessing) return "thinking"
    if (isListening) return "listening"
    return "idle"
  }, [isListening, isProcessing, isSpeaking])

  return { state }
}
