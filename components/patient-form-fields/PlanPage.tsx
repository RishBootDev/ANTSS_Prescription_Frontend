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
import { PatientData } from "../patient-form";

type Props = {
  data: PatientData;

  updateField: <K extends keyof PatientData>(
    field: K,
    value: PatientData[K]
  ) => void;

  inputClass?: (field: keyof PatientData) => string;

  wrapWithMic?: (
    fieldId: string,
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
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-1.5 px-3 pt-2.5">
        <CardTitle className="flex items-center gap-1.5 text-sm font-semibold">
          <Activity className="h-3.5 w-3.5 text-primary" />
          Plan
        </CardTitle>
      </CardHeader>

      <CardContent className="grid gap-3 px-3 pb-2.5">

        {/* Advice */}
        <div className="grid gap-1">
          <Label className="text-[10px] font-medium text-muted-foreground">
            Advice &amp; Instructions
          </Label>
          {wrapWithMic(
            "advice",
            <Textarea
              rows={2}
              value={data.advice ?? ""}
              onChange={(e) =>
                updateField("advice", e.target.value || null)
              }
              placeholder="e.g., Rest well, avoid cold food, drink plenty of fluids…"
              className={`text-xs resize-none ${inputClass("advice")}`}
            />
          )}
        </div>

        {/* Row: Next Visit + Follow-up Date */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

          {/* Next Visit Date */}
          <div className="grid gap-1">
            <Label className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Next Visit Date
            </Label>
            {wrapWithMic(
              "nextVisit",
              <Input
                type="date"
                min={today}
                value={data.nextVisit ?? ""}
                onChange={(e) =>
                  updateField("nextVisit", e.target.value || null)
                }
                className={`h-8 text-sm ${inputClass("nextVisit")}`}
              />
            )}
            <p className="text-[10px] text-muted-foreground">
              Suggested revisit date for follow-up
            </p>
          </div>

          {/* Follow-up Date */}
          <div className="grid gap-1">
            <Label className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3 text-primary" />
              Follow-up Date
              <span className="ml-1 text-[9px] text-muted-foreground/70">(must be today or later)</span>
            </Label>
            {wrapWithMic(
              "followUp",
              <Input
                type="date"
                min={today}
                value={data.followUp ?? ""}
                onChange={(e) =>
                  updateField("followUp", e.target.value || null)
                }
                className={`h-8 text-sm ${inputClass("followUp")}`}
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