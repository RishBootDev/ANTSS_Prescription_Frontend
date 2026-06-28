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
import { ShieldCheck, Plus, Trash2 } from "lucide-react";
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
  return (
    <Card className="border-slate-200 shadow-sm rounded-xl bg-white overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 px-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            {wrapWithMic(
              { mode: "COMPONENT", component: "Diagnoses" },
              <div className="flex items-center gap-2 cursor-pointer">
                <ShieldCheck className="h-4 w-4 text-slate-500" />
                Diagnosis
              </div>
            )}
          </CardTitle>

          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 px-3 text-xs bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
            onClick={addDiagnosis}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {(data.diagnoses?.length ?? 0) === 0 ? (
          <div className="rounded-md border bg-card/30 py-2 px-2 text-center text-xs text-muted-foreground">
            No diagnoses yet. Use voice or click "Add".
          </div>
        ) : (
          <div className="w-full">
            <div className="w-full">

              {/* Header */}
              <div className="hidden lg:grid grid-cols-[52px_1.35fr_1fr_0.7fr_36px] items-center gap-2 rounded-md px-2 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                <div>#</div>
                <div>Diagnosis</div>
                <div>Code</div>
                <div>Duration</div>
                <div />
              </div>

              {/* Rows */}
              <div className="space-y-4 lg:space-y-2 pt-1">
                {(data.diagnoses || []).map((d, index) => (
                  <div
                    key={d.id}
                    className="relative grid grid-cols-1 lg:grid-cols-[52px_1.35fr_1fr_0.7fr_36px] items-start gap-3 lg:gap-2 p-3 lg:p-0 lg:px-2 border lg:border-none border-slate-100 rounded-lg bg-slate-50/50 lg:bg-transparent"
                  >
                    {/* 1. Index (Desktop) */}
                    <div className="hidden lg:block pt-2 text-center text-[11px] font-medium text-slate-400">
                      {index + 1}
                    </div>

                    {/* Mobile Index (Hidden on Desktop) */}
                    <div className="lg:hidden flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-slate-700">Diagnosis #{index + 1}</span>
                    </div>

                    {/* 2. Diagnosis Name */}
                    <div className="flex flex-col gap-1 lg:block lg:gap-0">
                      <label className="lg:hidden text-[10px] uppercase text-slate-500 font-semibold">Diagnosis</label>
                      {wrapWithMic(
                        { mode: "FIELD", field: `diagnoses.${d.id}.diagnosisName` },
                        <Input
                          value={d.diagnosisName}
                          onChange={(e) =>
                            updateDiagnosis(d.id, "diagnosisName", e.target.value)
                          }
                          placeholder="e.g., Acute bronchitis"
                          className="h-8 text-sm"
                        />
                      )}
                    </div>

                    {/* 3 & 4. Code and Duration */}
                    <div className="grid grid-cols-2 gap-3 lg:contents">
                      <div className="flex flex-col gap-1 lg:block lg:gap-0">
                        <label className="lg:hidden text-[10px] uppercase text-slate-500 font-semibold">Code</label>
                        {wrapWithMic(
                          { mode: "FIELD", field: `diagnoses.${d.id}.diagnosisCode` },
                          <Input
                            value={d.diagnosisCode ?? ""}
                            onChange={(e) =>
                              updateDiagnosis(d.id, "diagnosisCode", e.target.value)
                            }
                            placeholder="Code"
                            className="h-8 text-sm"
                          />
                        )}
                      </div>

                      <div className="flex flex-col gap-1 lg:block lg:gap-0">
                        <label className="lg:hidden text-[10px] uppercase text-slate-500 font-semibold">Duration</label>
                        {wrapWithMic(
                          { mode: "FIELD", field: `diagnoses.${d.id}.diagnosisDuration` },
                          <Input
                            value={d.diagnosisDuration ?? ""}
                            onChange={(e) =>
                              updateDiagnosis(d.id, "diagnosisDuration", e.target.value)
                            }
                            placeholder="Duration"
                            className="h-8 text-sm"
                          />
                        )}
                      </div>
                    </div>

                    {/* 5. Trash Button */}
                    <div className="absolute top-2 right-2 lg:static lg:flex lg:justify-end lg:pt-1 z-10">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        onClick={() => removeDiagnosis(d.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}