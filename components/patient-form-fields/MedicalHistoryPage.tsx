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
import { History, Plus, Trash2, HeartPulse } from "lucide-react";
import {
  PatientData,
  PastMedicalHistoryEntry,
} from "../patient-form-fields/types";
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
  const histories = data.pastMedicalHistories || [];

  const commonInputClass = (field: string) =>
    `h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm
     placeholder:text-slate-400 transition-all
     hover:border-purple-300 focus-visible:border-purple-500 focus-visible:bg-white
     focus-visible:ring-2 focus-visible:ring-purple-100 ${inputClass(field)}`;

  return (
    <Card className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-white px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-800">
            {wrapWithMic(
              { mode: "COMPONENT", component: "Past Medical History" },
              <div className="flex cursor-pointer items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 ring-1 ring-purple-100">
                  <History className="h-4.5 w-4.5" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    Past Medical History
                    <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-600">
                      History
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] font-medium normal-case tracking-normal text-slate-400">
                    Previous illness, duration, status and notes
                  </p>
                </div>
              </div>
            )}
          </CardTitle>

          <Button
            type="button"
            size="sm"
            onClick={addPastMedicalHistory}
            className="h-8 rounded-xl bg-blue-600 px-3 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add
          </Button>
        </div>
      </CardHeader>

      <CardContent className="bg-gradient-to-b from-purple-50/35 to-white p-4">
        {histories.length === 0 ? (
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-purple-200 bg-white px-4 py-8 text-center shadow-sm">
            <div>
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                <HeartPulse className="h-6 w-6" />
              </div>

              <p className="text-sm font-bold text-slate-800">
                No medical history added
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Click Add to record previous illness or condition.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="hidden grid-cols-[52px_1.4fr_1fr_1fr_1.3fr_42px] gap-3 rounded-xl bg-slate-100 px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500 lg:grid">
              <div>#</div>
              <div>Condition / Disease</div>
              <div>Duration</div>
              <div>Status</div>
              <div>Notes</div>
              <div />
            </div>

            {histories.map((pmh, index) => (
              <div
                key={pmh.id}
                className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-purple-200 hover:shadow-md lg:grid-cols-[52px_1.4fr_1fr_1fr_1.3fr_42px] lg:items-center"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-xs font-bold text-purple-600 ring-1 ring-purple-100">
                    {index + 1}
                  </span>

                  <span className="text-xs font-semibold text-slate-700 lg:hidden">
                    History #{index + 1}
                  </span>
                </div>

                <div className="min-w-0">
                  <label className="mb-1 block text-[11px] font-semibold uppercase text-slate-500 lg:hidden">
                    Condition / Disease
                  </label>
                  {wrapWithMic(
                    {
                      mode: "FIELD",
                      field: `pastMedicalHistories.${pmh.id}.disease`,
                    },
                    <Input
                      value={pmh.disease}
                      onChange={(e) =>
                        updatePastMedicalHistory(
                          pmh.id,
                          "disease",
                          e.target.value
                        )
                      }
                      placeholder="e.g. Diabetes"
                      className={commonInputClass("pastMedicalHistories")}
                      ref={(el) =>
                        registerFieldRef?.(
                          `pastMedicalHistories.${pmh.id}.disease`,
                          el
                        )
                      }
                    />
                  )}
                </div>

                <div className="min-w-0">
                  <label className="mb-1 block text-[11px] font-semibold uppercase text-slate-500 lg:hidden">
                    Duration
                  </label>
                  {wrapWithMic(
                    {
                      mode: "FIELD",
                      field: `pastMedicalHistories.${pmh.id}.duration`,
                    },
                    <Input
                      value={pmh.duration}
                      onChange={(e) =>
                        updatePastMedicalHistory(
                          pmh.id,
                          "duration",
                          e.target.value
                        )
                      }
                      placeholder="e.g. 10 years"
                      className={commonInputClass("pastMedicalHistories")}
                      ref={(el) =>
                        registerFieldRef?.(
                          `pastMedicalHistories.${pmh.id}.duration`,
                          el
                        )
                      }
                    />
                  )}
                </div>

                <div className="min-w-0">
                  <label className="mb-1 block text-[11px] font-semibold uppercase text-slate-500 lg:hidden">
                    Status
                  </label>
                  {wrapWithMic(
                    {
                      mode: "FIELD",
                      field: `pastMedicalHistories.${pmh.id}.status`,
                    },
                    <Input
                      value={pmh.status}
                      onChange={(e) =>
                        updatePastMedicalHistory(
                          pmh.id,
                          "status",
                          e.target.value
                        )
                      }
                      placeholder="e.g. Active"
                      className={commonInputClass("pastMedicalHistories")}
                      ref={(el) =>
                        registerFieldRef?.(
                          `pastMedicalHistories.${pmh.id}.status`,
                          el
                        )
                      }
                    />
                  )}
                </div>

                <div className="min-w-0">
                  <label className="mb-1 block text-[11px] font-semibold uppercase text-slate-500 lg:hidden">
                    Notes
                  </label>
                  {wrapWithMic(
                    {
                      mode: "FIELD",
                      field: `pastMedicalHistories.${pmh.id}.notes`,
                    },
                    <Input
                      value={pmh.notes || ""}
                      onChange={(e) =>
                        updatePastMedicalHistory(
                          pmh.id,
                          "notes",
                          e.target.value
                        )
                      }
                      placeholder="e.g. medication controlled"
                      className={commonInputClass("pastMedicalHistories")}
                      ref={(el) =>
                        registerFieldRef?.(
                          `pastMedicalHistories.${pmh.id}.notes`,
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
                    onClick={() => removePastMedicalHistory(pmh.id)}
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