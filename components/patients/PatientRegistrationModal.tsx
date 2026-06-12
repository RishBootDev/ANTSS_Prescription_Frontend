import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Plus, User, Mic, MicOff, Activity, Loader2 } from "lucide-react"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { apiRequest } from "@/lib/api"
import { toast } from "sonner"
import { PatientData, emptyPatientData } from "@/types/patient"
import { getAuthState } from "@/lib/auth"
import { PatientService, RegistrationService } from "@/lib/services"

interface PatientRegistrationModalProps {
  onPatientRegistered: (patient: PatientData) => void;
}

export default function PatientRegistrationModal({ onPatientRegistered }: PatientRegistrationModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [registrationForm, setRegistrationForm] = useState<Omit<PatientData, "id">>(emptyPatientData)
  const [focusFieldKey, setFocusFieldKey] = useState<keyof PatientData | null>(null)
  const [isRegistering, setIsRegistering] = useState(false)

  const {
    transcript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({ lang: "en-US", continuous: true })

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

    if ("focus" in el && typeof (el as HTMLInputElement).focus === "function") {
      ;(el as HTMLInputElement).focus()
      if (el instanceof HTMLInputElement) {
        if (el.type !== "number") {
          const len = el.value.length
          el.setSelectionRange(len, len)
        }
      }
    }
  }, [focusFieldKey])

  const handleRegisterPatient = async () => {
    if (!registrationForm.name) {
      toast.error("Patient name is required");
      return;
    }

    try {
      setIsRegistering(true);
      
      let clinicId: number | null = null;
      let hospitalId: number | null = null;
      let doctorId: string | null = null;

      try {
        const { user } = getAuthState();
        
        if (user?.userType === "DOCTOR") {
          const profileJson = await apiRequest(`/api/doctors/profile`, { method: "GET" });
          if (profileJson.success && profileJson.data) {
            doctorId = profileJson.data.id;
            clinicId = profileJson.data.clinicId;
            hospitalId = profileJson.data.hospitalId;
          }
        } else {
          const doctorsJson = await apiRequest(`/api/doctors`, { method: "GET" });
          if (doctorsJson.success && doctorsJson.data && doctorsJson.data.length > 0) {
            const doc = doctorsJson.data[0];
            doctorId = doc.id; // Actual Doctor ID from the API
            clinicId = doc.clinicId;
            hospitalId = doc.hospitalId;
          }
        }
      } catch (err) {
        console.warn("Could not fetch doctor info", err);
      }

      const patientDataObj = await PatientService.createPatient({
        patientName: registrationForm.name,
        age: registrationForm.age || undefined,
        gender: registrationForm.gender || "",
        mobileNumber: registrationForm.contactNumber || "",
        address: registrationForm.localAddress || "",
        state: registrationForm.state || "",
        city: registrationForm.district || "",
        pincode: registrationForm.pincode || "",
      });
      
      const newPatientId = patientDataObj.patientId;
      if (!newPatientId) {
        throw new Error("Failed to create patient: ID is undefined");
      }
      const registrationPayload: any = {
        registrationNumber: "REG-" + Date.now().toString().slice(-6),
        status: "REGISTERED",
        patient: { patientId: newPatientId },
      };

      if (clinicId) registrationPayload.clinic = { id: clinicId };
      if (hospitalId) registrationPayload.hospital = { id: hospitalId };
      if (doctorId) registrationPayload.doctor = { id: doctorId };

      const regObj = await RegistrationService.createRegistration(registrationPayload);

      const newPatient: PatientData = {
        ...registrationForm,
        id: newPatientId.toString(),
        registrationId: regObj.registrationId,
        visitDate: new Date().toISOString().split("T")[0],
      };

      onPatientRegistered(newPatient);

      toast.success("Patient successfully registered!");

      setRegistrationForm(emptyPatientData);
      setIsOpen(false);
      resetTranscript();
      stopListening();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An error occurred during registration.");
    } finally {
      setIsRegistering(false);
    }
  }

  const wrapWithMic = (_fieldId: string, element: React.ReactElement<{ className?: string }>) => {
    return element
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => {
              setRegistrationForm(emptyPatientData)
              setIsOpen(false)
              stopListening()
              resetTranscript()
            }}>
              Cancel
            </Button>
            <Button onClick={handleRegisterPatient} disabled={!registrationForm.name || isRegistering}>
              {isRegistering ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Registering...
                </span>
              ) : (
                "Register Patient"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
