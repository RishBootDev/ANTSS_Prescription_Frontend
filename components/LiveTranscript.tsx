"use client"

import React, { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

type TranscriptEntry = {
  id: string
  speaker: "user" | "ai"
  text: string
}

type LiveTranscriptProps = {
  entries: TranscriptEntry[]
}

export default function LiveTranscript({ entries }: LiveTranscriptProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  // auto-scroll on new message
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [entries.length])

  return (
    <div ref={ref} className="max-h-36 overflow-auto px-1 space-y-2">
      <AnimatePresence initial={false}>
        {entries.map((e) => (
          <motion.div
            key={e.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.28 }}
            className={`p-2 rounded-lg ${e.speaker === "user" ? "bg-white/60 text-[#111827]" : "bg-[#f3f4f6]/60 text-[#374151]"}`}
          >
            <div className="text-sm leading-relaxed whitespace-pre-wrap">{e.text}</div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
