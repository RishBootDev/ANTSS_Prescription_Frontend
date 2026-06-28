import type { ReactElement } from "react";
import { Printer } from "lucide-react";
import { usePatientForm, BaseTemplateProps } from "@/hooks/usePatientForm";

import PatientPage from "../patient-form-fields/PatientPage";
import VitalsPage from "../patient-form-fields/VitalsPage";
import DiagnosisPage from "../patient-form-fields/DiagnosisPage";
import MedicinesPage from "../patient-form-fields/MedicinesPage";
import PlanPage from "../patient-form-fields/PlanPage";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ComplaintsPage from "../patient-form-fields/ComplaintsPage";
import TestRequestedPage from "../patient-form-fields/TestRequestedPage";

export default function QuickOpdTemplate(props: BaseTemplateProps) {
  const { data, mic, registerFieldRef, prescriptionHistoryLength } = props;
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
          Finish & Print
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {/* Top: Patient Mini Info */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <PatientPage
            data={data}
            updateField={helpers.updateField}
            inputClass={helpers.inputClass}
            mic={mic}
            registerFieldRef={registerFieldRef}
            prescriptionHistoryLength={prescriptionHistoryLength}
          />
        </div>

        {/* Middle Grid: Vitals, Diagnosis, Medicines (The Core of Quick OPD) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-4">
            <VitalsPage
              data={data}
              updateField={helpers.updateField}
              inputClass={helpers.inputClass}
              sectionPulseClass={helpers.sectionPulseClass}
              wrapWithMic={helpers.wrapWithMic as any}
              registerFieldRef={registerFieldRef}
            />
          </div>
          
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-4">
            <DiagnosisPage
              data={data}
              addDiagnosis={helpers.addDiagnosis}
              removeDiagnosis={helpers.removeDiagnosis}
              updateDiagnosis={helpers.updateDiagnosis}
              isHighlighted={helpers.isHighlighted}
              wrapWithMic={helpers.wrapWithMic}
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
          </div>
        </div>

        {/* Bottom: Plan and Optional Hidden Fields */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mt-4">
          <PlanPage
            data={data}
            updateField={helpers.updateField}
            inputClass={helpers.inputClass}
            wrapWithMic={helpers.wrapWithMic}
          />
        </div>

        {/* Accordion for everything else to keep the UI clean */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="additional-info">
              <AccordionTrigger className="text-slate-600 font-medium">Show Additional Information (Complaints, Tests)</AccordionTrigger>
              <AccordionContent className="pt-4 flex flex-col gap-6">
                <ComplaintsPage
                  data={data}
                  addComplaint={helpers.addComplaint}
                  updateComplaint={helpers.updateComplaint}
                  removeComplaint={helpers.removeComplaint}
                  wrapWithMic={helpers.wrapWithMic}
                  isHighlighted={helpers.isHighlighted}
                />
                <TestRequestedPage
                  data={data}
                  addTestRequested={helpers.addTestRequested}
                  updateTestRequested={helpers.updateTestRequested}
                  removeTestRequested={helpers.removeTestRequested}
                  wrapWithMic={helpers.wrapWithMic}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

      </div>
    </div>
  );
}
