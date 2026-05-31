"use client"

import { useEffect, useMemo, useRef, useState } from "react"

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export default function Ant3DRed({
  className,
}: {
  className?: string
}) {
  const cardRef = useRef<HTMLDivElement | null>(null)
  const [isPressed, setIsPressed] = useState(false)

  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined" || !("matchMedia" in window)) return false
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }, [])

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    if (prefersReducedMotion) return

    let raf = 0

    const onMove = (e: PointerEvent) => {
      if (isPressed) return
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height

      const ry = clamp((x - 0.5) * 24, -18, 18)
      const rx = clamp((0.5 - y) * 18, -14, 14)

      cancelAnimationFrame(raf)
      raf = window.requestAnimationFrame(() => setTilt({ rx, ry }))
    }

    const onLeave = () => setTilt({ rx: 0, ry: 0 })

    el.addEventListener("pointermove", onMove)
    el.addEventListener("pointerleave", onLeave)

    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener("pointermove", onMove)
      el.removeEventListener("pointerleave", onLeave)
    }
  }, [isPressed, prefersReducedMotion])

  useEffect(() => {
    if (prefersReducedMotion) return
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Enter" || ev.key === " ") setIsPressed(true)
    }
    const offKey = (ev: KeyboardEvent) => {
      if (ev.key === "Enter" || ev.key === " ") setIsPressed(false)
    }
    window.addEventListener("keydown", onKey)
    window.addEventListener("keyup", offKey)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("keyup", offKey)
    }
  }, [prefersReducedMotion])

  const transform = prefersReducedMotion
    ? "none"
    : `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(0)`

  return (
    <div
      ref={cardRef}
      className={className}
      role="button"
      tabIndex={0}
      aria-label="Interactive red ant"
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={() => setIsPressed(false)}
      onPointerCancel={() => setIsPressed(false)}
      onBlur={() => setIsPressed(false)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") setIsPressed(true)
      }}
      onKeyUp={(e) => {
        if (e.key === "Enter" || e.key === " ") setIsPressed(false)
      }}
      style={{
        transform,
        transition: prefersReducedMotion ? undefined : isPressed ? "transform 80ms ease" : "transform 180ms ease",
        transformStyle: "preserve-3d",
      }}
    >
      {/* Ant body */}
      <div className="relative w-[220px] h-[160px] mx-auto select-none">
        {/* shadow */}
        <div className="absolute left-1/2 top-[105px] w-[140px] h-[26px] -translate-x-1/2 bg-black/20 blur-[10px] rounded-full -z-10" />

        {/* back shell */}
        <div
          className="absolute left-[26px] top-[56px] w-[88px] h-[62px] rounded-[50px] bg-[#d11212] border-[3px] border-black"
          style={{ transform: "translateZ(20px) rotate(-10deg)" }}
        />
        {/* front head */}
        <div
          className="absolute left-[92px] top-[38px] w-[78px] h-[60px] rounded-[36px] bg-[#c10f0f] border-[3px] border-black"
          style={{ transform: "translateZ(26px) rotate(12deg)" }}
        />

        {/* abdomen bump */}
        <div
          className="absolute left-[70px] top-[85px] w-[92px] h-[48px] rounded-[46px] bg-[#b60e0e] border-[3px] border-black"
          style={{ transform: "translateZ(18px) rotate(6deg)" }}
        />

        {/* antennae */}
        <div className="absolute left-[140px] top-[38px] w-[48px] h-[60px]" style={{ transform: "translateZ(34px)" }}>
          <span className="absolute left-0 top-0 w-[6px] h-[46px] bg-black rounded-full -rotate-18 origin-bottom" />
          <span className="absolute left-[22px] top-[6px] w-[6px] h-[42px] bg-black rounded-full rotate-10 origin-bottom" />
          <span className="absolute left-[2px] top-[10px] w-[18px] h-[18px] bg-[#e21b1b] border-[3px] border-black rounded-full" />
          <span className="absolute left-[30px] top-[14px] w-[18px] h-[18px] bg-[#e21b1b] border-[3px] border-black rounded-full" />
        </div>

        {/* eyes */}
        <div className="absolute left-[125px] top-[62px] w-[10px] h-[10px] bg-white border-[3px] border-black rounded-full" style={{ transform: "translateZ(40px)" }} />
        <div className="absolute left-[142px] top-[62px] w-[10px] h-[10px] bg-white border-[3px] border-black rounded-full" style={{ transform: "translateZ(40px)" }} />

        {/* legs (chunky, simple) */}
        <div className="absolute left-[40px] top-[90px] w-[150px] h-[70px] -translate-x-0" style={{ transform: "translateZ(30px)" }}>
          {[
            { x: 18, y: 0, r: -20 },
            { x: 34, y: 8, r: -35 },
            { x: 52, y: 14, r: -55 },
            { x: 74, y: 16, r: 210 },
            { x: 94, y: 12, r: 190 },
            { x: 112, y: 6, r: 160 },
          ].map((p, idx) => (
            <div
              key={idx}
              className="absolute w-[14px] h-[10px] bg-[#8a0909] border-[3px] border-black rounded-[6px]"
              style={{
                left: p.x,
                top: p.y,
                transform: `rotate(${p.r}deg)`,
              }}
            />
          ))}
        </div>

        {/* red glow */}
        <div
          className="absolute left-[18px] top-[28px] w-[170px] h-[120px] rounded-[80px] bg-[#ff4b4b]/20 blur-[10px] border border-black/10"
          style={{ transform: "translateZ(-10px)" }}
        />
      </div>

      {/* pressed micro-jump */}
      <div
        className="pointer-events-none"
        style={{
          transform: isPressed && !prefersReducedMotion ? "translateY(-6px) translateZ(10px)" : "translateY(0)",
          transition: prefersReducedMotion ? undefined : "transform 120ms ease",
        }}
      />
    </div>
  )
}
