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
import { Label } from "@/components/ui/label";
import { Activity, Calendar, ClipboardCheck } from "lucide-react";
import { PatientData } from "../patient-form-fields/types";
import { VoiceContext } from "@/hooks/useConsultationVoice";

type Props = {
  data: PatientData;

  updateField: <K extends keyof PatientData>(
    field: K,
    value: PatientData[K]
  ) => void;

  inputClass?: (field: keyof PatientData) => string;

  wrapWithMic?: (
    context: VoiceContext,
    element: ReactElement<{ className?: string }>
  ) => JSX.Element;
};

function localTodayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function PlanPage({
  data,
  updateField,
  inputClass = () => "",
  wrapWithMic = (_, el) => el,
}: Props) {
  const today = localTodayStr();

  const commonInputClass = (field: keyof PatientData) =>
    `h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm
     placeholder:text-slate-400 transition-all
     hover:border-orange-300 focus-visible:border-orange-500 focus-visible:bg-white
     focus-visible:ring-2 focus-visible:ring-orange-100 ${inputClass(field)}`;

  return (
    <Card className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-white px-4 py-3">
        <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-800">
          {wrapWithMic(
            { mode: "COMPONENT", component: "Plan" },
            <div className="flex cursor-pointer items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600 ring-1 ring-orange-100">
                <Activity className="h-4.5 w-4.5" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  Treatment Plan
                  <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-600">
                    Follow-up
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] font-medium normal-case tracking-normal text-slate-400">
                  Advice, instructions and revisit schedule
                </p>
              </div>
            </div>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="bg-gradient-to-b from-orange-50/35 to-white p-4">
        <div className="grid gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <Label className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              <ClipboardCheck className="h-3.5 w-3.5 text-orange-500" />
              Advice &amp; Instructions
            </Label>

            {wrapWithMic(
              { mode: "FIELD", field: "advice" },
              <Textarea
                rows={4}
                value={data.advice ?? ""}
                onChange={(e) => updateField("advice", e.target.value || null)}
                placeholder="e.g. Rest well, avoid cold food, drink plenty of fluids..."
                className={`min-h-[110px] resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 shadow-none placeholder:text-slate-400 transition-all hover:border-orange-300 focus-visible:border-orange-500 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-orange-100 ${inputClass(
                  "advice"
                )}`}
              />
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-orange-200 hover:shadow-md">
              <Label className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                <Calendar className="h-3.5 w-3.5 text-orange-500" />
                Next Visit Date
              </Label>

              {wrapWithMic(
                { mode: "FIELD", field: "nextVisit" },
                <Input
                  type="date"
                  min={today}
                  value={data.nextVisit ?? ""}
                  onChange={(e) =>
                    updateField("nextVisit", e.target.value || null)
                  }
                  className={`${commonInputClass(
                    "nextVisit"
                  )} [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
                />
              )}

              <p className="mt-2 text-[11px] font-medium text-slate-400">
                Suggested revisit date for patient review.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-orange-200 hover:shadow-md">
              <Label className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                <Calendar className="h-3.5 w-3.5 text-blue-500" />
                Follow-up Date
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-600">
                  Today or later
                </span>
              </Label>

              {wrapWithMic(
                { mode: "FIELD", field: "followUp" },
                <Input
                  type="date"
                  min={today}
                  value={data.followUp ?? ""}
                  onChange={(e) =>
                    updateField("followUp", e.target.value || null)
                  }
                  className={`${commonInputClass(
                    "followUp"
                  )} [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
                />
              )}

              <p className="mt-2 text-[11px] font-medium text-slate-400">
                Date to schedule the follow-up appointment.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}