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
import { ShieldCheck, Plus, Trash2, BadgeCheck } from "lucide-react";
import { PatientData, DiagnosisEntry } from "../patient-form-fields/types";
import { VoiceContext } from "@/hooks/useConsultationVoice";

type Props = {
  data: PatientData;

  addDiagnosis: () => void;
  removeDiagnosis: (id: string) => void;

  updateDiagnosis: (
    id: string,
    field: keyof Omit<DiagnosisEntry, "id">,
    value: string
  ) => void;

  isHighlighted?: (field: string) => boolean;

  wrapWithMic?: (
    context: VoiceContext,
    element: ReactElement<{ className?: string }>
  ) => JSX.Element;
};

export default function DiagnosisPage({
  data,
  addDiagnosis,
  removeDiagnosis,
  updateDiagnosis,
  isHighlighted = () => false,
  wrapWithMic = (_, el) => el,
}: Props) {
  const diagnoses = data.diagnoses || [];

  const inputStyle = (highlight = false) =>
    `h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 shadow-none
     placeholder:text-slate-400 transition-all
     hover:border-blue-300 focus-visible:border-blue-500 focus-visible:bg-white
     focus-visible:ring-2 focus-visible:ring-blue-100
     ${
       highlight
         ? "border-blue-400 bg-blue-50 ring-2 ring-blue-100"
         : ""
     }`;

  return (
    <Card className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-white px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-800">
            {wrapWithMic(
              { mode: "COMPONENT", component: "Diagnoses" },
              <div className="flex cursor-pointer items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    Diagnosis
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                      Clinical
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] font-medium normal-case tracking-normal text-slate-400">
                    Disease name, code and clinical duration
                  </p>
                </div>
              </div>
            )}
          </CardTitle>

          <Button
            type="button"
            size="sm"
            onClick={addDiagnosis}
            className="h-8 rounded-xl bg-blue-600 px-3 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add
          </Button>
        </div>
      </CardHeader>

      <CardContent className="bg-gradient-to-b from-emerald-50/35 to-white p-4">
        {diagnoses.length === 0 ? (
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-emerald-200 bg-white px-4 py-7 text-center shadow-sm">
            <div>
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <BadgeCheck className="h-6 w-6" />
              </div>

              <p className="text-sm font-bold text-slate-800">
                No diagnosis added
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Click Add to record patient diagnosis.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="hidden grid-cols-[52px_1.5fr_1fr_1fr_42px] gap-3 rounded-xl bg-slate-100 px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500 lg:grid">
              <div>#</div>
              <div>Diagnosis</div>
              <div>Code</div>
              <div>Duration</div>
              <div />
            </div>

            {diagnoses.map((d, index) => (
              <div
                key={d.id}
                className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md lg:grid-cols-[52px_1.5fr_1fr_1fr_42px] lg:items-center"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-xs font-bold text-emerald-600 ring-1 ring-emerald-100">
                    {index + 1}
                  </span>

                  <span className="text-xs font-semibold text-slate-700 lg:hidden">
                    Diagnosis #{index + 1}
                  </span>
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase text-slate-500 lg:hidden">
                    Diagnosis
                  </label>
                  {wrapWithMic(
                    {
                      mode: "FIELD",
                      field: `diagnoses.${d.id}.diagnosisName`,
                    },
                    <Input
                      value={d.diagnosisName}
                      onChange={(e) =>
                        updateDiagnosis(
                          d.id,
                          "diagnosisName",
                          e.target.value
                        )
                      }
                      placeholder="e.g. Acute bronchitis"
                      className={inputStyle(isHighlighted("diagnoses"))}
                    />
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase text-slate-500 lg:hidden">
                    Code
                  </label>
                  {wrapWithMic(
                    {
                      mode: "FIELD",
                      field: `diagnoses.${d.id}.diagnosisCode`,
                    },
                    <Input
                      value={d.diagnosisCode ?? ""}
                      onChange={(e) =>
                        updateDiagnosis(
                          d.id,
                          "diagnosisCode",
                          e.target.value
                        )
                      }
                      placeholder="e.g. J20.9"
                      className={inputStyle()}
                    />
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase text-slate-500 lg:hidden">
                    Duration
                  </label>
                  {wrapWithMic(
                    {
                      mode: "FIELD",
                      field: `diagnoses.${d.id}.diagnosisDuration`,
                    },
                    <Input
                      value={d.diagnosisDuration ?? ""}
                      onChange={(e) =>
                        updateDiagnosis(
                          d.id,
                          "diagnosisDuration",
                          e.target.value
                        )
                      }
                      placeholder="e.g. 5 days"
                      className={inputStyle()}
                    />
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-9 w-9 rounded-xl p-0 text-slate-400 hover:bg-red-50 hover:text-red-500"
                    onClick={() => removeDiagnosis(d.id)}
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