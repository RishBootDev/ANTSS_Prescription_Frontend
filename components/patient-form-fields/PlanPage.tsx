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
import { Activity, Calendar } from "lucide-react";
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

// Returns today's date in YYYY-MM-DD (local timezone, no UTC shift)
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

  return (
    <Card className="border-slate-200 shadow-sm rounded-xl bg-white overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 px-4">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          {wrapWithMic(
            { mode: "COMPONENT", component: "Plan" },
            <div className="flex items-center gap-2 cursor-pointer">
              <Activity className="h-4 w-4 text-slate-500" />
              Plan
            </div>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="grid gap-3 p-4">

        {/* Advice */}
        <div className="grid gap-1">
          <Label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Advice &amp; Instructions
          </Label>
          {wrapWithMic(
            { mode: "FIELD", field: "advice" },
            <Textarea
              rows={2}
              value={data.advice ?? ""}
              onChange={(e) =>
                updateField("advice", e.target.value || null)
              }
              placeholder="e.g., Rest well, avoid cold food, drink plenty of fluids…"
              className={`text-sm bg-slate-50 border-slate-200 focus-visible:ring-sky-500 resize-none ${inputClass("advice")}`}
            />
          )}
        </div>

        {/* Row: Next Visit + Follow-up Date */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

          {/* Next Visit Date */}
          <div className="grid gap-1">
            <Label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1">
              <Calendar className="h-3 w-3" />
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
                className={`h-8 text-sm bg-slate-50 border-slate-200 focus-visible:ring-sky-500 [&::-webkit-calendar-picker-indicator]:mr-6 ${inputClass("nextVisit")}`}
              />
            )}
            <p className="text-[10px] text-muted-foreground">
              Suggested revisit date for follow-up
            </p>
          </div>

          {/* Follow-up Date */}
          <div className="grid gap-1">
            <Label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1">
              <Calendar className="h-3 w-3 text-primary" />
              Follow-up Date
              <span className="ml-1 text-[9px] text-muted-foreground/70">(must be today or later)</span>
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
                className={`h-8 text-sm bg-slate-50 border-slate-200 focus-visible:ring-sky-500 [&::-webkit-calendar-picker-indicator]:mr-6 ${inputClass("followUp")}`}
              />
            )}
            <p className="text-[10px] text-muted-foreground">
              Date to schedule the follow-up appointment
            </p>
          </div>

        </div>

      </CardContent>
    </Card>
  );
}