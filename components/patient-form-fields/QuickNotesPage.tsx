"use client";

import { ReactElement } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";
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
    node: ReactElement
  ) => ReactElement;
};

export default function QuickNotesPage({
  data,
  updateField,
  inputClass = () => "",
  wrapWithMic = (_, node) => node,
}: Props) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-1.5 px-3 pt-2.5">
        <CardTitle className="flex items-center gap-1.5 text-sm font-semibold">
          {wrapWithMic(
            { mode: "COMPONENT", component: "Quick Notes" },
            <div className="flex items-center gap-1.5 cursor-pointer">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Quick notes
            </div>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-3 pb-2.5">
        {wrapWithMic(
          { mode: "FIELD", field: "quickNotes" },
          <Textarea
            rows={3}
            value={data.quickNotes ?? ""}
            onChange={(e) =>
              updateField(
                "quickNotes",
                e.target.value.trim() ? e.target.value : null
              )
            }
            placeholder="Short notes from voice command"
            className={inputClass("quickNotes")}
          />
        )}
      </CardContent>
    </Card>
  );
}