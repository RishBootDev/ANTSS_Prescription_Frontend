"use client";

import React from "react";
import { Printer, AlertCircle, RefreshCw } from "lucide-react";
import { usePrescription } from "@/hooks/usePrescription";
import { MappedPrescription } from "@/types/prescription";
import { PrescriptionHeader } from "./PrescriptionHeader";
import { PatientInformation } from "./PatientInformation";
import { DiagnosisSection } from "./DiagnosisSection";
import { MedicationTable } from "./MedicationTable";
import { TestRecommendations } from "./TestRecommendations";
import { FollowUpSection } from "./FollowUpSection";
import { PrescriptionFooter } from "./PrescriptionFooter";

// Keep old exports for backward compatibility
export type { Medicine, Vital, DiagnosticTest } from "./types-compat";

export interface PrescriptionViewProps {
  prescription?: MappedPrescription; // Option 1: Direct prescription object
  prescriptionId?: number; // Option 2: Dynamic API loading
}

export default function PrescriptionView({ prescription: directPrescription, prescriptionId }: PrescriptionViewProps) {
  // Use our custom hook if prescriptionId is provided
  const { 
    prescription: apiPrescription, 
    loading, 
    error, 
    refresh 
  } = usePrescription(prescriptionId !== undefined ? prescriptionId : null);

  // Determine active data source
  const prescription = directPrescription || apiPrescription;

  const handlePrint = () => {
    window.print();
  };

  // 1. Loading State (Skeleton Loader)
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 py-8 px-4 flex flex-col items-center justify-start print:bg-white print:py-0 print:px-0">
        <div className="w-[210mm] max-w-full mb-6 flex justify-between items-center no-print">
          <div className="h-5 w-40 bg-slate-200 animate-pulse rounded" />
          <div className="h-10 w-36 bg-slate-200 animate-pulse rounded" />
        </div>

        <div className="w-[210mm] min-h-[297mm] bg-white p-[15mm] flex flex-col justify-between shadow-2xl relative print:shadow-none print:w-full print:h-full print:p-0">
          <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex justify-between items-start gap-4">
              <div className="w-[38%] space-y-2">
                <div className="h-6 w-32 bg-slate-200 animate-pulse rounded" />
                <div className="h-4 w-24 bg-slate-200 animate-pulse rounded" />
                <div className="h-3.5 w-20 bg-slate-200 animate-pulse rounded" />
              </div>
              <div className="w-[24%] flex justify-center">
                <div className="h-14 w-14 bg-slate-200 animate-pulse rounded-full" />
              </div>
              <div className="w-[38%] space-y-2 text-right flex flex-col items-end">
                <div className="h-6 w-36 bg-slate-200 animate-pulse rounded" />
                <div className="h-3.5 w-44 bg-slate-200 animate-pulse rounded" />
                <div className="h-3.5 w-28 bg-slate-200 animate-pulse rounded" />
              </div>
            </div>

            <div className="border-b border-slate-200 my-3" />

            {/* Patient Info Skeleton */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <div className="h-5 w-72 bg-slate-200 animate-pulse rounded" />
                <div className="h-5 w-32 bg-slate-200 animate-pulse rounded" />
              </div>
              <div className="h-4 w-48 bg-slate-200 animate-pulse rounded" />
              <div className="h-4 w-full bg-slate-200 animate-pulse rounded" />
            </div>

            <div className="border-b border-slate-200 my-3" />

            {/* Complaints & Findings Skeleton */}
            <div className="grid grid-cols-2 gap-6 py-2">
              <div className="space-y-2">
                <div className="h-5 w-28 bg-slate-200 animate-pulse rounded" />
                <div className="h-4 w-full bg-slate-200 animate-pulse rounded" />
                <div className="h-4 w-5/6 bg-slate-200 animate-pulse rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-5 w-28 bg-slate-200 animate-pulse rounded" />
                <div className="h-4 w-full bg-slate-200 animate-pulse rounded" />
                <div className="h-4 w-5/6 bg-slate-200 animate-pulse rounded" />
              </div>
            </div>

            {/* Medicine Table Skeleton */}
            <div className="space-y-3 mt-4">
              <div className="h-6 w-10 bg-slate-200 animate-pulse rounded" />
              <div className="border-t border-b border-slate-300 py-1" />
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex gap-4">
                    <div className="h-5 w-[55%] bg-slate-200 animate-pulse rounded" />
                    <div className="h-5 w-[30%] bg-slate-200 animate-pulse rounded" />
                    <div className="h-5 w-[15%] bg-slate-200 animate-pulse rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Skeleton */}
          <div className="mt-12 flex justify-between items-end">
            <div className="h-5 w-40 bg-slate-200 animate-pulse rounded" />
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-32 bg-slate-200 animate-pulse rounded" />
              <div className="h-3 w-28 bg-slate-200 animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-xl p-6 shadow-lg text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-red-600 mb-2">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Failed to Load Prescription</h2>
          <p className="text-sm text-slate-600">{error}</p>
          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={refresh}
              className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Retry API Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Empty State
  if (!prescription) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-6 shadow-lg text-center space-y-3">
          <h2 className="text-lg font-bold text-slate-900">No Prescription Selected</h2>
          <p className="text-sm text-slate-600">Please provide a prescription ID or pass the prescription data to view.</p>
        </div>
      </div>
    );
  }

  // 4. Normal Render State
  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 flex flex-col items-center justify-start print:bg-white print:py-0 print:px-0">
      
      {/* Control bar - Hidden during print */}
      <div className="w-[210mm] max-w-full mb-6 flex justify-between items-center no-print">
        <span className="text-sm font-semibold text-slate-600">Prescription Preview (A4 Size)</span>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-md text-sm font-medium"
        >
          <Printer className="w-4 h-4" />
          Print Prescription
        </button>
      </div>

      {/* Main A4 Document Container */}
      <div className="w-[210mm] min-h-[297mm] bg-white text-black font-serif shadow-2xl p-[15mm] flex flex-col justify-between relative print:shadow-none print:w-full print:h-full print:p-0 print:m-0 print:min-h-0 print:overflow-visible">
        
        {/* Top & Body Container */}
        <div>
          {/* Header Block */}
          <PrescriptionHeader clinic={prescription.clinic} doctor={prescription.doctor} />

          {/* Thin grey separator */}
          <div className="border-b border-slate-300 my-3" />

          {/* Patient Information Block */}
          <PatientInformation patient={prescription.patient} vitals={prescription.vitals} />

          {/* Thin grey separator */}
          <div className="border-b border-slate-300 my-3" />

          {/* Two Column Layout: Chief Complaints, Clinical Findings, pastHistory, allergies, diagnosis */}
          <DiagnosisSection 
            chiefComplaints={prescription.chiefComplaints} 
            clinicalFindings={prescription.clinicalFindings || []} 
            pastHistory={prescription.pastHistory} 
            allergies={prescription.allergies} 
            diagnosis={prescription.diagnosis} 
          />

          {/* Thin grey separator */}
          <div className="border-b border-slate-300 my-4" />

          {/* Rx Section (Prescribed Medicines Table) */}
          <MedicationTable medicines={prescription.medicines} />

          {/* Test Recommendations Section */}
          <TestRecommendations tests={prescription.testsRecommended} />
          
          {/* Advice & Follow Up Section */}
          <FollowUpSection 
            advice={prescription.advice} 
            followUp={prescription.followUp} 
            additionalNotes={prescription.additionalNotes} 
          />
        </div>

        {/* Bottom Area (Signature & Footer Stamp) */}
        <PrescriptionFooter doctor={prescription.doctor} />
      </div>

      {/* Global CSS style overrides for accurate A4 print layouts */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          
          /* Enforce backgrounds/colors */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          html, body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            font-family: 'Times New Roman', Times, serif !important;
          }
          
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}