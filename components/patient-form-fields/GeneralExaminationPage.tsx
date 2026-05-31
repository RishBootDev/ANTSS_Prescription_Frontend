"use client";

import { JSX, ReactElement } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Stethoscope } from "lucide-react";
import { PatientData } from "../patient-form";

type Props = {
  data: PatientData;

  updateField: <K extends keyof PatientData>(
    field: K,
    value: PatientData[K]
  ) => void;

  inputClass?: (field: keyof PatientData) => string;

  // ✅ IMPORTANT: matches your real wrapWithMic
  wrapWithMic?: (
    fieldId: string,
    element: ReactElement<{ className?: string }>
  ) => JSX.Element;
  registerFieldRef?: (fieldName: string, el: HTMLElement | null) => void;
};

export default function GeneralExaminationPage({
  data,
  updateField,
  inputClass = () => "",
  wrapWithMic = (_, el) => el,
  registerFieldRef,
}: Props) {
  return (
    <Card>
      <CardHeader className="pb-1.5 px-3 pt-2.5">
        <CardTitle className="flex items-center gap-1.5 text-sm font-semibold">
          <Stethoscope className="h-3.5 w-3.5 text-primary" />
          General examination
        </CardTitle>
      </CardHeader>

      <CardContent className="px-3 pb-2.5">
        {wrapWithMic(
          "generalExamination",
          <Textarea
            rows={3}
            ref={(el) => registerFieldRef?.("generalExamination", el)}
            value={data.generalExamination ?? ""}
            onChange={(e) =>
              updateField(
                "generalExamination",
                e.target.value.trim() ? e.target.value : null
              )
            }
            placeholder="Examination findings"
            className={inputClass("generalExamination")}
          />
        )}
      </CardContent>
    </Card>
  );
}