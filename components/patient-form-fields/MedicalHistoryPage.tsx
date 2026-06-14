"use client";

import { JSX, ReactElement } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileText, AlertCircle, Pill, Plus, Trash2 } from "lucide-react";
import { PatientData, PastMedicalHistoryEntry } from "../patient-form";

type Props = {
  data: PatientData;

  addPastMedicalHistory: () => void;
  removePastMedicalHistory: (id: string) => void;

  updatePastMedicalHistory: (
    id: string,
    field: keyof Omit<PastMedicalHistoryEntry, "id">,
    value: string
  ) => void;

  inputClass?: (field: string) => string;

  wrapWithMic?: (
    fieldId: string,
    element: ReactElement<{ className?: string }>
  ) => JSX.Element;
};

export default function MedicalHistoryPage({
  data,
  addPastMedicalHistory,
  removePastMedicalHistory,
  updatePastMedicalHistory,
  inputClass = () => "",
  wrapWithMic = (_, el) => el,
}: Props) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-1.5 px-3 pt-2.5">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-1.5 text-sm font-semibold">
            <FileText className="h-3.5 w-3.5 text-primary" />
            Past Medical History
          </CardTitle>

          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-6 px-2 text-[10px]"
            onClick={addPastMedicalHistory}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>

      <CardContent className="px-3 pb-2.5">
        {(data.pastMedicalHistories?.length ?? 0) === 0 ? (
          <div className="rounded-md border bg-card/30 py-2 px-2 text-center text-xs text-muted-foreground">
            No past medical history yet. Click "Add" to add one.
          </div>
        ) : (
          <div className="space-y-3">
            {(data.pastMedicalHistories || []).map((pmh, index) => (
              <div
                key={pmh.id}
                className="rounded-md border bg-card p-3 relative"
              >
                {/* Header with index and delete button */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-medium text-muted-foreground">
                    Entry #{index + 1}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removePastMedicalHistory(pmh.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {/* Allergies */}
                  <div className="grid gap-1">
                    <label className="text-[10px] flex items-center gap-1 font-medium">
                      <AlertCircle className="h-3 w-3 text-red-500" />
                      Allergies
                    </label>
                    {wrapWithMic(
                      `pastMedicalHistories.${pmh.id}.allergies`,
                      <Textarea
                        rows={2}
                        value={pmh.allergies ?? ""}
                        onChange={(e) =>
                          updatePastMedicalHistory(pmh.id, "allergies", e.target.value)
                        }
                        placeholder="List allergies..."
                        className={`text-xs resize-none ${inputClass("allergies")}`}
                      />
                    )}
                  </div>

                  {/* Current Medications */}
                  <div className="grid gap-1">
                    <label className="text-[10px] flex items-center gap-1 font-medium">
                      <Pill className="h-3 w-3 text-blue-500" />
                      Current Medications
                    </label>
                    {wrapWithMic(
                      `pastMedicalHistories.${pmh.id}.currentMedicine`,
                      <Textarea
                        rows={2}
                        value={pmh.currentMedicine ?? ""}
                        onChange={(e) =>
                          updatePastMedicalHistory(pmh.id, "currentMedicine", e.target.value)
                        }
                        placeholder="List current medications..."
                        className={`text-xs resize-none ${inputClass("currentMedicine")}`}
                      />
                    )}
                  </div>

                  {/* Medical History */}
                  <div className="grid gap-1">
                    <label className="text-[10px] flex items-center gap-1 font-medium">
                      <FileText className="h-3 w-3 text-green-500" />
                      Medical History
                    </label>
                    {wrapWithMic(
                      `pastMedicalHistories.${pmh.id}.medicalHistory`,
                      <Textarea
                        rows={2}
                        value={pmh.medicalHistory ?? ""}
                        onChange={(e) =>
                          updatePastMedicalHistory(pmh.id, "medicalHistory", e.target.value)
                        }
                        placeholder="Past surgeries, chronic conditions..."
                        className={`text-xs resize-none ${inputClass("medicalHistory")}`}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}