"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import SplineViewerWithErrorHandling from "./SplineViewerWithErrorHandling"

type AIMedicalAvatarProps = {
  isListening: boolean
  isSpeaking: boolean
  className?: string
}

/**
 * Spline web-component avatar (NOT @splinetool/react-spline).
 * Uses the viewer web component:
 *  <spline-viewer url="..." />
 */
export default function AIMedicalAvatar({
  isListening,
  isSpeaking,
  className,
}: AIMedicalAvatarProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Slightly vary the glow intensity with state transitions
  const glowLevel = useMemo(() => {
    if (isSpeaking) return 1
    if (isListening) return 0.75
    return 0.25
  }, [isListening, isSpeaking])

  // Optional: provide gentle mouse-react rotation (no heavy rerenders)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const prefersReduced =
      typeof window !== "undefined" &&
      "matchMedia" in window &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (prefersReduced) return

    let raf = 0

    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect()
        const x = (e.clientX - r.left) / Math.max(1, r.width)
        const y = (e.clientY - r.top) / Math.max(1, r.height)

        const rotY = (x - 0.5) * 10
        const rotX = -(y - 0.5) * 8

        el.style.setProperty("--avatar-rot-x", `${rotX}deg`)
        el.style.setProperty("--avatar-rot-y", `${rotY}deg`)
      })
    }

    window.addEventListener("pointermove", onMove, { passive: true })

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("pointermove", onMove)
    }
  }, [])

  // Talking effect: CSS animation hooks
  const motionClass = isSpeaking ? "avatar-talking" : isListening ? "avatar-listening" : ""

  const sceneUrl = "https://prod.spline.design/zESg9RgYAoqmVo4g/scene.splinecode"

  return (
    <div
      ref={containerRef}
      className={[
        "relative mx-auto w-full max-w-[520px] aspect-[4/5] sm:aspect-square",
        "rounded-[34px] overflow-hidden",
        "bg-white/10 border border-white/15 backdrop-blur-xl",
        "shadow-[0_30px_90px_rgba(0,0,0,0.18)] select-none",
        "transition-[transform,box-shadow,filter] duration-500 ease-out",
        isSpeaking
          ? "shadow-[0_50px_140px_rgba(185,28,28,0.42)]"
          : isListening
            ? "shadow-[0_40px_120px_rgba(185,28,28,0.30)]"
            : "shadow-[0_25px_70px_rgba(0,0,0,0.12)]",
        className ?? "",
        motionClass,
      ].join(" ")}
      style={{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ["--glow-level" as any]: String(glowLevel),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ["--avatar-rot-x" as any]: "0deg",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ["--avatar-rot-y" as any]: "0deg",
      }}
    >
      {/* Cinematic biotech glow background */}
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(closest-side at 55% 45%, rgba(220,38,38,0.28), transparent 60%), radial-gradient(closest-side at 35% 60%, rgba(244,63,94,0.18), transparent 58%)",
          filter: "saturate(1.2)",
          opacity: 0.95,
        }}
      />

      {/* Soft scanline / vignette */}
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.06), rgba(0,0,0,0.0)), radial-gradient(circle at center, rgba(0,0,0,0.0), rgba(0,0,0,0.25))",
          mixBlendMode: "overlay",
          pointerEvents: "none",
        }}
      />

      {/* Smooth transform wrapper */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          transform:
            "perspective(900px) rotateX(var(--avatar-rot-x)) rotateY(var(--avatar-rot-y))",
          transition: "transform 220ms ease-out",
        }}
      >
        {/* Scale up the scene inside the canvas so it fills the card */}
        <div
          className="absolute inset-0 origin-center"
          style={{
            transform: "scale(2.2) translateZ(0)",
            transformOrigin: "50% 50%",
          }}
        >
          <SplineViewerWithErrorHandling
            url={sceneUrl}
            fallback={
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "linear-gradient(135deg, rgba(220,38,38,0.15), rgba(244,63,94,0.08))",
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: "rgba(239,68,68,0.2)",
                    border: "2px solid rgba(239,68,68,0.3)",
                    animation: "pulse 2s ease-in-out infinite",
                  }}
                />
              </div>
            }
          />
        </div>

        {/* Hide "Built with Spline" badge if present */}
        <style jsx>{`
          /* Best-effort selectors: Spline viewer internals can change */
          spline-viewer [title*="Spline"],
          spline-viewer a,
          spline-viewer [class*="badge"],
          spline-viewer [class*="spline-badge"],
          spline-viewer [data-testid*="spline"],
          spline-viewer [aria-label*="Spline"] {
            display: none !important;
          }
        `}</style>
      </div>

      {/* Listening mic pulse + speaking waveform */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* Mic pulse (listening) */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 18,
            transform: "translateX(-50%)",
            width: 54,
            height: 54,
            borderRadius: 999,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(239,68,68,0.25)",
            boxShadow: isListening
              ? "0 0 0 2px rgba(239,68,68,0.28), 0 0 50px rgba(239,68,68,0.18)"
              : "0 0 0 0 rgba(0,0,0,0)",
            opacity: isListening ? 1 : 0.65,
            transition: "opacity 250ms ease, box-shadow 250ms ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 10,
              height: 18,
              borderRadius: 6,
              background: "rgba(239,68,68,0.75)",
              boxShadow: isListening ? "0 0 25px rgba(239,68,68,0.55)" : "none",
              transform: isListening ? "scale(1.05)" : "scale(0.98)",
              transition: "transform 250ms ease",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                right: 0,
                background: "rgba(255,255,255,0.25)",
                transform: "translateX(-100%)",
                animation: isListening ? "micSweep 1.15s ease-in-out infinite" : "none",
              }}
            />
          </div>
        </div>

        {/* Speaking waveform (top-center) */}
        <div
          style={{
            position: "absolute",
            top: 18,
            left: "50%",
            transform: "translateX(-50%)",
            width: 110,
            height: 34,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 6,
            opacity: isSpeaking ? 1 : 0.4,
            transition: "opacity 200ms ease",
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => {
            const h =
              isSpeaking && i % 2 === 0
                ? 18 + i
                : isSpeaking
                  ? 10 + i
                  : 10
            return (
              <div
                key={i}
                style={{
                  width: 10,
                  height: h,
                  borderRadius: 999,
                  background: "rgba(239,68,68,0.7)",
                  boxShadow: isSpeaking
                    ? "0 0 24px rgba(239,68,68,0.35)"
                    : "none",
                  animation: isSpeaking ? `wave${i} 0.85s ease-in-out infinite` : "none",
                }}
              />
            )
          })}
        </div>
      </div>

      {/* Component-local CSS animations (avoid styled-jsx nesting issues in Next.js App Router) */}
      <style>{`
        .avatar-talking spline-viewer {
          filter: saturate(1.2) contrast(1.05);
        }
        .avatar-listening {
          transform: translateZ(0) scale(1.01);
        }
        .avatar-talking {
          transform: translateZ(0) scale(1.03);
        }
        .avatar-listening::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 28px;
          background: radial-gradient(
            circle at 50% 45%,
            rgba(239,68,68,0.25),
            transparent 58%
          );
          animation: avatarPulse 1.2s ease-in-out infinite;
          pointer-events: none;
        }
        .avatar-talking::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 28px;
          background: radial-gradient(
            circle at 50% 45%,
            rgba(239,68,68,0.35),
            transparent 60%
          );
          animation: avatarTalking 0.9s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes avatarPulse {
          0% {
            opacity: 0.35;
            transform: scale(1);
          }
          50% {
            opacity: 0.85;
            transform: scale(1.02);
          }
          100% {
            opacity: 0.35;
            transform: scale(1);
          }
        }
        @keyframes avatarTalking {
          0% {
            opacity: 0.25;
            transform: scale(1);
          }
          35% {
            opacity: 0.95;
            transform: scale(1.03);
          }
          70% {
            opacity: 0.55;
            transform: scale(1.01);
          }
          100% {
            opacity: 0.25;
            transform: scale(1);
          }
        }
        @keyframes micSweep {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(120%); }
        }
        @keyframes wave0 { 0%{transform:scaleY(1);} 50%{transform:scaleY(1.35);} 100%{transform:scaleY(1);} }
        @keyframes wave1 { 0%{transform:scaleY(1);} 50%{transform:scaleY(1.15);} 100%{transform:scaleY(1);} }
        @keyframes wave2 { 0%{transform:scaleY(1);} 50%{transform:scaleY(1.45);} 100%{transform:scaleY(1);} }
        @keyframes wave3 { 0%{transform:scaleY(1);} 50%{transform:scaleY(1.2);} 100%{transform:scaleY(1);} }
        @keyframes wave4 { 0%{transform:scaleY(1);} 50%{transform:scaleY(1.3);} 100%{transform:scaleY(1);} }
        @keyframes wave5 { 0%{transform:scaleY(1);} 50%{transform:scaleY(1.18);} 100%{transform:scaleY(1);} }
      `}</style>
    </div>
  )
}
