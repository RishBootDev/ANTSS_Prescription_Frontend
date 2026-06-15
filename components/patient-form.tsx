"use client"

import type { ReactElement } from "react"
import { VoiceMicField } from "./voice-mic-field"
import { Printer } from "lucide-react"

import PatientPage from "./patient-form-fields/PatientPage"
import MedicalHistoryPage from "./patient-form-fields/MedicalHistoryPage"
import VitalsPage from "./patient-form-fields/VitalsPage"
import ComplaintsPage from "./patient-form-fields/ComplaintsPage"
import GeneralExaminationPage from "./patient-form-fields/GeneralExaminationPage"
import DiagnosisPage from "./patient-form-fields/DiagnosisPage"
import PlanPage from "./patient-form-fields/PlanPage"
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
} from "./patient-form-fields/types"

// Re-export types for backward compatibility
export type {
  MedicineEntry,
  ComplaintEntry,
  DiagnosisEntry,
  GeneralExaminationEntry,
  PastMedicalHistoryEntry,
  InvestigationEntry,
  TestRequestedEntry,
  DocumentEntry,
  PatientData,
}

import MedicinesPage from "./patient-form-fields/MedicinesPage"
import BillingPage from "./patient-form-fields/BillingPage"
import QuickNotesPage from "./patient-form-fields/QuickNotesPage"
import InvestigationsPage from "./patient-form-fields/InvestigationsPage"
import TestRequestedPage from "./patient-form-fields/TestRequestedPage"
import DocumentsPage from "./patient-form-fields/DocumentsPage"
import { MedicineMaster } from "@/src/services/medicine.service"

type PatientMicControls = {
  isListening: boolean
  isProcessing: boolean
  isSupported: boolean
  activeVoiceField: string | null
  onMicToggle: (fieldId: string) => void
}

interface PatientFormProps {
  data: PatientData
  onChange: (data: PatientData) => void
  highlightedFields?: string[]
  mic?: PatientMicControls
  registerFieldRef?: (fieldName: string, element: HTMLElement | null) => void
}

/* ================= COMPONENT ================= */

export function PatientForm({
  data,
  onChange,
  highlightedFields = [],
  mic,
  registerFieldRef,
}: PatientFormProps) {

  /* ---------- helpers ---------- */

  const updateField = <K extends keyof PatientData>(
    field: K,
    value: PatientData[K]
  ) => {
    onChange({ ...data, [field]: value })
  }

  const isHighlighted = (field: string) =>
    highlightedFields.includes(field)

  const inputClass = (field: string) =>
    isHighlighted(field)
      ? "ring-2 ring-accent bg-accent/10 animate-pulse"
      : ""

  const sectionPulseClass = (field: string) =>
    isHighlighted(field) ? "ring-2 ring-accent/60" : ""

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
    ])
  }

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
    )
  }

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
    )
  }

  const removeMedicine = (id: string) => {
    updateField(
      "medicines",
      (data.medicines || []).filter((m) => m.id !== id)
    )
  }

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
    ])
  }

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
    )
  }

  const removeComplaint = (id: string) => {
    updateField(
      "complaints",
      (data.complaints || []).filter((c) => c.id !== id)
    )
  }

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
    ])
  }

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
    )
  }

  const removeDiagnosis = (id: string) => {
    updateField(
      "diagnoses",
      (data.diagnoses || []).filter((d) => d.id !== id)
    )
  }

  /* ---------- general examinations ---------- */

  const addGeneralExamination = () => {
    updateField("generalExaminations", [
      ...(data.generalExaminations || []),
      {
        id: crypto.randomUUID(),
        examinationName: "",
      },
    ])
  }

  const updateGeneralExamination = (
    id: string,
    value: string
  ) => {
    updateField(
      "generalExaminations",
      data.generalExaminations.map((ge) =>
        ge.id === id
          ? { ...ge, examinationName: value }
          : ge
      )
    )
  }

  const removeGeneralExamination = (id: string) => {
    updateField(
      "generalExaminations",
      (data.generalExaminations || []).filter((ge) => ge.id !== id)
    )
  }

  /* ---------- past medical histories ---------- */

  const addPastMedicalHistory = () => {
    updateField("pastMedicalHistories", [
      ...(data.pastMedicalHistories || []),
      {
        id: crypto.randomUUID(),
        allergies: null,
        currentMedicine: null,
        medicalHistory: null,
      },
    ])
  }

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
    )
  }

  const removePastMedicalHistory = (id: string) => {
    updateField(
      "pastMedicalHistories",
      (data.pastMedicalHistories || []).filter((pmh) => pmh.id !== id)
    )
  }

  /* ---------- investigations ---------- */

  const addInvestigation = () => {
    updateField("investigations", [
      ...(data.investigations || []),
      {
        id: crypto.randomUUID(),
        investigationName: "",
        notes: null,
        documentUrl: null,
        documentFileName: null,
      },
    ])
  }

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
    )
  }

  const removeInvestigation = (id: string) => {
    updateField(
      "investigations",
      (data.investigations || []).filter((inv) => inv.id !== id)
    )
  }

  /* ---------- test requested ---------- */

  const addTestRequested = () => {
    updateField("testsRequested", [
      ...(data.testsRequested || []),
      {
        id: crypto.randomUUID(),
        testName: "",
        notes: null,
      },
    ])
  }

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
    )
  }

  const removeTestRequested = (id: string) => {
    updateField(
      "testsRequested",
      (data.testsRequested || []).filter((tr) => tr.id !== id)
    )
  }

  /* ---------- documents ---------- */

  const addDocument = () => {
    updateField("documents", [
      ...(data.documents || []),
      {
        id: crypto.randomUUID(),
        fileName: "",
        url: "",
      },
    ])
  }

  /** Add a document with pre-set fileName and URL (used for file upload) */
  const addDocumentWithValues = (fileName: string, url: string) => {
    updateField("documents", [
      ...(data.documents || []),
      {
        id: crypto.randomUUID(),
        fileName,
        url,
      },
    ])
  }

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
    )
  }

  const removeDocument = (id: string) => {
    updateField(
      "documents",
      (data.documents || []).filter((doc) => doc.id !== id)
    )
  }

  /* ---------- mic wrapper (UNCHANGED LOGIC) ---------- */

  const wrapWithMic = (
    fieldId: string,
    element: ReactElement<{ className?: string }>
  ) => {
    if (!mic) return element

    return (
      <VoiceMicField
        isListening={mic.isListening}
        isProcessing={mic.isProcessing}
        isActive={mic.activeVoiceField === fieldId}
        onMicToggle={() => mic.onMicToggle(fieldId)}
      >
        {element}
      </VoiceMicField>
    )
  }

  /* ---------- print handler ---------- */

  const handlePrintPrescription = () => {
    // Store current patient data in localStorage for the prescription page to use
    try {
      localStorage.setItem('prescriptionData', JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save prescription data:', e);
    }
    // Open prescription page in new tab for printing
    window.open("/prescription", "_blank");
  }

  /* ================= UI ================= */

  return (
    <div className="w-full">
      <div className="rounded-lg border bg-card p-1.5 shadow-sm">

        <div className="space-y-2">

          {/* Print Prescription Button */}
          <div className="flex justify-end px-2 pt-2 print:hidden">
            <button
              type="button"
              onClick={handlePrintPrescription}
              className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors shadow-sm text-sm font-medium"
              title="Print Prescription"
            >
              <Printer className="w-4 h-4" />
              Print Prescription
            </button>
          </div>

          {/* Patient Info */}
          <PatientPage
            data={data}
            updateField={updateField}
            inputClass={inputClass}
            mic={mic}
            registerFieldRef={registerFieldRef}
          />

          {/* Main - SOAP Clinical Flow */}
          <div className="space-y-2">

            {/* Past Medical History (after Patient Info, before Vitals) */}
            <MedicalHistoryPage
              data={data}
              addPastMedicalHistory={addPastMedicalHistory}
              updatePastMedicalHistory={updatePastMedicalHistory}
              removePastMedicalHistory={removePastMedicalHistory}
              inputClass={inputClass}
              wrapWithMic={wrapWithMic}
            />

            {/* Vitals Section */}
            <VitalsPage
              data={data}
              updateField={updateField}
              inputClass={inputClass}
              sectionPulseClass={sectionPulseClass}
              wrapWithMic={wrapWithMic as ( field: keyof PatientData, node: React.ReactElement ) => React.ReactElement}
              registerFieldRef={registerFieldRef}
            />

            {/* Chief Complaints (Subjective) */}
            <ComplaintsPage
              data={data}
              addComplaint={addComplaint}
              updateComplaint={updateComplaint}
              removeComplaint={removeComplaint}
              wrapWithMic={wrapWithMic}
              isHighlighted={isHighlighted}
            />

            {/* General Examination (Objective) */}
            <GeneralExaminationPage
              data={data}
              addGeneralExamination={addGeneralExamination}
              updateGeneralExamination={updateGeneralExamination}
              removeGeneralExamination={removeGeneralExamination}
              inputClass={inputClass}
              wrapWithMic={wrapWithMic}
              registerFieldRef={registerFieldRef}
            />

            {/* Diagnosis & Plan Row */}
            <div className="grid gap-2 xl:grid-cols-2">
              <DiagnosisPage
                data={data}
                addDiagnosis={addDiagnosis}
                removeDiagnosis={removeDiagnosis}
                updateDiagnosis={updateDiagnosis}
                isHighlighted={isHighlighted}
                wrapWithMic={wrapWithMic}
              />

              <PlanPage
                data={data}
                updateField={updateField}
                inputClass={inputClass}
                wrapWithMic={wrapWithMic}
              />
            </div>

            {/* Investigations Section */}
            <InvestigationsPage
              data={data}
              addInvestigation={addInvestigation}
              updateInvestigation={updateInvestigation}
              removeInvestigation={removeInvestigation}
              isHighlighted={isHighlighted}
              wrapWithMic={wrapWithMic}
            />

            {/* Test Requested Section */}
            <TestRequestedPage
              data={data}
              addTestRequested={addTestRequested}
              updateTestRequested={updateTestRequested}
              removeTestRequested={removeTestRequested}
              isHighlighted={isHighlighted}
              wrapWithMic={wrapWithMic}
            />

            {/* Documents Section */}
            <DocumentsPage
              data={data}
              addDocument={addDocument}
              addDocumentWithValues={addDocumentWithValues}
              updateDocument={updateDocument}
              removeDocument={removeDocument}
              isHighlighted={isHighlighted}
            />

            {/* Medicines (Treatment) */}
            <MedicinesPage
              data={data}
              addMedicine={addMedicine}
              removeMedicine={removeMedicine}
              updateMedicine={updateMedicine}
              applyMedicineMaster={applyMedicineMaster}
              inputClass={inputClass}
              isHighlighted={isHighlighted}
              wrapWithMic={wrapWithMic}
            />

            {/* Billing Section (Administrative) */}
            <BillingPage
              data={data}
              updateField={updateField}
              inputClass={inputClass}
              wrapWithMic={wrapWithMic}
            />

          </div>
        </div>
      </div>
    </div>
  )
}
