declare module "@splinetool/react-spline" {
  import type { ComponentType } from "react"

  type Props = {
    scene: string
    className?: string
    style?: React.CSSProperties
  }

  const Spline: ComponentType<Props>
  export default Spline
}

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
