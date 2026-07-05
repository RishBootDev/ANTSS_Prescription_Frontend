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
import { Stethoscope, Plus, Trash2, Activity } from "lucide-react";
import {
  PatientData,
  GeneralExaminationEntry,
} from "../patient-form-fields/types";
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
  const examinations = data.generalExaminations || [];

  const commonInputClass = (field: string) =>
    `h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 shadow-none
     placeholder:text-slate-400 transition-all
     hover:border-blue-300 focus-visible:border-blue-500 focus-visible:bg-white
     focus-visible:ring-2 focus-visible:ring-blue-100 ${inputClass(field)}`;

  return (
    <Card className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-white px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-800">
            {wrapWithMic(
              { mode: "COMPONENT", component: "General Examinations" },
              <div className="flex cursor-pointer items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                  <Stethoscope className="h-4.5 w-4.5" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    General Examination
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                      Clinical
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] font-medium normal-case tracking-normal text-slate-400">
                    Findings, status, severity and notes
                  </p>
                </div>
              </div>
            )}
          </CardTitle>

          <Button
            type="button"
            size="sm"
            onClick={addGeneralExamination}
            className="h-8 rounded-xl bg-blue-600 px-3 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add
          </Button>
        </div>
      </CardHeader>

      <CardContent className="bg-gradient-to-b from-blue-50/35 to-white p-4">
        {examinations.length === 0 ? (
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-blue-200 bg-white px-4 py-7 text-center shadow-sm">
            <div>
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Activity className="h-6 w-6" />
              </div>

              <p className="text-sm font-bold text-slate-800">
                No general examination added
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Click Add to record clinical findings.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="hidden grid-cols-[52px_1.4fr_1fr_1fr_1.3fr_42px] gap-3 rounded-xl bg-slate-100 px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500 lg:grid">
              <div>#</div>
              <div>Finding</div>
              <div>Status</div>
              <div>Severity</div>
              <div>Notes</div>
              <div />
            </div>

            {examinations.map((ge, index) => (
              <div
                key={ge.id}
                className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-blue-200 hover:shadow-md lg:grid-cols-[52px_1.4fr_1fr_1fr_1.3fr_42px] lg:items-center"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-600 ring-1 ring-blue-100">
                    {index + 1}
                  </span>

                  <span className="text-xs font-semibold text-slate-700 lg:hidden">
                    Examination #{index + 1}
                  </span>
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase text-slate-500 lg:hidden">
                    Finding
                  </label>
                  {wrapWithMic(
                    {
                      mode: "FIELD",
                      field: `generalExaminations.${ge.id}.finding`,
                    },
                    <Input
                      value={ge.finding}
                      onChange={(e) =>
                        updateGeneralExamination(
                          ge.id,
                          "finding",
                          e.target.value
                        )
                      }
                      placeholder="e.g. Pallor"
                      className={commonInputClass("generalExaminations")}
                      ref={(el) =>
                        registerFieldRef?.(
                          `generalExaminations.${ge.id}.finding`,
                          el
                        )
                      }
                    />
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase text-slate-500 lg:hidden">
                    Status
                  </label>
                  {wrapWithMic(
                    {
                      mode: "FIELD",
                      field: `generalExaminations.${ge.id}.status`,
                    },
                    <Input
                      value={ge.status}
                      onChange={(e) =>
                        updateGeneralExamination(
                          ge.id,
                          "status",
                          e.target.value
                        )
                      }
                      placeholder="e.g. Present"
                      className={commonInputClass("generalExaminations")}
                      ref={(el) =>
                        registerFieldRef?.(
                          `generalExaminations.${ge.id}.status`,
                          el
                        )
                      }
                    />
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase text-slate-500 lg:hidden">
                    Severity
                  </label>
                  {wrapWithMic(
                    {
                      mode: "FIELD",
                      field: `generalExaminations.${ge.id}.severity`,
                    },
                    <Input
                      value={ge.severity || ""}
                      onChange={(e) =>
                        updateGeneralExamination(
                          ge.id,
                          "severity",
                          e.target.value
                        )
                      }
                      placeholder="e.g. Mild"
                      className={commonInputClass("generalExaminations")}
                      ref={(el) =>
                        registerFieldRef?.(
                          `generalExaminations.${ge.id}.severity`,
                          el
                        )
                      }
                    />
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase text-slate-500 lg:hidden">
                    Notes
                  </label>
                  {wrapWithMic(
                    {
                      mode: "FIELD",
                      field: `generalExaminations.${ge.id}.notes`,
                    },
                    <Input
                      value={ge.notes || ""}
                      onChange={(e) =>
                        updateGeneralExamination(
                          ge.id,
                          "notes",
                          e.target.value
                        )
                      }
                      placeholder="e.g. lower eyelid"
                      className={commonInputClass("generalExaminations")}
                      ref={(el) =>
                        registerFieldRef?.(
                          `generalExaminations.${ge.id}.notes`,
                          el
                        )
                      }
                    />
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-9 w-9 rounded-xl p-0 text-slate-400 hover:bg-red-50 hover:text-red-500"
                    onClick={() => removeGeneralExamination(ge.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}