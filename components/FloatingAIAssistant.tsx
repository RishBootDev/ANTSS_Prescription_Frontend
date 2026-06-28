"use client"

import React, { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Mic, MicOff, X, Activity, ScanLine, ListTree, Hash } from "lucide-react"
import AvatarSpline from "./AvatarSpline"
import { VoiceContext } from "@/hooks/useConsultationVoice"

type AssistantStage = "idle" | "listening" | "transcribing" | "understanding" | "updating"

type FloatingAIAssistantProps = {
  assistantStage: AssistantStage
  activeVoiceContext: VoiceContext | null
  extractedPreview: any | null
  transcript: string
  error: string | null
  isSupported: boolean
  isListening: boolean
  isProcessing: boolean
  isSpeaking: boolean

  onStartListening: () => void
  onStopListening: () => void
  onClose?: () => void
}

export default function FloatingAIAssistant({
  assistantStage,
  activeVoiceContext,
  extractedPreview,
  transcript,
  error,
  isSupported,
  isListening,
  isProcessing,
  isSpeaking,
  onStartListening,
  onStopListening,
}: FloatingAIAssistantProps) {
  const [open, setOpen] = useState(false)

  // Map the new assistant stages to the old visual states
  const effectiveState = useMemo(() => {
    if (isSpeaking) return "speaking"
    if (assistantStage === "listening" || assistantStage === "transcribing") return "listening"
    if (assistantStage === "understanding" || assistantStage === "updating") return "thinking"
    return "idle"
  }, [assistantStage, isSpeaking])

  // Simple pseudo-random oscillation based on time for audio level
  const audioLevel = useMemo(() => {
    if (effectiveState !== "speaking") return 0
    const t = Date.now() / 200
    return Math.abs(Math.sin(t)) * 0.9
  }, [effectiveState])

  const statusText = useMemo(() => {
    if (assistantStage === "listening") return "Listening..."
    if (assistantStage === "transcribing") return "Transcribing..."
    if (assistantStage === "understanding") return "Understanding..."
    if (assistantStage === "updating") return "Updating Form..."
    if (isSpeaking) return "Speaking..."
    return "Idle"
  }, [assistantStage, isSpeaking])

  const statusSubtext = useMemo(() => {
    if (assistantStage === "idle") return "Ready to assist"
    if (assistantStage === "listening") return "Speak naturally"
    if (assistantStage === "transcribing") return "Converting speech to text"
    if (assistantStage === "understanding") return "Extracting medical data"
    if (assistantStage === "updating") return "Applying changes"
    if (isSpeaking) return "Responding to you"
    return ""
  }, [assistantStage, isSpeaking])

  const startStopLabel = isListening ? "Stop" : "Start"

  // Avatar glow effects based on state
  const getAvatarGlow = () => {
    if (effectiveState === "listening") {
      return "0 0 60px rgba(179,13,13,0.4), 0 0 120px rgba(179,13,13,0.2), 0 0 180px rgba(179,13,13,0.1)"
    }
    if (effectiveState === "thinking") {
      return "0 0 40px rgba(99,102,241,0.3), 0 0 80px rgba(99,102,241,0.15), 0 0 120px rgba(99,102,241,0.08)"
    }
    if (effectiveState === "speaking") {
      return "0 0 50px rgba(16,185,129,0.35), 0 0 100px rgba(16,185,129,0.2), 0 0 150px rgba(16,185,129,0.1)"
    }
    return "0 0 30px rgba(179,13,13,0.15), 0 0 60px rgba(179,13,13,0.08)"
  }

  const getStatusColor = () => {
    if (effectiveState === "listening") return "#b30d0d"
    if (effectiveState === "thinking") return "#6366f1"
    if (effectiveState === "speaking") return "#10b981"
    return "#6b6b6b"
  }

  // Format the current active context into a readable string
  const renderContextBanner = () => {
    if (!activeVoiceContext || activeVoiceContext.mode === "GLOBAL") {
      return (
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 bg-slate-100/50 px-2.5 py-1 rounded-full border border-slate-200">
          <ScanLine className="h-3 w-3" />
          Global Mode
        </div>
      )
    }
    if (activeVoiceContext.mode === "COMPONENT") {
      return (
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
          <ListTree className="h-3 w-3" />
          Component: {activeVoiceContext.component}
        </div>
      )
    }
    return (
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
        <Hash className="h-3 w-3" />
        Field: {activeVoiceContext.field}
      </div>
    )
  }

  return (
    <>
      {/* Collapsed State - Premium Floating Avatar Bubble */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          type="button"
          aria-label="Open AI assistant"
          onClick={() => setOpen(true)}
          className="relative flex h-20 w-20 items-center justify-center rounded-full backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden"
          style={{
            background: "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(248,250,252,0.9))",
            border: "1px solid rgba(255,255,255,0.8)",
            boxShadow: getAvatarGlow(),
          }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
        >
          {/* Animated background gradient */}
          <motion.div
            className="absolute inset-0"
            animate={
              effectiveState === "listening"
                ? {
                    background: [
                      "radial-gradient(circle at 50% 50%, rgba(179,13,13,0.15), transparent 70%)",
                      "radial-gradient(circle at 50% 50%, rgba(179,13,13,0.25), transparent 70%)",
                      "radial-gradient(circle at 50% 50%, rgba(179,13,13,0.15), transparent 70%)",
                    ],
                  }
                : effectiveState === "speaking"
                ? {
                    background: [
                      "radial-gradient(circle at 50% 50%, rgba(16,185,129,0.15), transparent 70%)",
                      "radial-gradient(circle at 50% 50%, rgba(16,185,129,0.25), transparent 70%)",
                      "radial-gradient(circle at 50% 50%, rgba(16,185,129,0.15), transparent 70%)",
                    ],
                  }
                : {}
            }
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Pulse ring for listening state */}
          {effectiveState === "listening" && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                border: "2px solid rgba(179,13,13,0.3)",
              }}
              animate={{
                scale: [1, 1.18, 1],
                opacity: [0.9, 0.35, 0.9],
              }}
              transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
            />
          )}

          {/* 3D Avatar - Main Focus */}
          <div className="relative h-full w-full flex items-center justify-center p-2 pointer-events-none">
            <div style={{ width: "84%", height: "84%", borderRadius: "50%", overflow: "hidden" }}>
              <AvatarSpline url="https://prod.spline.design/zESg9RgYAoqmVo4g/scene.splinecode" state={effectiveState} audioLevel={audioLevel} />
            </div>
          </div>

          {/* Status indicator dot */}
          <motion.div
            className="absolute bottom-1 right-1 pointer-events-none"
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: getStatusColor(),
              border: "2px solid white",
            }}
            animate={
              effectiveState === "listening" || effectiveState === "speaking"
                ? { scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }
                : {}
            }
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.button>
      </div>

      {/* Expanded State - Premium AI Panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/10 backdrop-blur-sm z-50"
              onClick={() => setOpen(false)}
            />

            {/* Main Panel */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="fixed bottom-6 right-6 z-50 flex flex-col pointer-events-none"
              style={{ width: 420 }}
            >
              <div
                className="rounded-[2rem] backdrop-blur-2xl overflow-hidden shadow-[0_40px_160px_rgba(0,0,0,0.2)] flex flex-col pointer-events-auto border border-white/70"
                style={{
                  background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.94) 100%)",
                  maxHeight: "calc(100vh - 48px)"
                }}
              >
                {/* Large Avatar Section - PRIMARY VISUAL FOCUS */}
                <div
                  className="relative flex flex-col items-center justify-center shrink-0"
                  style={{
                    minHeight: "280px",
                    paddingTop: 20,
                    background: effectiveState === "listening"
                      ? "linear-gradient(180deg, rgba(179,13,13,0.06) 0%, rgba(255,255,255,0) 100%)"
                      : effectiveState === "thinking"
                        ? "linear-gradient(180deg, rgba(99,102,241,0.04) 0%, rgba(255,255,255,0) 100%)"
                        : effectiveState === "speaking"
                          ? "linear-gradient(180deg, rgba(16,185,129,0.04) 0%, rgba(255,255,255,0) 100%)"
                          : "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(248,250,252,0.4) 100%)",
                    borderBottom: "1px solid rgba(255,255,255,0.6)",
                    boxShadow: "inset 0 -30px 60px rgba(0,0,0,0.03)",
                  }}
                >
                  {/* Context Banner */}
                  <div className="absolute top-4 left-4 z-20">
                    {renderContextBanner()}
                  </div>

                  {/* Close button */}
                  <motion.button
                    type="button"
                    className="absolute top-4 right-4 z-20 h-8 w-8 rounded-full flex items-center justify-center transition"
                    style={{
                      background: "rgba(255,255,255,0.8)",
                      border: "1px solid rgba(0,0,0,0.05)",
                      backdropFilter: "blur(10px)",
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setOpen(false)}
                    aria-label="Close assistant"
                  >
                    <X className="h-4 w-4 text-[#2b1111]" />
                  </motion.button>

                  {/* Main 3D Avatar */}
                  <motion.div
                    className="relative z-10 flex items-center justify-center mx-auto pointer-events-none"
                    style={{
                      width: 200,
                      height: 200,
                      borderRadius: "50%",
                      boxShadow: getAvatarGlow(),
                      background: "linear-gradient(180deg, rgba(255,255,255,0.76), rgba(255,255,255,0.5))",
                      border: "1px solid rgba(255,255,255,0.6)",
                      overflow: "hidden",
                    }}
                    animate={
                      effectiveState === "idle"
                        ? { y: [0, -8, 0] }
                        : effectiveState === "listening"
                          ? { scale: [1, 1.04, 1] }
                          : effectiveState === "speaking"
                            ? { y: [0, -6, 0, -6, 0] }
                            : {}
                    }
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <AvatarSpline url="https://prod.spline.design/zESg9RgYAoqmVo4g/scene.splinecode" state={effectiveState} audioLevel={audioLevel} />
                  </motion.div>

                  {/* Status text below avatar */}
                  <div className="mt-4 flex flex-col items-center z-10 pb-4">
                    <motion.div
                      className="text-lg font-semibold text-[#2b1111] tracking-tight"
                      key={statusText}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {statusText}
                    </motion.div>
                    <div className="text-sm text-[#6b6b6b] mt-0.5">{statusSubtext}</div>

                    {/* Stage Progress Bar Indicator */}
                    <div className="flex gap-1.5 mt-3">
                      {(["idle", "listening", "transcribing", "understanding", "updating"] as AssistantStage[]).map((stage, idx) => {
                        const stages = ["idle", "listening", "transcribing", "understanding", "updating"]
                        const currentIndex = stages.indexOf(assistantStage)
                        const isActive = idx <= currentIndex && assistantStage !== "idle"
                        
                        return (
                          <div 
                            key={stage}
                            className={`h-1.5 rounded-full transition-all duration-500 ${isActive ? 'bg-indigo-500' : 'bg-slate-200'}`}
                            style={{ width: isActive ? 24 : 12 }}
                          />
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Content Section (Scrollable) */}
                <div className="px-5 py-5 space-y-4 overflow-y-auto shrink" style={{ maxHeight: "40vh" }}>
                  {/* Live Transcript */}
                  <div
                    className="rounded-2xl p-4 shadow-sm"
                    style={{
                      background: "rgba(255,255,255,0.6)",
                      border: "1px solid rgba(255,255,255,0.8)",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider flex items-center justify-between">
                      <span>Live Transcript</span>
                      {assistantStage === "listening" && (
                        <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                      )}
                    </div>
                    <div
                      className="text-sm leading-relaxed text-slate-700 min-h-[40px]"
                      aria-live="polite"
                    >
                      {transcript?.trim() ? (
                        <span className="whitespace-pre-wrap">{transcript}</span>
                      ) : (
                        <span className="text-slate-400 italic">Listening for speech...</span>
                      )}
                    </div>
                  </div>

                  {/* Extracted Preview (Only show when understanding or updating) */}
                  <AnimatePresence>
                    {(assistantStage === "understanding" || assistantStage === "updating" || extractedPreview) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="rounded-2xl p-4 shadow-sm overflow-hidden"
                        style={{
                          background: "rgba(99,102,241,0.04)",
                          border: "1px solid rgba(99,102,241,0.15)",
                        }}
                      >
                        <div className="text-[10px] font-bold text-indigo-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                          <Activity className="h-3 w-3" />
                          Structured Output
                        </div>
                        {extractedPreview ? (
                          <pre className="text-[10px] sm:text-xs text-indigo-900 bg-white/50 p-2 rounded-lg border border-indigo-100 overflow-x-auto">
                            {JSON.stringify(extractedPreview, null, 2)}
                          </pre>
                        ) : (
                          <div className="flex items-center gap-2 text-xs text-indigo-500/70 py-2">
                            <span className="inline-block w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                            Analyzing semantics...
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Error message */}
                  {error && (
                    <div
                      className="rounded-xl p-3 text-sm shadow-sm"
                      style={{
                        background: "rgba(179,13,13,0.08)",
                        border: "1px solid rgba(179,13,13,0.15)",
                        color: "#b30d0d",
                      }}
                    >
                      {error}
                    </div>
                  )}
                </div>

                {/* Footer Controls (Fixed) */}
                <div className="p-5 border-t border-slate-100 bg-white/50 backdrop-blur-md shrink-0">
                  <div className="flex items-center justify-between gap-3">
                    {/* Status info */}
                    <div className="text-xs font-medium text-slate-500">
                      {!isSupported ? (
                        <span className="text-red-500">
                          SpeechRecognition not supported
                        </span>
                      ) : isProcessing ? (
                        <span className="text-indigo-600">AI is processing...</span>
                      ) : isListening ? (
                        <span className="flex items-center gap-2 text-red-600">
                          <span
                            className="inline-block rounded-full w-1.5 h-1.5 bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)]"
                            style={{ animation: "pulse 1.5s ease-in-out infinite" }}
                          />
                          Listening active
                        </span>
                      ) : (
                        <span>Ready to assist</span>
                      )}
                    </div>

                    {/* Voice control button */}
                    <motion.button
                      type="button"
                      onClick={() => {
                        if (isListening) onStopListening()
                        else onStartListening()
                      }}
                      className="relative inline-flex items-center gap-2.5 rounded-xl px-5 py-2.5 font-semibold text-sm shadow-lg transition disabled:opacity-50"
                      style={{
                        background: isListening
                          ? "linear-gradient(135deg, #b30d0d, #dc2626)"
                          : "linear-gradient(135deg, #0f172a, #334155)",
                        color: "white",
                        boxShadow: isListening ? "0 8px 25px rgba(179,13,13,0.3)" : "0 8px 20px rgba(15,23,42,0.15)",
                      }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      disabled={!isSupported || (isProcessing && !isListening)}
                    >
                      {/* Ripple effect when listening */}
                      {isListening && (
                        <motion.div
                          className="absolute inset-0 rounded-xl pointer-events-none"
                          style={{ border: "2px solid rgba(255,255,255,0.5)" }}
                          animate={{
                            scale: [1, 1.4, 1],
                            opacity: [0.6, 0, 0.6],
                          }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                        />
                      )}

                      {isListening ? (
                        <MicOff className="h-4 w-4" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                      <span>{startStopLabel}</span>
                    </motion.button>
                  </div>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}