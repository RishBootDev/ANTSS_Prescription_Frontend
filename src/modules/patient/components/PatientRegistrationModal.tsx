"use client";

import { useEffect, useState } from "react";
import type React from "react";
import { useRouter } from "next/navigation";
import { Activity, Loader2, Mic, MicOff, Plus, User } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { doctorService } from "@/src/services/doctor.service";
import { patientService } from "@/src/services/patient.service";
import { prescriptionService } from "@/src/services/prescription.service";
import { useAuthStore } from "@/src/store/authStore";

import { PatientData, emptyPatientData } from "../types";
import { PatientResponse } from "../../../../types/backend";

interface PatientRegistrationModalProps {
  onPatientRegistered: (patient: PatientData) => void;
}

export default function PatientRegistrationModal({ onPatientRegistered }: PatientRegistrationModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [registrationForm, setRegistrationForm] = useState<Omit<PatientData, "id">>({
    ...emptyPatientData,
    visitDate: new Date().toISOString().split("T")[0],
  });
  const [focusFieldKey, setFocusFieldKey] = useState<keyof PatientData | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isPrefilling, setIsPrefilling] = useState(false);

  const {
    transcript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({ lang: "en-US", continuous: true });

  useEffect(() => {
    if (!transcript || !isListening || !transcript.trim()) return;

    const controller = new AbortController();
    const text = transcript.trim();

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
      "visitDate",
      "contactNumber",
      "dateOfBirth",
    ];

    const timer = setTimeout(async () => {
      try {
        const response = await fetch("/api/extract-patient", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
          signal: controller.signal,
        });

        const data: any = await response.json();
        const extracted = data?.result;
        if (!extracted || typeof extracted !== "object") return;

        const focusPriority: (keyof PatientData)[] = [
          "name",
          "contactNumber",
          "dateOfBirth",
          "age",
          "gender",
          "weight",
          "height",
          "bloodPressureSystolic",
          "bloodPressureDiastolic",
          "pulse",
          "temperature",
          "oxygenSaturation",
          "visitDate",
        ];

        const firstFilled = focusPriority.find((key) => extracted[key] !== null && extracted[key] !== undefined);
        if (firstFilled) setFocusFieldKey(firstFilled);

        setRegistrationForm((prev) => {
          const updated: Omit<PatientData, "id"> = { ...prev };
          fieldsToCopy.forEach((key) => {
            const value = extracted[key];
            if (value !== null && value !== undefined) {
              (updated as any)[key] = value;
            }
          });
          return updated;
        });
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        console.error("Failed to extract patient registration details:", e);
      }
    }, 1500);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [transcript, isListening]);

  useEffect(() => {
    if (!focusFieldKey) return;
    const el = document.getElementById(`reg-${String(focusFieldKey)}`);
    if (!el || !("focus" in el)) return;

    (el as HTMLInputElement).focus();
    if (el instanceof HTMLInputElement && el.type !== "number") {
      const len = el.value.length;
      el.setSelectionRange(len, len);
    }
  }, [focusFieldKey]);

  useEffect(() => {
    const mobile = registrationForm.contactNumber;
    if (!isOpen || !mobile || mobile.length !== 10) return;

    const timer = setTimeout(async () => {
      setIsPrefilling(true);
      try {
        const patients = await patientService.getAllRegistrations();
        const match = (Array.isArray(patients) ? patients : []).find((patient) => patient.mobileNumber === mobile);
        if (match) {
          prefillFromExistingPatient(match);
          toast.info("Existing patient found. Form has been filled from the patient record.");
        }
      } catch (err) {
        console.warn("Could not prefill patient from mobile number", err);
      } finally {
        setIsPrefilling(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [registrationForm.contactNumber, isOpen]);

  const setField = <K extends keyof Omit<PatientData, "id">>(field: K, value: Omit<PatientData, "id">[K]) => {
    setRegistrationForm((prev) => ({ ...prev, [field]: value }));
  };

  const prefillFromExistingPatient = (patient: PatientResponse) => {
    setRegistrationForm((prev) => ({
      ...prev,
      name: patient.patientName || prev.name,
      age: patient.age ?? prev.age,
      gender: patient.gender || prev.gender,
      contactNumber: patient.mobileNumber || prev.contactNumber,
      dateOfBirth: patient.dateOfBirth || prev.dateOfBirth,
      localAddress: patient.address || prev.localAddress,
      state: patient.state || prev.state,
      district: patient.city || prev.district,
      pincode: patient.pincode || prev.pincode,
    }));
  };

  const handleDobChange = (dob: string) => {
    setRegistrationForm((prev) => {
      const updated = { ...prev, dateOfBirth: dob || null };
      if (dob) {
        const birthDate = new Date(dob);
        const today = new Date();
        let calculatedAge = today.getFullYear() - birthDate.getFullYear();
        const monthDelta = today.getMonth() - birthDate.getMonth();
        if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birthDate.getDate())) {
          calculatedAge--;
        }
        if (calculatedAge >= 0 && calculatedAge <= 150) {
          updated.age = calculatedAge;
        }
      }
      return updated;
    });
  };

  const validateForm = () => {
    if (!registrationForm.name?.trim()) {
      toast.error("Patient name is required");
      return false;
    }
    if (registrationForm.name.length > 100) {
      toast.error("Patient name must be 100 characters or less");
      return false;
    }
    if (registrationForm.contactNumber && !/^[6-9][0-9]{9}$/.test(registrationForm.contactNumber)) {
      toast.error("Mobile number must be a valid 10-digit number starting with 6-9");
      return false;
    }
    if (!registrationForm.gender) {
      toast.error("Gender is required");
      return false;
    }
    if (registrationForm.age !== null && (registrationForm.age < 0 || registrationForm.age > 150)) {
      toast.error("Age must be between 0 and 150");
      return false;
    }
    if (registrationForm.pincode && !/^[1-9][0-9]{5}$/.test(registrationForm.pincode)) {
      toast.error("Pincode must be a valid 6-digit number starting with 1-9");
      return false;
    }
    return true;
  };

  const resolveFacility = async () => {
    const { user } = useAuthStore.getState();
    let clinicId = user?.clinicId;
    let hospitalId = user?.hospitalId;

    if (!clinicId && !hospitalId) {
      try {
        if (user?.userType === "DOCTOR" || user?.role === "DOCTOR" || user?.role === "ROLE_DOCTOR") {
          const profileResponse = await doctorService.getDoctorProfile();
          const profile = profileResponse?.data ?? profileResponse;
          if (profile) {
            clinicId = profile.clinicId;
            hospitalId = profile.hospitalId;
          }
        } else {
          const doctorsResponse = await doctorService.listDoctors();
          const doctors = doctorsResponse?.data ?? doctorsResponse;
          const doctor = Array.isArray(doctors) ? doctors[0] : null;
          clinicId = doctor?.clinicId;
          hospitalId = doctor?.hospitalId;
        }
      } catch (err) {
        console.warn("Could not resolve facility from doctor profile", err);
      }
    }

    return { clinicId, hospitalId };
  };

  const resetAndClose = () => {
    setRegistrationForm({
      ...emptyPatientData,
      visitDate: new Date().toISOString().split("T")[0],
    });
    setIsOpen(false);
    stopListening();
    resetTranscript();
  };

  const handleRegisterPatient = async () => {
    if (!validateForm()) return;

    try {
      setIsRegistering(true);
      const { clinicId, hospitalId } = await resolveFacility();

      if (!clinicId && !hospitalId) {
        toast.error("No clinic or hospital is linked to this account.");
        return;
      }

      const registrationPayload: any = {
        status: "REGISTERED",
        patient: {
          patientName: registrationForm.name!.trim(),
          mobileNumber: registrationForm.contactNumber || "",
          gender: registrationForm.gender!,
          age: registrationForm.age ?? 0,
          dateOfBirth: registrationForm.dateOfBirth || "",
          address: registrationForm.localAddress || "",
          state: registrationForm.state || "",
          city: registrationForm.district || "",
          pincode: registrationForm.pincode || "",
        },
      };

      if (clinicId) registrationPayload.clinicId = clinicId;
      if (hospitalId) registrationPayload.hospitalId = hospitalId;

      const registrationResponse = await patientService.createRegistration(registrationPayload);
      const regObj = (registrationResponse as any)?.data ?? registrationResponse;
      const patient = regObj;

      try {
        await prescriptionService.savePrescription({
          registrationId: regObj.registrationId,
          complaints: [],
          generalExaminations: [],
          pastMedicalHistories: [],
          diagnoses: [],
          diagnostics: [],
          documents: [],
          medicines: [],
        } as any);
      } catch (err) {
        console.error("Failed to auto-create consultation", err);
      }

      const currentPatient = {
        id: String(patient.patientId || regObj.registrationId),
        registrationId: regObj.registrationId,
        registrationNumber: regObj.registrationNumber,
        name: patient.patientName,
        age: patient.age,
        gender: patient.gender,
        contactNumber: patient.mobileNumber,
        weight: registrationForm.weight,
        height: registrationForm.height,
        bloodPressureSystolic: registrationForm.bloodPressureSystolic,
        bloodPressureDiastolic: registrationForm.bloodPressureDiastolic,
        pulse: registrationForm.pulse,
        temperature: registrationForm.temperature,
        oxygenSaturation: registrationForm.oxygenSaturation,
        dateOfBirth: patient.dateOfBirth,
        localAddress: patient.address,
        state: patient.state,
        district: patient.city,
        pincode: patient.pincode,
      };
      localStorage.setItem("currentConsultationPatient", JSON.stringify(currentPatient));

      const newPatient: PatientData = {
        ...registrationForm,
        id: String(patient.patientId || regObj.registrationId),
        name: patient.patientName,
        age: patient.age,
        gender: patient.gender,
        contactNumber: patient.mobileNumber,
        localAddress: patient.address || null,
        state: patient.state || null,
        district: patient.city || null,
        pincode: patient.pincode || null,
        dateOfBirth: patient.dateOfBirth || null,
        registrationId: regObj.registrationId,
        registrationNumber: regObj.registrationNumber,
        visitDate: registrationForm.visitDate || new Date().toISOString().split("T")[0],
      };

      onPatientRegistered(newPatient);
      toast.success("Patient registration created successfully");
      resetAndClose();
      router.push("/consultation");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An error occurred during registration.");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button" className="gap-2">
          <Plus className="h-4 w-4" />
          Register Patient
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] w-[95vw] max-w-5xl overflow-y-auto sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Register Patient
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4">
            <Button
              size="lg"
              variant={isListening ? "destructive" : "default"}
              onClick={() => {
                if (isListening) {
                  stopListening();
                } else {
                  resetTranscript();
                  startListening();
                }
              }}
              disabled={!isSupported}
              className="mb-3 h-16 w-16 rounded-full"
            >
              {isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
            </Button>
            <p className="text-center text-sm font-medium">
              {isListening ? (
                <span className="animate-pulse text-red-500">Listening... Speak patient details</span>
              ) : (
                <span className="text-muted-foreground">Click mic and speak to fill the form</span>
              )}
            </p>
            {transcript && isListening && (
              <p className="mt-2 max-w-md text-center text-xs text-muted-foreground">"{transcript}"</p>
            )}
          </div>

          <section className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <User className="h-4 w-4" />
              Patient Details
              {isPrefilling && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Name *">
                <Input
                  id="reg-name"
                  value={registrationForm.name ?? ""}
                  onChange={(e) => setField("name", e.target.value || null)}
                  placeholder="Patient name"
                  maxLength={100}
                />
              </Field>
              <Field label="Mobile Number">
                <Input
                  id="reg-contactNumber"
                  value={registrationForm.contactNumber ?? ""}
                  onChange={(e) => setField("contactNumber", e.target.value.replace(/\D/g, "").slice(0, 10) || null)}
                  placeholder="10-digit mobile"
                  inputMode="numeric"
                  maxLength={10}
                />
              </Field>
              <Field label="Gender *">
                <Select
                  value={registrationForm.gender ?? ""}
                  onValueChange={(value) => setField("gender", value || null)}
                >
                  <SelectTrigger id="reg-gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Date of Birth">
                <Input
                  id="reg-dateOfBirth"
                  type="date"
                  value={registrationForm.dateOfBirth ?? ""}
                  onChange={(e) => handleDobChange(e.target.value)}
                />
              </Field>
              <Field label="Age">
                <Input
                  id="reg-age"
                  type="number"
                  value={registrationForm.age ?? ""}
                  onChange={(e) => setField("age", e.target.value ? Number(e.target.value) : null)}
                  placeholder="Age"
                  min={0}
                  max={150}
                />
              </Field>
              <Field label="Visit Date">
                <Input
                  id="reg-visitDate"
                  type="date"
                  value={registrationForm.visitDate ?? ""}
                  onChange={(e) => setField("visitDate", e.target.value || null)}
                />
              </Field>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold">Address</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="State">
                <Input
                  id="reg-state"
                  value={registrationForm.state ?? ""}
                  onChange={(e) => setField("state", e.target.value || null)}
                  placeholder="State"
                  maxLength={100}
                />
              </Field>
              <Field label="District/City">
                <Input
                  id="reg-district"
                  value={registrationForm.district ?? ""}
                  onChange={(e) => setField("district", e.target.value || null)}
                  placeholder="District or city"
                  maxLength={100}
                />
              </Field>
              <Field label="Pincode">
                <Input
                  id="reg-pincode"
                  value={registrationForm.pincode ?? ""}
                  onChange={(e) => setField("pincode", e.target.value.replace(/\D/g, "").slice(0, 6) || null)}
                  placeholder="Pincode"
                  inputMode="numeric"
                  maxLength={6}
                />
              </Field>
            </div>
            <Field label="Local Address">
              <Input
                id="reg-localAddress"
                value={registrationForm.localAddress ?? ""}
                onChange={(e) => setField("localAddress", e.target.value || null)}
                placeholder="House no, street, area"
                maxLength={255}
              />
            </Field>
          </section>

          <section className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Activity className="h-4 w-4" />
              Vitals For This Visit
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <NumberField label="Height" field="height" value={registrationForm.height} setField={setField} />
              <NumberField label="Weight" field="weight" value={registrationForm.weight} setField={setField} />
              <NumberField label="Pulse" field="pulse" value={registrationForm.pulse} setField={setField} />
              <NumberField label="Temperature" field="temperature" value={registrationForm.temperature} setField={setField} />
              <NumberField label="SpO2" field="oxygenSaturation" value={registrationForm.oxygenSaturation} setField={setField} />
              <NumberField label="BP Systolic" field="bloodPressureSystolic" value={registrationForm.bloodPressureSystolic} setField={setField} />
              <NumberField label="BP Diastolic" field="bloodPressureDiastolic" value={registrationForm.bloodPressureDiastolic} setField={setField} />
            </div>
          </section>

          <div className="flex justify-end gap-3 border-t pt-4">
            <Button type="button" variant="outline" onClick={resetAndClose}>
              Cancel
            </Button>
            <Button type="button" onClick={handleRegisterPatient} disabled={isRegistering}>
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
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function NumberField({
  label,
  field,
  value,
  setField,
}: {
  label: string;
  field: keyof Omit<PatientData, "id">;
  value: number | null;
  setField: <K extends keyof Omit<PatientData, "id">>(field: K, value: Omit<PatientData, "id">[K]) => void;
}) {
  return (
    <Field label={label}>
      <Input
        id={`reg-${String(field)}`}
        type="number"
        value={value ?? ""}
        onChange={(e) => setField(field, (e.target.value ? Number(e.target.value) : null) as any)}
        placeholder={label}
      />
    </Field>
  );
}
