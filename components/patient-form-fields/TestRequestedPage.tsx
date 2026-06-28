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
import { Activity, Plus, Trash2 } from "lucide-react";
import { PatientData, TestRequestedEntry } from "../patient-form-fields/types";
import { VoiceContext } from "@/hooks/useConsultationVoice";

type Props = {
  data: PatientData;

  addTestRequested: () => void;
  removeTestRequested: (id: string) => void;

  updateTestRequested: (
    id: string,
    field: keyof Omit<TestRequestedEntry, "id">,
    value: string
  ) => void;

  inputClass?: (field: string) => string;

  wrapWithMic?: (
    context: VoiceContext,
    element: ReactElement<{ className?: string }>
  ) => JSX.Element;
  registerFieldRef?: (fieldName: string, el: HTMLElement | null) => void;
};

export default function TestRequestedPage({
  data,
  addTestRequested,
  removeTestRequested,
  updateTestRequested,
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
              { mode: "COMPONENT", component: "Tests Requested" },
              <div className="flex items-center gap-2 cursor-pointer">
                <Activity className="h-4 w-4 text-slate-500" />
                Tests Requested
              </div>
            )}
          </CardTitle>

          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 px-3 text-xs bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
            onClick={addTestRequested}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {(data.testsRequested?.length ?? 0) === 0 ? (
          <div className="rounded-md border bg-card/30 py-2 px-2 text-center text-xs text-muted-foreground">
            No tests requested yet. Click "Add" to add one.
          </div>
        ) : (
          <div className="space-y-3">
            {/* Column Headers */}
            <div className="flex gap-2 px-8 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              <div className="w-1/2">Test Name</div>
              <div className="flex-1">Notes</div>
            </div>

            {(data.testsRequested || []).map((tr, index) => (
              <div
                key={tr.id}
                className="flex items-center gap-2"
              >
                {/* Index */}
                <div className="text-center text-[11px] font-medium text-slate-400 w-6 flex-shrink-0">
                  {index + 1}
                </div>

                {/* Test Name */}
                <div className="w-1/2">
                  {wrapWithMic(
                    { mode: "FIELD", field: `testsRequested.${tr.id}.name` },
                    <Input
                      value={tr.name}
                      onChange={(e) => updateTestRequested(tr.id, "name", e.target.value)}
                      placeholder="e.g., Complete Blood Count"
                      className={`h-8 text-xs bg-slate-50 border-slate-200 focus-visible:ring-sky-500 ${inputClass("testsRequested")}`}
                      ref={(el) => registerFieldRef?.(`testsRequested.${tr.id}.name`, el)}
                    />
                  )}
                </div>

                {/* Notes */}
                <div className="flex-1">
                  {wrapWithMic(
                    { mode: "FIELD", field: `testsRequested.${tr.id}.notes` },
                    <Input
                      value={tr.notes || ""}
                      onChange={(e) => updateTestRequested(tr.id, "notes", e.target.value)}
                      placeholder="e.g., fast for 12 hours"
                      className={`h-8 text-xs bg-slate-50 border-slate-200 focus-visible:ring-sky-500 ${inputClass("testsRequested")}`}
                      ref={(el) => registerFieldRef?.(`testsRequested.${tr.id}.notes`, el)}
                    />
                  )}
                </div>

                {/* Delete */}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                  onClick={() => removeTestRequested(tr.id)}
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