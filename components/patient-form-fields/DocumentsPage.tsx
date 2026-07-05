"use client";

import { useMemo, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Download,
  Eye,
  FileText,
  Plus,
  Trash2,
  Upload,
  Loader2,
  ExternalLink,
  CheckCircle,
  FolderOpen,
  FileUp,
} from "lucide-react";
import { PatientData, DocumentEntry } from "./types";
import { uploadPatientDocument } from "@/lib/services/documentService";

type Props = {
  data: PatientData;
  addDocument: () => void;
  addDocumentWithValues: (fileName: string, url: string) => void;
  removeDocument: (id: string) => void;
  updateDocument: (
    id: string,
    field: keyof Omit<DocumentEntry, "id">,
    value: string
  ) => void;
  isHighlighted?: (field: string) => boolean;
  previewOpen?: boolean;
  onPreviewOpenChange?: (open: boolean) => void;
};

export default function DocumentsPage({
  data,
  addDocument,
  addDocumentWithValues,
  removeDocument,
  updateDocument,
  isHighlighted = () => false,
  previewOpen,
  onPreviewOpenChange,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [internalPreviewOpen, setInternalPreviewOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null
  );

  const documents = data.documents || [];

  const previewDocuments = useMemo(
    () => documents.filter((doc) => doc.url),
    [documents]
  );

  const selectedDocument =
    previewDocuments.find((doc) => doc.id === selectedDocumentId) ||
    previewDocuments[0] ||
    null;

  const isPreviewOpen = previewOpen ?? internalPreviewOpen;

  const setPreviewOpen = (open: boolean) => {
    onPreviewOpenChange?.(open);

    if (previewOpen === undefined) {
      setInternalPreviewOpen(open);
    }
  };

  const openDocumentPreview = (doc?: DocumentEntry) => {
    setSelectedDocumentId(doc?.id || previewDocuments[0]?.id || null);
    setPreviewOpen(true);
  };

  const isImageDocument = (doc: DocumentEntry) => {
    const source = `${doc.fileName || ""} ${doc.url || ""}`.toLowerCase();
    return /\.(png|jpe?g|gif|webp|bmp|svg)(\?|#|$)/.test(source);
  };

  const handleCentralFileUpload = async (file: File) => {
    const patientId = data.patientId;

    if (!patientId) {
      alert("Please save the patient first before uploading documents.");
      return;
    }

    setUploading(true);

    try {
      const result = await uploadPatientDocument(patientId, file, "DOCUMENT");
      addDocumentWithValues(file.name, result.url);
    } catch (err: any) {
      console.error("Upload failed:", err);
      alert(err.message || "Failed to upload document");
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-white px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex min-w-0 items-center gap-3 text-slate-900">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                <FolderOpen className="h-4.5 w-4.5" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-black uppercase tracking-wide">
                    Documents
                  </span>

                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                    {documents.length}
                  </span>
                </div>

                <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                  Reports, consent forms and files
                </p>
              </div>
            </CardTitle>

            <Button
              type="button"
              size="sm"
              onClick={addDocument}
              className="h-8 rounded-xl bg-blue-600 px-3 text-[11px] font-bold text-white shadow-sm hover:bg-blue-700"
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add
            </Button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleCentralFileUpload(file);
            }}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />
        </CardHeader>

        <CardContent className="bg-gradient-to-b from-slate-50/70 to-white p-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="h-10 rounded-xl border-slate-200 bg-white text-xs font-bold text-slate-600 shadow-sm hover:bg-blue-50 hover:text-blue-600"
            >
              {uploading ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-1.5 h-4 w-4" />
              )}
              {uploading ? "Uploading" : "Upload"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => openDocumentPreview()}
              disabled={previewDocuments.length === 0}
              className="h-10 rounded-xl border-slate-200 bg-white text-xs font-bold text-slate-600 shadow-sm hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
            >
              <Eye className="mr-1.5 h-4 w-4" />
              Preview
            </Button>
          </div>

          <div
            className="group mt-3 flex min-h-[96px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-3 py-4 text-center shadow-sm transition hover:border-blue-300 hover:bg-blue-50/40"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition group-hover:bg-blue-600 group-hover:text-white">
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <FileUp className="h-5 w-5" />
              )}
            </div>

            <p className="text-xs font-bold text-slate-700">
              {uploading ? "Uploading file..." : "Click or drag file here"}
            </p>

            <p className="mt-0.5 text-[10px] font-medium text-slate-400">
              PDF, JPG, PNG, DOC — max 10MB
            </p>
          </div>

          {documents.length === 0 ? (
            <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-center shadow-sm">
              <p className="text-xs font-bold text-slate-700">
                No documents uploaded
              </p>
              <p className="mt-1 text-[10px] font-medium text-slate-400">
                Upload a file or click Add to create a document row.
              </p>
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              {documents.map((doc, index) => (
                <div
                  key={doc.id}
                  className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-blue-200 hover:shadow-md"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[11px] font-bold text-blue-600">
                        {index + 1}
                      </span>

                      <span className="truncate text-xs font-bold text-slate-700">
                        Document #{index + 1}
                      </span>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 rounded-lg p-0 text-slate-400 hover:bg-red-50 hover:text-red-500"
                      onClick={() => removeDocument(doc.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <Input
                    value={doc.fileName}
                    onChange={(e) =>
                      updateDocument(doc.id, "fileName", e.target.value)
                    }
                    placeholder="e.g. Lab Report"
                    className={`h-9 rounded-xl border-slate-200 bg-slate-50 text-xs font-semibold shadow-none placeholder:text-slate-400 focus-visible:border-blue-400 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-blue-100 ${
                      isHighlighted("documents")
                        ? "bg-blue-50 ring-2 ring-blue-100"
                        : ""
                    }`}
                  />

                  {doc.url ? (
                    <div className="mt-2 flex items-center justify-between gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-2 py-2">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <CheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        <button
                          type="button"
                          onClick={() => openDocumentPreview(doc)}
                          className="truncate text-[10px] font-bold text-emerald-700 hover:underline"
                        >
                          Uploaded
                        </button>
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openDocumentPreview(doc)}
                          className="rounded-lg p-1 text-blue-600 hover:bg-white"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>

                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg p-1 text-blue-600 hover:bg-white"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-2 py-2 text-[10px] font-medium text-slate-400">
                      No file uploaded for this row
                    </div>
                  )}
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
              <FileText className="h-4 w-4 text-primary" />
              Document Preview
            </DialogTitle>

            <DialogDescription className="text-xs">
              {previewDocuments.length > 0
                ? `${previewDocuments.length} document${
                    previewDocuments.length === 1 ? "" : "s"
                  } available`
                : "No uploaded documents available"}
            </DialogDescription>
          </DialogHeader>

          {selectedDocument ? (
            <div className="grid min-h-0 flex-1 grid-cols-1 bg-slate-100 lg:grid-cols-[280px_minmax(0,1fr)]">
              <aside className="min-h-0 overflow-y-auto border-b border-slate-200 bg-white p-3 lg:border-b-0 lg:border-r">
                <div className="space-y-2">
                  {previewDocuments.map((doc, index) => (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => setSelectedDocumentId(doc.id)}
                      className={`flex w-full min-w-0 items-center gap-2 rounded-xl border px-3 py-2 text-left transition-colors ${
                        selectedDocument.id === doc.id
                          ? "border-blue-200 bg-blue-50 text-blue-700"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <FileText className="h-4 w-4 shrink-0" />

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-bold">
                          {doc.fileName || `Document ${index + 1}`}
                        </span>
                        <span className="block truncate text-[10px] text-slate-400">
                          {doc.url}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </aside>

              <main className="flex min-h-0 flex-col">
                <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-2">
                  <p className="min-w-0 truncate text-xs font-bold text-slate-700">
                    {selectedDocument.fileName || "Selected document"}
                  </p>

                  <a
                    href={selectedDocument.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-bold text-slate-600 hover:bg-slate-50"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Open
                  </a>
                </div>

                <div className="min-h-0 flex-1 overflow-auto bg-slate-100 p-4">
                  {isImageDocument(selectedDocument) ? (
                    <div className="flex min-h-full items-center justify-center">
                      <img
                        key={selectedDocument.id}
                        src={selectedDocument.url}
                        alt={selectedDocument.fileName || "Document preview"}
                        className="max-h-full max-w-full rounded-xl object-contain shadow-sm"
                      />
                    </div>
                  ) : (
                    <iframe
                      key={selectedDocument.id}
                      src={selectedDocument.url}
                      title={selectedDocument.fileName || "Document preview"}
                      className="h-full min-h-[640px] w-full rounded-xl border-0 bg-white shadow-sm"
                    />
                  )}
                </div>
              </main>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-slate-500">
              Upload a document first to preview it here.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}