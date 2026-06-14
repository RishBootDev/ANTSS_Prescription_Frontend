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
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-1.5 px-3 pt-2.5">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-1.5 text-sm font-semibold">
            <FileText className="h-3.5 w-3.5 text-primary" />
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
              variant="default"
              className="h-6 px-2 text-[10px]"
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
              className="h-6 px-2 text-[10px]"
              onClick={addDocument}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-3 pb-2.5">
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
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Header Row */}
              <div className="grid grid-cols-[40px_1fr_1.5fr_32px] items-center gap-1 rounded-md bg-muted/30 px-2 py-1 text-[10px] font-medium text-muted-foreground">
                <div>#</div>
                <div>File Name</div>
                <div>URL</div>
                <div />
              </div>

              {/* Rows */}
              <div className="space-y-1.5 pt-1.5">
                {(data.documents || []).map((doc, index) => (
                  <div
                    key={doc.id}
                    className="grid grid-cols-[40px_1fr_1.5fr_32px] items-center gap-1 rounded-md border bg-card px-2 py-1.5"
                  >
                    {/* Index */}
                    <div className="text-center text-[11px] text-muted-foreground">
                      {index + 1}
                    </div>

                    {/* File Name */}
                    <Input
                      value={doc.fileName}
                      onChange={(e) =>
                        updateDocument(doc.id, "fileName", e.target.value)
                      }
                      placeholder="e.g., Lab Report"
                      className={`h-8 text-xs ${
                        isHighlighted("documents")
                          ? "ring-2 ring-accent bg-accent/10"
                          : ""
                      }`}
                    />

                    {/* URL column: show link if present, else show input */}
                    <div className="flex items-center gap-1 min-w-0">
                      {doc.url ? (
                        <div className="flex items-center gap-1 w-full">
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
                        <Input
                          value={doc.url}
                          onChange={(e) =>
                            updateDocument(doc.id, "url", e.target.value)
                          }
                          placeholder="https://..."
                          className="h-8 text-xs"
                        />
                      )}
                    </div>

                    {/* Delete */}
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
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
