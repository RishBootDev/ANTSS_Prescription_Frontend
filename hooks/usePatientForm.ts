import type { ReactElement } from "react";
import React from "react";
import { VoiceMicField } from "../components/voice-mic-field";
import {
  type MedicineEntry,
  type ComplaintEntry,
  type DiagnosisEntry,
  type GeneralExaminationEntry,
  type PastMedicalHistoryEntry,
  type InvestigationEntry,
  type TestRequestedEntry,
  type DocumentEntry,
  type PatientData,
} from "../components/patient-form-fields/types";
import { MedicineMaster } from "@/src/services/medicine.service";
import { VoiceContext } from "./useConsultationVoice";

export type PatientMicControls = {
  isListening: boolean;
  isProcessing: boolean;
  isSupported: boolean;
  activeVoiceContext?: VoiceContext | null;
  onMicToggle: (context: VoiceContext) => void;
};

export interface BaseTemplateProps {
  data: PatientData;
  onChange: (data: PatientData) => void;
  highlightedFields?: string[];
  mic?: PatientMicControls;
  registerFieldRef?: (fieldName: string, element: HTMLElement | null) => void;
  prescriptionHistoryNode?: React.ReactNode;
  prescriptionHistoryLength?: number;
}

export function usePatientForm(props: BaseTemplateProps) {
  const { data, onChange, highlightedFields = [], mic } = props;

  const updateField = <K extends keyof PatientData>(
    field: K,
    value: PatientData[K]
  ) => {
    onChange({ ...data, [field]: value });
  };

  const isHighlighted = (field: string) =>
    highlightedFields.includes(field);

  const inputClass = (field: string) =>
    isHighlighted(field)
      ? "ring-2 ring-accent bg-accent/10 animate-pulse"
      : "";

  const sectionPulseClass = (field: string) =>
    isHighlighted(field) ? "ring-2 ring-accent/60" : "";

  /* ---------- medicines ---------- */
  const addMedicine = () => {
    updateField("medicines", [
      ...(data.medicines || []),
      {
        id: crypto.randomUUID(),
        medicineName: "",
        strength: "",
        dosage: "",
        frequency: "",
        duration: "",
        instruction: "",
        quantity: "",
      },
    ]);
  };

  const updateMedicine = (
    id: string,
    field: keyof Omit<MedicineEntry, "id">,
    value: string
  ) => {
    updateField(
      "medicines",
      data.medicines.map((m) =>
        m.id === id ? { ...m, [field]: value } : m
      )
    );
  };

  const applyMedicineMaster = (id: string, medicine: MedicineMaster) => {
    updateField(
      "medicines",
      data.medicines.map((m) =>
        m.id === id
          ? {
              ...m,
              medicineName: medicine.medicineName || "",
              strength: medicine.strength || "",
              dosage: medicine.defaultDosage || "",
              frequency: medicine.defaultFrequency || "",
              duration: medicine.defaultDuration || "",
              instruction: medicine.defaultInstruction || "",
            }
          : m
      )
    );
  };

  const removeMedicine = (id: string) => {
    updateField(
      "medicines",
      (data.medicines || []).filter((m) => m.id !== id)
    );
  };

  /* ---------- complaints ---------- */
  const addComplaint = () => {
    updateField("complaints", [
      ...(data.complaints || []),
      {
        id: crypto.randomUUID(),
        complaintName: "",
        complaintFrequency: null,
        severity: null,
        complaintDuration: null,
      },
    ]);
  };

  const updateComplaint = (
    id: string,
    field: keyof Omit<ComplaintEntry, "id">,
    value: string
  ) => {
    updateField(
      "complaints",
      data.complaints.map((c) =>
        c.id === id
          ? { ...c, [field]: value || null }
          : c
      )
    );
  };

  const removeComplaint = (id: string) => {
    updateField(
      "complaints",
      (data.complaints || []).filter((c) => c.id !== id)
    );
  };

  /* ---------- diagnosis ---------- */
  const addDiagnosis = () => {
    updateField("diagnoses", [
      ...(data.diagnoses || []),
      {
        id: crypto.randomUUID(),
        diagnosisName: "",
        diagnosisCode: null,
        diagnosisDuration: null,
      },
    ]);
  };

  const updateDiagnosis = (
    id: string,
    field: keyof Omit<DiagnosisEntry, "id">,
    value: string
  ) => {
    updateField(
      "diagnoses",
      data.diagnoses.map((d) =>
        d.id === id
          ? { ...d, [field]: value || null }
          : d
      )
    );
  };

  const removeDiagnosis = (id: string) => {
    updateField(
      "diagnoses",
      (data.diagnoses || []).filter((d) => d.id !== id)
    );
  };

  /* ---------- general examinations ---------- */
  const addGeneralExamination = () => {
    updateField("generalExaminations", [
      ...(data.generalExaminations || []),
      {
        id: crypto.randomUUID(),
        finding: "",
        status: "",
      },
    ]);
  };

  const updateGeneralExamination = (
    id: string,
    field: keyof Omit<GeneralExaminationEntry, "id">,
    value: string
  ) => {
    updateField(
      "generalExaminations",
      data.generalExaminations.map((ge) =>
        ge.id === id
          ? { ...ge, [field]: value }
          : ge
      )
    );
  };

  const removeGeneralExamination = (id: string) => {
    updateField(
      "generalExaminations",
      (data.generalExaminations || []).filter((ge) => ge.id !== id)
    );
  };

  /* ---------- past medical histories ---------- */
  const addPastMedicalHistory = () => {
    updateField("pastMedicalHistories", [
      ...(data.pastMedicalHistories || []),
      {
        id: crypto.randomUUID(),
        disease: "",
        duration: "",
        status: "",
      },
    ]);
  };

  const updatePastMedicalHistory = (
    id: string,
    field: keyof Omit<PastMedicalHistoryEntry, "id">,
    value: string
  ) => {
    updateField(
      "pastMedicalHistories",
      data.pastMedicalHistories.map((pmh) =>
        pmh.id === id
          ? { ...pmh, [field]: value || null }
          : pmh
      )
    );
  };

  const removePastMedicalHistory = (id: string) => {
    updateField(
      "pastMedicalHistories",
      (data.pastMedicalHistories || []).filter((pmh) => pmh.id !== id)
    );
  };

  /* ---------- investigations ---------- */
  const addInvestigation = () => {
    updateField("investigations", [
      ...(data.investigations || []),
      {
        id: crypto.randomUUID(),
        test: "",
        value: "",
        notes: "",
        documentUrl: null,
        documentFileName: null,
      },
    ]);
  };

  const updateInvestigation = (
    id: string,
    field: keyof Omit<InvestigationEntry, "id">,
    value: string
  ) => {
    updateField(
      "investigations",
      data.investigations.map((inv) =>
        inv.id === id
          ? { ...inv, [field]: value || null }
          : inv
      )
    );
  };

  const updateInvestigationMultiple = (
    id: string,
    updates: Partial<Omit<InvestigationEntry, "id">>
  ) => {
    updateField(
      "investigations",
      data.investigations.map((inv) =>
        inv.id === id ? { ...inv, ...updates } : inv
      )
    );
  };

  const removeInvestigation = (id: string) => {
    updateField(
      "investigations",
      (data.investigations || []).filter((inv) => inv.id !== id)
    );
  };

  /* ---------- test requested ---------- */
  const addTestRequested = () => {
    updateField("testsRequested", [
      ...(data.testsRequested || []),
      {
        id: crypto.randomUUID(),
        name: "",
        notes: "",
      },
    ]);
  };

  const updateTestRequested = (
    id: string,
    field: keyof Omit<TestRequestedEntry, "id">,
    value: string
  ) => {
    updateField(
      "testsRequested",
      data.testsRequested.map((tr) =>
        tr.id === id
          ? { ...tr, [field]: value || null }
          : tr
      )
    );
  };

  const removeTestRequested = (id: string) => {
    updateField(
      "testsRequested",
      (data.testsRequested || []).filter((tr) => tr.id !== id)
    );
  };

  /* ---------- documents ---------- */
  const addDocument = () => {
    updateField("documents", [
      ...(data.documents || []),
      {
        id: crypto.randomUUID(),
        fileName: "",
        url: "",
      },
    ]);
  };

  const addDocumentWithValues = (fileName: string, url: string) => {
    updateField("documents", [
      ...(data.documents || []),
      {
        id: crypto.randomUUID(),
        fileName,
        url,
      },
    ]);
  };

  const updateDocument = (
    id: string,
    field: keyof Omit<DocumentEntry, "id">,
    value: string
  ) => {
    updateField(
      "documents",
      data.documents.map((doc) =>
        doc.id === id
          ? { ...doc, [field]: value }
          : doc
      )
    );
  };

  const removeDocument = (id: string) => {
    updateField(
      "documents",
      (data.documents || []).filter((doc) => doc.id !== id)
    );
  };

  /* ---------- mic wrapper ---------- */
  const wrapWithMic = (
    context: VoiceContext,
    element: ReactElement<{ className?: string }>
  ) => {
    if (!mic) return element;

    const isActive = 
      mic.activeVoiceContext?.mode === context.mode &&
      mic.activeVoiceContext?.field === context.field &&
      mic.activeVoiceContext?.component === context.component;

    return React.createElement(VoiceMicField, {
      isListening: mic.isListening,
      isProcessing: mic.isProcessing,
      isActive,
      onMicToggle: () => mic.onMicToggle(context),
      children: element,
    });
  };

  /* ---------- print handler ---------- */
  const handlePrintPrescription = () => {
    try {
      localStorage.setItem("prescriptionData", JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save prescription data:", e);
    }
    window.open("/prescription", "_blank");
  };

  return {
    updateField,
    isHighlighted,
    inputClass,
    sectionPulseClass,
    addMedicine,
    updateMedicine,
    applyMedicineMaster,
    removeMedicine,
    addComplaint,
    updateComplaint,
    removeComplaint,
    addDiagnosis,
    updateDiagnosis,
    removeDiagnosis,
    addGeneralExamination,
    updateGeneralExamination,
    removeGeneralExamination,
    addPastMedicalHistory,
    updatePastMedicalHistory,
    removePastMedicalHistory,
    addInvestigation,
    updateInvestigation,
    updateInvestigationMultiple,
    removeInvestigation,
    addTestRequested,
    updateTestRequested,
    removeTestRequested,
    addDocument,
    addDocumentWithValues,
    updateDocument,
    removeDocument,
    wrapWithMic,
    handlePrintPrescription,
  };
}
