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
import MedicinesPage from "./patient-form-fields/MedicinesPage"
import BillingPage from "./patient-form-fields/BillingPage"
import QuickNotesPage from "./patient-form-fields/QuickNotesPage"

/* ================= TYPES ================= */

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

export interface PatientData {
  registrationId?: number | null
  registrationNumber?: string | null
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
  respiratoryRate?: number | null
  bloodGroup: string | null
  lmp: string | null
  visitDate: string | null

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
      ...data.medicines,
      {
        id: crypto.randomUUID(),
        name: "",
        dose: "",
        frequency: "",
        duration: "",
        instructions: "",
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

  const removeMedicine = (id: string) => {
    updateField(
      "medicines",
      data.medicines.filter((m) => m.id !== id)
    )
  }

  /* ---------- complaints ---------- */

  const addComplaint = () => {
    updateField("complaints", [
      ...data.complaints,
      {
        id: crypto.randomUUID(),
        complaint: "",
        frequency: null,
        severity: null,
        duration: null,
        date: null,
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
      data.complaints.filter((c) => c.id !== id)
    )
  }

  /* ---------- diagnosis ---------- */

  const addDiagnosis = () => {
    updateField("diagnoses", [
      ...data.diagnoses,
      {
        id: crypto.randomUUID(),
        diagnosis: "",
        snomedCode: null,
        duration: null,
        date: null,
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
      data.diagnoses.filter((d) => d.id !== id)
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
    // Open prescription demo page in new tab for printing
    window.open("/prescription-demo", "_blank");
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
              updateField={updateField}
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
              updateField={updateField}
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

            {/* Medicines (Treatment) */}
            <MedicinesPage
              data={data}
              addMedicine={addMedicine}
              removeMedicine={removeMedicine}
              updateMedicine={updateMedicine}
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