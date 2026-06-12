"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import Script from "next/script"

type SplineViewerWithErrorHandlingProps = {
  url: string
  style?: React.CSSProperties
  className?: string
  fallback?: React.ReactNode
  onError?: (error: Error) => void
}

/**
 * A wrapper component for the Spline viewer that handles errors gracefully.
 * The "Missing property" error in buildTimeline is a Spline scene file issue
 * that occurs when the scene has animations referencing missing properties.
 * This wrapper catches such errors and displays fallback content.
 */
export default function SplineViewerWithErrorHandling({
  url,
  style,
  className,
  fallback,
  onError,
}: SplineViewerWithErrorHandlingProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [viewerLoaded, setViewerLoaded] = useState(false)
  const errorReported = useRef(false)

  // Default fallback: a simple animated placeholder
  const defaultFallback = (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, rgba(220,38,38,0.15), rgba(244,63,94,0.08))",
        borderRadius: "inherit",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "rgba(239,68,68,0.2)",
          border: "2px solid rgba(239,68,68,0.3)",
          animation: "pulse 2s ease-in-out infinite",
        }}
      />
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      `}</style>
    </div>
  )

  const handleError = useCallback(
    (error: Error | Event) => {
      if (errorReported.current) return
      errorReported.current = true

      const err = error instanceof Error ? error : new Error("Spline viewer failed to load")
      console.warn("[SplineViewer] Error caught:", err.message)
      setHasError(true)
      setIsLoading(false)

      if (onError && typeof onError === "function") {
        onError(err)
      }
    },
    [onError]
  )

  // Check WebGL availability during mount
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const isAvailable = !!(
        window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
      if (!isAvailable) {
        handleError(new Error("WebGL context creation is not supported or is disabled in the browser."));
      }
    } catch (e) {
      handleError(new Error("WebGL context availability check failed."));
    }
  }, [handleError]);

  // Global error handler for uncaught errors from the Spline viewer
  useEffect(() => {
    if (viewerLoaded) return

    const originalErrorHandler = window.onerror
    const originalPromiseRejectionHandler = window.onunhandledrejection

    window.onerror = function (message, source, lineno, colno, error) {
      // Check if error is from spline-viewer or WebGL
      const msgStr = String(message || "").toLowerCase();
      if (
        (source && source.includes("spline-viewer")) ||
        msgStr.includes("webgl") ||
        msgStr.includes("context")
      ) {
        handleError(error || new Error(String(message)))
        return true
      }
      // Call original handler if exists
      if (originalErrorHandler) {
        return originalErrorHandler(message, source, lineno, colno, error)
      }
      return false
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason
      if (reason && typeof reason === "object" && "message" in reason) {
        const msg = String(reason.message || "")
        const lowerMsg = msg.toLowerCase();
        if (
          lowerMsg.includes("spline") ||
          lowerMsg.includes("timeline") ||
          lowerMsg.includes("webgl") ||
          lowerMsg.includes("renderer") ||
          lowerMsg.includes("context")
        ) {
          handleError(new Error(msg))
        }
      }
      // Call original handler if exists
      if (originalPromiseRejectionHandler) {
        originalPromiseRejectionHandler.call(window, event)
      }
    }

    window.addEventListener("unhandledrejection", handleUnhandledRejection)

    return () => {
      window.onerror = originalErrorHandler
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
    }
  }, [handleError, viewerLoaded])

  // Monitor the spline-viewer element for errors
  useEffect(() => {
    if (!containerRef.current || hasError) return

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const addedNode of mutation.addedNodes) {
          if (
            addedNode instanceof HTMLElement &&
            (addedNode.tagName === "SPLINE-VIEWER" || addedNode.querySelector?.("spline-viewer"))
          ) {
            const viewer = addedNode.tagName === "SPLINE-VIEWER" ? addedNode : addedNode.querySelector("spline-viewer")
            if (viewer) {
              // Listen for Spline-specific events
              const handleSplineError = () => handleError(new Error("Spline viewer emitted error event"))
              const handleSplineLoad = () => {
                setIsLoading(false)
                setHasError(false)
              }

              viewer.addEventListener("load", handleSplineLoad)
              viewer.addEventListener("error", handleSplineError)

              // Set a timeout to detect if the viewer fails to initialize
              const timeoutId = setTimeout(() => {
                // Check if viewer seems stuck (no load event after reasonable time)
                if (isLoading) {
                  // Don't force error, just stop loading state
                  setIsLoading(false)
                }
              }, 15000) // 15 second timeout

              return () => {
                viewer.removeEventListener("load", handleSplineLoad)
                viewer.removeEventListener("error", handleSplineError)
                clearTimeout(timeoutId)
              }
            }
          }
        }
      }
    })

    observer.observe(containerRef.current, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [hasError, handleError, isLoading])

  // Mark viewer script as loaded
  const handleScriptLoad = () => {
    setViewerLoaded(true)
  }

  const handleScriptError = () => {
    handleError(new Error("Failed to load Spline viewer script"))
  }

  if (hasError) {
    return <>{fallback || defaultFallback}</>
  }

  return (
    <div ref={containerRef} className={className} style={style}>
      <Script
        src="https://unpkg.com/@splinetool/viewer@1.12.92/build/spline-viewer.js"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
        onError={handleScriptError}
      />
      {React.createElement("spline-viewer", {
        url,
        style: { width: "100%", height: "100%", display: "block" },
      })}
    </div>
  )
}