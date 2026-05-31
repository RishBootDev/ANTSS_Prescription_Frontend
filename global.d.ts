import type React from "react"

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "spline-viewer": {
        url?: string
        style?: React.CSSProperties
        class?: string
        [key: string]: unknown
      }
    }
  }
}

export {}
