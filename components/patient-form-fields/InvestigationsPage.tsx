"use client";

import { ChangeEvent, JSX, ReactElement, useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Download,
  Eye,
  FileSearch,
  Plus,
  Trash2,
  Upload,
  FileText,
  Loader2,
  X,
  Microscope,
  Paperclip,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PatientData, InvestigationEntry } from "../patient-form-fields/types";
import { VoiceContext } from "@/hooks/useConsultationVoice";
import { uploadPatientDocument } from "@/lib/services/documentService";

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

  previewOpen?: boolean;
  onPreviewOpenChange?: (open: boolean) => void;
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
  previewOpen,
  onPreviewOpenChange,
}: Props) {
  const [internalPreviewOpen, setInternalPreviewOpen] = useState(false);
  const [selectedInvestigationId, setSelectedInvestigationId] =
    useState<string | null>(null);
  const [uploadingInvestigationId, setUploadingInvestigationId] =
    useState<string | null>(null);

  const investigations = useMemo(
    () => data.investigations || [],
    [data.investigations]
  );

  const savedInvestigations = useMemo(
    () =>
      investigations.filter((inv) =>
        [inv.test, inv.value, inv.notes, inv.documentUrl, inv.documentFileName].some(
          (value) => typeof value === "string" && value.trim() !== ""
        )
      ),
    [investigations]
  );

  const selectedInvestigation =
    savedInvestigations.find((inv) => inv.id === selectedInvestigationId) ||
    savedInvestigations[0] ||
    null;

  const isPreviewOpen = previewOpen ?? internalPreviewOpen;

  const setPreviewOpen = (open: boolean) => {
    onPreviewOpenChange?.(open);

    if (previewOpen === undefined) {
      setInternalPreviewOpen(open);
    }
  };

  const openInvestigationPreview = (investigation?: InvestigationEntry) => {
    setSelectedInvestigationId(investigation?.id || savedInvestigations[0]?.id || null);
    setPreviewOpen(true);
  };

  const isImageReport = (investigation: InvestigationEntry) => {
    const source = `${
      investigation.documentFileName || ""
    } ${investigation.documentUrl || ""}`.toLowerCase();

    return /\.(png|jpe?g|gif|webp|bmp|svg)(\?|#|$)/.test(source);
  };

  const handleFileUpload = async (
    id: string,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!data.patientId) {
      alert("Please save the patient first before uploading investigation reports.");
      e.target.value = "";
      return;
    }

    setUploadingInvestigationId(id);

    try {
      const result = await uploadPatientDocument(
        data.patientId,
        file,
        "INVESTIGATION"
      );

      updateInvestigationMultiple(id, {
        documentUrl: result.url,
        documentFileName: result.fileName || file.name,
      });
    } catch (err: any) {
      console.error("Investigation upload failed:", err);
      alert(err.message || "Failed to upload investigation report");
    } finally {
      setUploadingInvestigationId(null);
      e.target.value = "";
    }
  };

  const handleRemoveFile = (id: string) => {
    updateInvestigationMultiple(id, {
      documentUrl: null,
      documentFileName: null,
    });
  };

  const inputStyle = (field: string) =>
    `h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 shadow-none
     placeholder:text-slate-400 transition-all
     hover:border-cyan-300 focus-visible:border-cyan-500 focus-visible:bg-white
     focus-visible:ring-2 focus-visible:ring-cyan-100 ${inputClass(field)}`;

  return (
    <>
      <Card className="overflow-hidden rounded-2xl border border-cyan-100 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-white px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-800">
              {wrapWithMic(
                { mode: "COMPONENT", component: "Investigations" },
                <div className="flex cursor-pointer items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 ring-1 ring-cyan-100">
                    <Microscope className="h-4.5 w-4.5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      Investigations / Reports
                      <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-[10px] font-bold text-cyan-600">
                        Lab
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] font-medium normal-case tracking-normal text-slate-400">
                      Test results, notes and report attachments
                    </p>
                  </div>
                </div>
              )}
            </CardTitle>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 rounded-xl border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                onClick={() => openInvestigationPreview()}
                disabled={savedInvestigations.length === 0}
              >
                <Eye className="mr-1 h-3.5 w-3.5" />
                Preview
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={addInvestigation}
                className="h-8 rounded-xl bg-blue-600 px-3 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="bg-gradient-to-b from-cyan-50/35 to-white p-4">
          {investigations.length === 0 ? (
            <div className="flex items-center justify-center rounded-2xl border border-dashed border-cyan-200 bg-white px-4 py-8 text-center shadow-sm">
              <div>
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                  <FileSearch className="h-6 w-6" />
                </div>

                <p className="text-sm font-bold text-slate-800">
                  No investigations added
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Click Add to record lab test results.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="hidden grid-cols-[52px_1.3fr_1fr_1.2fr_120px_42px] gap-3 rounded-xl bg-slate-100 px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500 lg:grid">
                <div>#</div>
                <div>Test Name</div>
                <div>Value / Result</div>
                <div>Notes</div>
                <div className="text-center">Attachment</div>
                <div />
              </div>

              {investigations.map((inv, index) => (
                <div
                  key={inv.id}
                  className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-cyan-200 hover:shadow-md lg:grid-cols-[52px_1.3fr_1fr_1.2fr_120px_42px] lg:items-center"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-50 text-xs font-bold text-cyan-600 ring-1 ring-cyan-100">
                      {index + 1}
                    </span>

                    <span className="text-xs font-semibold text-slate-700 lg:hidden">
                      Investigation #{index + 1}
                    </span>
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-semibold uppercase text-slate-500 lg:hidden">
                      Test Name
                    </label>
                    {wrapWithMic(
                      {
                        mode: "FIELD",
                        field: `investigations.${inv.id}.test`,
                      },
                      <Input
                        value={inv.test}
                        onChange={(e) =>
                          updateInvestigation(inv.id, "test", e.target.value)
                        }
                        placeholder="e.g. HbA1c"
                        className={inputStyle("investigations")}
                        ref={(el) =>
                          registerFieldRef?.(
                            `investigations.${inv.id}.test`,
                            el
                          )
                        }
                      />
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-semibold uppercase text-slate-500 lg:hidden">
                      Value / Result
                    </label>
                    {wrapWithMic(
                      {
                        mode: "FIELD",
                        field: `investigations.${inv.id}.value`,
                      },
                      <Input
                        value={inv.value}
                        onChange={(e) =>
                          updateInvestigation(inv.id, "value", e.target.value)
                        }
                        placeholder="e.g. 6.5%"
                        className={inputStyle("investigations")}
                        ref={(el) =>
                          registerFieldRef?.(
                            `investigations.${inv.id}.value`,
                            el
                          )
                        }
                      />
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-semibold uppercase text-slate-500 lg:hidden">
                      Notes
                    </label>
                    {wrapWithMic(
                      {
                        mode: "FIELD",
                        field: `investigations.${inv.id}.notes`,
                      },
                      <Input
                        value={inv.notes || ""}
                        onChange={(e) =>
                          updateInvestigation(inv.id, "notes", e.target.value)
                        }
                        placeholder="e.g. improved"
                        className={inputStyle("investigations")}
                        ref={(el) =>
                          registerFieldRef?.(
                            `investigations.${inv.id}.notes`,
                            el
                          )
                        }
                      />
                    )}
                  </div>

                  <div className="flex items-center justify-start lg:justify-center">
                    {uploadingInvestigationId === inv.id ? (
                      <div className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-cyan-200 bg-cyan-50 px-3 text-[11px] font-semibold text-cyan-700">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Uploading
                      </div>
                    ) : inv.documentUrl ? (
                      <div className="flex h-9 max-w-[120px] items-center gap-1 rounded-xl border border-cyan-200 bg-cyan-50 px-2 text-[11px] font-semibold text-cyan-700">
                        <FileText className="h-3.5 w-3.5 shrink-0" />

                        <button
                          type="button"
                          onClick={() => openInvestigationPreview(inv)}
                          className="min-w-0 flex-1 truncate text-left hover:underline"
                          title="Preview lab report"
                        >
                          {inv.documentFileName || "Report"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveFile(inv.id)}
                          className="shrink-0 rounded-md p-0.5 hover:bg-red-50 hover:text-red-500"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="inline-flex h-9 cursor-pointer items-center justify-center rounded-xl border border-dashed border-cyan-300 bg-white px-3 text-xs font-semibold text-cyan-700 transition-colors hover:border-cyan-400 hover:bg-cyan-50">
                        <Upload className="mr-1 h-3.5 w-3.5" />
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

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-9 w-9 rounded-xl p-0 text-slate-400 hover:bg-red-50 hover:text-red-500"
                      onClick={() => removeInvestigation(inv.id)}
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

      <Dialog open={isPreviewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="flex h-[94vh] max-h-[94vh] !w-[calc(100vw-3rem)] !max-w-[1200px] flex-col gap-0 overflow-hidden border-slate-200 bg-slate-100 p-0">
          <DialogHeader className="shrink-0 border-b border-slate-200 bg-white px-5 py-4 pr-14">
            <DialogTitle className="flex items-center gap-2 text-base text-slate-900">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <FileSearch className="h-4 w-4" />
              </div>
              Lab Reports Preview
            </DialogTitle>

            <DialogDescription className="text-xs">
              {savedInvestigations.length > 0
                ? `${savedInvestigations.length} investigation${
                    savedInvestigations.length === 1 ? "" : "s"
                  } available`
                : "No investigations available"}
            </DialogDescription>
          </DialogHeader>

          {selectedInvestigation ? (
            <div className="grid min-h-0 flex-1 grid-cols-1 bg-slate-100 lg:grid-cols-[300px_minmax(0,1fr)]">
              <aside className="min-h-0 overflow-y-auto border-b border-slate-200 bg-white p-3 lg:border-b-0 lg:border-r">
                <div className="space-y-2">
                  {savedInvestigations.map((inv, index) => (
                    <button
                      key={inv.id}
                      type="button"
                      onClick={() => setSelectedInvestigationId(inv.id)}
                      className={`flex w-full min-w-0 items-start gap-2 rounded-xl border px-3 py-2 text-left transition-colors ${
                        selectedInvestigation.id === inv.id
                          ? "border-cyan-200 bg-cyan-50 text-cyan-700"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <FileSearch className="mt-0.5 h-4 w-4 shrink-0" />

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-bold">
                          {inv.test || `Investigation ${index + 1}`}
                        </span>

                        <span className="block truncate text-[10px] text-slate-500">
                          {inv.value || "Result not entered"}
                        </span>

                        {inv.documentUrl && (
                          <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-cyan-600">
                            <Paperclip className="h-3 w-3" />
                            Report attached
                          </span>
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              </aside>

              <main className="grid min-h-0 grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)]">
                <section className="min-h-0 overflow-y-auto border-b border-slate-200 bg-white p-4 lg:border-b-0 lg:border-r">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Investigation Details
                  </p>

                  <div className="space-y-3">
                    {[
                      ["Test Name", selectedInvestigation.test || "Not entered"],
                      ["Value / Result", selectedInvestigation.value || "Not entered"],
                      ["Notes", selectedInvestigation.notes || "No notes added"],
                      [
                        "Attachment",
                        selectedInvestigation.documentFileName ||
                          "No report attached",
                      ],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                      >
                        <p className="text-[10px] font-bold uppercase text-slate-500">
                          {label}
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-sm font-semibold text-slate-800">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="flex min-h-0 flex-col">
                  <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-2">
                    <p className="min-w-0 truncate text-xs font-bold text-slate-700">
                      {selectedInvestigation.documentFileName || "Report preview"}
                    </p>

                    {selectedInvestigation.documentUrl && (
                      <a
                        href={selectedInvestigation.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Open
                      </a>
                    )}
                  </div>

                  <div className="min-h-0 flex-1 overflow-auto bg-slate-100 p-4">
                    {selectedInvestigation.documentUrl ? (
                      isImageReport(selectedInvestigation) ? (
                        <div className="flex min-h-full items-center justify-center">
                          <img
                            key={selectedInvestigation.id}
                            src={selectedInvestigation.documentUrl}
                            alt={
                              selectedInvestigation.documentFileName ||
                              "Lab report preview"
                            }
                            className="max-h-full max-w-full rounded-xl object-contain shadow-sm"
                          />
                        </div>
                      ) : (
                        <iframe
                          key={selectedInvestigation.id}
                          src={selectedInvestigation.documentUrl}
                          title={
                            selectedInvestigation.documentFileName ||
                            "Lab report preview"
                          }
                          className="h-full min-h-[640px] w-full rounded-xl border-0 bg-white shadow-sm"
                        />
                      )
                    ) : (
                      <div className="flex h-full min-h-[360px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-center text-sm text-slate-600">
                        No lab report file attached for this investigation.
                      </div>
                    )}
                  </div>
                </section>
              </main>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-slate-600">
              Add an investigation first to preview lab reports here.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
