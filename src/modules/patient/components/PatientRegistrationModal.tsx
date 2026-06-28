import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Plus, User, Mic, MicOff, Activity, Loader2, Search } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { toast } from "sonner";
import { PatientData, emptyPatientData } from "../types";
import { useAuthStore } from "@/src/store/authStore";
import { patientService } from "@/src/services/patient.service";
import { doctorService } from "@/src/services/doctor.service";
import { prescriptionService } from "@/src/services/prescription.service";
import { PatientResponse } from "../../../../types/backend";

interface PatientRegistrationModalProps {
  onPatientRegistered: (patient: PatientData) => void;
}

export default function PatientRegistrationModal({ onPatientRegistered }: PatientRegistrationModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("new");

  // Form State
  const [registrationForm, setRegistrationForm] = useState<Omit<PatientData, "id">>(emptyPatientData);
  const [focusFieldKey, setFocusFieldKey] = useState<keyof PatientData | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // Existing Patient Search State
  const [existingPatients, setExistingPatients] = useState<PatientResponse[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientResponse | null>(null);
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);

  const {
    transcript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({ lang: "en-US", continuous: true });

  // Load existing patients list when dialog is open and tab is "existing"
  useEffect(() => {
    if (isOpen && activeTab === "existing") {
      const loadPatients = async () => {
        setIsLoadingPatients(true);
        try {
          const data = await patientService.getAllPatients();
          setExistingPatients(Array.isArray(data) ? data : (data as any)?.data || []);
        } catch (err) {
          console.error("Failed to load existing patients list", err);
          toast.error("Failed to retrieve patients list");
        } finally {
          setIsLoadingPatients(false);
        }
      };
      loadPatients();
    }
  }, [isOpen, activeTab]);

  // Process voice input for registration form (AI extraction)
  useEffect(() => {
    if (activeTab !== "new") return;
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
        if (!data || typeof data !== "object" || !("result" in data)) return;

        const extracted = data.result;
        if (!extracted || typeof extracted !== "object") return;

        const focusPriority: (keyof PatientData)[] = [
          "name",
          "dateOfBirth",
          "age",
          "weight",
          "height",
          "bloodPressureSystolic",
          "bloodPressureDiastolic",
          "pulse",
          "temperature",
          "oxygenSaturation",
          "contactNumber",
          "visitDate",
        ];

        let firstFilled: keyof PatientData | null = null;
        for (const key of focusPriority) {
          const v = extracted[key];
          if (v !== null && v !== undefined) {
            firstFilled = key;
            break;
          }
        }

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
        console.error("Failed to extract patient (registration):", e);
      }
    }, 1500);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [transcript, isListening, activeTab]);

  useEffect(() => {
    if (!focusFieldKey) return;
    const id = `reg-${String(focusFieldKey)}`;
    const el = document.getElementById(id);
    if (!el) return;

    if ("focus" in el && typeof (el as HTMLInputElement).focus === "function") {
      (el as HTMLInputElement).focus();
      if (el instanceof HTMLInputElement) {
        if (el.type !== "number") {
          const len = el.value.length;
          el.setSelectionRange(len, len);
        }
      }
    }
  }, [focusFieldKey]);

  // Handle Date of Birth change and compute Age
  const handleDobChange = (dob: string) => {
    setRegistrationForm((prev) => {
      const updated = { ...prev, dateOfBirth: dob || null };
      if (dob) {
        const birthDate = new Date(dob);
        const today = new Date();
        let calculatedAge = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          calculatedAge--;
        }
        if (calculatedAge >= 0 && calculatedAge <= 150) {
          updated.age = calculatedAge;
        }
      }
      return updated;
    });
  };

  const handleRegisterPatient = async () => {
    const isExisting = activeTab === "existing";

    if (isExisting) {
      if (!selectedPatient) {
        toast.error("Please select an existing patient");
        return;
      }
    } else {
      // New patient validations matching backend constraints
      if (!registrationForm.name || !registrationForm.name.trim()) {
        toast.error("Patient name is required");
        return;
      }
      if (registrationForm.name.length > 100) {
        toast.error("Patient name must be 100 characters or less");
        return;
      }
      if (!registrationForm.gender) {
        toast.error("Gender is required");
        return;
      }
      if (registrationForm.gender.length > 20) {
        toast.error("Gender must be 20 characters or less");
        return;
      }
      if (registrationForm.age !== null && (registrationForm.age < 0 || registrationForm.age > 150)) {
        toast.error("Age must be between 0 and 150");
        return;
      }
      if (registrationForm.contactNumber) {
        const phoneRegex = /^[6-9][0-9]{9}$/;
        if (!phoneRegex.test(registrationForm.contactNumber)) {
          toast.error("Contact number must be a valid 10-digit mobile number starting with 6-9");
          return;
        }
      }
      if (registrationForm.pincode) {
        const pincodeRegex = /^[1-9][0-9]{5}$/;
        if (!pincodeRegex.test(registrationForm.pincode)) {
          toast.error("Pincode must be a valid 6-digit number starting with 1-9");
          return;
        }
      }
      if (registrationForm.dateOfBirth && registrationForm.dateOfBirth.length > 20) {
        toast.error("Date of birth length cannot exceed 20 characters");
        return;
      }
      if (registrationForm.localAddress && registrationForm.localAddress.length > 255) {
        toast.error("Local address must be 255 characters or less");
        return;
      }
      if (registrationForm.state && registrationForm.state.length > 100) {
        toast.error("State must be 100 characters or less");
        return;
      }
      if (registrationForm.district && registrationForm.district.length > 100) {
        toast.error("District/City must be 100 characters or less");
        return;
      }
    }

    try {
      setIsRegistering(true);

      const { user } = useAuthStore.getState();
      let clinicId = user?.clinicId;
      let hospitalId = user?.hospitalId;

      // Fallback logic for facility lookup if not present directly on user object
      if (!clinicId && !hospitalId) {
        try {
          if (user?.userType === "DOCTOR" || user?.role === "DOCTOR") {
            const profileJson = await doctorService.getDoctorProfile();
            if (profileJson.success && profileJson.data) {
              clinicId = profileJson.data.clinicId;
              hospitalId = profileJson.data.hospitalId;
            }
          } else {
            const doctorsJson = await doctorService.listDoctors();
            if (doctorsJson.success && doctorsJson.data && doctorsJson.data.length > 0) {
              const doc = doctorsJson.data[0];
              clinicId = doc.clinicId;
              hospitalId = doc.hospitalId;
            }
          }
        } catch (err) {
          console.warn("Could not fetch doctor info in fallback", err);
        }
      }

      let patientId: number;
      let finalPatientDetails: any;

      if (isExisting && selectedPatient) {
        patientId = selectedPatient.patientId!;
        finalPatientDetails = {
          name: selectedPatient.patientName,
          age: selectedPatient.age,
          gender: selectedPatient.gender,
          contactNumber: selectedPatient.mobileNumber,
          localAddress: selectedPatient.address,
          state: selectedPatient.state,
          district: selectedPatient.city,
          pincode: selectedPatient.pincode,
          dateOfBirth: selectedPatient.dateOfBirth,
        };
      } else {
        // Create new patient
        const patientDataObj = await patientService.createPatient({
          patientName: registrationForm.name!,
          age: registrationForm.age || 0,
          gender: registrationForm.gender!,
          mobileNumber: registrationForm.contactNumber || "",
          address: registrationForm.localAddress || "",
          state: registrationForm.state || "",
          city: registrationForm.district || "",
          pincode: registrationForm.pincode || "",
          dateOfBirth: registrationForm.dateOfBirth || "",
        });

        patientId = patientDataObj.patientId!;
        finalPatientDetails = {
          name: registrationForm.name,
          age: registrationForm.age,
          gender: registrationForm.gender,
          contactNumber: registrationForm.contactNumber,
          localAddress: registrationForm.localAddress,
          state: registrationForm.state,
          district: registrationForm.district,
          pincode: registrationForm.pincode,
          dateOfBirth: registrationForm.dateOfBirth,
        };
      }

      if (!patientId) {
        toast.error("Failed to resolve Patient ID");
        setIsRegistering(false);
        return;
      }

      // Build registration payload matching DTO
      const registrationPayload: any = {
        status: "REGISTERED",
        patientId: patientId,
      };

      if (clinicId) registrationPayload.clinicId = clinicId;
      if (hospitalId) registrationPayload.hospitalId = hospitalId;

      let regObj;
      try {
        regObj = await patientService.createRegistration(registrationPayload);
      } catch (err: any) {
        console.error("Patient registration failed:", err);
        toast.error("Registration failed: Patient record was resolved but registration could not be completed. The patient might already be registered at this facility.");
        setIsRegistering(false);
        return;
      }

      // Auto-create empty consultation
      try {
        const payload = {
          registrationId: regObj.registrationId,
          registrationNumber: regObj.registrationNumber,
          complaints: [],
          generalExaminations: [],
          pastMedicalHistories: [],
          diagnoses: [],
          diagnostics: [],
          documents: [],
          medicines: [],
        };
        await prescriptionService.savePrescription(payload as any);
      } catch (err) {
        console.error("Failed to auto-create consultation", err);
      }

      // Save complete patient details in currentConsultationPatient (including vitals)
      const currentPatient = {
        id: String(patientId),
        registrationId: regObj.registrationId,
        registrationNumber: regObj.registrationNumber,
        name: finalPatientDetails.name,
        age: finalPatientDetails.age,
        gender: finalPatientDetails.gender,
        contactNumber: finalPatientDetails.contactNumber,
        // Prefilled vitals for doctor consultation
        weight: registrationForm.weight,
        height: registrationForm.height,
        bloodPressureSystolic: registrationForm.bloodPressureSystolic,
        bloodPressureDiastolic: registrationForm.bloodPressureDiastolic,
        pulse: registrationForm.pulse,
        temperature: registrationForm.temperature,
        oxygenSaturation: registrationForm.oxygenSaturation,
        // DOB & Address details
        dateOfBirth: finalPatientDetails.dateOfBirth,
        localAddress: finalPatientDetails.localAddress,
        state: finalPatientDetails.state,
        district: finalPatientDetails.district,
        pincode: finalPatientDetails.pincode,
      };
      localStorage.setItem("currentConsultationPatient", JSON.stringify(currentPatient));

      // Build parent PatientData structure
      const newPatient: PatientData = {
        ...registrationForm,
        id: patientId.toString(),
        name: finalPatientDetails.name,
        age: finalPatientDetails.age,
        gender: finalPatientDetails.gender,
        contactNumber: finalPatientDetails.contactNumber,
        localAddress: finalPatientDetails.localAddress,
        state: finalPatientDetails.state,
        district: finalPatientDetails.district,
        pincode: finalPatientDetails.pincode,
        dateOfBirth: finalPatientDetails.dateOfBirth,
        registrationId: regObj.registrationId,
        registrationNumber: regObj.registrationNumber,
        visitDate: new Date().toISOString().split("T")[0],
      };

      onPatientRegistered(newPatient);
      toast.success("Patient successfully registered!");

      // Clear states
      setRegistrationForm(emptyPatientData);
      setSelectedPatient(null);
      setPatientSearchQuery("");
      setIsOpen(false);
      resetTranscript();
      stopListening();

      // Redirect to consultation dashboard
      router.push("/consultation");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An error occurred during registration.");
    } finally {
      setIsRegistering(false);
    }
  };

  const filteredExistingPatients = existingPatients.filter((p) => {
    const q = patientSearchQuery.trim().toLowerCase();
    if (!q) return [];
    return (
      (p.patientName && p.patientName.toLowerCase().includes(q)) ||
      (p.mobileNumber && p.mobileNumber.includes(q))
    );
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Register Patient
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Register Patient
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          <Tabs value={activeTab} onValueChange={(val) => {
            setActiveTab(val);
            stopListening();
            resetTranscript();
          }} className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="new">Register New Patient</TabsTrigger>
              <TabsTrigger value="existing">Register Existing Patient</TabsTrigger>
            </TabsList>

            <TabsContent value="new" className="space-y-6">
              {/* Voice recognition */}
              <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border-2 border-dashed border-primary/30">
                <div className="flex items-center gap-4 mb-3">
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
                    className="h-16 w-16 rounded-full"
                  >
                    {isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
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
                  <p className="text-xs text-muted-foreground text-center max-w-md">"{transcript}"</p>
                )}
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Example: "Name is John Doe, Age 35, Male, Weight 70 kg, BP 120/80"
                </p>
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Basic Information
                </h3>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Name *</label>
                    <Input
                      id="reg-name"
                      value={registrationForm.name ?? ""}
                      onChange={(e) => setRegistrationForm((prev) => ({ ...prev, name: e.target.value || null }))}
                      placeholder="Patient Name"
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Date of Birth</label>
                    <Input
                      id="reg-dateOfBirth"
                      type="date"
                      value={registrationForm.dateOfBirth ?? ""}
                      onChange={(e) => handleDobChange(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Age</label>
                    <Input
                      id="reg-age"
                      type="number"
                      value={registrationForm.age ?? ""}
                      onChange={(e) =>
                        setRegistrationForm((prev) => ({
                          ...prev,
                          age: e.target.value ? Number(e.target.value) : null,
                        }))
                      }
                      placeholder="Age"
                      min={0}
                      max={150}
                    />
                  </div>
                </div>

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Gender *</label>
                    <Select
                      value={registrationForm.gender ?? ""}
                      onValueChange={(v) => setRegistrationForm((prev) => ({ ...prev, gender: v || null }))}
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
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Contact Number</label>
                    <Input
                      id="reg-contactNumber"
                      value={registrationForm.contactNumber ?? ""}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setRegistrationForm((prev) => ({ ...prev, contactNumber: v || null }));
                      }}
                      placeholder="Phone Number (10 digit)"
                      maxLength={10}
                      inputMode="numeric"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-4 pt-1">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-primary font-bold text-xs">
                      A
                    </span>
                    Address
                  </h3>
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">State</label>
                      <Input
                        id="reg-state"
                        value={registrationForm.state ?? ""}
                        onChange={(e) => setRegistrationForm((prev) => ({ ...prev, state: e.target.value || null }))}
                        placeholder="State"
                        maxLength={100}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">District/City</label>
                      <Input
                        id="reg-district"
                        value={registrationForm.district ?? ""}
                        onChange={(e) =>
                          setRegistrationForm((prev) => ({ ...prev, district: e.target.value || null }))
                        }
                        placeholder="District/City"
                        maxLength={100}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Pincode</label>
                      <Input
                        id="reg-pincode"
                        value={registrationForm.pincode ?? ""}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                          setRegistrationForm((prev) => ({ ...prev, pincode: v ? v : null }));
                        }}
                        placeholder="Pincode"
                        maxLength={6}
                        inputMode="numeric"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Local Address</label>
                    <Input
                      id="reg-localAddress"
                      value={registrationForm.localAddress ?? ""}
                      onChange={(e) =>
                        setRegistrationForm((prev) => ({ ...prev, localAddress: e.target.value || null }))
                      }
                      placeholder="House no, street, area..."
                      maxLength={255}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="existing" className="space-y-6">
              {/* Existing Patient Selection */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Search className="h-4 w-4 text-primary" />
                  Search Patient
                </h3>

                {!selectedPatient ? (
                  <div className="space-y-2 relative">
                    <label className="text-sm text-muted-foreground">Patient Name or Mobile Number</label>
                    <Input
                      placeholder="Type name or phone number..."
                      value={patientSearchQuery}
                      onChange={(e) => setPatientSearchQuery(e.target.value)}
                    />
                    {patientSearchQuery && (
                      <div className="absolute z-50 w-full bg-card border rounded-lg shadow-lg max-h-60 overflow-y-auto mt-1">
                        {isLoadingPatients ? (
                          <div className="p-4 text-sm text-muted-foreground text-center flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            Loading patients...
                          </div>
                        ) : filteredExistingPatients.length === 0 ? (
                          <div className="p-4 text-sm text-muted-foreground text-center">No patients found</div>
                        ) : (
                          filteredExistingPatients.map((p) => (
                            <div
                              key={p.patientId}
                              onClick={() => {
                                setSelectedPatient(p);
                                setPatientSearchQuery("");
                                // Note: bloodGroup not supported in backend
                              }}
                              className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0 text-sm flex items-center justify-between"
                            >
                              <div>
                                <div className="font-semibold text-foreground">{p.patientName}</div>
                                <div className="text-xs text-muted-foreground">
                                  ID: {p.patientId} | {p.gender} | Age: {p.age || "N/A"}
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground font-mono">
                                {p.mobileNumber || "No Phone"}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-muted/40 border rounded-xl flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="font-bold text-foreground">{selectedPatient.patientName}</h4>
                      <p className="text-xs text-muted-foreground font-mono">
                        Phone: {selectedPatient.mobileNumber || "N/A"} | Gender: {selectedPatient.gender} | Age: {selectedPatient.age || "N/A"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Address: {selectedPatient.address || "N/A"}, {selectedPatient.city || ""}, {selectedPatient.state || ""} {selectedPatient.pincode || ""}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPatient(null);
                      }}
                    >
                      Change Patient
                    </Button>
                  </div>
                )}

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Visit Date</label>
                    <Input
                      type="date"
                      value={registrationForm.visitDate ?? ""}
                      onChange={(e) =>
                        setRegistrationForm((prev) => ({ ...prev, visitDate: e.target.value || null }))
                      }
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>


          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setRegistrationForm(emptyPatientData);
                setSelectedPatient(null);
                setPatientSearchQuery("");
                setIsOpen(false);
                stopListening();
                resetTranscript();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleRegisterPatient} disabled={isRegistering || (!selectedPatient && !registrationForm.name)}>
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
