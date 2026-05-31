"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Save,
  RotateCcw,
  CheckCircle,
  User,
  Phone,
  Calendar,
  Activity,
  Thermometer,
  Heart,
  AlertTriangle,
  Pill,
  FileText,
  Printer,
  Stethoscope,
  Syringe,
} from "lucide-react"
import { PatientForm, PatientData, MedicineEntry, ComplaintEntry, DiagnosisEntry } from "@/components/patient-form"
import { VoiceControl } from "@/components/voice-control"
import FloatingAIAssistant from "@/components/FloatingAIAssistant"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import type { PatientData as PatientListData } from "../patients/page"
import { getAuthState } from "@/lib/auth"

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
  bloodGroup: null,
  lmp: null,
  visitDate: null,
  allergies: null,
  currentMedications: null,
  chiefComplaint: null,
  symptoms: null,
  medicalHistory: null,
  quickNotes: null,
  complaints: [],
  generalExamination: null,
  diagnoses: [],
  advice: null,
  testsRequested: null,
  nextVisit: null,
  investigations: null,
  payment: null,
  followUp: null,
  contactNumber: null,
  emergencyContact: null,
  insuranceId: null,
  medicines: [],
}

// Convert patient list data to patient form data
function convertToPatientFormData(patient: PatientListData): PatientData {
  return {
    name: patient.name,
    age: patient.age,
    gender: patient.gender,
    weight: patient.weight,
    height: patient.height,
    bloodPressureSystolic: patient.bloodPressureSystolic,
    bloodPressureDiastolic: patient.bloodPressureDiastolic,
    pulse: patient.pulse,
    temperature: patient.temperature,
    oxygenSaturation: patient.oxygenSaturation,
    bloodGroup: patient.bloodGroup,
    lmp: patient.lmp,
    visitDate: patient.visitDate,
    allergies: patient.allergies,
    currentMedications: patient.currentMedications,
    chiefComplaint: patient.chiefComplaint,
    symptoms: patient.symptoms,
    medicalHistory: patient.medicalHistory,
    quickNotes: patient.quickNotes,
    complaints: patient.complaints as ComplaintEntry[],
    generalExamination: patient.generalExamination,
    diagnoses: patient.diagnoses as DiagnosisEntry[],
    advice: patient.advice,
    testsRequested: patient.testsRequested,
    nextVisit: patient.nextVisit,
    investigations: patient.investigations,
    payment: patient.payment,
    followUp: patient.followUp,
    contactNumber: patient.contactNumber,
    emergencyContact: patient.emergencyContact,
    insuranceId: patient.insuranceId,
    medicines: patient.medicines as MedicineEntry[],
  }
}

export default function ConsultationPage() {
  const router = useRouter()
  const [patientData, setPatientData] = useState<PatientData>(emptyPatientData)

  useEffect(() => {
    const auth = getAuthState()
    if (!auth.isAuthenticated) router.replace("/login")
  }, [router])
  const [originalPatient, setOriginalPatient] = useState<PatientListData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")
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

  const assistantState = isAvatarSpeaking
    ? "speaking"
    : isLoading
      ? "thinking"
      : isListening
        ? "listening"
        : "idle"

  // Load patient data from localStorage
  useEffect(() => {
    const storedPatient = localStorage.getItem("currentConsultationPatient")
    if (storedPatient) {
      try {
        const patient: PatientListData = JSON.parse(storedPatient)
        setOriginalPatient(patient)
        setPatientData(convertToPatientFormData(patient))
      } catch (e) {
        console.error("Failed to load patient data:", e)
      }
    }
    setIsLoading(false)
  }, [])

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
                  name: (m.name ?? "") as string,
                  dose: (m.dose ?? "") as string,
                  frequency: (m.frequency ?? "") as string,
                  duration: (m.duration ?? "") as string,
                  instructions: (m.instructions ?? "") as string,
                }
              })

              const medicineKey = (m: MedicineEntry) =>
                `${m.name}`.trim().toLowerCase() +
                `|${m.dose}`.trim().toLowerCase() +
                `|${m.frequency}`.trim().toLowerCase() +
                `|${m.duration}`.trim().toLowerCase() +
                `|${m.instructions}`.trim().toLowerCase()

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
                  complaint: (c.complaint ?? "") as string,
                  frequency: (c.frequency ?? null) as string | null,
                  severity: (c.severity ?? null) as string | null,
                  duration: (c.duration ?? null) as string | null,
                  date: (c.date ?? null) as string | null,
                }
              })

              const complaintKey = (c: ComplaintEntry) =>
                `${c.complaint}`.trim().toLowerCase() +
                `|${c.frequency ?? ""}`.trim().toLowerCase() +
                `|${c.severity ?? ""}`.trim().toLowerCase() +
                `|${c.duration ?? ""}`.trim().toLowerCase() +
                `|${c.date ?? ""}`.trim().toLowerCase()

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
                  diagnosis: (d.diagnosis ?? "") as string,
                  snomedCode: (d.snomedCode ?? null) as string | null,
                  duration: (d.duration ?? null) as string | null,
                  date: (d.date ?? null) as string | null,
                }
              })

              const diagnosisKey = (d: DiagnosisEntry) =>
                `${d.diagnosis}`.trim().toLowerCase() +
                `|${d.snomedCode ?? ""}`.trim().toLowerCase() +
                `|${d.duration ?? ""}`.trim().toLowerCase() +
                `|${d.date ?? ""}`.trim().toLowerCase()

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
  }, [speak])

  const handleStopListening = useCallback(() => {
    stopListening()
    setActiveVoiceField(null)
  }, [stopListening])

  const handleMicToggleForField = useCallback(
    (fieldId: string) => {
      if (isLoading || !isSupported) return

      if (isListening && activeVoiceField === fieldId) {
        stopListening()
        setActiveVoiceField(null)
        return
      }

      setActiveVoiceField(fieldId)
      resetTranscript()
      startListening()
    },
    [isLoading, isSupported, isListening, activeVoiceField, stopListening, resetTranscript, startListening]
  )

  // Interrupt AI speech when user starts speaking
  useEffect(() => {
    if (transcript && isListening) {
      handleUserStartedSpeaking()
    }
  }, [transcript, isListening, handleUserStartedSpeaking])

  // Silence-based detection
  useEffect(() => {
    if (processDebounceTimerRef.current) {
      clearTimeout(processDebounceTimerRef.current)
      processDebounceTimerRef.current = null
    }

    if (transcript.trim() && transcript.trim() !== lastProcessedTranscriptRef.current) {
      hasProcessedCurrentTranscriptRef.current = false
    }

    if (isListening && !isLoading && transcript.trim() && !hasProcessedCurrentTranscriptRef.current) {
      processDebounceTimerRef.current = setTimeout(() => {
        processTranscript(transcript)
        hasProcessedCurrentTranscriptRef.current = true
        lastProcessedTranscriptRef.current = transcript.trim()
      }, 1500)
    }

    return () => {
      if (processDebounceTimerRef.current) {
        clearTimeout(processDebounceTimerRef.current)
        processDebounceTimerRef.current = null
      }
    }
  }, [transcript, isListening, isLoading, processTranscript])

  const handleReset = () => {
    if (originalPatient) {
      setPatientData(convertToPatientFormData(originalPatient))
    } else {
      setPatientData(emptyPatientData)
    }
    resetTranscript()
    setSaveStatus("idle")
  }

  const handleSave = async () => {
    setSaveStatus("saving")
    
    // Update the patient in localStorage
    if (originalPatient) {
      const updatedPatient: PatientListData = {
        ...originalPatient,
        ...patientData,
      }
      
      // Get all patients and update this one
      const storedPatients = localStorage.getItem("patients")
      if (storedPatients) {
        const patients: PatientListData[] = JSON.parse(storedPatients)
        const updatedPatients = patients.map(p => 
          p.id === originalPatient.id ? updatedPatient : p
        )
        localStorage.setItem("patients", JSON.stringify(updatedPatients))
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSaveStatus("saved")
    setTimeout(() => setSaveStatus("idle"), 2000)
  }

  // Auto-scroll and focus on highlighted fields
  useEffect(() => {
    if (highlightedFields.length > 0 && !focusedField) {
      const timer = setTimeout(() => {
        const firstField = highlightedFields[0]
        const element = fieldRefs.current.get(firstField)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          if (typeof (element as HTMLElement).focus === 'function') {
            (element as HTMLElement).focus()
          }
          setFocusedField(firstField)
        }
      }, 200)
      return () => clearTimeout(timer)
    }
    
    if (highlightedFields.length === 0) {
      setFocusedField(null)
    }
  }, [highlightedFields, focusedField])

  const handlePrintPrescription = () => {
    try {
      localStorage.setItem('prescriptionData', JSON.stringify(patientData))
    } catch (e) {
      console.error('Failed to save prescription data:', e)
    }
    window.open("/prescription-demo", "_blank")
  }

  // Go back to patients list
  const goBack = () => {
    router.push("/patients")
  }

  if (isLoading && !patientData.name) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading patient data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={goBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-2 ml-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Syringe className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-foreground">Consultation</h1>
                <p className="text-[10px] text-muted-foreground">AI Voice-Enabled Form</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-4 lg:px-6">
        <section className="mb-4">
          {/* Floating AI copilot lives bottom-right; keep the consultation form as focus */}
          <FloatingAIAssistant
            state={assistantState}
            transcript={transcript}
            error={error}
            isSupported={isSupported}
            isListening={isListening}
            isProcessing={isLoading}
            isSpeaking={isAvatarSpeaking}
            onStartListening={startListening}
            onStopListening={handleStopListening}
          />

        {/* Patient Information Card - Displayed at the top, separate from the form */}
        <section className="mb-4">
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Name and Basic Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{patientData.name || "N/A"}</p>
                      <p className="text-xs text-muted-foreground">
                        {patientData.age ? `${patientData.age} years` : ""} {patientData.gender ? `• ${patientData.gender}` : ""}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Contact:</span>
                    <span>{patientData.contactNumber || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Visit:</span>
                    <span>{patientData.visitDate || "N/A"}</span>
                  </div>
                </div>

                {/* Vitals */}
                <div className="space-y-1">
                  {patientData.bloodPressureSystolic && patientData.bloodPressureDiastolic && (
                    <div className="flex items-center gap-2 text-sm">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">BP:</span>
                      <span className="font-medium">{patientData.bloodPressureSystolic}/{patientData.bloodPressureDiastolic} mmHg</span>
                    </div>
                  )}
                  {patientData.pulse && (
                    <div className="flex items-center gap-2 text-sm">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Pulse:</span>
                      <span className="font-medium">{patientData.pulse} bpm</span>
                    </div>
                  )}
                  {patientData.temperature && (
                    <div className="flex items-center gap-2 text-sm">
                      <Thermometer className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Temp:</span>
                      <span className="font-medium">{patientData.temperature}°F</span>
                    </div>
                  )}
                </div>

                {/* Blood Group and SpO2 */}
                <div className="space-y-1">
                  {patientData.bloodGroup && (
                    <Badge variant="secondary" className="text-xs">
                      Blood Group: {patientData.bloodGroup}
                    </Badge>
                  )}
                  {patientData.oxygenSaturation && (
                    <div className="flex items-center gap-2 text-sm">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">SpO2:</span>
                      <span className="font-medium">{patientData.oxygenSaturation}%</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Medical Alerts */}
              {patientData.allergies && patientData.allergies !== "None" && patientData.allergies !== "N/A" && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-700">
                    <strong>Allergies:</strong> {patientData.allergies}
                  </span>
                </div>
              )}

              {/* Additional Info Row */}
              <Separator className="my-3" />
              
              <div className="grid gap-2 md:grid-cols-3 text-sm">
                {patientData.chiefComplaint && (
                  <div>
                    <span className="text-muted-foreground">Chief Complaint: </span>
                    <span className="font-medium">{patientData.chiefComplaint}</span>
                  </div>
                )}
                {patientData.medicalHistory && (
                  <div>
                    <span className="text-muted-foreground">Medical History: </span>
                    <span className="font-medium">{patientData.medicalHistory}</span>
                  </div>
                )}
                {patientData.currentMedications && (
                  <div>
                    <span className="text-muted-foreground">Current Medications: </span>
                    <span className="font-medium">{patientData.currentMedications}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Prescription Form */}
        <section>
          <PatientForm
            data={patientData}
            onChange={setPatientData}
            highlightedFields={highlightedFields}
            mic={{
              isListening,
              isProcessing: isLoading,
              isSupported,
              activeVoiceField,
              onMicToggle: handleMicToggleForField,
            }}
            registerFieldRef={registerFieldRef}
          />
        </section>
        </section>
      </main>
    </div>
  )
}
