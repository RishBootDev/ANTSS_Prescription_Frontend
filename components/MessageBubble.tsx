"use client"

import React from "react"
import { motion } from "framer-motion"

type MessageBubbleProps = {
  text?: string
  isTyping?: boolean
  side?: "left" | "right"
}

export default function MessageBubble({ text = "", isTyping = false, side = "right" }: MessageBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-[70%]"
      style={{ justifySelf: side === "right" ? "end" : "start" }}
    >
      <div
        className="rounded-2xl p-3"
        style={{
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.6)",
          boxShadow: "0 10px 30px rgba(2,6,23,0.06)",
        }}
      >
        <div className="text-sm text-[#111827] leading-snug">
          {text}
        </div>

        {isTyping && (
          <div className="flex items-center gap-1 mt-2">
            {[0,1,2].map((i) => (
              <motion.span
                key={i}
                className="block bg-[#9CA3AF]"
                style={{ width: 6, height: 6, borderRadius: 999 }}
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12 }}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
