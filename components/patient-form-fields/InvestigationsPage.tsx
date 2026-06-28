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
import { FileSearch, Plus, Trash2, Upload, FileText, X } from "lucide-react";
import { PatientData, InvestigationEntry } from "../patient-form-fields/types";
import { VoiceContext } from "@/hooks/useConsultationVoice";

type Props = {
  data: PatientData;

  addInvestigation: () => void;
  removeInvestigation: (id: string) => void;

  updateInvestigation: (
    id: string,
    field: keyof Omit<InvestigationEntry, "id">,
    value: string
  ) => void;

  updateInvestigationMultiple: (
    id: string,
    updates: Partial<Omit<InvestigationEntry, "id">>
  ) => void;

  inputClass?: (field: string) => string;

  wrapWithMic?: (
    context: VoiceContext,
    element: ReactElement<{ className?: string }>
  ) => JSX.Element;
  registerFieldRef?: (fieldName: string, el: HTMLElement | null) => void;
};

export default function InvestigationsPage({
  data,
  addInvestigation,
  removeInvestigation,
  updateInvestigation,
  updateInvestigationMultiple,
  inputClass = () => "",
  wrapWithMic = (_, el) => el,
  registerFieldRef,
}: Props) {
  // Mock file upload handler
  const handleFileUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateInvestigationMultiple(id, {
        documentUrl: URL.createObjectURL(file), // temporary local URL
        documentFileName: file.name
      });
    }
  };

  const handleRemoveFile = (id: string) => {
    updateInvestigationMultiple(id, {
      documentUrl: null,
      documentFileName: null
    });
  };

  return (
    <Card className="border-slate-200 shadow-sm rounded-xl bg-white overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 px-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            {wrapWithMic(
              { mode: "COMPONENT", component: "Investigations" },
              <div className="flex items-center gap-2 cursor-pointer">
                <FileSearch className="h-4 w-4 text-slate-500" />
                Investigations / Reports
              </div>
            )}
          </CardTitle>

          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 px-3 text-xs bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
            onClick={addInvestigation}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {(data.investigations?.length ?? 0) === 0 ? (
          <div className="rounded-md border bg-card/30 py-2 px-2 text-center text-xs text-muted-foreground">
            No investigations added yet. Click "Add" to add one.
          </div>
        ) : (
          <div className="space-y-3">
            {/* Column Headers */}
            <div className="flex gap-2 px-8 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              <div className="w-1/3">Test Name</div>
              <div className="w-1/4">Value / Result</div>
              <div className="flex-1">Notes</div>
              <div className="w-24 text-center">Attachment</div>
            </div>

            {(data.investigations || []).map((inv, index) => (
              <div
                key={inv.id}
                className="flex items-center gap-2"
              >
                {/* Index */}
                <div className="text-center text-[11px] font-medium text-slate-400 w-6 flex-shrink-0">
                  {index + 1}
                </div>

                {/* Test */}
                <div className="w-1/3">
                  {wrapWithMic(
                    { mode: "FIELD", field: `investigations.${inv.id}.test` },
                    <Input
                      value={inv.test}
                      onChange={(e) => updateInvestigation(inv.id, "test", e.target.value)}
                      placeholder="e.g., HbA1c"
                      className={`h-8 text-xs bg-slate-50 border-slate-200 focus-visible:ring-sky-500 ${inputClass("investigations")}`}
                      ref={(el) => registerFieldRef?.(`investigations.${inv.id}.test`, el)}
                    />
                  )}
                </div>

                {/* Value */}
                <div className="w-1/4">
                  {wrapWithMic(
                    { mode: "FIELD", field: `investigations.${inv.id}.value` },
                    <Input
                      value={inv.value}
                      onChange={(e) => updateInvestigation(inv.id, "value", e.target.value)}
                      placeholder="e.g., 6.5%"
                      className={`h-8 text-xs bg-slate-50 border-slate-200 focus-visible:ring-sky-500 ${inputClass("investigations")}`}
                      ref={(el) => registerFieldRef?.(`investigations.${inv.id}.value`, el)}
                    />
                  )}
                </div>

                {/* Notes */}
                <div className="flex-1">
                  {wrapWithMic(
                    { mode: "FIELD", field: `investigations.${inv.id}.notes` },
                    <Input
                      value={inv.notes || ""}
                      onChange={(e) => updateInvestigation(inv.id, "notes", e.target.value)}
                      placeholder="e.g., improved since last visit"
                      className={`h-8 text-xs bg-slate-50 border-slate-200 focus-visible:ring-sky-500 ${inputClass("investigations")}`}
                      ref={(el) => registerFieldRef?.(`investigations.${inv.id}.notes`, el)}
                    />
                  )}
                </div>

                {/* Attachment */}
                <div className="w-24 flex justify-center items-center">
                  {inv.documentUrl ? (
                     <div className="flex items-center gap-1 bg-sky-50 text-sky-700 px-2 py-1 rounded-md text-[10px] border border-sky-100 max-w-[90px]">
                       <FileText className="h-3 w-3 flex-shrink-0" />
                       <span className="truncate flex-1">{inv.documentFileName}</span>
                       <button onClick={() => handleRemoveFile(inv.id)} className="hover:text-red-500">
                          <X className="h-3 w-3" />
                       </button>
                     </div>
                  ) : (
                    <label className="cursor-pointer inline-flex items-center justify-center h-7 px-2 text-xs border border-dashed border-slate-300 rounded-md text-slate-500 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-400 transition-colors">
                      <Upload className="h-3 w-3 mr-1" />
                      Upload
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload(inv.id, e)}
                      />
                    </label>
                  )}
                </div>

                {/* Delete */}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                  onClick={() => removeInvestigation(inv.id)}
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
