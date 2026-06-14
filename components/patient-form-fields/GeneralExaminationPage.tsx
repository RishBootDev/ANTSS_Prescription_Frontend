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
import { Stethoscope, Plus, Trash2 } from "lucide-react";
import { PatientData, GeneralExaminationEntry } from "../patient-form";

type Props = {
  data: PatientData;

  addGeneralExamination: () => void;
  removeGeneralExamination: (id: string) => void;

  updateGeneralExamination: (
    id: string,
    value: string
  ) => void;

  inputClass?: (field: string) => string;

  wrapWithMic?: (
    fieldId: string,
    element: ReactElement<{ className?: string }>
  ) => JSX.Element;
  registerFieldRef?: (fieldName: string, el: HTMLElement | null) => void;
};

export default function GeneralExaminationPage({
  data,
  addGeneralExamination,
  removeGeneralExamination,
  updateGeneralExamination,
  inputClass = () => "",
  wrapWithMic = (_, el) => el,
  registerFieldRef,
}: Props) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-1.5 px-3 pt-2.5">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-1.5 text-sm font-semibold">
            <Stethoscope className="h-3.5 w-3.5 text-primary" />
            General Examination
          </CardTitle>

          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-6 px-2 text-[10px]"
            onClick={addGeneralExamination}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>

      <CardContent className="px-3 pb-2.5">
        {(data.generalExaminations?.length ?? 0) === 0 ? (
          <div className="rounded-md border bg-card/30 py-2 px-2 text-center text-xs text-muted-foreground">
            No general examinations yet. Click "Add" to add one.
          </div>
        ) : (
          <div className="space-y-1.5">
            {(data.generalExaminations || []).map((ge, index) => (
              <div
                key={ge.id}
                className="flex items-center gap-2 rounded-md border bg-card px-2 py-1.5"
              >
                {/* Index */}
                <div className="text-center text-[11px] text-muted-foreground w-8 flex-shrink-0">
                  {index + 1}
                </div>

                {/* Examination Name */}
                {wrapWithMic(
                  `generalExaminations.${ge.id}.name`,
                  <Input
                    value={ge.examinationName}
                    onChange={(e) =>
                      updateGeneralExamination(ge.id, e.target.value)
                    }
                    placeholder="e.g., Afebrile, BP normal"
                    className={`h-8 text-xs flex-1 ${inputClass("generalExaminations")}`}
                    ref={(el) => registerFieldRef?.(`generalExaminations.${ge.id}`, el)}
                  />
                )}

                {/* Delete */}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive flex-shrink-0"
                  onClick={() => removeGeneralExamination(ge.id)}
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