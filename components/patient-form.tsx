"use client"

import React, { useEffect, useState, useMemo } from "react"
import { BaseTemplateProps } from "@/hooks/usePatientForm"
import EmrTemplate from "./templates/EmrTemplate"
import ClassicTemplate from "./templates/ClassicTemplate"
import QuickOpdTemplate from "./templates/QuickOpdTemplate"
import { TemplateId } from "./TemplateSelector"

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

export function PatientForm(props: BaseTemplateProps) {
  const [templateId, setTemplateId] = useState<TemplateId>("EMR");

  useEffect(() => {
    // Initial load from localStorage
    const stored = localStorage.getItem("preferred_prescription_template") as TemplateId;
    if (stored) {
      setTemplateId(stored);
    }

    // Listen for custom event from ConsultationHeader
    const handleTemplateChanged = (e: Event) => {
      const customEvent = e as CustomEvent<TemplateId>;
      if (customEvent.detail) {
        setTemplateId(customEvent.detail);
      }
    };

    window.addEventListener("templateChanged", handleTemplateChanged);
    return () => window.removeEventListener("templateChanged", handleTemplateChanged);
  }, []);

  const TemplateComponent = useMemo(() => {
    switch (templateId) {
      case "CLASSIC":
        return ClassicTemplate;
      case "QUICK_OPD":
        return QuickOpdTemplate;
      case "EMR":
      default:
        return EmrTemplate;
    }
  }, [templateId]);

  return <TemplateComponent {...props} />;
}
