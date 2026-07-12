import type { ReactElement } from "react";
import React, { useState } from "react";
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
import { printHeadersService, type PrintHeader } from "@/src/services/printHeaders.service";
import { tokenService } from "@/src/modules/auth/services/token.service";
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
  visitHistory?: Array<Record<string, any> & {
    prescriptionId: number;
    createdAt?: string;
  }>;
  canPrint?: boolean;
  onPrintBlocked?: () => void;
  printPrescriptionId?: number | null;
}

export function usePatientForm(props: BaseTemplateProps) {
  const {
    data,
    onChange,
    highlightedFields = [],
    mic,
    canPrint = true,
    onPrintBlocked,
    printPrescriptionId,
  } = props;
  const [printingPrescriptionId, setPrintingPrescriptionId] = useState<number | null>(null);

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
        m.id === id
          ? {
              ...m,
              [field]: value,
              ...(field === "medicineName"
                ? { medicineMasterId: undefined }
                : {}),
            }
          : m
      )
    );
  };

  const applyMedicineMaster = (id: string, medicine: MedicineMaster) => {
  updateField(
    "medicines",
    (data.medicines || []).map((m) =>
      m.id === id
        ? {
            ...m,
            medicineMasterId: medicine.medicineId ?? medicine.id,
            medicineName: medicine.medicineName || "",
            strength: medicine.strength || "",
            dosage: medicine.dosage || "",
            instruction: medicine.instructions || "",
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
        documentUrl: null,
        documentFileName: null,
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
      variant: context.mode === "COMPONENT" ? "section" : "field",
      children: element,
    });
  };

  const getHeaderId = (header: PrintHeader): number | null => {
    const value = Number(header.headerId ?? header.id);
    return Number.isFinite(value) && value > 0 ? value : null;
  };

  const sortHeadersByNewest = (headers: PrintHeader[]) => {
    return [...headers].sort((a, b) => {
      const aTime = Date.parse(a.updatedAt || a.createdAt || "");
      const bTime = Date.parse(b.updatedAt || b.createdAt || "");
      return (Number.isFinite(bTime) ? bTime : 0) - (Number.isFinite(aTime) ? aTime : 0);
    });
  };

  const getPrintHeaderLookupCandidates = () => {
    const user = tokenService.getUser() as any;
    const candidates: Array<{ entityId?: number; entityType?: string }> = [];

    const addCandidate = (entityId: unknown, entityType: string) => {
      const numericEntityId = Number(entityId);
      if (Number.isFinite(numericEntityId) && numericEntityId > 0) {
        candidates.push({ entityId: numericEntityId, entityType });
      }
    };

    addCandidate(user?.doctorId, "DOCTOR");
    addCandidate(user?.clinicId, "CLINIC");
    addCandidate(user?.hospitalId, "HOSPITAL");
    candidates.push({});

    return candidates;
  };

  const resolvePrintHeaderId = async (): Promise<number> => {
    for (const params of getPrintHeaderLookupCandidates()) {
      const headers = sortHeadersByNewest(await printHeadersService.getHeaders(params));
      const headerId = headers.map(getHeaderId).find((id): id is number => Boolean(id));

      if (headerId) {
        return headerId;
      }
    }

    return 0;
  };

  const openPdfBlob = (blob: Blob, prescriptionId: number) => {
    const pdfBlob = blob.type === "application/pdf" ? blob : new Blob([blob], { type: "application/pdf" });
    const url = URL.createObjectURL(pdfBlob);
    const openedWindow = window.open(url, "_blank", "noopener,noreferrer");

    if (!openedWindow) {
      const link = document.createElement("a");
      link.href = url;
      link.download = `prescription-${prescriptionId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    }

    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  /* ---------- print handler ---------- */
  const handlePrintPrescriptionById = async (prescriptionId: number) => {
    if (!Number.isFinite(prescriptionId) || prescriptionId <= 0) {
      onPrintBlocked?.();
      return;
    }

    try {
      setPrintingPrescriptionId(prescriptionId);
      const pdf = await printHeadersService.getPrescriptionPdf(
        await resolvePrintHeaderId(),
        prescriptionId
      );
      openPdfBlob(pdf, prescriptionId);
    } catch (error: any) {
      console.error("Failed to generate prescription PDF:", error);
      window.alert(error?.message || "Failed to generate prescription PDF. Please try again.");
    } finally {
      setPrintingPrescriptionId(null);
    }
  };

  const handlePrintPrescription = async () => {
    if (!canPrint) {
      onPrintBlocked?.();
      return;
    }

    const savedPrescriptionId = Number(printPrescriptionId || (data as any).prescriptionId);

    try {
      localStorage.setItem("prescriptionData", JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save prescription data:", e);
    }

    await handlePrintPrescriptionById(savedPrescriptionId);
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
    handlePrintPrescriptionById,
    isPrintingPrescription: printingPrescriptionId !== null,
    printingPrescriptionId,
  };
}
