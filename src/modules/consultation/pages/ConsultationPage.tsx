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
import { SavePrescriptionRequest } from "../../../../types/backend";

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
  respiratoryRate: null,

  lmp: null,
  visitDate: null,
  allergies: null,
  currentMedications: null,
  chiefComplaint: null,
  symptoms: null,
  medicalHistory: null,
  quickNotes: null,
  complaints: [{ id: "comp-new", complaintName: "", complaintFrequency: "", severity: "", complaintDuration: "" }],
  generalExaminations: [{ id: "ge-new", finding: "", status: "", severity: "" }],
  pastMedicalHistories: [{ id: "pmh-new", disease: "", duration: "", status: "", notes: "" }],
  diagnoses: [{ id: "diag-new", diagnosisName: "", diagnosisCode: "", diagnosisDuration: "" }],
  advice: null,
  testsRequested: [{ id: "test-new", name: "", notes: "" }],
  nextVisit: null,
  investigations: [{ id: "inv-new", test: "", value: "", notes: "" }],
  payment: null,
  followUp: null,
  contactNumber: null,
  emergencyContact: null,
  insuranceId: null,
  medicines: [{ id: "med-new", medicineName: "", strength: "", dosage: "", frequency: "", duration: "", instruction: "", quantity: "1" }],
  documents: [],
};

const convertToPatientFormData = (patient: any): PatientData => {
  return {
    registrationId: patient.registrationId || null,
    registrationNumber: patient.registrationNumber || null,
    patientId: Number(patient.id) || Number(patient.patientId) || null,
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
    respiratoryRate: patient.respiratoryRate || null,

    lmp: patient.lmp || null,
    visitDate: patient.visitDate || null,
    allergies: patient.allergies || null,
    currentMedications: patient.currentMedications || null,
    chiefComplaint: patient.chiefComplaint || null,
    symptoms: patient.symptoms || null,
    medicalHistory: patient.medicalHistory || null,
    quickNotes: patient.quickNotes || null,
    complaints: patient.complaints?.length ? patient.complaints : [{ id: "comp-new", complaintName: "", complaintFrequency: "", severity: "", complaintDuration: "" }],
    generalExaminations: patient.generalExaminations?.length ? patient.generalExaminations : [{ id: "ge-new", finding: "", status: "", severity: "" }],
    pastMedicalHistories: patient.pastMedicalHistories?.length ? patient.pastMedicalHistories : [{ id: "pmh-new", disease: "", duration: "", status: "", notes: "" }],
    diagnoses: patient.diagnoses?.length ? patient.diagnoses : [{ id: "diag-new", diagnosisName: "", diagnosisCode: "", diagnosisDuration: "" }],
    advice: patient.advice || null,
    testsRequested: patient.testsRequested?.length ? patient.testsRequested : [{ id: "test-new", name: "", notes: "" }],
    nextVisit: patient.nextVisit || null,
    investigations: patient.investigations?.length ? patient.investigations : [{ id: "inv-new", test: "", value: "", notes: "" }],
    payment: patient.payment || null,
    followUp: patient.followUp || null,
    contactNumber: patient.contactNumber || null,
    emergencyContact: patient.emergencyContact || null,
    insuranceId: patient.insuranceId || null,
    medicines: patient.medicines?.length ? patient.medicines : [{ id: "med-new", medicineName: "", strength: "", dosage: "", frequency: "", duration: "", instruction: "", quantity: "1" }],
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
    activeVoiceContext,
    extractedPreview,
    registerFieldRef,
    handleMicToggle,
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
      patientId: Number(originalPatient?.id) || Number(originalPatient?.patientId) || Number(c.patientId) || null,
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
      respiratoryRate: c.respiratoryRate || null,

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
      pastMedicalHistories: (c.pastMedicalHistories || []).map((pmh: any, i: number) => ({
        id: pmh.id || `pmh-${i}`,
        allergies: pmh.allergies ?? null,
        currentMedicine: pmh.currentMedicine ?? null,
        medicalHistory: pmh.medicalHistory ?? null,
      })),
      advice: c.advice || null,
      testsRequested: (prescription.diagnostics || prescription.testRequested || []).map((tr: any, i: number) => ({
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

      // ==========================================
      // 1. Validation Checks matching Backend DTOs
      // ==========================================

      // Vitals Validation (height, weight, temperature, pulse, spo2, respiratoryRate >= 0)
      if (patientData.height !== null && patientData.height < 0) {
        throw new Error("Vitals: Height must be positive or zero.");
      }
      if (patientData.weight !== null && patientData.weight < 0) {
        throw new Error("Vitals: Weight must be positive or zero.");
      }
      if (patientData.temperature !== null && patientData.temperature < 0) {
        throw new Error("Vitals: Temperature must be positive or zero.");
      }
      if (patientData.pulse !== null && patientData.pulse < 0) {
        throw new Error("Vitals: Pulse must be positive or zero.");
      }
      if (patientData.oxygenSaturation !== null && patientData.oxygenSaturation < 0) {
        throw new Error("Vitals: SpO2 must be positive or zero.");
      }
      if (patientData.respiratoryRate !== null && patientData.respiratoryRate !== undefined && patientData.respiratoryRate < 0) {
        throw new Error("Vitals: Respiratory Rate must be positive or zero.");
      }
      
      let bpStr = null;
      if (patientData.bloodPressureSystolic && patientData.bloodPressureDiastolic) {
        bpStr = `${patientData.bloodPressureSystolic}/${patientData.bloodPressureDiastolic}`;
        if (bpStr.length > 20) {
          throw new Error("Vitals: Blood Pressure format length must not exceed 20 characters.");
        }
      }

      // Chief Complaints (Name required, max 255, frequency/severity/duration max 100)
      const validComplaints = (patientData.complaints || [])
        .filter((c) => c.complaintName && c.complaintName.trim() !== "")
        .map((c) => {
          const name = c.complaintName.trim();
          if (name.length > 255) {
            throw new Error(`Chief Complaints: "${name}" exceeds 255 characters.`);
          }
          if (c.complaintFrequency && c.complaintFrequency.length > 100) {
            throw new Error(`Chief Complaints: Frequency for "${name}" exceeds 100 characters.`);
          }
          if (c.severity && c.severity.length > 100) {
            throw new Error(`Chief Complaints: Severity for "${name}" exceeds 100 characters.`);
          }
          if (c.complaintDuration && c.complaintDuration.length > 100) {
            throw new Error(`Chief Complaints: Duration for "${name}" exceeds 100 characters.`);
          }
          return {
            complaintName: name,
            complaintFrequency: c.complaintFrequency || "",
            severity: c.severity || "",
            complaintDuration: c.complaintDuration || "",
          };
        });

      // General Examinations (Max 255)
      const validGeneralExaminations = (patientData.generalExaminations || [])
        .map((ge) => {
          let str = ge.finding || "";
          if (ge.status) str += ` (${ge.status})`;
          if (ge.severity) str += ` [${ge.severity}]`;
          return str;
        })
        .filter(Boolean)
        .filter((name) => name.trim() !== "")
        .map((name) => {
          const val = name.trim();
          if (val.length > 255) {
            throw new Error(`General Examination: "${val}" exceeds 255 characters.`);
          }
          return val;
        });

      // Past Medical History (allergies/currentMedicine max 1000, medicalHistory max 2000)
      const validPastMedicalHistories = (patientData.pastMedicalHistories || [])
        .filter((pmh) => pmh.disease && pmh.disease.trim() !== "")
        .map((pmh) => {
          let str = pmh.disease || "";
          if (pmh.duration) str += ` for ${pmh.duration}`;
          if (pmh.status) str += ` (${pmh.status})`;
          if (pmh.notes) str += ` - ${pmh.notes}`;
          
          if (str.length > 2000) {
            throw new Error(`Medical History: History exceeds 2000 characters.`);
          }
          return {
            allergies: "",
            currentMedicine: "",
            medicalHistory: str,
          };
        });

      // Diagnoses (Name required, max 255, code/duration max 100)
      const validDiagnoses = (patientData.diagnoses || [])
        .filter((d) => d.diagnosisName && d.diagnosisName.trim() !== "")
        .map((d) => {
          const name = d.diagnosisName.trim();
          if (name.length > 255) {
            throw new Error(`Diagnosis: "${name}" exceeds 255 characters.`);
          }
          if (d.diagnosisCode && d.diagnosisCode.length > 100) {
            throw new Error(`Diagnosis: Code for "${name}" exceeds 100 characters.`);
          }
          if (d.diagnosisDuration && d.diagnosisDuration.length > 100) {
            throw new Error(`Diagnosis: Duration for "${name}" exceeds 100 characters.`);
          }
          return {
            diagnosisName: name,
            diagnosisCode: d.diagnosisCode || "",
            diagnosisDuration: d.diagnosisDuration || "",
          };
        });

      // Diagnostics (Name required, max 255, notes max 1000)
      const validDiagnostics = [
        ...patientData.investigations.map((inv) => ({
          testName: inv.test || "",
          notes: [inv.value, inv.notes].filter(Boolean).join(" - ") || "",
        })),
        ...patientData.testsRequested.map((tr) => ({
          testName: tr.name || "",
          notes: tr.notes || "",
        })),
      ]
        .filter((d) => d.testName && d.testName.trim() !== "")
        .map((d) => {
          const name = d.testName.trim();
          if (name.length > 255) {
            throw new Error(`Diagnostics: Test name "${name}" exceeds 255 characters.`);
          }
          if (d.notes && d.notes.length > 1000) {
            throw new Error(`Diagnostics: Notes for test "${name}" exceeds 1000 characters.`);
          }
          return {
            testName: name,
            notes: d.notes || "",
          };
        });

      // Documents (fileName max 255, url max 2048)
      const validDocuments = [
        ...patientData.documents.map((doc) => ({
          fileName: doc.fileName || "",
          url: doc.url || "",
        })),
        ...patientData.investigations
          .filter((inv) => inv.documentUrl)
          .map((inv) => ({
            fileName: inv.documentFileName || "investigation_doc",
            url: inv.documentUrl || "",
          }))
      ]
        .filter((doc) => doc.fileName && doc.url && doc.fileName.trim() !== "" && doc.url.trim() !== "")
        .map((doc) => {
          const fileName = doc.fileName.trim();
          const url = doc.url.trim();
          if (fileName.length > 255) {
            throw new Error(`Documents: File name exceeds 255 characters.`);
          }
          if (url.length > 2048) {
            throw new Error(`Documents: URL exceeds 2048 characters.`);
          }
          return {
            fileName,
            url,
          };
        });

      // Medicines (Name required, max 255, strength/dosage/frequency/duration max 100, instruction max 500, quantity max 50)
      const validMedicines = (patientData.medicines || [])
        .filter((m) => m.medicineName && m.medicineName.trim() !== "")
        .map((m) => {
          const name = m.medicineName.trim();
          if (name.length > 255) {
            throw new Error(`Medicines: Medicine name "${name}" exceeds 255 characters.`);
          }
          if (m.strength && m.strength.length > 100) {
            throw new Error(`Medicines: Strength for "${name}" exceeds 100 characters.`);
          }
          if (m.dosage && m.dosage.length > 100) {
            throw new Error(`Medicines: Dosage for "${name}" exceeds 100 characters.`);
          }
          if (m.frequency && m.frequency.length > 100) {
            throw new Error(`Medicines: Frequency for "${name}" exceeds 100 characters.`);
          }
          if (m.duration && m.duration.length > 100) {
            throw new Error(`Medicines: Duration for "${name}" exceeds 100 characters.`);
          }
          if (m.instruction && m.instruction.length > 500) {
            throw new Error(`Medicines: Instruction for "${name}" exceeds 500 characters.`);
          }
          if (m.quantity && m.quantity.length > 50) {
            throw new Error(`Medicines: Quantity for "${name}" exceeds 50 characters.`);
          }
          return {
            medicineName: name,
            strength: m.strength || "",
            dosage: m.dosage || "",
            frequency: m.frequency || "",
            duration: m.duration || "",
            instruction: m.instruction || "",
            quantity: m.quantity || "1",
          };
        });

      // Advice & Notes length (max 2000)
      if (patientData.advice && patientData.advice.length > 2000) {
        throw new Error("Advice text exceeds 2000 characters.");
      }
      if (patientData.quickNotes && patientData.quickNotes.length > 2000) {
        throw new Error("Prescription Notes exceeds 2000 characters.");
      }

      // Follow Up Date validation (Future or Present)
      if (patientData.followUp) {
        // Parse date components locally to avoid UTC vs local timezone mismatch
        // e.g. "2026-06-23" must be treated as local date, not UTC midnight
        const [fyear, fmonth, fday] = patientData.followUp.split("-").map(Number);
        const followUp = new Date(fyear, fmonth - 1, fday); // local midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (followUp < today) {
          throw new Error("Follow-up date cannot be in the past.");
        }
      }

      // ==========================================
      // 2. Build Payload
      // ==========================================
      const payload: SavePrescriptionRequest = {
        registrationId: Number(registrationId),
        
        // Vitals mapped as actual numbers (or omitted via undefined if null)
        height: patientData.height !== null ? Number(patientData.height) : undefined,
        weight: patientData.weight !== null ? Number(patientData.weight) : undefined,
        temperature: patientData.temperature !== null ? Number(patientData.temperature) : undefined,
        pulse: patientData.pulse !== null ? Number(patientData.pulse) : undefined,
        spo2: patientData.oxygenSaturation !== null ? Number(patientData.oxygenSaturation) : undefined,
        bp: bpStr || undefined,
        respiratoryRate: patientData.respiratoryRate !== null ? Number(patientData.respiratoryRate) : undefined,

        complaints: validComplaints,
        generalExaminations: validGeneralExaminations,
        pastMedicalHistories: validPastMedicalHistories,
        diagnoses: validDiagnoses,
        diagnostics: validDiagnostics,
        documents: validDocuments,

        advice: patientData.advice || undefined,
        notes: patientData.quickNotes || undefined,

        followUpDate: patientData.followUp ? new Date(patientData.followUp).toISOString() : undefined,
        medicines: validMedicines,
      };

      const sameDayPrescription = prescriptionHistory.find((p) => {
        if (!p.createdAt) return false;
        return p.createdAt.startsWith(todayYYYYMMDD);
      });

      if (sameDayPrescription) {
        await prescriptionService.updatePrescription(sameDayPrescription.prescriptionId, payload);
      } else {
        await prescriptionService.savePrescription(payload);
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

      <main className="mx-auto max-w-none px-3 py-4 sm:px-4 lg:px-6 w-full">
        <FloatingAIAssistant
          assistantStage={assistantState as any}
          activeVoiceContext={activeVoiceContext}
          extractedPreview={extractedPreview}
          transcript={transcript}
          error={error}
          isSupported={isSupported}
          isListening={isListening}
          isProcessing={isLoading}
          isSpeaking={isAvatarSpeaking}
          onStartListening={startListening}
          onStopListening={stopListening}
        />



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
                activeVoiceContext,
                onMicToggle: handleMicToggle,
              }}
              registerFieldRef={registerFieldRef}
              prescriptionHistoryNode={
                <PrescriptionHistoryCard
                  prescriptionHistory={prescriptionHistory}
                  viewingPrescriptionId={viewingPrescriptionId}
                  handleLoadPrescription={handleLoadPrescription}
                  handleReset={handleReset}
                />
              }
              prescriptionHistoryLength={prescriptionHistory.length}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
