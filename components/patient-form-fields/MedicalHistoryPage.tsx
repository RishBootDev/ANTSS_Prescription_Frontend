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
import { FileText, AlertCircle, Pill } from "lucide-react";
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

export default function MedicalHistoryPage({
  data,
  updateField,
  inputClass = () => "",
  wrapWithMic = (_, el) => el,
}: Props) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-1.5 px-3 pt-2.5">
        <CardTitle className="flex items-center gap-1.5 text-sm font-semibold">
          <FileText className="h-3.5 w-3.5 text-primary" />
          Past Medical History
        </CardTitle>
      </CardHeader>

      <CardContent className="px-3 pb-2.5">
        <div className="grid gap-3 md:grid-cols-3">
          {/* Allergies */}
          <div className="grid gap-1">
            <Label className="text-[10px] flex items-center gap-1">
              <AlertCircle className="h-3 w-3 text-red-500" />
              Allergies
            </Label>
            {wrapWithMic(
              "allergies",
              <Textarea
                rows={3}
                value={data.allergies ?? ""}
                onChange={(e) =>
                  updateField("allergies", e.target.value || null)
                }
                placeholder="List allergies..."
                className={`text-sm resize-none ${inputClass("allergies")}`}
              />
            )}
          </div>

          {/* Current Medications */}
          <div className="grid gap-1">
            <Label className="text-[10px] flex items-center gap-1">
              <Pill className="h-3 w-3 text-blue-500" />
              Current Medications
            </Label>
            {wrapWithMic(
              "currentMedications",
              <Textarea
                rows={3}
                value={data.currentMedications ?? ""}
                onChange={(e) =>
                  updateField("currentMedications", e.target.value || null)
                }
                placeholder="List current medications..."
                className={`text-sm resize-none ${inputClass("currentMedications")}`}
              />
            )}
          </div>

          {/* Medical History */}
          <div className="grid gap-1">
            <Label className="text-[10px] flex items-center gap-1">
              <FileText className="h-3 w-3 text-green-500" />
              Medical History
            </Label>
            {wrapWithMic(
              "medicalHistory",
              <Textarea
                rows={3}
                value={data.medicalHistory ?? ""}
                onChange={(e) =>
                  updateField("medicalHistory", e.target.value || null)
                }
                placeholder="Past surgeries, chronic conditions..."
                className={`text-sm resize-none ${inputClass("medicalHistory")}`}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}