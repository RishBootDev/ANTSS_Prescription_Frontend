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
import { PatientData, DiagnosisEntry } from "../patient-form";

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
    fieldId: string,
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
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-1.5 px-3 pt-2.5">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-1.5 text-sm font-semibold">
            <ShieldCheck className="h-3.5 w-3.5 text-accent" />
            Diagnosis
          </CardTitle>

          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-6 gap-1 text-[10px]"
            onClick={addDiagnosis}
          >
            <Plus className="h-3 w-3" />
            Add
          </Button>
        </div>
      </CardHeader>

      <CardContent className="px-3 pb-2.5">
        {(data.diagnoses?.length ?? 0) === 0 ? (
          <div className="rounded-md border bg-card/30 py-2 px-2 text-center text-xs text-muted-foreground">
            No diagnoses yet. Use voice or click "Add".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[780px]">

              {/* Header */}
              <div className="grid grid-cols-[52px_1.35fr_1fr_0.7fr_36px] items-center gap-1.5 rounded-md bg-muted/30 px-2 py-1 text-[10px] font-medium text-muted-foreground">
                <div>#</div>
                <div>Diagnosis</div>
                <div>Code</div>
                <div>Duration</div>
                <div />
              </div>

              {/* Rows */}
              <div className="space-y-1.5 pt-1.5">
                {(data.diagnoses || []).map((d, index) => (
                  <div
                    key={d.id}
                    className="grid grid-cols-[52px_1.35fr_1fr_0.7fr_36px] items-start gap-1.5 rounded-md border bg-card px-2 py-1.5"
                  >
                    <div className="pt-1.5 text-center text-[11px] text-muted-foreground">
                      {index + 1}
                    </div>

                    {wrapWithMic(
                      `diagnoses.${d.id}.diagnosisName`,
                      <Input
                        value={d.diagnosisName}
                        onChange={(e) =>
                          updateDiagnosis(d.id, "diagnosisName", e.target.value)
                        }
                        placeholder="e.g., Acute bronchitis"
                        className="h-8 text-sm"
                      />
                    )}

                    {wrapWithMic(
                      `diagnoses.${d.id}.diagnosisCode`,
                      <Input
                        value={d.diagnosisCode ?? ""}
                        onChange={(e) =>
                          updateDiagnosis(d.id, "diagnosisCode", e.target.value)
                        }
                        placeholder="Code"
                        className="h-8 text-sm"
                      />
                    )}

                    {wrapWithMic(
                      `diagnoses.${d.id}.diagnosisDuration`,
                      <Input
                        value={d.diagnosisDuration ?? ""}
                        onChange={(e) =>
                          updateDiagnosis(d.id, "diagnosisDuration", e.target.value)
                        }
                        placeholder="Duration"
                        className="h-8 text-sm"
                      />
                    )}

                    <div className="flex justify-end pt-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
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