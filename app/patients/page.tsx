"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Users, 
  Plus, 
  Search, 
  Stethoscope, 
  Mic, 
  MicOff, 
  Loader2,
  User,
  Phone,
  Calendar,
  Syringe,
  Activity
} from "lucide-react"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { getAuthState } from "@/lib/auth"

// Patient data type matching the existing PatientData interface
export interface PatientData {
  id?: string
  name: string | null
  age: number | null
  gender: string | null
  weight: number | null
  height: number | null
  bloodPressureSystolic: number | null
  bloodPressureDiastolic: number | null
  pulse: number | null
  temperature: number | null
  oxygenSaturation: number | null
  bloodGroup: string | null
  lmp: string | null
  visitDate: string | null

  state: string | null
  district: string | null
  pincode: string | null
  localAddress: string | null

  allergies: string | null
  currentMedications: string | null
  chiefComplaint: string | null
  symptoms: string | null
  medicalHistory: string | null

  quickNotes: string | null
  complaints: ComplaintEntry[]
  generalExamination: string | null
  diagnoses: DiagnosisEntry[]

  advice: string | null
  testsRequested: string | null
  nextVisit: string | null
  investigations: string | null
  payment: string | null
  followUp: string | null

  contactNumber: string | null
  emergencyContact: string | null
  insuranceId: string | null

  medicines: MedicineEntry[]
}

export interface MedicineEntry {
  id: string
  name: string
  dose: string
  frequency: string
  duration: string
  instructions: string
}

export interface ComplaintEntry {
  id: string
  complaint: string
  frequency: string | null
  severity: string | null
  duration: string | null
  date: string | null
}

export interface DiagnosisEntry {
  id: string
  diagnosis: string
  snomedCode: string | null
  duration: string | null
  date: string | null
}

const emptyPatientData: Omit<PatientData, "id"> = {
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

  state: null,
  district: null,
  pincode: null,
  localAddress: null,

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

// Sample patients data (in production, this would come from a database)
const samplePatients: PatientData[] = [
  {
    id: "1",
    name: "Rajesh Kumar",
    age: 45,
    gender: "Male",
    weight: 70,
    height: 170,
    bloodPressureSystolic: 120,
    bloodPressureDiastolic: 80,
    pulse: 72,
    temperature: 98.6,
    oxygenSaturation: 98,
    bloodGroup: "A+",
    lmp: null,
    visitDate: "2024-01-15",
    state: null,
    district: null,
    pincode: null,
    localAddress: null,
    allergies: "Penicillin",
    currentMedications: "Metformin 500mg",
    chiefComplaint: "Fever and headache",
    symptoms: "Body ache, fatigue",
    medicalHistory: "Diabetes Type 2",
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
    contactNumber: "9876543210",
    emergencyContact: "9876543211",
    insuranceId: "INS123456",
    medicines: [],
  },
  {
    id: "2",
    name: "Priya Sharma",
    age: 32,
    gender: "Female",
    weight: 58,
    height: 160,
    bloodPressureSystolic: 110,
    bloodPressureDiastolic: 70,
    pulse: 75,
    temperature: 99.1,
    oxygenSaturation: 99,
    bloodGroup: "B+",
    lmp: "2024-01-01",
    visitDate: "2024-01-15",
    state: null,
    district: null,
    pincode: null,
    localAddress: null,
    allergies: "None",
    currentMedications: "None",
    chiefComplaint: "Cold and cough",
    symptoms: "Sore throat, runny nose",
    medicalHistory: "No chronic conditions",
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
    contactNumber: "9123456780",
    emergencyContact: "9123456781",
    insuranceId: "INS789012",
    medicines: [],
  },
  {
    id: "3",
    name: "Amit Patel",
    age: 55,
    gender: "Male",
    weight: 80,
    height: 175,
    bloodPressureSystolic: 140,
    bloodPressureDiastolic: 90,
    pulse: 80,
    temperature: 98.4,
    oxygenSaturation: 97,
    bloodGroup: "O+",
    lmp: null,
    visitDate: "2024-01-14",
    state: null,
    district: null,
    pincode: null,
    localAddress: null,
    allergies: "Sulfa drugs",
    currentMedications: "Atenolol 50mg, Aspirin 75mg",
    chiefComplaint: "Chest discomfort",
    symptoms: "Shortness of breath",
    medicalHistory: "Hypertension, Heart disease",
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
    contactNumber: "9988776655",
    emergencyContact: "9988776644",
    insuranceId: "INS345678",
    medicines: [],
  },
]

export default function PatientsPage() {
  const router = useRouter()
  const [patients, setPatients] = useState<PatientData[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [genderFilter, setGenderFilter] = useState<string>("all")
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false)
  const [registrationForm, setRegistrationForm] = useState<Omit<PatientData, "id">>(emptyPatientData)
  const [activeVoiceField, setActiveVoiceField] = useState<string | null>(null)
  const [focusFieldKey, setFocusFieldKey] = useState<keyof PatientData | null>(null)

  useEffect(() => {
    const auth = getAuthState()
    if (!auth.isAuthenticated) router.replace("/login")
  }, [router])

  const {
    transcript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({ lang: "en-US", continuous: true })

  // isProcessing is not needed for registration form voice input
  const isProcessing = false

  // Load patients from localStorage or use sample data
  useEffect(() => {
    const storedPatients = localStorage.getItem("patients")
    if (storedPatients) {
      setPatients(JSON.parse(storedPatients))
    } else {
      setPatients(samplePatients)
      localStorage.setItem("patients", JSON.stringify(samplePatients))
    }
  }, [])

  // Process voice input for registration form (AI extraction)
  useEffect(() => {
    if (!transcript || !isListening || !transcript.trim()) return

    const controller = new AbortController()
    const text = transcript.trim()

    const fieldsToCopy: (keyof PatientData)[] = [
      "name",
      "age",
      "gender",
      "weight",
      "height",
      "bloodPressureSystolic",
      "bloodPressureDiastolic",
      "pulse",
      "temperature",
      "oxygenSaturation",
      "bloodGroup",
      "visitDate",
      "contactNumber",
    ]

    const timer = setTimeout(async () => {
      try {
        const response = await fetch("/api/extract-patient", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
          signal: controller.signal,
        })

        const data: unknown = await response.json()
        if (!data || typeof data !== "object" || !("result" in data)) return

        const responseObj = data as {
          result?: Partial<Record<keyof PatientData, unknown>>
        }

        const extracted = responseObj.result
        if (!extracted || typeof extracted !== "object") return

        // Choose first filled field for focus (priority order)
        const focusPriority: (keyof PatientData)[] = [
          "name",
          "age",
          "weight",
          "height",
          "bloodPressureSystolic",
          "bloodPressureDiastolic",
          "pulse",
          "temperature",
          "oxygenSaturation",
          "bloodGroup",
          "contactNumber",
          "visitDate",
        ]

        let firstFilled: keyof PatientData | null = null
        for (const key of focusPriority) {
          const v = extracted[key]
          if (v !== null && v !== undefined) {
            firstFilled = key
            break
          }
        }

        if (firstFilled) setFocusFieldKey(firstFilled)

        setRegistrationForm((prev) => {
          const updated: Omit<PatientData, "id"> = { ...prev }

          fieldsToCopy.forEach((key) => {
            const value = extracted[key]
            if (value !== null && value !== undefined) {
              ;(updated as Record<string, unknown>)[key as string] = value
            }
          })

          return updated
        })
      } catch (e) {
        // Swallow aborts; other errors should not break the UI
        if (e instanceof Error && e.name === "AbortError") return
        console.error("Failed to extract patient (registration):", e)
      }
    }, 1500)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [transcript, isListening])

  useEffect(() => {
    if (!focusFieldKey) return
    const id = `reg-${String(focusFieldKey)}`
    const el = document.getElementById(id)
    if (!el) return

    // Focus only if focusable (inputs will be)
    if ("focus" in el && typeof (el as HTMLInputElement).focus === "function") {
      ;(el as HTMLInputElement).focus()
      // Move cursor to end for text fields
      if (el instanceof HTMLInputElement) {
        // selection range isn't supported for input type="number"
        if (el.type !== "number") {
          const len = el.value.length
          el.setSelectionRange(len, len)
        }
      }
    }
  }, [focusFieldKey])

  // Filter patients based on search and gender
  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = !searchQuery || 
      patient.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.contactNumber?.includes(searchQuery) ||
      patient.id?.includes(searchQuery)

    const matchesGender = genderFilter === "all" || patient.gender === genderFilter

    return matchesSearch && matchesGender
  })

  // Handle patient registration
  const handleRegisterPatient = () => {
    const newPatient: PatientData = {
      ...registrationForm,
      id: crypto.randomUUID(),
      visitDate: new Date().toISOString().split('T')[0],
    }

    const updatedPatients = [...patients, newPatient]
    setPatients(updatedPatients)
    localStorage.setItem("patients", JSON.stringify(updatedPatients))
    
    // Reset form and close dialog
    setRegistrationForm(emptyPatientData)
    setIsRegisterDialogOpen(false)
    resetTranscript()
    stopListening()
  }

  // Handle consult button click - navigate to prescription form with patient data
  const handleConsult = (patient: PatientData) => {
    // Store patient data in localStorage for the consultation page
    localStorage.setItem("currentConsultationPatient", JSON.stringify(patient))
    // Navigate to the consultation form page
    router.push("/consultation")
  }

  // Wrap field with mic button (disabled: registration uses ONLY the central mic)
  const wrapWithMic = (_fieldId: string, element: React.ReactElement<{ className?: string }>) => {
    return element
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Syringe className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Compunder AI</h1>
              <p className="text-xs text-muted-foreground">Patient Management System</p>
            </div>
          </div>

          <nav className="flex items-center gap-4">
            <a 
              href="/" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </a>
            <a 
              href="/patients" 
              className="text-sm font-medium text-primary"
            >
              Patients
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-6 relative">
        {/* Blurred doctor background for next-gen look */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/doctor-bg.png')] bg-no-repeat bg-[length:700px_700px] bg-[position:45%_18%] opacity-40 blur-4xl" aria-hidden="true" />
          <div className="absolute inset-0 bg-background/40 dark:bg-background/30" aria-hidden="true" />
          <div className="absolute inset-0 bg-black/10 dark:bg-black/20" aria-hidden="true" />
        </div>

        <div className="relative z-10">
        {/* Page Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-6 w-6" />
              Patient List
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and consult patients
            </p>
          </div>

          {/* Register Patient Button */}
          <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Register Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Register New Patient
                </DialogTitle>
              </DialogHeader>

              <div className="mt-4 space-y-6">
                {/* Central Voice Input Section */}
                <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border-2 border-dashed border-primary/30">
                     <div className="flex items-center gap-4 mb-3">
                    <Button
                      size="lg"
                      variant={isListening ? "destructive" : "default"}
                      onClick={() => {
                        if (isListening) {
                          stopListening()
                        } else {
                          resetTranscript()
                          startListening()
                        }
                      }}
                      disabled={!isSupported}
                      className="h-16 w-16 rounded-full"
                    >
                      {isListening ? (
                        <MicOff className="h-8 w-8" />
                      ) : (
                        <Mic className="h-8 w-8" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm font-medium text-center mb-2">
                    {isListening ? (
                      <span className="text-red-500 animate-pulse">Listening... Speak patient details</span>
                    ) : (
                      <span className="text-muted-foreground">Click mic and speak to fill the form</span>
                    )}
                  </p>
                  {transcript && isListening && (
                    <p className="text-xs text-muted-foreground text-center max-w-md">
                      "{transcript}"
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Example: "Name is John Doe, Age 35, Male, Weight 70 kg, BP 120/80"
                  </p>
                </div>

                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Basic Information
                  </h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Name</label>
                      {wrapWithMic("name", (
                        <Input
                          id="reg-name"
                          value={registrationForm.name ?? ""}
                          onChange={(e) => setRegistrationForm(prev => ({ ...prev, name: e.target.value || null }))}
                          placeholder="Patient Name"
                        />
                      ))}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Age</label>
                      {wrapWithMic("age", (
                          <Input
                            id="reg-age"
                            type="number"
                            value={registrationForm.age ?? ""}
                            onChange={(e) => setRegistrationForm(prev => ({ ...prev, age: e.target.value ? Number(e.target.value) : null }))}
                            placeholder="Age"
                          />
                      ))}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Gender</label>
                      <Select
                        value={registrationForm.gender ?? ""}
                        onValueChange={(v) => setRegistrationForm(prev => ({ ...prev, gender: v || null }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Contact Number</label>
                      {wrapWithMic("contactNumber", (
                        <Input
                          id="reg-contactNumber"
                          value={registrationForm.contactNumber ?? ""}
                          onChange={(e) => setRegistrationForm(prev => ({ ...prev, contactNumber: e.target.value || null }))}
                          placeholder="Phone Number"
                        />
                      ))}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Blood Group</label>
                      {wrapWithMic("bloodGroup", (
                        <Select
                          value={registrationForm.bloodGroup ?? ""}
                          onValueChange={(v) => setRegistrationForm(prev => ({ ...prev, bloodGroup: v || null }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select blood group" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A+">A+</SelectItem>
                            <SelectItem value="A-">A-</SelectItem>
                            <SelectItem value="B+">B+</SelectItem>
                            <SelectItem value="B-">B-</SelectItem>
                            <SelectItem value="O+">O+</SelectItem>
                            <SelectItem value="O-">O-</SelectItem>
                            <SelectItem value="AB+">AB+</SelectItem>
                            <SelectItem value="AB-">AB-</SelectItem>
                          </SelectContent>
                        </Select>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Visit Date</label>
                      <Input
                        type="date"
                        value={registrationForm.visitDate ?? ""}
                        onChange={(e) => setRegistrationForm(prev => ({ ...prev, visitDate: e.target.value || null }))}
                      />
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="space-y-4 pt-1">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-primary font-bold">
                        A
                      </span>
                      Address
                    </h3>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">State</label>
                        <Input
                          id="reg-state"
                          value={registrationForm.state ?? ""}
                          onChange={(e) => setRegistrationForm(prev => ({ ...prev, state: e.target.value || null }))}
                          placeholder="State"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">District</label>
                        <Input
                          id="reg-district"
                          value={registrationForm.district ?? ""}
                          onChange={(e) => setRegistrationForm(prev => ({ ...prev, district: e.target.value || null }))}
                          placeholder="District"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Pincode</label>
                        <Input
                          id="reg-pincode"
                          value={registrationForm.pincode ?? ""}
                          onChange={(e) => {
                            const v = e.target.value.replace(/\D/g, "").slice(0, 6)
                            setRegistrationForm(prev => ({ ...prev, pincode: v ? v : null }))
                          }}
                          placeholder="Pincode"
                          inputMode="numeric"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Local Address</label>
                      <Input
                        id="reg-localAddress"
                        value={registrationForm.localAddress ?? ""}
                        onChange={(e) => setRegistrationForm(prev => ({ ...prev, localAddress: e.target.value || null }))}
                        placeholder="House no, street, area..."
                      />
                    </div>
                  </div>
                </div>

                {/* Vitals */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Vitals
                  </h3>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Weight (kg)</label>
                      {wrapWithMic("weight", (
                        <Input
                          id="reg-weight"
                          type="number"
                          value={registrationForm.weight ?? ""}
                          onChange={(e) => setRegistrationForm(prev => ({ ...prev, weight: e.target.value ? Number(e.target.value) : null }))}
                          placeholder="Weight"
                        />
                      ))}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Height (cm)</label>
                      {wrapWithMic("height", (
                        <Input
                          id="reg-height"
                          type="number"
                          value={registrationForm.height ?? ""}
                          onChange={(e) => setRegistrationForm(prev => ({ ...prev, height: e.target.value ? Number(e.target.value) : null }))}
                          placeholder="Height"
                        />
                      ))}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">BP (Systolic/Diastolic)</label>
                      {wrapWithMic("bp", (
                        <Input
                          placeholder="120/80"
                          value={registrationForm.bloodPressureSystolic && registrationForm.bloodPressureDiastolic 
                            ? `${registrationForm.bloodPressureSystolic}/${registrationForm.bloodPressureDiastolic}` 
                            : ""}
                          onChange={(e) => {
                            const match = e.target.value.match(/(\d+)\s*[/\-]\s*(\d+)/)
                            if (match) {
                              setRegistrationForm(prev => ({ 
                                ...prev, 
                                bloodPressureSystolic: parseInt(match[1]),
                                bloodPressureDiastolic: parseInt(match[2])
                              }))
                            }
                          }}
                        />
                      ))}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Pulse (bpm)</label>
                      {wrapWithMic("pulse", (
                        <Input
                          type="number"
                          value={registrationForm.pulse ?? ""}
                          onChange={(e) => setRegistrationForm(prev => ({ ...prev, pulse: e.target.value ? Number(e.target.value) : null }))}
                          placeholder="Pulse"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Temperature (°F)</label>
                      {wrapWithMic("temperature", (
                        <Input
                          type="number"
                          step="0.1"
                          value={registrationForm.temperature ?? ""}
                          onChange={(e) => setRegistrationForm(prev => ({ ...prev, temperature: e.target.value ? Number(e.target.value) : null }))}
                          placeholder="98.6"
                        />
                      ))}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">SpO2 (%)</label>
                      {wrapWithMic("spo2", (
                        <Input
                          type="number"
                          value={registrationForm.oxygenSaturation ?? ""}
                          onChange={(e) => setRegistrationForm(prev => ({ ...prev, oxygenSaturation: e.target.value ? Number(e.target.value) : null }))}
                          placeholder="98"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => {
                    setRegistrationForm(emptyPatientData)
                    setIsRegisterDialogOpen(false)
                    stopListening()
                    resetTranscript()
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleRegisterPatient} disabled={!registrationForm.name}>
                    Register Patient
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter */}
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={genderFilter} onValueChange={setGenderFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Genders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genders</SelectItem>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Patient List Table */}
        <Card>
          <CardContent className="p-0">
            {filteredPatients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No patients found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchQuery || genderFilter !== "all" 
                    ? "Try adjusting your search or filters" 
                    : "Register your first patient to get started"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Blood Group</TableHead>
                      <TableHead>Last Visit</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-mono text-sm">
                          {patient.id?.slice(0, 8) || "N/A"}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            {patient.name}
                          </div>
                        </TableCell>
                        <TableCell>{patient.age || "N/A"}</TableCell>
                        <TableCell>{patient.gender || "N/A"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {patient.contactNumber || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                            {patient.bloodGroup || "N/A"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {patient.visitDate || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => handleConsult(patient)}
                            className="gap-2"
                          >
                            <Stethoscope className="h-4 w-4" />
                            Consult
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{patients.length}</p>
                  <p className="text-sm text-muted-foreground">Total Patients</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {patients.filter(p => p.gender === "Male").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Male Patients</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {patients.filter(p => p.gender === "Female").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Female Patients</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Stethoscope className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {patients.filter(p => p.visitDate === new Date().toISOString().split('T')[0]).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Today's Visits</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </main>
    </div>
  )
}
