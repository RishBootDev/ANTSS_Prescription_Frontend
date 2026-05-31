"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"

type Particle = {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  size: number
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined" || !("matchMedia" in window)) return
    const media: MediaQueryList = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setPrefersReducedMotion(Boolean(media.matches))
    update()
    // Safari compatibility
    if ("addEventListener" in media) {
      media.addEventListener("change", update)
      return () => media.removeEventListener("change", update)
    }
    ;(media as unknown as { addListener: (cb: () => void) => void; removeListener: (cb: () => void) => void }).addListener(
      update,
    )
    return () =>
      (media as unknown as {
        addListener: (cb: () => void) => void
        removeListener: (cb: () => void) => void
      }).removeListener(update)
  }, [])

  return prefersReducedMotion
}

export function Patients3DBackground() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)

  const prefersReducedMotion = usePrefersReducedMotion()

  // Keep geometry/material stable
  const config = useMemo(
    () => ({
      particleCount: 260,
      bounds: 22,
      cameraZ: 42,
      fov: 55,
      speed: 0.0025,
    }),
    [],
  )

  useEffect(() => {
    if (prefersReducedMotion) return
    const el = containerRef.current
    if (!el) return

    const width = el.clientWidth
    const height = el.clientHeight

    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0xffffff, 45, 95)

    const camera = new THREE.PerspectiveCamera(config.fov, width / height, 0.1, 250)
    camera.position.z = config.cameraZ

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(width, height)

    // Ensure canvas is behind content and doesn't intercept clicks
    renderer.domElement.style.position = "absolute"
    renderer.domElement.style.inset = "0"
    renderer.domElement.style.zIndex = "0"
    renderer.domElement.style.pointerEvents = "none"
    el.appendChild(renderer.domElement)

    const particles: Particle[] = []
    const geometry = new THREE.BufferGeometry()

    const positions = new Float32Array(config.particleCount * 3)
    const colors = new Float32Array(config.particleCount * 3)

    const baseColor = new THREE.Color("#0ea5e9") // cyan-ish
    const accentColor = new THREE.Color("#22c55e") // green

    for (let i = 0; i < config.particleCount; i++) {
      const x = (Math.random() - 0.5) * config.bounds
      const y = (Math.random() - 0.5) * config.bounds
      const z = (Math.random() - 0.5) * config.bounds

      const vx = (Math.random() - 0.5) * config.speed
      const vy = (Math.random() - 0.5) * config.speed
      const vz = (Math.random() - 0.5) * config.speed

      const size = 0.8 + Math.random() * 1.8

      particles.push({ x, y, z, vx, vy, vz, size })

      positions[i * 3 + 0] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z

      const mix = Math.random()
      const c = baseColor.clone().lerp(accentColor, mix)
      colors[i * 3 + 0] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size: 1.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    })

    const points = new THREE.Points(geometry, material)
    scene.add(points)

    const resize = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      if (!w || !h) return
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

    const ro = new ResizeObserver(() => resize())
    ro.observe(el)

    const animate = () => {
      const posAttr = geometry.getAttribute("position") as THREE.BufferAttribute

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.z += p.vz

        // Wrap around bounds to avoid hard edges
        if (p.x > config.bounds / 2) p.x = -config.bounds / 2
        if (p.x < -config.bounds / 2) p.x = config.bounds / 2
        if (p.y > config.bounds / 2) p.y = -config.bounds / 2
        if (p.y < -config.bounds / 2) p.y = config.bounds / 2
        if (p.z > config.bounds / 2) p.z = -config.bounds / 2
        if (p.z < -config.bounds / 2) p.z = config.bounds / 2

        posAttr.setXYZ(i, p.x, p.y, p.z)
      }

      posAttr.needsUpdate = true
      renderer.render(scene, camera)
      rafRef.current = window.requestAnimationFrame(animate)
    }

    rafRef.current = window.requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
      ro.disconnect()

      geometry.dispose()
      material.dispose()
      scene.remove(points)
      renderer.dispose()

      if (renderer.domElement && renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement)
      }
    }
  }, [config, prefersReducedMotion])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0"
      aria-hidden="true"
      style={{ width: "100vw", height: "100vh" }}
    />
  )
}
