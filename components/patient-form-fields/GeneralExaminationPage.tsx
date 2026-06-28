"use client";

import { JSX, ReactElement } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Stethoscope, Plus, Trash2 } from "lucide-react";
import { PatientData, GeneralExaminationEntry } from "../patient-form-fields/types";
import { VoiceContext } from "@/hooks/useConsultationVoice";

type Props = {
  data: PatientData;

  addGeneralExamination: () => void;
  removeGeneralExamination: (id: string) => void;

  updateGeneralExamination: (
    id: string,
    field: keyof Omit<GeneralExaminationEntry, "id">,
    value: string
  ) => void;

  inputClass?: (field: string) => string;

  wrapWithMic?: (
    context: VoiceContext,
    element: ReactElement<{ className?: string }>
  ) => JSX.Element;
  registerFieldRef?: (fieldName: string, el: HTMLElement | null) => void;
};

export default function GeneralExaminationPage({
  data,
  addGeneralExamination,
  removeGeneralExamination,
  updateGeneralExamination,
  inputClass = () => "",
  wrapWithMic = (_, el) => el,
  registerFieldRef,
}: Props) {
  return (
    <Card className="border-slate-200 shadow-sm rounded-xl bg-white overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 px-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            {wrapWithMic(
              { mode: "COMPONENT", component: "General Examinations" },
              <div className="flex items-center gap-2 cursor-pointer">
                <Stethoscope className="h-4 w-4 text-slate-500" />
                General Examination
              </div>
            )}
          </CardTitle>

          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 px-3 text-xs bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
            onClick={addGeneralExamination}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {(data.generalExaminations?.length ?? 0) === 0 ? (
          <div className="rounded-md border bg-card/30 py-2 px-2 text-center text-xs text-muted-foreground">
            No general examinations yet. Click "Add" to add one.
          </div>
        ) : (
          <div className="space-y-3">
            {/* Column Headers */}
            <div className="flex gap-2 px-8 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              <div className="w-1/3">Finding</div>
              <div className="w-1/4">Status</div>
              <div className="w-1/4">Severity</div>
              <div className="flex-1">Notes</div>
            </div>

            {(data.generalExaminations || []).map((ge, index) => (
              <div
                key={ge.id}
                className="flex items-center gap-2"
              >
                {/* Index */}
                <div className="text-center text-[11px] font-medium text-slate-400 w-6 flex-shrink-0">
                  {index + 1}
                </div>

                {/* Finding */}
                <div className="w-1/3">
                  {wrapWithMic(
                    { mode: "FIELD", field: `generalExaminations.${ge.id}.finding` },
                    <Input
                      value={ge.finding}
                      onChange={(e) => updateGeneralExamination(ge.id, "finding", e.target.value)}
                      placeholder="e.g., Pallor"
                      className={`h-8 text-xs bg-slate-50 border-slate-200 focus-visible:ring-sky-500 ${inputClass("generalExaminations")}`}
                      ref={(el) => registerFieldRef?.(`generalExaminations.${ge.id}.finding`, el)}
                    />
                  )}
                </div>

                {/* Status */}
                <div className="w-1/4">
                  {wrapWithMic(
                    { mode: "FIELD", field: `generalExaminations.${ge.id}.status` },
                    <Input
                      value={ge.status}
                      onChange={(e) => updateGeneralExamination(ge.id, "status", e.target.value)}
                      placeholder="e.g., Present"
                      className={`h-8 text-xs bg-slate-50 border-slate-200 focus-visible:ring-sky-500 ${inputClass("generalExaminations")}`}
                      ref={(el) => registerFieldRef?.(`generalExaminations.${ge.id}.status`, el)}
                    />
                  )}
                </div>

                {/* Severity */}
                <div className="w-1/4">
                  {wrapWithMic(
                    { mode: "FIELD", field: `generalExaminations.${ge.id}.severity` },
                    <Input
                      value={ge.severity || ""}
                      onChange={(e) => updateGeneralExamination(ge.id, "severity", e.target.value)}
                      placeholder="e.g., Mild"
                      className={`h-8 text-xs bg-slate-50 border-slate-200 focus-visible:ring-sky-500 ${inputClass("generalExaminations")}`}
                      ref={(el) => registerFieldRef?.(`generalExaminations.${ge.id}.severity`, el)}
                    />
                  )}
                </div>

                {/* Notes */}
                <div className="flex-1">
                  {wrapWithMic(
                    { mode: "FIELD", field: `generalExaminations.${ge.id}.notes` },
                    <Input
                      value={ge.notes || ""}
                      onChange={(e) => updateGeneralExamination(ge.id, "notes", e.target.value)}
                      placeholder="e.g., lower eyelid"
                      className={`h-8 text-xs bg-slate-50 border-slate-200 focus-visible:ring-sky-500 ${inputClass("generalExaminations")}`}
                      ref={(el) => registerFieldRef?.(`generalExaminations.${ge.id}.notes`, el)}
                    />
                  )}
                </div>

                {/* Delete */}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                  onClick={() => removeGeneralExamination(ge.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}