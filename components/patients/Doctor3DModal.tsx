"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined" || !("matchMedia" in window)) return
    const media: MediaQueryList = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setPrefersReducedMotion(Boolean(media.matches))
    update()

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

function buildDoctorTexture() {
  const canvas = document.createElement("canvas")
  const size = 512
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")
  if (!ctx) return null

  ctx.clearRect(0, 0, size, size)
  ctx.fillStyle = "rgba(255,255,255,0)"
  ctx.fillRect(0, 0, size, size)

  // background plate
  ctx.fillStyle = "rgba(255,255,255,0.9)"
  roundRect(ctx, size * 0.08, size * 0.08, size * 0.84, size * 0.84, size * 0.14)
  ctx.fill()

  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.06)"
  roundRect(ctx, size * 0.12, size * 0.12, size * 0.76, size * 0.76, size * 0.12)
  ctx.fill()

  const cx = size / 2
  const headY = size * 0.33
  const bodyY = size * 0.62

  // subtle outline
  ctx.lineWidth = 10
  ctx.lineJoin = "round"
  ctx.lineCap = "round"

  // head
  ctx.fillStyle = "#f2c8a3"
  ctx.beginPath()
  ctx.arc(cx, headY, size * 0.12, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = "rgba(0,0,0,0.08)"
  ctx.stroke()

  // stethoscope/neck
  ctx.strokeStyle = "#0f766e"
  ctx.lineWidth = 12
  ctx.beginPath()
  ctx.moveTo(cx - size * 0.03, headY + size * 0.09)
  ctx.lineTo(cx - size * 0.04, headY + size * 0.15)
  ctx.stroke()

  // suit/body
  ctx.fillStyle = "#e0f2fe"
  ctx.beginPath()
  ctx.moveTo(cx - size * 0.20, bodyY - size * 0.08)
  ctx.quadraticCurveTo(cx - size * 0.22, bodyY + size * 0.03, cx - size * 0.08, bodyY + size * 0.12)
  ctx.lineTo(cx + size * 0.08, bodyY + size * 0.12)
  ctx.quadraticCurveTo(cx + size * 0.22, bodyY + size * 0.03, cx + size * 0.20, bodyY - size * 0.08)
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = "rgba(0,0,0,0.08)"
  ctx.lineWidth = 10
  ctx.stroke()

  // doctor cross (red)
  const crossX = cx
  const crossY = size * 0.60
  const crossSize = size * 0.085

  ctx.fillStyle = "#ef4444"
  // vertical
  ctx.beginPath()
  ctx.roundRect(crossX - crossSize * 0.18, crossY - crossSize * 0.58, crossSize * 0.36, crossSize * 1.16, crossSize * 0.18)
  ctx.fill()
  // horizontal
  ctx.beginPath()
  ctx.roundRect(crossX - crossSize * 0.58, crossY - crossSize * 0.18, crossSize * 1.16, crossSize * 0.36, crossSize * 0.18)
  ctx.fill()

  // backplate highlight
  ctx.fillStyle = "rgba(14,165,233,0.07)"
  ctx.beginPath()
  ctx.ellipse(cx, size * 0.40, size * 0.22, size * 0.14, 0, 0, Math.PI * 2)
  ctx.fill()

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  texture.needsUpdate = true
  return texture
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

export function Doctor3DModal() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [open, setOpen] = useState(false)

  const buttonMountRef = useRef<HTMLDivElement | null>(null)
  const modalMountRef = useRef<HTMLDivElement | null>(null)

  const scenesRef = useRef<{
    button?: { cleanup: () => void }
    modal?: { cleanup: () => void }
  }>({})

  const hospitalEmoji = "🏥"

  const label = useMemo(() => (open ? "Close Doctor" : "Open Doctor"), [open])

  useEffect(() => {
    if (open) return

    // Create small button scene
    const mount = buttonMountRef.current
    if (!mount) return

    if (!("ResizeObserver" in window)) return
    let renderer: THREE.WebGLRenderer | null = null
    let frameId: number | null = null

    const width = mount.clientWidth
    const height = mount.clientHeight

    const scene = new THREE.Scene()
    scene.background = null

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100)
    camera.position.z = 4

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(width, height)
    renderer.domElement.style.width = "100%"
    renderer.domElement.style.height = "100%"
    renderer.domElement.style.display = "block"
    mount.appendChild(renderer.domElement)

    const light = new THREE.AmbientLight(0xffffff, 1.0)
    scene.add(light)

    const texture = buildDoctorTexture()
    const material = new THREE.MeshBasicMaterial({ map: texture ?? undefined, transparent: true })
    const geometry = new THREE.PlaneGeometry(1.9, 1.9)
    const plane = new THREE.Mesh(geometry, material)
    scene.add(plane)

    // faint halo
    const haloGeo = new THREE.CircleGeometry(1.75, 48)
    const haloMat = new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.12 })
    const halo = new THREE.Mesh(haloGeo, haloMat)
    halo.position.z = -0.2
    scene.add(halo)

    const resize = () => {
      if (!renderer) return
      const w = mount.clientWidth
      const h = mount.clientHeight
      if (!w || !h) return
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }

    const ro = new ResizeObserver(() => resize())
    ro.observe(mount)

    const animate = () => {
      const t = performance.now() / 1000
      plane.rotation.y = prefersReducedMotion ? 0 : Math.sin(t) * 0.25
      plane.rotation.x = prefersReducedMotion ? 0 : -0.05 + Math.cos(t * 1.2) * 0.03
      halo.rotation.z = prefersReducedMotion ? 0 : Math.sin(t * 0.7) * 0.06
      renderer?.render(scene, camera)
      frameId = window.requestAnimationFrame(animate)
    }

    animate()

    scenesRef.current.button = {
      cleanup: () => {
        if (frameId) window.cancelAnimationFrame(frameId)
        ro.disconnect()
        geometry.dispose()
        material.dispose()
        texture?.dispose?.()
        scene.remove(plane)
        scene.remove(halo)
        renderer?.dispose()
        if (renderer?.domElement && renderer.domElement.parentElement) {
          renderer.domElement.parentElement.removeChild(renderer.domElement)
        }
      },
    }

    return () => scenesRef.current.button?.cleanup?.()
  }, [prefersReducedMotion, open])

  useEffect(() => {
    if (!open) {
      // cleanup modal scene when closed
      scenesRef.current.modal?.cleanup?.()
      scenesRef.current.modal = undefined
      return
    }

    const mount = modalMountRef.current
    if (!mount) return
    let renderer: THREE.WebGLRenderer | null = null
    let frameId: number | null = null

    const width = mount.clientWidth
    const height = mount.clientHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100)
    camera.position.z = 6

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(width, height)
    renderer.domElement.style.width = "100%"
    renderer.domElement.style.height = "100%"
    mount.appendChild(renderer.domElement)

    const ambient = new THREE.AmbientLight(0xffffff, 1.1)
    scene.add(ambient)

    const texture = buildDoctorTexture()
    const material = new THREE.MeshBasicMaterial({ map: texture ?? undefined, transparent: true })
    const geometry = new THREE.PlaneGeometry(3.1, 3.1)
    const plane = new THREE.Mesh(geometry, material)
    scene.add(plane)

    const planetGeo = new THREE.SphereGeometry(2.2, 32, 16)
    const planetMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.12 })
    const planet = new THREE.Mesh(planetGeo, planetMat)
    planet.position.z = -2.6
    scene.add(planet)

    const ringGeo = new THREE.TorusGeometry(2.4, 0.08, 18, 90)
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.22 })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.rotation.x = Math.PI / 2
    ring.position.z = -1.7
    scene.add(ring)

    const resize = () => {
      if (!renderer) return
      const w = mount.clientWidth
      const h = mount.clientHeight
      if (!w || !h) return
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }

    const ro = new ResizeObserver(() => resize())
    ro.observe(mount)

    const animate = () => {
      const t = performance.now() / 1000
      plane.rotation.y = prefersReducedMotion ? 0 : Math.sin(t * 0.9) * 0.45
      plane.rotation.x = prefersReducedMotion ? 0 : -0.08 + Math.cos(t * 1.1) * 0.05
      ring.rotation.z = prefersReducedMotion ? 0 : t * 0.9
      planet.rotation.y = prefersReducedMotion ? 0 : t * 0.35
      renderer?.render(scene, camera)
      frameId = window.requestAnimationFrame(animate)
    }

    animate()

    scenesRef.current.modal = {
      cleanup: () => {
        if (frameId) window.cancelAnimationFrame(frameId)
        ro.disconnect()
        geometry.dispose()
        material.dispose()
        planetGeo.dispose()
        planetMat.dispose()
        ringGeo.dispose()
        ringMat.dispose()
        texture?.dispose?.()
        scene.remove(plane)
        scene.remove(planet)
        scene.remove(ring)
        renderer?.dispose()
        if (renderer?.domElement && renderer.domElement.parentElement) {
          renderer.domElement.parentElement.removeChild(renderer.domElement)
        }
      },
    }

    return () => scenesRef.current.modal?.cleanup?.()
  }, [open, prefersReducedMotion])

  const onQuickAction = (action: "newVisit" | "emergency") => {
    // Placeholder hooks (no routing change in this task)
    // You can replace with real actions later.
    const msg =
      action === "newVisit"
        ? "New Visit created (demo)"
        : "Emergency alert triggered (demo)"
    // eslint-disable-next-line no-alert
    alert(msg)
  }

  return (
    <>
      {/* Bottom-left doctor launcher */}
      <button
        type="button"
        className="fixed left-4 bottom-4 z-[100] flex items-center gap-3 rounded-2xl border border-border/70 bg-card/80 px-4 py-3 shadow-lg backdrop-blur transition hover:bg-card"
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
      >
        <div ref={buttonMountRef} className="h-14 w-14 rounded-2xl overflow-hidden" aria-hidden="true" />
        <div className="text-left">
          <div className="text-sm font-semibold text-foreground">Doctor</div>
          <div className="text-[11px] text-muted-foreground">Hospital AI</div>
        </div>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-[101] flex items-end justify-start p-4 sm:items-center">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border/70 bg-card shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="text-lg" aria-hidden="true">{hospitalEmoji}</div>
                <div>
                  <div className="text-sm font-semibold">Hospital Assistant</div>
                  <div className="text-xs text-muted-foreground">Interactive 3D doctor modal</div>
                </div>
              </div>

              <button
                type="button"
                className="rounded-xl border border-border/70 bg-background px-3 py-1 text-xs hover:bg-accent"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="p-4">
              <div ref={modalMountRef} className="h-56 w-full rounded-2xl bg-background/40 border border-border/60 overflow-hidden" aria-hidden="true" />

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="rounded-2xl border border-border/60 bg-background px-4 py-3 text-left hover:bg-accent/40"
                  onClick={() => onQuickAction("newVisit")}
                >
                  <div className="text-sm font-semibold">New Visit</div>
                  <div className="text-xs text-muted-foreground">Start a consultation</div>
                </button>

                <button
                  type="button"
                  className="rounded-2xl border border-border/60 bg-background px-4 py-3 text-left hover:bg-accent/40"
                  onClick={() => onQuickAction("emergency")}
                >
                  <div className="text-sm font-semibold">Emergency</div>
                  <div className="text-xs text-muted-foreground">Quick escalation</div>
                </button>
              </div>

              <div className="mt-3 rounded-2xl border border-border/60 bg-background/30 p-3">
                <div className="text-xs text-muted-foreground">Tip</div>
                <div className="text-sm font-medium">
                  Click doctor at bottom-left to toggle this hospital modal.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
