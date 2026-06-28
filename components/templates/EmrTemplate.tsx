import type { ReactElement } from "react";
import { Printer } from "lucide-react";
import { usePatientForm, BaseTemplateProps } from "@/hooks/usePatientForm";

import PatientPage from "../patient-form-fields/PatientPage";
import MedicalHistoryPage from "../patient-form-fields/MedicalHistoryPage";
import VitalsPage from "../patient-form-fields/VitalsPage";
import ComplaintsPage from "../patient-form-fields/ComplaintsPage";
import GeneralExaminationPage from "../patient-form-fields/GeneralExaminationPage";
import DiagnosisPage from "../patient-form-fields/DiagnosisPage";
import PlanPage from "../patient-form-fields/PlanPage";
import MedicinesPage from "../patient-form-fields/MedicinesPage";
import InvestigationsPage from "../patient-form-fields/InvestigationsPage";
import TestRequestedPage from "../patient-form-fields/TestRequestedPage";
import DocumentsPage from "../patient-form-fields/DocumentsPage";

export default function EmrTemplate(props: BaseTemplateProps) {
  const { data, mic, registerFieldRef, prescriptionHistoryNode, prescriptionHistoryLength } = props;
  
  const helpers = usePatientForm(props);

  return (
    <div className="w-full">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-none">
        
        {/* ==================================================== */}
        {/* LEFT COLUMN (lg:col-span-5)                         */}
        {/* ==================================================== */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          <PatientPage
            data={data}
            updateField={helpers.updateField}
            inputClass={helpers.inputClass}
            mic={mic}
            registerFieldRef={registerFieldRef}
            prescriptionHistoryLength={prescriptionHistoryLength}
          />

          <VitalsPage
            data={data}
            updateField={helpers.updateField}
            inputClass={helpers.inputClass}
            sectionPulseClass={helpers.sectionPulseClass}
            wrapWithMic={helpers.wrapWithMic as any}
            registerFieldRef={registerFieldRef}
          />

          <MedicalHistoryPage
            data={data}
            addPastMedicalHistory={helpers.addPastMedicalHistory}
            updatePastMedicalHistory={helpers.updatePastMedicalHistory}
            removePastMedicalHistory={helpers.removePastMedicalHistory}
            inputClass={helpers.inputClass}
            wrapWithMic={helpers.wrapWithMic}
          />

          <ComplaintsPage
            data={data}
            addComplaint={helpers.addComplaint}
            updateComplaint={helpers.updateComplaint}
            removeComplaint={helpers.removeComplaint}
            wrapWithMic={helpers.wrapWithMic}
          />

          <GeneralExaminationPage
            data={data}
            addGeneralExamination={helpers.addGeneralExamination}
            updateGeneralExamination={helpers.updateGeneralExamination}
            removeGeneralExamination={helpers.removeGeneralExamination}
            inputClass={helpers.inputClass}
            wrapWithMic={helpers.wrapWithMic}
            registerFieldRef={registerFieldRef}
          />

          <DiagnosisPage
            data={data}
            addDiagnosis={helpers.addDiagnosis}
            removeDiagnosis={helpers.removeDiagnosis}
            updateDiagnosis={helpers.updateDiagnosis}
            isHighlighted={helpers.isHighlighted}
            wrapWithMic={helpers.wrapWithMic}
          />

          <PlanPage
            data={data}
            updateField={helpers.updateField}
            inputClass={helpers.inputClass}
            wrapWithMic={helpers.wrapWithMic}
          />

        </div>

        {/* ==================================================== */}
        {/* RIGHT COLUMN (lg:col-span-7)                        */}
        {/* ==================================================== */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {prescriptionHistoryNode}

          <TestRequestedPage
            data={data}
            addTestRequested={helpers.addTestRequested}
            updateTestRequested={helpers.updateTestRequested}
            removeTestRequested={helpers.removeTestRequested}
            wrapWithMic={helpers.wrapWithMic}
          />

          <InvestigationsPage
            data={data}
            addInvestigation={helpers.addInvestigation}
            updateInvestigation={helpers.updateInvestigation}
            updateInvestigationMultiple={helpers.updateInvestigationMultiple}
            removeInvestigation={helpers.removeInvestigation}
            wrapWithMic={helpers.wrapWithMic}
          />

          <DocumentsPage
            data={data}
            addDocument={helpers.addDocument}
            addDocumentWithValues={helpers.addDocumentWithValues}
            updateDocument={helpers.updateDocument}
            removeDocument={helpers.removeDocument}
            isHighlighted={helpers.isHighlighted}
          />

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

          {/* Digital Signature */}
          <div className="flex justify-end mt-2 mb-8 print:hidden">
            <div className="border border-slate-200 shadow-sm rounded-xl bg-white w-full max-w-[340px] p-5 flex gap-5">
              <div className="flex-1 border-2 border-dashed border-slate-200 rounded-lg h-24 flex items-center justify-center bg-slate-50">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold text-center leading-relaxed">Doctor's<br/>Stamp</span>
              </div>
              <div className="flex-[1.2] flex flex-col items-center justify-end border-b-2 border-slate-800 pb-2 relative">
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
      </div>
    </div>
  );
}
