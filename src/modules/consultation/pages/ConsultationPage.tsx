import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PatientForm, PatientData, MedicineEntry, ComplaintEntry, DiagnosisEntry, GeneralExaminationEntry, PastMedicalHistoryEntry, InvestigationEntry, TestRequestedEntry, DocumentEntry } from "@/components/patient-form";
import dynamic from "next/dynamic";
const FloatingAIAssistant = dynamic(() => import("@/components/FloatingAIAssistant"), { ssr: false });
import { useAuthStore } from "@/src/store/authStore";
import { prescriptionService } from "@/src/services/prescription.service";
import { useConsultationVoice } from "@/hooks/useConsultationVoice";

import { ConsultationHeader } from "../components/ConsultationHeader";
import { PatientInfoCard } from "../components/PatientInfoCard";
import { PrescriptionHistoryCard } from "../components/PrescriptionHistoryCard";

const emptyPatientData: PatientData = {
  registrationId: null,
  registrationNumber: null,
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
};

const convertToPatientFormData = (patient: any): PatientData => {
  return {
    registrationId: patient.registrationId || null,
    registrationNumber: patient.registrationNumber || null,
    name: patient.name,
    age: patient.age,
    gender: patient.gender,
    weight: patient.weight || null,
    height: patient.height || null,
    bloodPressureSystolic: patient.bloodPressureSystolic || null,
    bloodPressureDiastolic: patient.bloodPressureDiastolic || null,
    pulse: patient.pulse || null,
    temperature: patient.temperature || null,
    oxygenSaturation: patient.oxygenSaturation || null,
    bloodGroup: patient.bloodGroup || null,
    lmp: patient.lmp || null,
    visitDate: patient.visitDate || null,
    allergies: patient.allergies || null,
    currentMedications: patient.currentMedications || null,
    chiefComplaint: patient.chiefComplaint || null,
    symptoms: patient.symptoms || null,
    medicalHistory: patient.medicalHistory || null,
    quickNotes: patient.quickNotes || null,
    complaints: (patient.complaints || []) as ComplaintEntry[],
    generalExaminations: (patient.generalExaminations || []) as GeneralExaminationEntry[],
    pastMedicalHistories: (patient.pastMedicalHistories || []) as PastMedicalHistoryEntry[],
    diagnoses: (patient.diagnoses || []) as DiagnosisEntry[],
    advice: patient.advice || null,
    testsRequested: (patient.testsRequested || []) as TestRequestedEntry[],
    nextVisit: patient.nextVisit || null,
    investigations: (patient.investigations || []) as InvestigationEntry[],
    payment: patient.payment || null,
    followUp: patient.followUp || null,
    contactNumber: patient.contactNumber || null,
    emergencyContact: patient.emergencyContact || null,
    insuranceId: patient.insuranceId || null,
    medicines: (patient.medicines || []) as MedicineEntry[],
    documents: (patient.documents || []) as DocumentEntry[],
  };
};

export default function ConsultationPage() {
  const router = useRouter();
  const { isAuthenticated, initialize } = useAuthStore();
  const [patientData, setPatientData] = useState<PatientData>(emptyPatientData);
  const [originalPatient, setOriginalPatient] = useState<any | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [prescriptionHistory, setPrescriptionHistory] = useState<any[]>([]);
  const [viewingPrescriptionId, setViewingPrescriptionId] = useState<number | null>(null);

  const localDate = new Date();
  const todayYYYYMMDD = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, "0")}-${String(
    localDate.getDate()
  ).padStart(2, "0")}`;

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  // Voice assistant hook
  const {
    transcript,
    isListening,
    isSupported,
    error,
    isLoading,
    assistantState,
    highlightedFields,
    activeVoiceField,
    registerFieldRef,
    handleMicToggleForField,
    resetTranscript,
    startListening,
    stopListening,
    isAvatarSpeaking,
  } = useConsultationVoice({ patientData, setPatientData });

  const fetchPrescriptionHistory = useCallback(async (patientId: number) => {
    try {
      const history = await prescriptionService.getDetailedPrescriptionsByPatientId(patientId);
      if (Array.isArray(history)) {
        setPrescriptionHistory(history);
      }
    } catch (e) {
      console.error("Failed to fetch prescription history:", e);
    }
  }, []);

  // Load patient data and draft from storage
  useEffect(() => {
    const storedPatient = localStorage.getItem("currentConsultationPatient");
    if (storedPatient) {
      try {
        const patient = JSON.parse(storedPatient);
        setOriginalPatient(patient);

        const draftStr = localStorage.getItem(`draftConsultation_${patient.id}`);
        if (draftStr) {
          try {
            const draft = JSON.parse(draftStr);
            setPatientData(draft.patientData);
            if (draft.viewingPrescriptionId) {
              setViewingPrescriptionId(draft.viewingPrescriptionId);
            }
          } catch (e) {
            setPatientData(convertToPatientFormData(patient));
          }
        } else {
          setPatientData(convertToPatientFormData(patient));
        }

        if (patient.id) {
          fetchPrescriptionHistory(Number(patient.id));
        }
      } catch (e) {
        console.error("Failed to load patient data:", e);
      }
    }
  }, [fetchPrescriptionHistory]);

  // Autosave draft
  useEffect(() => {
    if (patientData && originalPatient) {
      localStorage.setItem(
        `draftConsultation_${originalPatient.id}`,
        JSON.stringify({
          patientData,
          viewingPrescriptionId,
        })
      );
    }
  }, [patientData, viewingPrescriptionId, originalPatient]);

  const handleLoadPrescription = (prescription: any) => {
    setViewingPrescriptionId(prescription.prescriptionId);

    const c = prescription.consultation || {};

    const mappedData: PatientData = {
      registrationId: c.registrationId || null,
      registrationNumber: c.registrationNumber || originalPatient?.registrationNumber || null,
      name: originalPatient?.name || c.patientName || "",
      age: originalPatient?.age || c.age || 0,
      gender: originalPatient?.gender || c.gender || "Male",
      weight: c.weight || null,
      height: c.height || null,
      bloodPressureSystolic: c.bp ? Number(c.bp.split("/")[0]) : null,
      bloodPressureDiastolic: c.bp ? Number(c.bp.split("/")[1]) : null,
      pulse: c.pulse || null,
      temperature: c.temperature || null,
      oxygenSaturation: c.spo2 || null,
      bloodGroup: originalPatient?.bloodGroup || null,
      lmp: originalPatient?.lmp || null,
      visitDate: prescription.createdAt ? prescription.createdAt.split("T")[0] : null,
      allergies: c.allergies || null,
      currentMedications: c.currentMedicine || null,
      medicalHistory: c.medicalHistory || null,
      chiefComplaint: null,
      symptoms: null,
      quickNotes: prescription.notes || null,
      generalExaminations: (c.generalExaminations || []).map((ge: string, i: number) => ({
        id: `ge-${i}`,
        examinationName: ge,
      })),
      pastMedicalHistories: c.pastMedicalHistories || [],
      advice: c.advice || null,
      testsRequested: (prescription.testRequested || []).map((tr: any, i: number) => ({
        id: `tr-${i}`,
        testName: tr.testName,
        notes: tr.notes || null,
      })),
      nextVisit: null,
      // Map investigation document links into investigations
      investigations: (prescription.investigations || []).map((inv: any, i: number) => ({
        id: `inv-${i}`,
        investigationName: inv.investigationName,
        notes: inv.notes || null,
        documentUrl: inv.documentUrl || null,
        documentFileName: inv.documentFileName || null,
      })),
      // Build a set of investigation document URLs so we can filter them out of
      // the documents list — they already belong to an investigation row
      documents: (() => {
        const invDocUrls = new Set(
          (prescription.investigations || [])
            .filter((inv: any) => inv.documentUrl)
            .map((inv: any) => inv.documentUrl)
        );
        return (prescription.documents || [])
          .filter((doc: any) => !invDocUrls.has(doc.url))
          .map((doc: any, i: number) => ({
            id: `doc-${i}`,
            fileName: doc.fileName,
            url: doc.url,
          }));
      })(),
      payment: null,
      followUp: c.followUpDate ? c.followUpDate.split("T")[0] : null,
      contactNumber: originalPatient?.contactNumber || c.mobileNumber || null,
      emergencyContact: originalPatient?.emergencyContact || null,
      insuranceId: originalPatient?.insuranceId || null,

      complaints: (c.complaints || []).map((comp: any, i: number) => ({
        id: `comp-${i}`,
        complaintName: comp.complaintName || comp.complaint || "",
        complaintFrequency: comp.complaintFrequency || comp.frequency || null,
        severity: comp.severity || null,
        complaintDuration: comp.complaintDuration || comp.duration || null,
      })),

      diagnoses: (c.diagnoses || []).map((diag: any, i: number) => ({
        id: `diag-${i}`,
        diagnosisName: diag.diagnosisName || diag.diagnosis || "",
        diagnosisCode: diag.diagnosisCode || diag.snomedCode || null,
        diagnosisDuration: diag.diagnosisDuration || diag.duration || null,
      })),

      medicines: (prescription.medicines || []).map((m: any, index: number) => ({
        id: `med-${index}`,
        medicineName: m.medicineName || "",
        strength: m.strength || "",
        dosage: m.dosage || m.strength || "",
        frequency: m.frequency || "",
        duration: m.duration || "",
        instruction: m.instruction || "",
        quantity: m.quantity || "",
      })),
    };

    setPatientData(mappedData);
  };

  // Auto-load today's prescription if it exists in the history
  useEffect(() => {
    if (prescriptionHistory.length > 0 && !viewingPrescriptionId) {
      const todayRx = prescriptionHistory.find((p) => p.createdAt?.startsWith(todayYYYYMMDD));
      if (todayRx) {
        handleLoadPrescription(todayRx);
      }
    }
  }, [prescriptionHistory, viewingPrescriptionId, todayYYYYMMDD]);

  const goBack = () => {
    if (originalPatient) {
      localStorage.setItem(
        `draftConsultation_${originalPatient.id}`,
        JSON.stringify({
          patientData,
          viewingPrescriptionId,
        })
      );
    }
    router.back();
  };

  const handleReset = () => {
    if (originalPatient) {
      setPatientData(convertToPatientFormData(originalPatient));
      localStorage.removeItem(`draftConsultation_${originalPatient.id}`);
    } else {
      setPatientData(emptyPatientData);
    }
    setViewingPrescriptionId(null);
    resetTranscript();
    setSaveStatus("idle");
  };

  const handleSave = async () => {
    setSaveStatus("saving");

    try {
      const registrationId = originalPatient?.registrationId || patientData.registrationId;
      if (!registrationId) {
        throw new Error("No active registration found for this patient. Please register the patient first.");
      }

      // Build payload matching new API structure
      const payload = {
        registrationId: Number(registrationId),
        registrationNumber: originalPatient?.registrationNumber || patientData.registrationNumber || undefined,
        bp:
          patientData.bloodPressureSystolic && patientData.bloodPressureDiastolic
            ? `${patientData.bloodPressureSystolic}/${patientData.bloodPressureDiastolic}`
            : null,
        pulse: patientData.pulse?.toString() || null,
        temperature: patientData.temperature?.toString() || null,
        spo2: patientData.oxygenSaturation?.toString() || null,
        weight: patientData.weight?.toString() || null,
        height: patientData.height?.toString() || null,

        // Complaints - array of objects
        complaints: patientData.complaints.map((c) => ({
          complaintName: c.complaintName || "",
          complaintFrequency: c.complaintFrequency || "",
          severity: c.severity || "",
          complaintDuration: c.complaintDuration || "",
        })),

        // General Examinations - array of strings
        generalExaminations: patientData.generalExaminations.map((ge) => ge.examinationName).filter(Boolean),

        // Past Medical Histories - array of objects
        pastMedicalHistories: patientData.pastMedicalHistories.map((pmh) => ({
          allergies: pmh.allergies || "",
          currentMedicine: pmh.currentMedicine || "",
          medicalHistory: pmh.medicalHistory || "",
        })),

        // Diagnoses - array of objects
        diagnoses: patientData.diagnoses.map((d) => ({
          diagnosisName: d.diagnosisName || "",
          diagnosisCode: d.diagnosisCode || "",
          diagnosisDuration: d.diagnosisDuration || "",
        })),

        // Investigations - array of objects
        investigations: patientData.investigations.map((inv) => ({
          investigationName: inv.investigationName || "",
          notes: inv.notes || "",
        })),

        // Test Requested - array of objects
        testRequested: patientData.testsRequested.map((tr) => ({
          testName: tr.testName || "",
          notes: tr.notes || "",
        })),

        // Documents - array of objects
        documents: patientData.documents.map((doc) => ({
          fileName: doc.fileName || "",
          url: doc.url || "",
        })),

        advice: patientData.advice || null,
        notes: patientData.quickNotes || null,
        allergies: patientData.allergies || null,
        medicalHistory: patientData.medicalHistory || null,
        currentMedicine: patientData.currentMedications || null,

        followUpDate: patientData.followUp ? new Date(patientData.followUp).toISOString() : null,

        // Medicines - array of objects with new field names
        medicines: patientData.medicines.map((m) => ({
          medicineName: m.medicineName || "",
          strength: m.strength || "",
          dosage: m.dosage || "",
          frequency: m.frequency || "",
          duration: m.duration || "",
          instruction: m.instruction || "",
          quantity: m.quantity || "1",
        })),
      };

      const sameDayPrescription = prescriptionHistory.find((p) => {
        if (!p.createdAt) return false;
        return p.createdAt.startsWith(todayYYYYMMDD);
      });

      if (sameDayPrescription) {
        await prescriptionService.updatePrescription(sameDayPrescription.prescriptionId, payload as any);
      } else {
        await prescriptionService.savePrescription(payload as any);
      }

      if (originalPatient) {
        const updatedPatient = {
          ...originalPatient,
          ...patientData,
        };
        const storedPatients = localStorage.getItem("patients");
        if (storedPatients) {
          const patients = JSON.parse(storedPatients);
          const index = patients.findIndex((p: any) => p.id === originalPatient.id);
          if (index !== -1) {
            patients[index] = updatedPatient;
            localStorage.setItem("patients", JSON.stringify(patients));
          }
        }
      }

      setSaveStatus("saved");

      if (originalPatient?.id) {
        fetchPrescriptionHistory(Number(originalPatient.id));
      }

      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (e: any) {
      console.error("Failed to save prescription:", e);
      alert(e.message || "Failed to save prescription. Please check all required fields.");
      setSaveStatus("idle");
    }
  };

  const isReadOnly = viewingPrescriptionId
    ? !prescriptionHistory.some(
        (p) => p.prescriptionId === viewingPrescriptionId && p.createdAt?.startsWith(todayYYYYMMDD)
      )
    : false;

  return (
    <div className="min-h-screen bg-background">
      <ConsultationHeader
        goBack={goBack}
        handleReset={handleReset}
        handleSave={handleSave}
        saveStatus={saveStatus}
        isReadOnly={isReadOnly}
        hasTodayPrescription={prescriptionHistory.some((p) => p.createdAt?.startsWith(todayYYYYMMDD))}
      />

      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-4 lg:px-6">
        <FloatingAIAssistant
          state={assistantState as any}
          transcript={transcript}
          error={error}
          isSupported={isSupported}
          isListening={isListening}
          isProcessing={isLoading}
          isSpeaking={isAvatarSpeaking}
          onStartListening={startListening}
          onStopListening={stopListening}
        />

        <section className="mb-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <PatientInfoCard patientData={patientData} prescriptionHistoryLength={prescriptionHistory.length} />
            </div>
            <div>
              <PrescriptionHistoryCard
                prescriptionHistory={prescriptionHistory}
                viewingPrescriptionId={viewingPrescriptionId}
                handleLoadPrescription={handleLoadPrescription}
                handleReset={handleReset}
              />
            </div>
          </div>
        </section>

        <section>
          <div className={isReadOnly ? "pointer-events-none opacity-80" : ""}>
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
          </div>
        </section>
      </main>
    </div>
  );
}
