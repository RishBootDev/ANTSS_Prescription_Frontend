"use client";

import { useRef, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Plus,
  Trash2,
  Upload,
  Loader2,
  ExternalLink,
  CheckCircle,
} from "lucide-react";
import { PatientData, DocumentEntry } from "./types";
import { uploadPatientDocument } from "@/lib/services/documentService";

type Props = {
  data: PatientData;

  addDocument: () => void;
  /** Add a document with pre-set fileName and URL (used after file upload) */
  addDocumentWithValues: (fileName: string, url: string) => void;
  removeDocument: (id: string) => void;

  updateDocument: (
    id: string,
    field: keyof Omit<DocumentEntry, "id">,
    value: string
  ) => void;

  isHighlighted?: (field: string) => boolean;
};

export default function DocumentsPage({
  data,
  addDocument,
  addDocumentWithValues,
  removeDocument,
  updateDocument,
  isHighlighted = () => false,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  /**
   * Upload a file to the backend, then create a document entry with the returned URL.
   * Uses addDocumentWithValues to create the entry directly with correct values.
   */
  const handleCentralFileUpload = async (file: File) => {
    const patientId = data.patientId;
    if (!patientId) {
      alert("Please save the patient first before uploading documents.");
      return;
    }

    setUploading(true);
    try {
      const result = await uploadPatientDocument(patientId, file, "DOCUMENT");
      // Directly add an entry with the correct fileName and URL — no setTimeout needed
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
    <Card className="border-slate-200 shadow-sm rounded-xl bg-white overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 px-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <FileText className="h-4 w-4 text-slate-500" />
            Documents
          </CardTitle>

          <div className="flex items-center gap-1">
            {/* Hidden file input for central upload */}
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
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 px-3 text-xs bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Upload className="h-3 w-3 mr-1" />
              )}
              {uploading ? "Uploading..." : "Upload"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 px-3 text-xs bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
              onClick={addDocument}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* Central upload drop zone */}
        <div
          className="rounded-md border-2 border-dashed border-muted-foreground/30 bg-card/20 py-4 px-4 mb-3 text-center cursor-pointer hover:bg-card/40 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
          <p className="text-xs text-muted-foreground font-medium">
            Click or drag files here to upload
          </p>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5">
            PDF, JPG, PNG, DOC — max 10MB
          </p>
        </div>

        {(data.documents?.length ?? 0) === 0 ? (
          <div className="rounded-md border bg-card/30 py-2 px-2 text-center text-xs text-muted-foreground">
            No documents yet. Upload files above or click "Add" to add a URL manually.
          </div>
        ) : (
          <div className="w-full">
            <div className="w-full">
              {/* Header Row */}
              <div className="hidden lg:grid grid-cols-[40px_1fr_1.5fr_32px] items-center gap-2 rounded-md px-2 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                <div>#</div>
                <div>File Name</div>
                <div>URL</div>
                <div />
              </div>

              {/* Rows */}
              <div className="space-y-4 lg:space-y-2 pt-1">
                {(data.documents || []).map((doc, index) => (
                  <div
                    key={doc.id}
                    className="relative grid grid-cols-1 lg:grid-cols-[40px_1fr_1.5fr_32px] items-start gap-3 lg:gap-2 p-3 lg:p-0 lg:px-2 border lg:border-none border-slate-100 rounded-lg bg-slate-50/50 lg:bg-transparent"
                  >
                    {/* Index */}
                    <div className="hidden lg:block pt-2 text-center text-[11px] font-medium text-slate-400">
                      {index + 1}
                    </div>

                    <div className="lg:hidden flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-slate-700">Document #{index + 1}</span>
                    </div>

                    {/* File Name */}
                    <div className="flex flex-col gap-1 lg:block lg:gap-0">
                      <label className="lg:hidden text-[10px] uppercase text-slate-500 font-semibold">File Name</label>
                      <Input
                        value={doc.fileName}
                        onChange={(e) =>
                          updateDocument(doc.id, "fileName", e.target.value)
                        }
                        placeholder="e.g., Lab Report"
                        className={`h-8 text-sm lg:text-xs bg-slate-50 border-slate-200 focus-visible:ring-sky-500 ${
                          isHighlighted("documents")
                            ? "ring-2 ring-sky-500 bg-sky-50"
                            : ""
                        }`}
                      />
                    </div>

                    {/* URL column: show link if present, else show input */}
                    <div className="flex flex-col gap-1 lg:block lg:gap-0 min-w-0">
                      <label className="lg:hidden text-[10px] uppercase text-slate-500 font-semibold">URL</label>
                      <div className="flex items-center gap-1 min-w-0">
                        {doc.url ? (
                          <div className="flex items-center gap-1 w-full bg-slate-50 border border-slate-200 rounded-md px-2 h-8 lg:h-auto lg:border-none lg:bg-transparent lg:px-0">
                            <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                            <span className="text-[10px] text-muted-foreground truncate flex-1">
                              {doc.url}
                            </span>
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex-shrink-0"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 w-full bg-slate-50 border border-slate-200 rounded-md px-2 h-8 lg:h-auto lg:border-none lg:bg-transparent lg:px-0">
                             <span className="text-[10px] text-muted-foreground italic truncate flex-1">
                               Upload a document...
                             </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Delete */}
                    <div className="absolute top-2 right-2 lg:static lg:flex lg:justify-end lg:pt-1 z-10">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        onClick={() => removeDocument(doc.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
