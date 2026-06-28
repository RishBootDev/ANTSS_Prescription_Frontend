"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useAudioRecorder } from "@/src/hooks/useAudioRecorder"
import { 
  PatientData, 
  MedicineEntry, 
  ComplaintEntry, 
  DiagnosisEntry,
  GeneralExaminationEntry,
  PastMedicalHistoryEntry,
  InvestigationEntry,
  TestRequestedEntry
} from "@/components/patient-form-fields/types"

export type VoiceMode = "FIELD" | "COMPONENT" | "GLOBAL";
export interface VoiceContext {
  mode: VoiceMode;
  component?: string;
  field?: string;
}

interface UseConsultationVoiceOptions {
  patientData: PatientData;
  setPatientData: React.Dispatch<React.SetStateAction<PatientData>>;
}

export function useConsultationVoice({ patientData, setPatientData }: UseConsultationVoiceOptions) {
  const [assistantState, setAssistantState] = useState<"idle" | "listening" | "transcribing" | "understanding" | "updating" | "speaking">("idle")
  const [highlightedFields, setHighlightedFields] = useState<string[]>([])
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false)
  const [activeVoiceContext, setActiveVoiceContext] = useState<VoiceContext>({ mode: "GLOBAL" })
  const [extractedPreview, setExtractedPreview] = useState<any>(null)
  const [transcript, setTranscript] = useState("")

  const fieldRefs = useRef<Map<string, HTMLElement>>(new Map())
  const isSpeakingRef = useRef(false)
  const lastExtractedTranscriptRef = useRef("")
  const transcriptRef = useRef(transcript)
  const activeVoiceContextRef = useRef(activeVoiceContext)

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    activeVoiceContextRef.current = activeVoiceContext;
  }, [activeVoiceContext]);

  const {
    isRecording: isListening,
    error: recorderError,
    startRecording,
    stopRecording,
    getAccumulatedAudio,
    isSupported,
  } = useAudioRecorder()

  // --- TTS ---
  const speak = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) return
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel()
      isSpeakingRef.current = false
    }
    if (!text) return

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1; utterance.pitch = 1; utterance.volume = 1;

    utterance.onstart = () => { isSpeakingRef.current = true; setIsAvatarSpeaking(true); setAssistantState("speaking"); }
    utterance.onend = () => { isSpeakingRef.current = false; setIsAvatarSpeaking(false); setAssistantState("idle"); }
    utterance.onerror = (e) => { isSpeakingRef.current = false; if (e.error !== 'canceled') console.error("TTS error:", e.error); }
    window.speechSynthesis.speak(utterance)
  }, [])

  const handleUserStartedSpeaking = useCallback(() => {
    if (isSpeakingRef.current) {
      window.speechSynthesis.cancel()
      isSpeakingRef.current = false
      setIsAvatarSpeaking(false)
    }
  }, [])

  const registerFieldRef = useCallback((fieldName: string, element: HTMLElement | null) => {
    if (element) fieldRefs.current.set(fieldName, element)
    else fieldRefs.current.delete(fieldName)
  }, [])

  // --- Core API Calls ---
  const fetchTranscription = useCallback(async () => {
    const blob = await getAccumulatedAudio();
    if (!blob) return;

    setAssistantState("transcribing");
    const formData = new FormData();
    formData.append("audio", blob, "chunk.webm");

    try {
      const res = await fetch("/api/ai/transcribe", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        if (data.transcript) {
          setTranscript(data.transcript);
        }
      }
    } catch (err) {
      console.error("Transcription error:", err);
    }
  }, [getAccumulatedAudio]);

  const runExtraction = useCallback(async (currentTranscript: string) => {
    if (!currentTranscript || currentTranscript === lastExtractedTranscriptRef.current) return;

    setAssistantState("understanding");
    try {
      const payload = {
        transcript: currentTranscript,
        mode: activeVoiceContextRef.current.mode,
        component: activeVoiceContextRef.current.component,
        field: activeVoiceContextRef.current.field
      };

      const res = await fetch("/api/ai/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.result) {
          setAssistantState("updating");
          setExtractedPreview(data.result);
          lastExtractedTranscriptRef.current = currentTranscript;
          mergeExtractedData(data.result);
          
          if (data.reply) {
            speak(data.reply);
          }
        }
      }
    } catch (err) {
      console.error("Extraction error:", err);
    }
  }, [speak]);

  // Merge JSON deeply without destroying existing fields unnecessarily
  const mergeExtractedData = (extracted: Partial<Record<keyof PatientData, unknown>>) => {
    const newHighlighted: string[] = []

    setPatientData((prev) => {
      const updated: PatientData = { ...prev }

      Object.keys(extracted).forEach((key) => {
        const typedKey = key as keyof PatientData
        const value = extracted[typedKey] as unknown

        // Medicines
        if (typedKey === "medicines") {
          if (Array.isArray(value) && value.length > 0) {
            const newMedicines: MedicineEntry[] = value.map((m, idx) => ({
              id: `med-${Date.now()}-${idx}`,
              medicineName: (m.medicineName ?? "") as string,
              strength: (m.strength ?? "") as string,
              dosage: (m.dosage ?? "") as string,
              frequency: (m.frequency ?? "") as string,
              duration: (m.duration ?? "") as string,
              instruction: (m.instruction ?? "") as string,
              quantity: (m.quantity ?? "") as string,
            }))
            const existingNames = new Set(prev.medicines.map(m => m.medicineName.toLowerCase()));
            const uniqueToAdd = newMedicines.filter(m => !existingNames.has(m.medicineName.toLowerCase()));
            if (uniqueToAdd.length > 0) {
              updated.medicines = [...prev.medicines, ...uniqueToAdd]
              newHighlighted.push("medicines")
            }
          }
          return
        }

        // Complaints
        if (typedKey === "complaints") {
          if (Array.isArray(value) && value.length > 0) {
            const newComplaints: ComplaintEntry[] = value.map((c, idx) => ({
              id: `cmp-${Date.now()}-${idx}`,
              complaintName: (c.complaintName ?? "") as string,
              complaintFrequency: (c.complaintFrequency ?? null) as string | null,
              severity: (c.severity ?? null) as string | null,
              complaintDuration: (c.complaintDuration ?? null) as string | null,
            }))
            const existingNames = new Set(prev.complaints.map(c => c.complaintName.toLowerCase()));
            const uniqueToAdd = newComplaints.filter(c => !existingNames.has(c.complaintName.toLowerCase()));
            if (uniqueToAdd.length > 0) {
              updated.complaints = [...prev.complaints, ...uniqueToAdd]
              newHighlighted.push("complaints")
            }
          }
          return
        }

        // Diagnoses
        if (typedKey === "diagnoses") {
          if (Array.isArray(value) && value.length > 0) {
            const newDiagnoses: DiagnosisEntry[] = value.map((d, idx) => ({
              id: `dx-${Date.now()}-${idx}`,
              diagnosisName: (d.diagnosisName ?? "") as string,
              diagnosisCode: (d.diagnosisCode ?? null) as string | null,
              diagnosisDuration: (d.diagnosisDuration ?? null) as string | null,
            }))
            const existingNames = new Set(prev.diagnoses.map(d => d.diagnosisName.toLowerCase()));
            const uniqueToAdd = newDiagnoses.filter(d => !existingNames.has(d.diagnosisName.toLowerCase()));
            if (uniqueToAdd.length > 0) {
              updated.diagnoses = [...prev.diagnoses, ...uniqueToAdd]
              newHighlighted.push("diagnoses")
            }
          }
          return
        }

        // General Examinations
        if (typedKey === "generalExaminations") {
          if (Array.isArray(value) && value.length > 0) {
            const newItems: GeneralExaminationEntry[] = value.map((i, idx) => ({
              id: `ge-${Date.now()}-${idx}`,
              finding: (i.finding ?? "") as string,
              status: (i.status ?? "") as string,
              severity: (i.severity ?? "") as string,
              notes: (i.notes ?? "") as string,
            }))
            const existingNames = new Set(prev.generalExaminations.map(x => x.finding.toLowerCase()));
            const uniqueToAdd = newItems.filter(x => !existingNames.has(x.finding.toLowerCase()));
            if (uniqueToAdd.length > 0) {
              updated.generalExaminations = [...prev.generalExaminations, ...uniqueToAdd]
              newHighlighted.push("generalExaminations")
            }
          }
          return
        }

        // Past Medical Histories
        if (typedKey === "pastMedicalHistories") {
          if (Array.isArray(value) && value.length > 0) {
            const newItems: PastMedicalHistoryEntry[] = value.map((i, idx) => ({
              id: `pmh-${Date.now()}-${idx}`,
              disease: (i.disease ?? "") as string,
              duration: (i.duration ?? "") as string,
              status: (i.status ?? "") as string,
              notes: (i.notes ?? "") as string,
            }))
            const existingNames = new Set(prev.pastMedicalHistories.map(x => x.disease.toLowerCase()));
            const uniqueToAdd = newItems.filter(x => !existingNames.has(x.disease.toLowerCase()));
            if (uniqueToAdd.length > 0) {
              updated.pastMedicalHistories = [...prev.pastMedicalHistories, ...uniqueToAdd]
              newHighlighted.push("pastMedicalHistories")
            }
          }
          return
        }

        // Investigations
        if (typedKey === "investigations") {
          if (Array.isArray(value) && value.length > 0) {
            const newItems: InvestigationEntry[] = value.map((i, idx) => ({
              id: `inv-${Date.now()}-${idx}`,
              test: (i.test ?? "") as string,
              value: (i.value ?? "") as string,
              notes: (i.notes ?? "") as string,
            }))
            const existingNames = new Set(prev.investigations.map(x => x.test.toLowerCase()));
            const uniqueToAdd = newItems.filter(x => !existingNames.has(x.test.toLowerCase()));
            if (uniqueToAdd.length > 0) {
              updated.investigations = [...prev.investigations, ...uniqueToAdd]
              newHighlighted.push("investigations")
            }
          }
          return
        }

        // Tests Requested
        if (typedKey === "testsRequested") {
          if (Array.isArray(value) && value.length > 0) {
            const newItems: TestRequestedEntry[] = value.map((i, idx) => ({
              id: `test-${Date.now()}-${idx}`,
              name: (i.name ?? "") as string,
              notes: (i.notes ?? "") as string,
            }))
            const existingNames = new Set(prev.testsRequested.map(x => x.name.toLowerCase()));
            const uniqueToAdd = newItems.filter(x => !existingNames.has(x.name.toLowerCase()));
            if (uniqueToAdd.length > 0) {
              updated.testsRequested = [...prev.testsRequested, ...uniqueToAdd]
              newHighlighted.push("testsRequested")
            }
          }
          return
        }

        // Handle primitive fields (only override if AI found something new and current is empty, or if explicitly requested)
        if (value !== null && value !== undefined && value !== "") {
          const currentVal = prev[typedKey];
          // Only update if current is empty to preserve doctor's manual edits, 
          // or if the value is meaningfully different.
          if (!currentVal || currentVal === "") {
            (updated as any)[typedKey] = value;
            newHighlighted.push(typedKey as string)
          }
        }
      })

      return updated
    })

    if (newHighlighted.length > 0) {
      setHighlightedFields(newHighlighted)
      setTimeout(() => setHighlightedFields([]), 2000)
    }
    setAssistantState(isListening ? "listening" : "idle")
  }

  // --- Interval Orchestrator ---
  useEffect(() => {
    let transcribeInterval: NodeJS.Timeout;
    let extractInterval: NodeJS.Timeout;

    if (isListening) {
      setAssistantState("listening");
      // Ping transcription every 3500ms (to stay within Groq 20 RPM limit)
      transcribeInterval = setInterval(() => {
        fetchTranscription();
      }, 3500);

      // Ping extraction every 5000ms using the latest transcript
      extractInterval = setInterval(() => {
        runExtraction(transcriptRef.current);
      }, 5000);
    } else {
      // When stopped, perform one final extraction to ensure completion
      if (transcriptRef.current !== lastExtractedTranscriptRef.current) {
        runExtraction(transcriptRef.current);
      } else {
        setAssistantState("idle");
      }
    }

    return () => {
      clearInterval(transcribeInterval);
      clearInterval(extractInterval);
    };
  }, [isListening, fetchTranscription, runExtraction]);

  const handleStopListening = useCallback(() => {
    stopRecording()
    setActiveVoiceContext({ mode: "GLOBAL" })
  }, [stopRecording])

  const handleMicToggle = useCallback(
    (context: VoiceContext) => {
      // If clicking the same mic while listening, stop it.
      if (isListening && activeVoiceContext.mode === context.mode && activeVoiceContext.field === context.field && activeVoiceContext.component === context.component) {
        handleStopListening()
      } else {
        setActiveVoiceContext(context)
        setTranscript("")
        setExtractedPreview(null)
        lastExtractedTranscriptRef.current = ""

        setTimeout(() => {
          if (context.field) {
            const element = fieldRefs.current.get(context.field)
            if (element) {
              element.focus()
              element.scrollIntoView({ behavior: "smooth", block: "center" })
            }
          }
          startRecording()
          handleUserStartedSpeaking()
        }, 100)
      }
    },
    [isListening, activeVoiceContext, handleStopListening, startRecording, handleUserStartedSpeaking]
  )

  const resetTranscript = useCallback(() => {
    setTranscript("")
    setExtractedPreview(null)
  }, [])

  return {
    transcript,
    isListening,
    isSupported,
    error: recorderError,
    isLoading: assistantState !== "idle" && assistantState !== "listening",
    assistantState,
    highlightedFields,
    activeVoiceContext,
    extractedPreview,
    registerFieldRef,
    handleMicToggle,
    resetTranscript,
    speak,
    startListening: () => handleMicToggle({ mode: "GLOBAL" }),
    stopListening: handleStopListening,
    isAvatarSpeaking
  }
}
