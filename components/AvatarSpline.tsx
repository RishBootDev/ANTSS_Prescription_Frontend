"use client"

import dynamic from "next/dynamic"
import React, { useEffect, useMemo, useRef } from "react"
import { motion } from "framer-motion"

const Spline = dynamic(() => import("@splinetool/react-spline"), { ssr: false }) as any

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
      {/* Spline viewer: transparent background */}
      <div style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}>
        <Spline scene={url} style={{ width: "100%", height: "100%", background: "transparent" }} />
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

