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
import { Activity } from "lucide-react";
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

export default function PlanPage({
  data,
  updateField,
  inputClass = () => "",
  wrapWithMic = (_, el) => el,
}: Props) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-1.5 px-3 pt-2.5">
        <CardTitle className="flex items-center gap-1.5 text-sm font-semibold">
          <Activity className="h-3.5 w-3.5 text-primary" />
          Plan
        </CardTitle>
      </CardHeader>

      <CardContent className="grid gap-2 px-3 pb-2.5">

        {/* Advice */}
        <div className="grid gap-1">
          <Label className="text-[10px]">Advice</Label>
          {wrapWithMic(
            "advice",
            <Textarea
              rows={2}
              value={data.advice ?? ""}
              onChange={(e) =>
                updateField("advice", e.target.value || null)
              }
              className={inputClass("advice")}
            />
          )}
        </div>

        {/* Row 1 */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {wrapWithMic(
            "nextVisit",
            <Input
              value={data.nextVisit ?? ""}
              onChange={(e) =>
                updateField("nextVisit", e.target.value || null)
              }
              placeholder="Next visit"
              className={inputClass("nextVisit")}
            />
          )}

          {wrapWithMic(
            "followUp",
            <Input
              type="number"
              value={data.followUp ?? ""}
              onChange={(e) =>
                updateField("followUp", e.target.value || null)
              }
              placeholder="Follow up days"
              className={inputClass("followUp")}
            />
          )}
        </div>

      </CardContent>
    </Card>
  );
}