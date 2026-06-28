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
import { History, Plus, Trash2 } from "lucide-react";
import { PatientData, PastMedicalHistoryEntry } from "../patient-form-fields/types";
import { VoiceContext } from "@/hooks/useConsultationVoice";

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
    context: VoiceContext,
    element: ReactElement<{ className?: string }>
  ) => JSX.Element;
  registerFieldRef?: (fieldName: string, el: HTMLElement | null) => void;
};

export default function MedicalHistoryPage({
  data,
  addPastMedicalHistory,
  removePastMedicalHistory,
  updatePastMedicalHistory,
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
              { mode: "COMPONENT", component: "Past Medical History" },
              <div className="flex items-center gap-2 cursor-pointer">
                <History className="h-4 w-4 text-slate-500" />
                Past Medical History
              </div>
            )}
          </CardTitle>

          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 px-3 text-xs bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
            onClick={addPastMedicalHistory}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {(data.pastMedicalHistories?.length ?? 0) === 0 ? (
          <div className="rounded-md border bg-card/30 py-2 px-2 text-center text-xs text-muted-foreground">
            No past medical history added yet. Click "Add" to add one.
          </div>
        ) : (
          <div className="space-y-3">
            {/* Column Headers */}
            <div className="flex gap-2 px-8 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              <div className="w-1/3">Condition / Disease</div>
              <div className="w-1/4">Duration</div>
              <div className="w-1/4">Status</div>
              <div className="flex-1">Notes</div>
            </div>

            {(data.pastMedicalHistories || []).map((pmh, index) => (
              <div
                key={pmh.id}
                className="flex items-center gap-2"
              >
                {/* Index */}
                <div className="text-center text-[11px] font-medium text-slate-400 w-6 flex-shrink-0">
                  {index + 1}
                </div>

                {/* Disease */}
                <div className="w-1/3">
                  {wrapWithMic(
                    { mode: "FIELD", field: `pastMedicalHistories.${pmh.id}.disease` },
                    <Input
                      value={pmh.disease}
                      onChange={(e) => updatePastMedicalHistory(pmh.id, "disease", e.target.value)}
                      placeholder="e.g., Diabetes"
                      className={`h-8 text-xs bg-slate-50 border-slate-200 focus-visible:ring-sky-500 ${inputClass("pastMedicalHistories")}`}
                      ref={(el) => registerFieldRef?.(`pastMedicalHistories.${pmh.id}.disease`, el)}
                    />
                  )}
                </div>

                {/* Duration */}
                <div className="w-1/4">
                  {wrapWithMic(
                    { mode: "FIELD", field: `pastMedicalHistories.${pmh.id}.duration` },
                    <Input
                      value={pmh.duration}
                      onChange={(e) => updatePastMedicalHistory(pmh.id, "duration", e.target.value)}
                      placeholder="e.g., 10 years"
                      className={`h-8 text-xs bg-slate-50 border-slate-200 focus-visible:ring-sky-500 ${inputClass("pastMedicalHistories")}`}
                      ref={(el) => registerFieldRef?.(`pastMedicalHistories.${pmh.id}.duration`, el)}
                    />
                  )}
                </div>

                {/* Status */}
                <div className="w-1/4">
                  {wrapWithMic(
                    { mode: "FIELD", field: `pastMedicalHistories.${pmh.id}.status` },
                    <Input
                      value={pmh.status}
                      onChange={(e) => updatePastMedicalHistory(pmh.id, "status", e.target.value)}
                      placeholder="e.g., Active"
                      className={`h-8 text-xs bg-slate-50 border-slate-200 focus-visible:ring-sky-500 ${inputClass("pastMedicalHistories")}`}
                      ref={(el) => registerFieldRef?.(`pastMedicalHistories.${pmh.id}.status`, el)}
                    />
                  )}
                </div>

                {/* Notes */}
                <div className="flex-1">
                  {wrapWithMic(
                    { mode: "FIELD", field: `pastMedicalHistories.${pmh.id}.notes` },
                    <Input
                      value={pmh.notes || ""}
                      onChange={(e) => updatePastMedicalHistory(pmh.id, "notes", e.target.value)}
                      placeholder="e.g., medication controlled"
                      className={`h-8 text-xs bg-slate-50 border-slate-200 focus-visible:ring-sky-500 ${inputClass("pastMedicalHistories")}`}
                      ref={(el) => registerFieldRef?.(`pastMedicalHistories.${pmh.id}.notes`, el)}
                    />
                  )}
                </div>

                {/* Delete */}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                  onClick={() => removePastMedicalHistory(pmh.id)}
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