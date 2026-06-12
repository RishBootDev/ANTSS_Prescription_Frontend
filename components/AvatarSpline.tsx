"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import SplineViewerWithErrorHandling from "./SplineViewerWithErrorHandling"

type AvatarSplineProps = {
  url: string
  style?: React.CSSProperties
  className?: string
  ariaLabel?: string
  state?: "idle" | "listening" | "thinking" | "speaking"
  /** audioLevel: 0..1 value to drive lip-sync (optional). If not provided we simulate mouth movement while speaking. */
  audioLevel?: number
}

export default function AvatarSpline({ url, style, className, ariaLabel, state = "idle", audioLevel = 0 }: AvatarSplineProps) {
  const mouthRef = useRef<HTMLDivElement | null>(null)

  // Smooth the audio level for nicer animation
  const smoothedLevel = useMemo(() => {
    // simple easing transform
    return Math.min(1, Math.max(0, audioLevel))
  }, [audioLevel])

  useEffect(() => {
    const el = mouthRef.current
    if (!el) return
    if (state === "speaking") {
      // animate mouth scale based on smoothedLevel
      el.style.transform = `translateY(0px) scaleY(${0.6 + smoothedLevel * 0.9})`
      el.style.opacity = `${0.85}`
    } else if (state === "listening") {
      el.style.transform = `translateY(0px) scaleY(${0.9})`
      el.style.opacity = `0.6`
    } else {
      el.style.transform = `translateY(0px) scaleY(0.9)`
      el.style.opacity = `0.55`
    }
  }, [smoothedLevel, state])

  return (
    <div
      className={className}
      style={{ width: "100%", height: "100%", display: "block", pointerEvents: "none", position: "relative", ...style }}
      aria-hidden={!ariaLabel}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
    >
      {/* Spline viewer: transparent background with robust error handling */}
      <div style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}>
        <SplineViewerWithErrorHandling
          url={url}
          style={{ width: "100%", height: "100%", background: "transparent" }}
          fallback={
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-rose-50 to-red-100 dark:from-zinc-950 dark:to-zinc-900 rounded-full border border-red-200/50">
              <motion.div
                className="w-16 h-16 rounded-full flex items-center justify-center bg-red-600/10 border border-red-500/20"
                animate={state === "speaking" ? {
                  scale: [1, 1.15, 1],
                  borderColor: ["rgba(179,13,13,0.2)", "rgba(179,13,13,0.5)", "rgba(179,13,13,0.2)"]
                } : state === "listening" ? {
                  scale: [1, 1.25, 1],
                  borderColor: ["rgba(179,13,13,0.4)", "rgba(179,13,13,0.8)", "rgba(179,13,13,0.4)"]
                } : {
                  scale: 1
                }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <motion.div
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-rose-600 shadow-md shadow-red-500/30 flex items-center justify-center"
                  animate={state === "thinking" ? {
                    rotate: 360
                  } : {}}
                  transition={state === "thinking" ? { duration: 2, repeat: Infinity, ease: "linear" } : {}}
                >
                  {/* Micro waveform lines inside the fallback bubble */}
                  <div className="flex gap-0.75 items-center justify-center h-4">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-white rounded-full"
                        style={{ height: 4 }}
                        animate={state === "speaking" || state === "listening" ? {
                          height: [4, 14, 4]
                        } : {}}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.15,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </div>
          }
        />
      </div>

      {/* Visual overlays to simulate lip/mouth and glow effects */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        initial={false}
        animate={state === "listening" ? { scale: [1, 1.02, 1] } : { scale: 1 }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Glow ring */}
        <motion.div
          className="absolute rounded-full"
          style={{ width: "85%", height: "85%", filter: "blur(18px)", opacity: state === "idle" ? 0.06 : state === "listening" ? 0.22 : state === "speaking" ? 0.2 : 0.08, pointerEvents: "none" }}
          animate={state === "listening" ? { boxShadow: ["0 0 30px rgba(220,38,38,0.08)", "0 0 80px rgba(220,38,38,0.16)"] } : { boxShadow: "0 0 30px rgba(0,0,0,0.04)" }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Mouth overlay - simple rectangle to simulate lip movement if Spline doesn't expose blendshapes */}
        <div
          ref={mouthRef}
          className="absolute"
          style={{
            bottom: "16%",
            width: "36%",
            height: 12,
            borderRadius: 8,
            background: "rgba(20,20,20,0.85)",
            transformOrigin: "center",
            transition: "transform 120ms linear, opacity 260ms linear",
            opacity: 0.55,
            pointerEvents: "none",
          }}
        />
      </motion.div>
    </div>
  )
}


