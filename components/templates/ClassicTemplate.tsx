import type { ReactElement } from "react";
import { Printer } from "lucide-react";
import { usePatientForm, BaseTemplateProps } from "@/hooks/usePatientForm";

import PatientPage from "../patient-form-fields/PatientPage";
import ComplaintsPage from "../patient-form-fields/ComplaintsPage";
import DiagnosisPage from "../patient-form-fields/DiagnosisPage";
import PlanPage from "../patient-form-fields/PlanPage";
import MedicinesPage from "../patient-form-fields/MedicinesPage";

export default function ClassicTemplate(props: BaseTemplateProps) {
  const { data, mic, registerFieldRef, prescriptionHistoryLength } = props;
  const helpers = usePatientForm(props);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-end px-2 pb-3 print:hidden">
        <button
          type="button"
          onClick={helpers.handlePrintPrescription}
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors shadow-sm text-sm font-medium"
          title="Print Prescription"
        >
          <Printer className="w-4 h-4" />
          Print Prescription
        </button>
      </div>

      <div className="flex flex-col gap-8 w-full bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
        
        {/* Patient Info */}
        <div className="border-b border-slate-200 pb-6">
          <PatientPage
            data={data}
            updateField={helpers.updateField}
            inputClass={helpers.inputClass}
            mic={mic}
            registerFieldRef={registerFieldRef}
            prescriptionHistoryLength={prescriptionHistoryLength}
          />
        </div>

        {/* Complaints (Subjective) */}
        <div>
          <ComplaintsPage
            data={data}
            addComplaint={helpers.addComplaint}
            updateComplaint={helpers.updateComplaint}
            removeComplaint={helpers.removeComplaint}
            wrapWithMic={helpers.wrapWithMic}
            isHighlighted={helpers.isHighlighted}
          />
        </div>

        {/* Diagnosis (Assessment) */}
        <div>
          <DiagnosisPage
            data={data}
            addDiagnosis={helpers.addDiagnosis}
            removeDiagnosis={helpers.removeDiagnosis}
            updateDiagnosis={helpers.updateDiagnosis}
            isHighlighted={helpers.isHighlighted}
            wrapWithMic={helpers.wrapWithMic}
          />
        </div>

        {/* Medicines (Treatment) */}
        <div>
          <MedicinesPage
            data={data}
            addMedicine={helpers.addMedicine}
            removeMedicine={helpers.removeMedicine}
            updateMedicine={helpers.updateMedicine}
            applyMedicineMaster={helpers.applyMedicineMaster}
            inputClass={helpers.inputClass}
            isHighlighted={helpers.isHighlighted}
            wrapWithMic={helpers.wrapWithMic}
          />
        </div>

        {/* Plan / Advice */}
        <div>
          <PlanPage
            data={data}
            updateField={helpers.updateField}
            inputClass={helpers.inputClass}
            wrapWithMic={helpers.wrapWithMic}
          />
        </div>

        {/* Digital Signature */}
        <div className="flex justify-end mt-8 pt-6 border-t border-slate-200 print:hidden">
          <div className="flex flex-col items-center justify-end border-b-2 border-slate-800 pb-2 relative w-48">
            <div className="h-16 flex items-end justify-center w-full mb-1">
              <span className="font-['Brush_Script_MT',cursive,serif] italic text-3xl text-slate-700 opacity-90 select-none">
                Dr. Smith
              </span>
            </div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-semibold">Signature</span>
          </div>
        </div>

      </div>
    </div>
  );
}
