"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { PatientData, MedicineEntry, ComplaintEntry, DiagnosisEntry } from "@/components/patient-form"

interface UseConsultationVoiceOptions {
  patientData: PatientData;
  setPatientData: React.Dispatch<React.SetStateAction<PatientData>>;
}

export function useConsultationVoice({ patientData, setPatientData }: UseConsultationVoiceOptions) {
  const [isLoading, setIsLoading] = useState(false)
  const [highlightedFields, setHighlightedFields] = useState<string[]>([])
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false)
  const [activeVoiceField, setActiveVoiceField] = useState<string | null>(null)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const fieldRefs = useRef<Map<string, HTMLElement>>(new Map())
  const lastProcessedTranscriptRef = useRef<string>("")
  const processDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isSpeakingRef = useRef(false)
  const hasProcessedCurrentTranscriptRef = useRef(false)

  const {
    transcript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({ lang: "en-US", continuous: true })

  // Text-to-Speech function
  const speak = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) {
      console.log("Text-to-speech not supported")
      return
    }

    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel()
      isSpeakingRef.current = false
    }

    if (!text) return

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1
    utterance.pitch = 1
    utterance.volume = 1

    utterance.onstart = () => {
      isSpeakingRef.current = true
      setIsAvatarSpeaking(true)
    }

    utterance.onend = () => {
      isSpeakingRef.current = false
      setIsAvatarSpeaking(false)
    }

    utterance.onerror = (event) => {
      isSpeakingRef.current = false
      if (event.error !== 'canceled' && event.error !== 'interrupted') {
        console.error("TTS error:", event.error)
      }
    }

    window.speechSynthesis.speak(utterance)
  }, [])

  // Interrupt AI speech when user starts speaking
  const handleUserStartedSpeaking = useCallback(() => {
    if (isSpeakingRef.current) {
      window.speechSynthesis.cancel()
      isSpeakingRef.current = false
      setIsAvatarSpeaking(false)
    }
  }, [])

  // Register a field's element ref
  const registerFieldRef = useCallback((fieldName: string, element: HTMLElement | null) => {
    if (element) {
      fieldRefs.current.set(fieldName, element)
    } else {
      fieldRefs.current.delete(fieldName)
    }
  }, [])

  const processTranscript = useCallback(async (text: string) => {
    if (!text.trim()) return

    const trimmedText = text.trim()
    if (trimmedText === lastProcessedTranscriptRef.current) {
      return
    }
    lastProcessedTranscriptRef.current = trimmedText

    setIsLoading(true)
    try {
      const response = await fetch("/api/extract-patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })

      const data: unknown = await response.json()
      if (!data || typeof data !== "object" || !("result" in data)) return

      const responseObj = data as { result?: Partial<Record<keyof PatientData, unknown>>; reply?: string }
      const extracted = responseObj.result
      const reply = responseObj.reply

      if (!extracted || typeof extracted !== "object") return

      const newHighlighted: string[] = []

      setPatientData((prev) => {
        const updated: PatientData = { ...prev }

        Object.keys(extracted).forEach((key) => {
          const typedKey = key as keyof PatientData
          const value = extracted[typedKey] as unknown

          if (typedKey === "medicines") {
            if (Array.isArray(value) && value.length > 0) {
              const newMedicines: MedicineEntry[] = value.map((med, idx) => {
                const m = med as Partial<MedicineEntry>
                return {
                  id: `med-${Date.now()}-${idx}`,
                  medicineName: (m.medicineName ?? "") as string,
                  strength: (m.strength ?? "") as string,
                  dosage: (m.dosage ?? "") as string,
                  frequency: (m.frequency ?? "") as string,
                  duration: (m.duration ?? "") as string,
                  instruction: (m.instruction ?? "") as string,
                  quantity: (m.quantity ?? "") as string,
                }
              })

              const medicineKey = (m: MedicineEntry) =>
                `${m.medicineName}`.trim().toLowerCase() +
                `|${m.strength}`.trim().toLowerCase() +
                `|${m.dosage}`.trim().toLowerCase() +
                `|${m.frequency}`.trim().toLowerCase() +
                `|${m.duration}`.trim().toLowerCase() +
                `|${m.instruction}`.trim().toLowerCase() +
                `|${m.quantity}`.trim().toLowerCase()

              const existingKeys = new Set(prev.medicines.map(medicineKey))
              const uniqueToAdd = newMedicines.filter((m) => !existingKeys.has(medicineKey(m)))

              updated.medicines = [...prev.medicines, ...uniqueToAdd]
              if (uniqueToAdd.length > 0) newHighlighted.push("medicines")
            }
            return
          }

          if (typedKey === "complaints") {
            if (Array.isArray(value) && value.length > 0) {
              const newComplaints: ComplaintEntry[] = value.map((cmp, idx) => {
                const c = cmp as Partial<ComplaintEntry>
                return {
                  id: `cmp-${Date.now()}-${idx}`,
                  complaintName: (c.complaintName ?? "") as string,
                  complaintFrequency: (c.complaintFrequency ?? null) as string | null,
                  severity: (c.severity ?? null) as string | null,
                  complaintDuration: (c.complaintDuration ?? null) as string | null,
                }
              })

              const complaintKey = (c: ComplaintEntry) =>
                `${c.complaintName}`.trim().toLowerCase() +
                `|${c.complaintFrequency ?? ""}`.trim().toLowerCase() +
                `|${c.severity ?? ""}`.trim().toLowerCase() +
                `|${c.complaintDuration ?? ""}`.trim().toLowerCase()

              const existingKeys = new Set(prev.complaints.map(complaintKey))
              const uniqueToAdd = newComplaints.filter((c) => !existingKeys.has(complaintKey(c)))

              updated.complaints = [...prev.complaints, ...uniqueToAdd]
              if (uniqueToAdd.length > 0) newHighlighted.push("complaints")
            }
            return
          }

          if (typedKey === "diagnoses") {
            if (Array.isArray(value) && value.length > 0) {
              const newDiagnoses: DiagnosisEntry[] = value.map((dx, idx) => {
                const d = dx as Partial<DiagnosisEntry>
                return {
                  id: `dx-${Date.now()}-${idx}`,
                  diagnosisName: (d.diagnosisName ?? "") as string,
                  diagnosisCode: (d.diagnosisCode ?? null) as string | null,
                  diagnosisDuration: (d.diagnosisDuration ?? null) as string | null,
                }
              })

              const diagnosisKey = (d: DiagnosisEntry) =>
                `${d.diagnosisName}`.trim().toLowerCase() +
                `|${d.diagnosisCode ?? ""}`.trim().toLowerCase() +
                `|${d.diagnosisDuration ?? ""}`.trim().toLowerCase()

              const existingKeys = new Set(prev.diagnoses.map(diagnosisKey))
              const uniqueToAdd = newDiagnoses.filter((d) => !existingKeys.has(diagnosisKey(d)))

              updated.diagnoses = [...prev.diagnoses, ...uniqueToAdd]
              if (uniqueToAdd.length > 0) newHighlighted.push("diagnoses")
            }
            return
          }

          if (value !== null && value !== undefined) {
            const updatedRecord = updated as unknown as Record<string, unknown>
            updatedRecord[typedKey as string] = value
            newHighlighted.push(typedKey as string)
          }
        })

        return updated
      })

      setHighlightedFields(newHighlighted)
      setFocusedField(null)

      if (reply) {
        speak(reply)
      }

      setTimeout(() => {
        setHighlightedFields([])
      }, 2000)
    } catch (err) {
      console.error("Failed to process speech:", err)
    } finally {
      setIsLoading(false)
    }
  }, [speak, setPatientData])

  const handleStopListening = useCallback(() => {
    stopListening()
    if (transcript.trim() && !hasProcessedCurrentTranscriptRef.current) {
      processTranscript(transcript)
      hasProcessedCurrentTranscriptRef.current = true
    }
  }, [stopListening, transcript, processTranscript])

  const handleMicToggleForField = useCallback(
    (fieldName: string) => {
      if (isListening && activeVoiceField === fieldName) {
        handleStopListening()
        setActiveVoiceField(null)
      } else {
        if (isListening) {
          handleStopListening()
        }
        setActiveVoiceField(fieldName)
        setFocusedField(fieldName)
        resetTranscript()
        hasProcessedCurrentTranscriptRef.current = false

        setTimeout(() => {
          const element = fieldRefs.current.get(fieldName)
          if (element) {
            element.focus()
            element.scrollIntoView({ behavior: "smooth", block: "center" })
          }
          startListening()
          handleUserStartedSpeaking()
        }, 100)
      }
    },
    [isListening, activeVoiceField, handleStopListening, resetTranscript, startListening, handleUserStartedSpeaking]
  )

  useEffect(() => {
    if (!isListening && activeVoiceField) {
      if (transcript.trim() && !hasProcessedCurrentTranscriptRef.current) {
        if (processDebounceTimerRef.current) {
          clearTimeout(processDebounceTimerRef.current)
        }
        processDebounceTimerRef.current = setTimeout(() => {
          processTranscript(transcript)
          hasProcessedCurrentTranscriptRef.current = true
        }, 1000)
      } else {
        setActiveVoiceField(null)
        setFocusedField(null)
      }
    }

    return () => {
      if (processDebounceTimerRef.current) {
        clearTimeout(processDebounceTimerRef.current)
        processDebounceTimerRef.current = null
      }
    }
  }, [transcript, isListening, activeVoiceField, processTranscript])

  const assistantState = isAvatarSpeaking
    ? "speaking"
    : isLoading
      ? "thinking"
      : isListening
        ? "listening"
        : "idle"

  return {
    transcript,
    isListening,
    isSupported,
    error,
    isLoading,
    assistantState,
    highlightedFields,
    activeVoiceField,
    focusedField,
    registerFieldRef,
    handleMicToggleForField,
    resetTranscript,
    speak,
    startListening,
    stopListening,
    isAvatarSpeaking
  }
}
