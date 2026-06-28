"use client"

import { useState, useCallback, useEffect, useRef, useCallback as useStableCallback } from "react"
import { Button } from "@/components/ui/button"
import { PatientForm, PatientData, MedicineEntry, ComplaintEntry, DiagnosisEntry, GeneralExaminationEntry, PastMedicalHistoryEntry, InvestigationEntry, TestRequestedEntry, DocumentEntry } from "./patient-form"
import { VoiceControl } from "./voice-control"
import { VoiceContext } from "@/hooks/useConsultationVoice"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { Save, RotateCcw, CheckCircle } from "lucide-react"

const emptyPatientData: PatientData = {
  name: null,
  age: null,
  gender: null,
  weight: null,
  height: null,
  bloodPressureSystolic: null,
  bloodPressureDiastolic: null,
  pulse: null,
  temperature: null,
  oxygenSaturation: null,

  lmp: null,
  visitDate: null,

  allergies: null,
  currentMedications: null,
  chiefComplaint: null,
  symptoms: null,
  medicalHistory: null,

  quickNotes: null,
  complaints: [],
  generalExaminations: [],
  pastMedicalHistories: [],
  diagnoses: [],

  advice: null,
  testsRequested: [],
  nextVisit: null,
  investigations: [],
  payment: null,
  followUp: null,

  contactNumber: null,
  emergencyContact: null,
  insuranceId: null,

  medicines: [],
  documents: [],
}

export function PatientDashboard() {
  const [patientData, setPatientData] = useState<PatientData>(emptyPatientData)
  const [isProcessing, setIsProcessing] = useState(false)
  const [highlightedFields, setHighlightedFields] = useState<string[]>([])
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")
  const [activeVoiceContext, setActiveVoiceContext] = useState<VoiceContext | null>(null)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  // Store refs to all input elements by field name
  const fieldRefs = useRef<Map<string, HTMLElement>>(new Map())

  // Track the last processed transcript to prevent duplicate processing
  const lastProcessedTranscriptRef = useRef<string>("")

  // Ref to store the debounce timer for silence detection
  const processDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Ref to track if AI is currently speaking
  const isSpeakingRef = useRef(false)

  // Ref to track if we've already processed the current transcript
  const hasProcessedCurrentTranscriptRef = useRef(false)

  // Text-to-Speech function
  const speak = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) {
      console.log("Text-to-speech not supported")
      return
    }

    // Cancel any ongoing speech quietly
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
      console.log("AI speaking:", text.substring(0, 50) + (text.length > 50 ? '...' : ''))
    }

    utterance.onend = () => {
      isSpeakingRef.current = false
      console.log("AI finished speaking")
    }

    utterance.onerror = (event) => {
      isSpeakingRef.current = false
      // Only log actual errors, not 'canceled' which is expected when interrupted
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
      console.log("Interrupted AI speech")
    }
  }, [])

  // Register a field's element ref
  const registerFieldRef = useCallback((fieldName: string, element: HTMLElement | null) => {
    if (element) {
      fieldRefs.current.set(fieldName, element)
      console.log('Registered field ref:', fieldName, element)
    } else {
      fieldRefs.current.delete(fieldName)
      console.log('Unregistered field ref:', fieldName)
    }
  }, [])

  const {
    transcript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({ lang: "en-US", continuous: true })

  const processTranscript = useCallback(async (text: string) => {
    if (!text.trim()) return

    // Prevent duplicate processing of the same transcript
    const trimmedText = text.trim()
    if (trimmedText === lastProcessedTranscriptRef.current) {
      console.log('Skipping duplicate processing:', trimmedText)
      return
    }
    lastProcessedTranscriptRef.current = trimmedText

    console.log('Processing transcript:', trimmedText)
    setIsProcessing(true)
    try {
      const response = await fetch("/api/extract-patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })

      const data: unknown = await response.json()
      if (!data || typeof data !== "object" || !("result" in data)) return

      // Extract both result and reply from response
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

          // For other fields: set only when explicitly non-null/non-undefined
          if (value !== null && value !== undefined) {
            const updatedRecord = updated as unknown as Record<string, unknown>
            updatedRecord[typedKey as string] = value
            newHighlighted.push(typedKey as string)
          }
        })

        return updated
      })

      console.log('Setting highlightedFields:', newHighlighted)
      setHighlightedFields(newHighlighted)
      setFocusedField(null) // Reset focused field to allow re-triggering

      // Speak the AI's conversational reply
      if (reply) {
        console.log('AI reply:', reply)
        speak(reply)
      }

      // Clear highlights and focus after 2 seconds
      setTimeout(() => {
        console.log('Clearing highlightedFields')
        setHighlightedFields([])
      }, 2000)
    } catch (err) {
      console.error("Failed to process speech:", err)
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const handleStopListening = useCallback(() => {
    stopListening()
    setActiveVoiceContext(null)
  }, [stopListening])

  const handleMicToggle = useCallback(
    (context: VoiceContext) => {
      if (isProcessing || !isSupported) return

      // Stop if the same field is already active
      if (isListening && activeVoiceContext?.mode === context.mode && activeVoiceContext?.component === context.component && activeVoiceContext?.field === context.field) {
        stopListening()
        setActiveVoiceContext(null)
        return
      }

      // Start for this field
      setActiveVoiceContext(context)
      resetTranscript()
      startListening()
    },
    [
      isProcessing,
      isSupported,
      isListening,
      activeVoiceContext,
      stopListening,
      resetTranscript,
      startListening,
    ]
  )

  // NOTE: Listening is manual start/stop - user controls when to start/stop
  // Processing happens automatically during listening (silence-based detection)

  // Interrupt AI speech when user starts speaking (transcript updates while AI is talking)
  useEffect(() => {
    if (transcript && isListening) {
      handleUserStartedSpeaking()
    }
  }, [transcript, isListening, handleUserStartedSpeaking])

  // Silence-based detection: process transcript after ~1.5s of no changes while listening
  useEffect(() => {
    // Clear any existing timer when transcript changes
    if (processDebounceTimerRef.current) {
      clearTimeout(processDebounceTimerRef.current)
      processDebounceTimerRef.current = null
    }

    // Reset the processed flag when transcript changes (new speech detected)
    if (transcript.trim() && transcript.trim() !== lastProcessedTranscriptRef.current) {
      hasProcessedCurrentTranscriptRef.current = false
    }

    // Only process while listening and not already processing and haven't processed this transcript yet
    if (isListening && !isProcessing && transcript.trim() && !hasProcessedCurrentTranscriptRef.current) {
      // Wait 1.5 seconds after last transcript change before processing
      processDebounceTimerRef.current = setTimeout(() => {
        console.log('Silence detected, processing transcript:', transcript.trim())
        processTranscript(transcript)
        // Mark as processed to prevent duplicate processing
        hasProcessedCurrentTranscriptRef.current = true
        // Update last processed transcript
        lastProcessedTranscriptRef.current = transcript.trim()
      }, 1500)
    }

    return () => {
      if (processDebounceTimerRef.current) {
        clearTimeout(processDebounceTimerRef.current)
        processDebounceTimerRef.current = null
      }
    }
  }, [transcript, isListening, isProcessing, processTranscript])

  const handleReset = () => {
    setPatientData(emptyPatientData)
    resetTranscript()
    setSaveStatus("idle")
  }

  const handleSave = async () => {
    setSaveStatus("saving")
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSaveStatus("saved")
    setTimeout(() => setSaveStatus("idle"), 2000)
  }

  // Auto-scroll and focus on highlighted fields
  useEffect(() => {
    console.log('useEffect triggered:', { highlightedFields, focusedField, length: highlightedFields.length })
    if (highlightedFields.length > 0 && !focusedField) {
      console.log('Attempting auto-focus for fields:', highlightedFields)
      // Small delay to ensure DOM has updated with new values
      const timer = setTimeout(() => {
        const firstField = highlightedFields[0]
        const element = fieldRefs.current.get(firstField)
        console.log('Auto-focus attempt:', { firstField, element, allRefs: Array.from(fieldRefs.current.keys()) })
        if (element) {
          // Scroll to the element
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          
          // Focus the element if it's focusable
          if (typeof (element as HTMLElement).focus === 'function') {
            (element as HTMLElement).focus()
            console.log('Focused element:', firstField)
          }
          
          // Track that we've focused this field
          setFocusedField(firstField)
        } else {
          console.warn('Element not found for field:', firstField)
        }
      }, 200)
      return () => clearTimeout(timer)
    }
    
    // Reset focused field when highlights are cleared
    if (highlightedFields.length === 0) {
      setFocusedField(null)
    }
  }, [highlightedFields, focusedField])

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-base font-bold text-primary-foreground">P</span>
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground">Patient Dashboard</h1>
              <p className="text-[10px] text-muted-foreground">AI Voice-Enabled Form</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => window.location.href = "/patients"} className="text-muted-foreground mr-2">
              Back to Patients
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>

            <Button size="sm" onClick={handleSave} disabled={saveStatus === "saving"}>
              {saveStatus === "saved" ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Saved
                </>
              ) : saveStatus === "saving" ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin">⏳</span>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Patient
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-4 lg:px-6">
        <section className="sticky top-16 z-40 mb-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <VoiceControl
            isListening={isListening}
            isProcessing={isProcessing}
            isSupported={isSupported}
            transcript={transcript}
            error={error}
            onStartListening={startListening}
            onStopListening={handleStopListening}
          />
        </section>

        <section>
          <PatientForm
            data={patientData}
            onChange={setPatientData}
            highlightedFields={highlightedFields}
            mic={{
              isListening,
              isProcessing,
              isSupported,
              activeVoiceContext,
              onMicToggle: handleMicToggle,
            }}
            registerFieldRef={registerFieldRef}
          />
        </section>
      </main>
    </div>
  )
}
