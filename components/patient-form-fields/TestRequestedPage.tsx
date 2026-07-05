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
import {
  Activity,
  FileText,
  Loader2,
  Plus,
  Trash2,
  Upload,
  X,
  FlaskConical,
} from "lucide-react";
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

  const testsRequested = data.testsRequested || [];

  const handleFileUpload = async (
    id: string,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!data.patientId) {
      alert("Please save the patient first before uploading test documents.");
      e.target.value = "";
      return;
    }

    setUploadingTestId(id);

    try {
      const result = await uploadPatientDocument(
        data.patientId,
        file,
        "TEST_REQUESTED"
      );

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

  const inputStyle = (field: string) =>
    `h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm
     placeholder:text-slate-400 transition-all
     hover:border-teal-300 focus-visible:border-teal-500 focus-visible:bg-white
     focus-visible:ring-2 focus-visible:ring-teal-100 ${inputClass(field)}`;

  return (
    <Card className="overflow-hidden rounded-2xl border border-teal-100 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-white px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-800">
            {wrapWithMic(
              { mode: "COMPONENT", component: "Tests Requested" },
              <div className="flex cursor-pointer items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600 ring-1 ring-teal-100">
                  <Activity className="h-4.5 w-4.5" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    Tests Requested
                    <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-600">
                      Lab Order
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] font-medium normal-case tracking-normal text-slate-400">
                    Requested tests, notes and document attachments
                  </p>
                </div>
              </div>
            )}
          </CardTitle>

          <Button
            type="button"
            size="sm"
            onClick={addTestRequested}
            className="h-8 rounded-xl bg-blue-600 px-3 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add
          </Button>
        </div>
      </CardHeader>

      <CardContent className="bg-gradient-to-b from-teal-50/35 to-white p-4">
        {testsRequested.length === 0 ? (
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-teal-200 bg-white px-4 py-8 text-center shadow-sm">
            <div>
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                <FlaskConical className="h-6 w-6" />
              </div>

              <p className="text-sm font-bold text-slate-800">
                No tests requested
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Click Add to request lab tests or attach documents.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="hidden grid-cols-[52px_1.3fr_1.3fr_130px_42px] gap-3 rounded-xl bg-slate-100 px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500 lg:grid">
              <div>#</div>
              <div>Test Name</div>
              <div>Notes</div>
              <div className="text-center">Attachment</div>
              <div />
            </div>

            {testsRequested.map((tr, index) => (
              <div
                key={tr.id}
                className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-teal-200 hover:shadow-md lg:grid-cols-[52px_1.3fr_1.3fr_130px_42px] lg:items-center"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-xs font-bold text-teal-600 ring-1 ring-teal-100">
                    {index + 1}
                  </span>

                  <span className="text-xs font-semibold text-slate-700 lg:hidden">
                    Test #{index + 1}
                  </span>
                </div>

                <div className="min-w-0">
                  <label className="mb-1 block text-[11px] font-semibold uppercase text-slate-500 lg:hidden">
                    Test Name
                  </label>
                  {wrapWithMic(
                    {
                      mode: "FIELD",
                      field: `testsRequested.${tr.id}.name`,
                    },
                    <Input
                      value={tr.name}
                      onChange={(e) =>
                        updateTestRequested(tr.id, "name", e.target.value)
                      }
                      placeholder="e.g. Complete Blood Count"
                      className={inputStyle("testsRequested")}
                      ref={(el) =>
                        registerFieldRef?.(`testsRequested.${tr.id}.name`, el)
                      }
                    />
                  )}
                </div>

                <div className="min-w-0">
                  <label className="mb-1 block text-[11px] font-semibold uppercase text-slate-500 lg:hidden">
                    Notes
                  </label>
                  {wrapWithMic(
                    {
                      mode: "FIELD",
                      field: `testsRequested.${tr.id}.notes`,
                    },
                    <Input
                      value={tr.notes || ""}
                      onChange={(e) =>
                        updateTestRequested(tr.id, "notes", e.target.value)
                      }
                      placeholder="e.g. fast for 12 hours"
                      className={inputStyle("testsRequested")}
                      ref={(el) =>
                        registerFieldRef?.(`testsRequested.${tr.id}.notes`, el)
                      }
                    />
                  )}
                </div>

                <div className="flex items-center justify-start lg:justify-center">
                  {uploadingTestId === tr.id ? (
                    <div className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-3 text-[11px] font-semibold text-teal-700">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Uploading
                    </div>
                  ) : tr.documentUrl ? (
                    <div className="flex h-9 max-w-[130px] items-center gap-1 rounded-xl border border-teal-200 bg-teal-50 px-2 text-[11px] font-semibold text-teal-700">
                      <FileText className="h-3.5 w-3.5 shrink-0" />

                      <a
                        href={tr.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-w-0 flex-1 truncate text-left hover:underline"
                        title={tr.documentFileName || "Open document"}
                      >
                        {tr.documentFileName || "Document"}
                      </a>

                      <button
                        type="button"
                        onClick={() => handleRemoveFile(tr.id)}
                        className="shrink-0 rounded-md p-0.5 hover:bg-red-50 hover:text-red-500"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="inline-flex h-9 cursor-pointer items-center justify-center rounded-xl border border-dashed border-teal-300 bg-white px-3 text-xs font-semibold text-teal-700 transition-colors hover:border-teal-400 hover:bg-teal-50">
                      <Upload className="mr-1 h-3.5 w-3.5" />
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

                <div className="flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-9 w-9 rounded-xl p-0 text-slate-400 hover:bg-red-50 hover:text-red-500"
                    onClick={() => removeTestRequested(tr.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}