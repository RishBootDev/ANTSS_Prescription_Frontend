"use client"

import React, { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Mic, MicOff, X } from "lucide-react"
import type { CSSProperties } from "react"
import SplineViewerWithErrorHandling from "./SplineViewerWithErrorHandling"
import AvatarSpline from "./AvatarSpline"
import useAssistantStateMachine from "../hooks/useAssistantStateMachine"
import MessageBubble from "./MessageBubble"
import LiveTranscript from "./LiveTranscript"

type AssistantState = "idle" | "listening" | "thinking" | "speaking"

type FloatingAIAssistantProps = {
  state: AssistantState
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
  state,
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

  const { state: derivedState } = useAssistantStateMachine({ isListening, isProcessing: isProcessing, isSpeaking })
  // prefer external state prop if provided, otherwise use derived state
  const effectiveState = state || derivedState

  // Transcript entries for live transcript component
  const [entries, setEntries] = useState<{ id: string; speaker: "user" | "ai"; text: string }[]>([])

  useEffect(() => {
    // if transcript changes, add as user speech entry
    if (transcript && transcript.trim()) {
      setEntries((s) => {
        const last = s[s.length - 1]
        if (last && last.text === transcript) return s
        return [...s, { id: String(Date.now()), speaker: "user", text: transcript }]
      })
    }
  }, [transcript])

  // Simulated AI response entry when isProcessing changes to false and isSpeaking true could be wired by parent.
  // For demonstration, we won't auto-add AI entries here.

  // audioLevel simulation when speaking (if not provided externally) — use simple oscillation
  const audioLevel = useMemo(() => {
    if (effectiveState !== "speaking") return 0
    // simple pseudo-random oscillation based on time
    const t = Date.now() / 200
    return Math.abs(Math.sin(t)) * 0.9
  }, [effectiveState])

  const statusText = useMemo(() => {
    if (state === "speaking") return "Speaking..."
    if (state === "thinking") return "Thinking..."
    if (state === "listening") return "Listening..."
    return "Idle"
  }, [state])

  const statusSubtext = useMemo(() => {
    if (state === "idle") return "Ready to assist"
    if (state === "listening") return "Capture your words"
    if (state === "thinking") return "Processing information"
    if (state === "speaking") return "Responding to you"
    return ""
  }, [state])

  const startStopLabel = isListening ? "Stop" : "Start"

  const accent = "#b30d0d"

  // Avatar glow effects based on state
  const getAvatarGlow = () => {
    if (state === "listening") {
      return "0 0 60px rgba(179,13,13,0.4), 0 0 120px rgba(179,13,13,0.2), 0 0 180px rgba(179,13,13,0.1)"
    }
    if (state === "thinking") {
      return "0 0 40px rgba(99,102,241,0.3), 0 0 80px rgba(99,102,241,0.15), 0 0 120px rgba(99,102,241,0.08)"
    }
    if (state === "speaking") {
      return "0 0 50px rgba(16,185,129,0.35), 0 0 100px rgba(16,185,129,0.2), 0 0 150px rgba(16,185,129,0.1)"
    }
    return "0 0 30px rgba(179,13,13,0.15), 0 0 60px rgba(179,13,13,0.08)"
  }

  const getStatusColor = () => {
    if (state === "listening") return "#b30d0d"
    if (state === "thinking") return "#6366f1"
    if (state === "speaking") return "#10b981"
    return "#6b6b6b"
  }

  return (
    <>
      {/* Collapsed State - Premium Floating Avatar Bubble */}
      <div className="fixed bottom-6 right-6 z-60">
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
          <div className="relative h-full w-full flex items-center justify-center p-2">
            <div style={{ width: "84%", height: "84%", borderRadius: "50%", overflow: "hidden" }}>
              <AvatarSpline url="https://prod.spline.design/zESg9RgYAoqmVo4g/scene.splinecode" state={effectiveState} audioLevel={audioLevel} />
            </div>
          </div>

          {/* Status indicator dot */}
          <motion.div
            className="absolute bottom-1 right-1"
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
              className="fixed inset-0 bg-black/10 backdrop-blur-sm z-59"
              onClick={() => setOpen(false)}
            />

            {/* Main Panel */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="fixed bottom-6 right-6 z-60"
              style={{ width: 400, minWidth: 380, maxWidth: 420 }}
            >
        <div
          className="rounded-4xl backdrop-blur-2xl overflow-hidden shadow-[0_40px_160px_rgba(0,0,0,0.2)]"
                style={{
                    background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.94) 100%)",
                    border: "1px solid rgba(255,255,255,0.72)",
                }}
              >
                {/* Large Avatar Section - PRIMARY VISUAL FOCUS */}
                <div
                  className="relative flex items-center justify-center"
                  style={{
                    minHeight: "260px",
                    paddingTop: 12,
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
                  {/* Close button */}
                  <motion.button
                    type="button"
                    className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full flex items-center justify-center transition"
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

                  {/* Ambient glow behind avatar */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={
                      state === "listening"
                        ? {
                            background: [
                              "radial-gradient(ellipse at 50% 40%, rgba(179,13,13,0.12) 0%, transparent 60%)",
                              "radial-gradient(ellipse at 50% 40%, rgba(179,13,13,0.2) 0%, transparent 60%)",
                              "radial-gradient(ellipse at 50% 40%, rgba(179,13,13,0.12) 0%, transparent 60%)",
                            ],
                          }
                        : state === "speaking"
                          ? {
                              background: [
                                "radial-gradient(ellipse at 50% 40%, rgba(16,185,129,0.1) 0%, transparent 60%)",
                                "radial-gradient(ellipse at 50% 40%, rgba(16,185,129,0.18) 0%, transparent 60%)",
                                "radial-gradient(ellipse at 50% 40%, rgba(16,185,129,0.1) 0%, transparent 60%)",
                              ],
                            }
                          : {}
                    }
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />

                  {/* Main 3D Avatar */}
                  <motion.div
                    className="relative z-10 flex items-center justify-center mx-auto"
                    style={{
                      width: 260,
                      height: 260,
                      borderRadius: "50%",
                      boxShadow: getAvatarGlow(),
                      background: "linear-gradient(180deg, rgba(255,255,255,0.76), rgba(255,255,255,0.5))",
                      border: "1px solid rgba(255,255,255,0.6)",
                      overflow: "hidden",
                    }}
                    animate={
                      effectiveState === "idle"
                        ? {
                            y: [0, -8, 0],
                          }
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
                    <AvatarSpline url="https://prod.spline.design/zESg9RgYAoqmVo4g/scene.splinecode" />

                    {/* Waveform overlay while speaking */}
                    {state === "speaking" && (
                      <div
                        aria-hidden
                        className="absolute left-0 right-0 bottom-2 flex items-end justify-center gap-1"
                        style={{ padding: 8, pointerEvents: "none" }}
                      >
                        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                          <motion.span
                            key={i}
                            style={{
                              width: 6,
                              height: 6 + i * 6,
                              background: getStatusColor(),
                              borderRadius: 4,
                              opacity: 0.95,
                            }}
                            animate={{
                              height: [6 + i * 4, 6 + i * 10, 6 + i * 4],
                              opacity: [0.6, 1, 0.6],
                            }}
                            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.08, ease: "easeInOut" }}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>

                  {/* Status text below avatar */}
                  <motion.div
                    className="absolute bottom-6 left-0 right-0 text-center z-10"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <motion.div
                      className="text-lg font-semibold text-[#2b1111] tracking-tight"
                      key={statusText}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {statusText}
                    </motion.div>
                    <div className="text-sm text-[#6b6b6b] mt-1">{statusSubtext}</div>

                    {/* Animated dots for listening/speaking */}
                    {(state === "listening" || state === "speaking") && (
                      <div className="flex items-center justify-center gap-1.5 mt-3">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <motion.div
                            key={i}
                            style={{
                              width: 4,
                              height: 16,
                              borderRadius: 2,
                              background: getStatusColor(),
                            }}
                            animate={{
                              scaleY: [0.4, 1, 0.4],
                            }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              delay: i * 0.1,
                              ease: "easeInOut",
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Content Section */}
                <div className="px-5 pb-5 space-y-4">
                  {/* Live Transcript */}
                  <div
                    className="rounded-2xl p-4"
                    style={{
                      background: "rgba(255,255,255,0.6)",
                      border: "1px solid rgba(255,255,255,0.8)",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <div className="text-[11px] font-medium text-[#6b6b6b] mb-2 uppercase tracking-wide">
                      Live Transcript
                    </div>
                    <div
                      className="text-sm leading-relaxed text-[#2b1111] min-h-15 max-h-30 overflow-auto"
                      aria-live="polite"
                    >
                      {transcript?.trim() ? (
                        <span className="whitespace-pre-wrap">{transcript}</span>
                      ) : (
                        <span className="text-[#a0a0a0] italic">No speech detected yet...</span>
                      )}
                    </div>
                  </div>

                  {/* Error message */}
                  {error && (
                    <div
                      className="rounded-xl p-3 text-sm"
                      style={{
                        background: "rgba(179,13,13,0.08)",
                        border: "1px solid rgba(179,13,13,0.15)",
                        color: "#b30d0d",
                      }}
                    >
                      {error}
                    </div>
                  )}

                  {/* Controls */}
                  <div className="flex items-center justify-between gap-3">
                    {/* Status info */}
                    <div className="text-sm text-[#6b6b6b]">
                      {!isSupported ? (
                        <span className="text-[#b30d0d] font-medium">
                          SpeechRecognition not supported
                        </span>
                      ) : isProcessing ? (
                        <span>AI is processing...</span>
                      ) : isListening ? (
                        <span className="flex items-center gap-2">
                          <span
                            className="inline-block rounded-full"
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: "#b30d0d",
                              animation: "pulse 1.5s ease-in-out infinite",
                            }}
                          />
                          Listening
                        </span>
                      ) : isSpeaking ? (
                        <span className="flex items-center gap-2">
                          <span
                            className="inline-block rounded-full"
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: "#10b981",
                              animation: "pulse 1.5s ease-in-out infinite",
                            }}
                          />
                          Speaking
                        </span>
                      ) : (
                        <span>Ready to listen</span>
                      )}
                    </div>

                    {/* Voice control button */}
                    <motion.button
                      type="button"
                      onClick={() => {
                        if (isListening) onStopListening()
                        else onStartListening()
                      }}
                      className="relative inline-flex items-center gap-2.5 rounded-2xl px-5 py-3 font-semibold text-sm shadow-lg transition"
                      style={{
                        background: isListening
                          ? "linear-gradient(135deg, #b30d0d, #dc2626)"
                          : "linear-gradient(135deg, #b30d0d, #dc2626)",
                        color: "white",
                        boxShadow: "0 8px 30px rgba(179,13,13,0.3)",
                      }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      disabled={!isSupported || isProcessing}
                    >
                      {/* Ripple effect when listening */}
                      {isListening && (
                        <motion.div
                          className="absolute inset-0 rounded-2xl"
                          style={{
                            border: "2px solid rgba(255,255,255,0.5)",
                          }}
                          animate={{
                            scale: [1, 1.4, 1],
                            opacity: [0.6, 0, 0.6],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeOut",
                          }}
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

                  {/* Tip */}
                  <div
                    className="rounded-xl p-3 text-xs"
                    style={{
                      background: "rgba(99,102,241,0.05)",
                      border: "1px solid rgba(99,102,241,0.1)",
                      color: "#6b6b6b",
                    }}
                  >
                    💡 Tip: Say patient details clearly. Example: "Name is John Smith, age 45, male..."
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