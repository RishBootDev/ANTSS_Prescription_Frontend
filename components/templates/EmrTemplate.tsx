"use client";

import { useState } from "react";
import {
  Activity,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  FileSearch,
  FileText,
  FolderOpen,
  HeartPulse,
  History,
  ListChecks,
  Pill,
  Stethoscope,
  Syringe,
  TestTube2,
  Users,
  Clock3,
  Eye,
  Sparkles,
  ChevronRight,
  Compass,
} from "lucide-react";
import { usePatientForm, BaseTemplateProps } from "@/hooks/usePatientForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const {
    data,
    mic,
    registerFieldRef,
    prescriptionHistoryNode,
    prescriptionHistoryLength,
    visitHistory = [],
  } = props;

  const helpers = usePatientForm(props);

  const [visitsOpen, setVisitsOpen] = useState(true);
  const [prescriptionsOpen, setPrescriptionsOpen] = useState(false);
  const [documentsPreviewOpen, setDocumentsPreviewOpen] = useState(false);
  const [labReportsPreviewOpen, setLabReportsPreviewOpen] = useState(false);

  const [selectedVisit, setSelectedVisit] = useState<{
    prescriptionId: number;
    createdAt?: string;
  } | null>(null);

  const savedInvestigationCount = (data.investigations || []).filter((inv) =>
    [inv.test, inv.value, inv.notes, inv.documentUrl, inv.documentFileName].some(
      (value) => typeof value === "string" && value.trim() !== ""
    )
  ).length;

  const savedDocumentCount = (data.documents || []).filter((doc) =>
    [doc.fileName, doc.url].some((value) => typeof value === "string" && value.trim() !== "")
  ).length;

  const formSections = [
    { id: "chief-complaints", label: "Chief Complaints", icon: ClipboardList },
    { id: "past-medical-history", label: "Medical History", icon: History },
    { id: "general-examination", label: "Examination", icon: Stethoscope },
    { id: "diagnosis", label: "Diagnosis", icon: FileSearch },
    { id: "medicines", label: "Medicines", icon: Pill },
    { id: "investigations", label: "Investigations", icon: TestTube2 },
    { id: "tests-requested", label: "Tests Requested", icon: Activity },
    { id: "plan", label: "Plan & Follow-up", icon: ListChecks },
    { id: "documents", label: "Documents", icon: FolderOpen },
    { id: "vitals", label: "Vitals", icon: HeartPulse },
  ];

  const navigateToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const formatVisitDate = (date?: string) => {
    if (!date) return "Visit date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="emr-workspace w-full pb-14">
      <div className="patient-summary sticky top-[65px] z-40 -mx-3 mb-5 border-b border-slate-200 bg-white shadow-sm sm:-mx-4 lg:-mx-6">
        <PatientPage
          data={data}
          updateField={helpers.updateField}
          inputClass={helpers.inputClass}
          mic={mic}
          registerFieldRef={registerFieldRef}
          prescriptionHistoryLength={prescriptionHistoryLength}
        />
      </div>

      <div className="grid w-full grid-cols-1 gap-4 xl:grid-cols-[290px_minmax(560px,1fr)_320px]">
        <aside className="timeline-rail flex min-w-0 flex-col gap-3 xl:sticky xl:top-[151px] xl:max-h-[calc(100vh-164px)] xl:self-start xl:overflow-y-auto xl:overflow-x-hidden xl:pr-1">
          <nav className="hidden shrink-0 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm lg:block">
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 px-4 py-4 text-white">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-2xl" />

              <div className="relative flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                  <Clock3 className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-bold uppercase tracking-wide">
                    Patient Timeline
                  </p>
                  <p className="mt-0.5 text-[11px] text-white/75">
                    Complete clinical visit history
                  </p>
                </div>
              </div>

              <div className="relative mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-white/12 px-3 py-2 ring-1 ring-white/15">
                  <p className="text-[10px] uppercase text-white/65">Visits</p>
                  <p className="text-lg font-bold">{visitHistory.length}</p>
                </div>

                <div className="rounded-xl bg-white/12 px-3 py-2 ring-1 ring-white/15">
                  <p className="text-[10px] uppercase text-white/65">Rx</p>
                  <p className="text-lg font-bold">
                    {prescriptionHistoryLength ?? 0}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setVisitsOpen((open) => !open)}
              className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-700 transition hover:bg-blue-50/50"
              aria-expanded={visitsOpen}
            >
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                Visits
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] text-blue-600">
                  {visitHistory.length}
                </span>
              </span>

              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform ${
                  visitsOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {visitsOpen && (
              <div className="max-h-[300px] overflow-y-auto bg-gradient-to-b from-slate-50 to-white px-3 py-3">
                {visitHistory.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white px-3 py-5 text-center">
                    <CalendarDays className="mx-auto mb-2 h-5 w-5 text-slate-400" />
                    <p className="text-xs font-semibold text-slate-500">
                      No previous visits
                    </p>
                  </div>
                ) : (
                  <div className="relative space-y-3">
                    <div className="absolute bottom-4 left-[15px] top-4 w-px bg-gradient-to-b from-blue-400 via-blue-200 to-transparent" />

                    {visitHistory.map((visit, index) => {
                      const isLatest = index === 0;

                      return (
                        <button
                          key={visit.prescriptionId}
                          type="button"
                          onClick={() => setSelectedVisit(visit)}
                          className="group relative flex w-full gap-3 text-left"
                        >
                          <div
                            className={`relative z-10 mt-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-4 border-white shadow-sm ${
                              isLatest
                                ? "bg-blue-600 text-white"
                                : "bg-blue-50 text-blue-600"
                            }`}
                          >
                            {isLatest ? (
                              <Sparkles className="h-3.5 w-3.5" />
                            ) : (
                              <CalendarDays className="h-3.5 w-3.5" />
                            )}
                          </div>

                          <div
                            className={`min-w-0 flex-1 rounded-2xl border bg-white px-3 py-3 shadow-sm transition-all group-hover:-translate-y-0.5 group-hover:border-blue-200 group-hover:shadow-md ${
                              isLatest
                                ? "border-blue-200 ring-1 ring-blue-100"
                                : "border-slate-200"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate text-xs font-bold text-slate-800">
                                {formatVisitDate(visit.createdAt)}
                              </p>

                              {isLatest && (
                                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-600">
                                  Latest
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-[11px] font-medium text-slate-500">
                              Prescription #{visit.prescriptionId}
                            </p>

                            <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
                              <span className="text-[10px] font-semibold text-blue-600">
                                View details
                              </span>
                              <Eye className="h-3.5 w-3.5 text-blue-500 opacity-70" />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-slate-100 p-2">
              <button
  type="button"
  onClick={() => setPrescriptionsOpen((open) => !open)}
  className={`group mx-2 mb-2 flex w-[calc(100%-16px)] items-center justify-between rounded-2xl border px-3 py-3 transition-all duration-200 ${
    prescriptionsOpen
      ? "border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm"
      : "border-transparent hover:border-slate-200 hover:bg-slate-50"
  }`}
>
  <div className="flex items-center gap-3">
    <div
      className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
        prescriptionsOpen
          ? "bg-blue-600 text-white shadow-md"
          : "bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600"
      }`}
    >
      <Syringe className="h-4 w-4" />
    </div>

    <div className="text-left">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-800">
          Prescriptions
        </span>

        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-600">
          {prescriptionHistoryLength ?? 0}
        </span>
      </div>

      <p className="mt-0.5 text-[10px] text-slate-500">
        Previous prescriptions
      </p>
    </div>
  </div>

  <ChevronDown
    className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${
      prescriptionsOpen ? "rotate-180 text-blue-600" : ""
    }`}
  />
</button>

              {prescriptionsOpen && (
  <div className="mb-2 rounded-2xl border border-blue-100 bg-blue-50/40 p-2">
    <div
      className="
        max-h-72 overflow-y-auto rounded-xl
        [&>div]:border-0
        [&>div]:shadow-none
        [&>div>div:first-child]:hidden
      "
    >
      {prescriptionHistoryNode}
    </div>
  </div>
)}

              <button
  type="button"
  onClick={() => setLabReportsPreviewOpen(true)}
  className="group mx-2 mb-2 flex w-[calc(100%-16px)] items-center justify-between rounded-2xl border border-transparent px-3 py-3 transition-all duration-200 hover:border-cyan-200 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-sky-50 hover:shadow-sm"
>
  <div className="flex items-center gap-3">
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 transition-all group-hover:bg-cyan-600 group-hover:text-white group-hover:shadow-md">
      <FileText className="h-4 w-4" />
    </div>

    <div className="text-left">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-800">
          Lab Reports
        </span>

        <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-bold text-cyan-700">
          {savedInvestigationCount}
        </span>
      </div>

      <p className="mt-0.5 text-[10px] text-slate-500">
        Investigation reports
      </p>
    </div>
  </div>

  <ChevronRight className="h-4 w-4 text-slate-400 transition-all group-hover:translate-x-1 group-hover:text-cyan-600" />
</button>

              <button
  type="button"
  onClick={() => setDocumentsPreviewOpen(true)}
  className="group mx-2 mb-2 flex w-[calc(100%-16px)] items-center justify-between rounded-2xl border border-transparent px-3 py-3 transition-all duration-200 hover:border-amber-200 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:shadow-sm"
>
  <div className="flex items-center gap-3">
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 transition-all group-hover:bg-amber-600 group-hover:text-white group-hover:shadow-md">
      <FolderOpen className="h-4 w-4" />
    </div>

    <div className="text-left">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-800">
          Documents
        </span>

        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
          {savedDocumentCount}
        </span>
      </div>

      <p className="mt-0.5 text-[10px] text-slate-500">
        Uploaded clinical files
      </p>
    </div>
  </div>

  <ChevronRight className="h-4 w-4 text-slate-400 transition-all duration-200 group-hover:translate-x-1 group-hover:text-amber-600" />
</button>
            </div>
          </nav>

          <nav className="hidden shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
  <div className="border-b border-slate-100 px-4 py-2.5">
    <div className="flex items-center justify-between gap-2">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-800">
          Form Navigation
        </p>
        <p className="mt-0.5 text-[10px] font-medium text-slate-400">
          Quick jump to section
        </p>
      </div>

      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
        <Compass className="h-4 w-4" />
      </div>
    </div>
  </div>

  <div className="flex flex-wrap gap-1.5 p-2.5">
    {formSections.map(({ id, label, icon: Icon }) => (
      <button
        key={id}
        type="button"
        onClick={() => navigateToSection(id)}
        title={label}
        className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
      >
        <Icon className="h-3 w-3 shrink-0 text-slate-400 group-hover:text-blue-600" />
        <span className="max-w-[92px] truncate">{label}</span>
      </button>
    ))}
  </div>
</nav>

         <div
  id="documents"
  className="shrink-0 scroll-mt-[150px] overflow-hidden rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/70 via-white to-orange-50/60 p-[1px] shadow-[0_10px_30px_rgba(245,158,11,0.10)]"
>
  <div className="rounded-2xl bg-white">
    <DocumentsPage
      data={data}
      addDocument={helpers.addDocument}
      addDocumentWithValues={helpers.addDocumentWithValues}
      updateDocument={helpers.updateDocument}
      removeDocument={helpers.removeDocument}
      isHighlighted={helpers.isHighlighted}
      previewOpen={documentsPreviewOpen}
      onPreviewOpenChange={setDocumentsPreviewOpen}
    />
  </div>
</div>
        </aside>

        <section className="clinical-form-stack flex min-w-0 flex-col gap-3">
          <div id="chief-complaints" className="scroll-mt-[150px]">
            <ComplaintsPage
              data={data}
              addComplaint={helpers.addComplaint}
              updateComplaint={helpers.updateComplaint}
              removeComplaint={helpers.removeComplaint}
              wrapWithMic={helpers.wrapWithMic}
            />
          </div>

          <div id="past-medical-history" className="scroll-mt-[150px]">
            <MedicalHistoryPage
              data={data}
              addPastMedicalHistory={helpers.addPastMedicalHistory}
              updatePastMedicalHistory={helpers.updatePastMedicalHistory}
              removePastMedicalHistory={helpers.removePastMedicalHistory}
              inputClass={helpers.inputClass}
              wrapWithMic={helpers.wrapWithMic}
            />
          </div>

          <div id="general-examination" className="scroll-mt-[150px]">
            <GeneralExaminationPage
              data={data}
              addGeneralExamination={helpers.addGeneralExamination}
              updateGeneralExamination={helpers.updateGeneralExamination}
              removeGeneralExamination={helpers.removeGeneralExamination}
              inputClass={helpers.inputClass}
              wrapWithMic={helpers.wrapWithMic}
              registerFieldRef={registerFieldRef}
            />
          </div>

          <div id="diagnosis" className="scroll-mt-[150px]">
            <DiagnosisPage
              data={data}
              addDiagnosis={helpers.addDiagnosis}
              removeDiagnosis={helpers.removeDiagnosis}
              updateDiagnosis={helpers.updateDiagnosis}
              isHighlighted={helpers.isHighlighted}
              wrapWithMic={helpers.wrapWithMic}
            />
          </div>

          <div id="medicines" className="scroll-mt-[150px]">
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

          <div id="investigations" className="scroll-mt-[150px]">
            <InvestigationsPage
              data={data}
              addInvestigation={helpers.addInvestigation}
              updateInvestigation={helpers.updateInvestigation}
              updateInvestigationMultiple={helpers.updateInvestigationMultiple}
              removeInvestigation={helpers.removeInvestigation}
              wrapWithMic={helpers.wrapWithMic}
              previewOpen={labReportsPreviewOpen}
              onPreviewOpenChange={setLabReportsPreviewOpen}
            />
          </div>

          <div id="tests-requested" className="scroll-mt-[150px]">
            <TestRequestedPage
              data={data}
              addTestRequested={helpers.addTestRequested}
              updateTestRequested={helpers.updateTestRequested}
              removeTestRequested={helpers.removeTestRequested}
              wrapWithMic={helpers.wrapWithMic}
            />
          </div>

          <div id="plan" className="scroll-mt-[150px]">
            <PlanPage
              data={data}
              updateField={helpers.updateField}
              inputClass={helpers.inputClass}
              wrapWithMic={helpers.wrapWithMic}
            />
          </div>
        </section>

        <aside className="vitals-rail flex min-w-0 flex-col gap-3 xl:sticky xl:top-[151px] xl:h-[calc(100vh-164px)] xl:self-start xl:overflow-y-auto xl:overflow-x-hidden xl:pr-1">
          <div id="vitals" className="shrink-0 scroll-mt-[150px]">
            <VitalsPage
              data={data}
              updateField={helpers.updateField}
              inputClass={helpers.inputClass}
              sectionPulseClass={helpers.sectionPulseClass}
              wrapWithMic={helpers.wrapWithMic as any}
              registerFieldRef={registerFieldRef}
            />
          </div>

          {data.allergies &&
            data.allergies !== "None" &&
            data.allergies !== "N/A" && (
              <div className="shrink-0 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 shadow-sm">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-red-500">
                  Drug allergy
                </p>
                <p className="font-semibold">{data.allergies}</p>
              </div>
            )}
        </aside>
      </div>

      <button
        id="print-prescription-action"
        type="button"
        onClick={helpers.handlePrintPrescription}
        aria-hidden="true"
        tabIndex={-1}
        className="hidden"
      />

      <Dialog
        open={selectedVisit !== null}
        onOpenChange={(open) => !open && setSelectedVisit(null)}
      >
        <DialogContent className="flex h-[94vh] max-h-[94vh] !w-[calc(100vw-3rem)] !max-w-[1200px] flex-col gap-0 overflow-hidden border-slate-200 bg-slate-100 p-0">
          <DialogHeader className="shrink-0 border-b border-slate-200 bg-white px-5 py-4 pr-14">
            <DialogTitle className="flex items-center gap-2 text-base text-slate-900">
              <CalendarDays className="h-4 w-4 text-primary" />
              Prescription details
            </DialogTitle>

            <DialogDescription className="text-xs">
              {selectedVisit?.createdAt
                ? new Date(selectedVisit.createdAt).toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    }
                  )
                : "Selected visit"}
              {" · Read only"}
            </DialogDescription>
          </DialogHeader>

          {selectedVisit && (
            <iframe
              key={selectedVisit.prescriptionId}
              src={`/prescription?id=${selectedVisit.prescriptionId}`}
              title={`Prescription from ${
                selectedVisit.createdAt || selectedVisit.prescriptionId
              }`}
              className="min-h-0 w-full flex-1 border-0 bg-slate-100"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
