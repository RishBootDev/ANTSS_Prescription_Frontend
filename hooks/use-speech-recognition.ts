"use client"

import { useState, useCallback, useRef, useEffect } from "react"

interface UseSpeechRecognitionOptions {
  lang?: string
  continuous?: boolean
  interimResults?: boolean
}

interface UseSpeechRecognitionReturn {
  transcript: string
  isListening: boolean
  isSupported: boolean
  error: string | null
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
}

/**
 * Minimal Web Speech API typings.
 * (The browser supports this, but TS types are not always included in Next.js projects.)
 */
interface SpeechRecognitionAlternative {
  transcript: string
}

interface SpeechRecognitionResult {
  isFinal: boolean
  0: SpeechRecognitionAlternative
}

interface SpeechRecognitionResultList {
  length: number
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionEvent {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent {
  error: string
}

interface SpeechRecognition {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
  const { lang = "en-US", continuous = true, interimResults = true } = options

  const [transcript, setTranscript] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const isMountedRef = useRef(false)
  // Use a ref to track if we should be listening (for restart logic)
  const shouldBeListeningRef = useRef(false)
  // Track restart attempts to prevent infinite loops
  const restartAttemptRef = useRef(0)
  const maxRestartAttempts = 5
  // Timeout for restart delay
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Initialize speech recognition only once
  useEffect(() => {
    isMountedRef.current = true

    if (typeof window !== "undefined") {
      const SpeechRecognitionCtor =
        window.SpeechRecognition || window.webkitSpeechRecognition

      if (SpeechRecognitionCtor) {
        setIsSupported(true)
        const recognition = new SpeechRecognitionCtor()
        recognition.lang = lang
        recognition.continuous = continuous
        recognition.interimResults = interimResults
        recognitionRef.current = recognition

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          if (!isMountedRef.current) return

          let finalTranscript = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i]
            if (result.isFinal) {
              finalTranscript += result[0].transcript
            }
          }

          if (finalTranscript) {
            setTranscript((prev) => {
              const newTranscript = prev 
                ? prev + " " + finalTranscript.trim() 
                : finalTranscript.trim()
              return newTranscript
            })
          }
        }

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          if (!isMountedRef.current) return

          console.log('Speech recognition error:', event.error)

          // Handle different error types
          if (event.error === 'no-speech') {
            // No speech detected, keep listening
            return
          }

          if (event.error === 'audio') {
            // Audio capture error - microphone might have been disconnected
            setError('Audio capture error. Please check your microphone.')
            shouldBeListeningRef.current = false
            setIsListening(false)
            return
          }

          if (event.error === 'not-allowed') {
            setError('Microphone permission denied. Please allow microphone access in your browser settings.')
            shouldBeListeningRef.current = false
            setIsListening(false)
            return
          }

          if (event.error === 'network') {
            console.log('Network error, will attempt to restart...')
            // Network error - try to restart
            return
          }

          if (event.error === 'service-not-allowed') {
            setError('Speech recognition service not allowed. Please check your browser settings.')
            shouldBeListeningRef.current = false
            setIsListening(false)
            return
          }

          if (event.error === 'aborted') {
            // User intentionally stopped
            shouldBeListeningRef.current = false
            setIsListening(false)
            return
          }

          // For other errors, try to continue
          console.log('Unhandled speech recognition error:', event.error)
        }

        recognition.onend = () => {
          if (!isMountedRef.current) return

          setIsListening(false)

          // If we should still be listening, restart with a delay
          if (shouldBeListeningRef.current && recognitionRef.current) {
            console.log('Recognition ended, attempting restart...')
            
            // Clear any existing restart timeout
            if (restartTimeoutRef.current) {
              clearTimeout(restartTimeoutRef.current)
            }

            // Check if we've exceeded max restart attempts
            if (restartAttemptRef.current >= maxRestartAttempts) {
              console.log('Max restart attempts reached, stopping.')
              setError('Speech recognition stopped after multiple restarts. Please try again.')
              shouldBeListeningRef.current = false
              return
            }

            // Increment restart attempt
            restartAttemptRef.current += 1

            // Restart with increasing delay (100ms, 200ms, 400ms, etc.)
            const delay = Math.min(100 * Math.pow(2, restartAttemptRef.current - 1), 2000)
            console.log(`Restarting in ${delay}ms (attempt ${restartAttemptRef.current}/${maxRestartAttempts})`)

            restartTimeoutRef.current = setTimeout(() => {
              if (isMountedRef.current && shouldBeListeningRef.current && recognitionRef.current) {
                try {
                  recognitionRef.current.start()
                  console.log('Restart successful')
                } catch (e) {
                  console.log('Restart failed:', e)
                }
              }
            }, delay)
          } else {
            // Clean stop - reset restart counter
            restartAttemptRef.current = 0
            console.log('Recognition stopped cleanly')
          }
        }

        recognition.onstart = () => {
          if (!isMountedRef.current) return
          setIsListening(true)
          setError(null)
          // Reset restart counter on successful start
          restartAttemptRef.current = 0
          console.log('Recognition started')
        }
      }
    }

    return () => {
      isMountedRef.current = false
      shouldBeListeningRef.current = false
      
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current)
        restartTimeoutRef.current = null
      }
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch {
          // Ignore errors on abort
        }
      }
    }
    // Only initialize once
  }, [])

  // Update options on the existing recognition instance
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = lang
      recognitionRef.current.continuous = continuous
      recognitionRef.current.interimResults = interimResults
    }
  }, [lang, continuous, interimResults])

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError("Speech recognition not available")
      return
    }

    // Clear any pending restart timeouts
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current)
      restartTimeoutRef.current = null
    }

    // Reset restart counter
    restartAttemptRef.current = 0
    
    // If already listening, don't start again
    if (isListening) {
      return
    }

    setError(null)
    setTranscript("")
    shouldBeListeningRef.current = true
    
    try {
      recognitionRef.current.start()
    } catch (e) {
      console.error('Failed to start recognition:', e)
      setError("Failed to start speech recognition. Please try again.")
      shouldBeListeningRef.current = false
      setIsListening(false)
    }
  }, [isListening])

  const stopListening = useCallback(() => {
    // Clear any pending restart timeouts
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current)
      restartTimeoutRef.current = null
    }

    shouldBeListeningRef.current = false
    restartAttemptRef.current = 0

    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop()
      } catch {
        // Ignore if already stopped
      }
      setIsListening(false)
    }
  }, [isListening])

  const resetTranscript = useCallback(() => {
    setTranscript("")
  }, [])

  return {
    transcript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  }
}

// Add type declarations for Web Speech API constructors
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition
    webkitSpeechRecognition?: new () => SpeechRecognition
  }
}