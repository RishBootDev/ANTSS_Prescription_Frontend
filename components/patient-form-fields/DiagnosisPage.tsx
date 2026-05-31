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

  // ✅ SAME TYPE (IMPORTANT)
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
    <Card>
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
        {data.diagnoses.length === 0 ? (
          <div className="rounded-md border bg-card/30 py-2 px-2 text-center text-xs text-muted-foreground">
            No diagnoses yet. Use voice or click "Add".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[780px]">

              {/* Header */}
              <div className="grid grid-cols-[52px_1.35fr_1fr_0.7fr_0.8fr_36px] items-center gap-1.5 rounded-md bg-muted/30 px-2 py-1 text-[10px] font-medium text-muted-foreground">
                <div>#</div>
                <div>Diagnosis</div>
                <div>SNOMED Code</div>
                <div>Duration</div>
                <div>Date</div>
                <div />
              </div>

              {/* Rows */}
              <div className="space-y-1.5 pt-1.5">
                {data.diagnoses.map((d, index) => (
                  <div
                    key={d.id}
                    className="grid grid-cols-[52px_1.35fr_1fr_0.7fr_0.8fr_36px] items-start gap-1.5 rounded-md border bg-card px-2 py-1.5"
                  >
                    <div className="pt-1.5 text-center text-[11px] text-muted-foreground">
                      {index + 1}
                    </div>

                    {wrapWithMic(
                      `diagnoses.${d.id}.diagnosis`,
                      <Input
                        value={d.diagnosis}
                        onChange={(e) =>
                          updateDiagnosis(d.id, "diagnosis", e.target.value)
                        }
                        placeholder="e.g., Acute bronchitis"
                        className="h-8 text-sm"
                      />
                    )}

                    {wrapWithMic(
                      `diagnoses.${d.id}.snomedCode`,
                      <Input
                        value={d.snomedCode ?? ""}
                        onChange={(e) =>
                          updateDiagnosis(d.id, "snomedCode", e.target.value)
                        }
                        placeholder="SNOMED"
                        className="h-8 text-sm"
                      />
                    )}

                    {wrapWithMic(
                      `diagnoses.${d.id}.duration`,
                      <Input
                        value={d.duration ?? ""}
                        onChange={(e) =>
                          updateDiagnosis(d.id, "duration", e.target.value)
                        }
                        placeholder="Duration"
                        className="h-8 text-sm"
                      />
                    )}

                    {wrapWithMic(
                      `diagnoses.${d.id}.date`,
                      <Input
                        value={d.date ?? ""}
                        onChange={(e) =>
                          updateDiagnosis(d.id, "date", e.target.value)
                        }
                        placeholder="Date"
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