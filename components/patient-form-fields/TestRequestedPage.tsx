"use client";

import { ChangeEvent, JSX, ReactElement, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Activity, FileText, Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { PatientData, TestRequestedEntry } from "../patient-form-fields/types";
import { VoiceContext } from "@/hooks/useConsultationVoice";
import { uploadPatientDocument } from "@/lib/services/documentService";

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
  const [uploadingTestId, setUploadingTestId] = useState<string | null>(null);

  const handleFileUpload = async (id: string, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!data.patientId) {
      alert("Please save the patient first before uploading test documents.");
      e.target.value = "";
      return;
    }

    setUploadingTestId(id);

    try {
      const result = await uploadPatientDocument(data.patientId, file, "TEST_REQUESTED");
      updateTestRequested(id, "documentUrl", result.url);
      updateTestRequested(id, "documentFileName", result.fileName || file.name);
    } catch (err: any) {
      console.error("Test document upload failed:", err);
      alert(err.message || "Failed to upload test document");
    } finally {
      setUploadingTestId(null);
      e.target.value = "";
    }
  };

  const handleRemoveFile = (id: string) => {
    updateTestRequested(id, "documentUrl", "");
    updateTestRequested(id, "documentFileName", "");
  };

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
              <div className="w-2/5">Test Name</div>
              <div className="flex-1">Notes</div>
              <div className="w-28 text-center">Attachment</div>
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
                <div className="w-2/5">
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

                <div className="w-28 flex justify-center items-center">
                  {uploadingTestId === tr.id ? (
                    <div className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 text-[10px] text-slate-500">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Uploading
                    </div>
                  ) : tr.documentUrl ? (
                    <div className="flex max-w-[104px] items-center gap-1 rounded-md border border-sky-100 bg-sky-50 px-2 py-1 text-[10px] text-sky-700">
                      <FileText className="h-3 w-3 shrink-0" />
                      <a
                        href={tr.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-w-0 flex-1 truncate text-left hover:underline"
                        title={tr.documentFileName || "Open document"}
                      >
                        {tr.documentFileName || "Document"}
                      </a>
                      <button type="button" onClick={() => handleRemoveFile(tr.id)} className="hover:text-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="inline-flex h-7 cursor-pointer items-center justify-center rounded-md border border-dashed border-slate-300 px-2 text-xs text-slate-500 transition-colors hover:border-slate-400 hover:bg-slate-50 hover:text-slate-700">
                      <Upload className="mr-1 h-3 w-3" />
                      Upload
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload(tr.id, e)}
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
