"use client";

import { useRef, JSX, ReactElement, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  TestTube,
  Plus,
  Trash2,
  Upload,
  FileText,
  CheckCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { type PatientData, type InvestigationEntry } from "./types";
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

  isHighlighted?: (field: string) => boolean;

  wrapWithMic?: (
    fieldId: string,
    element: ReactElement<{ className?: string }>
  ) => JSX.Element;
};

export default function InvestigationsPage({
  data,
  addInvestigation,
  removeInvestigation,
  updateInvestigation,
  isHighlighted = () => false,
  wrapWithMic = (_, el) => el,
}: Props) {
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const handleFileUpload = async (invId: string, file: File) => {
    const patientId = data.patientId;
    if (!patientId) {
      alert("Patient must be saved first before uploading documents.");
      return;
    }

    setUploadingId(invId);
    try {
      const result = await uploadPatientDocument(patientId, file, "INVESTIGATION");
      updateInvestigation(invId, "documentUrl", result.url);
      updateInvestigation(invId, "documentFileName", result.fileName);
    } catch (err: any) {
      console.error("Upload failed:", err);
      alert(err.message || "Failed to upload document");
    } finally {
      setUploadingId(null);
      // Reset file input so the same file can be re-selected
      if (fileInputRefs.current[invId]) {
        fileInputRefs.current[invId]!.value = "";
      }
    }
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-1.5 px-3 pt-2.5">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-1.5 text-sm font-semibold">
            <TestTube className="h-3.5 w-3.5 text-primary" />
            Investigations
          </CardTitle>

          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-6 px-2 text-[10px]"
            onClick={addInvestigation}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>

      <CardContent className="px-3 pb-2.5">
        {(data.investigations?.length ?? 0) === 0 ? (
          <div className="rounded-md border bg-card/30 py-2 px-2 text-center text-xs text-muted-foreground">
            No investigations yet. Click "Add" to add one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[750px]">

              {/* Header Row */}
              <div className="grid grid-cols-[40px_1.3fr_1fr_1.2fr_32px] items-center gap-1 rounded-md bg-muted/30 px-2 py-1 text-[10px] font-medium text-muted-foreground">
                <div>#</div>
                <div>Investigation Name</div>
                <div>Notes</div>
                <div>Document</div>
                <div />
              </div>

              {/* Rows */}
              <div className="space-y-1.5 pt-1.5">
                {(data.investigations || []).map((inv, index) => (
                  <div
                    key={inv.id}
                    className="grid grid-cols-[40px_1.3fr_1fr_1.2fr_32px] items-center gap-1 rounded-md border bg-card px-2 py-1.5"
                  >
                    {/* Index */}
                    <div className="text-center text-[11px] text-muted-foreground">
                      {index + 1}
                    </div>

                    {/* Investigation Name */}
                    {wrapWithMic(
                      `investigations.${inv.id}.name`,
                      <Input
                        value={inv.investigationName}
                        onChange={(e) =>
                          updateInvestigation(inv.id, "investigationName", e.target.value)
                        }
                        placeholder="e.g., CBC, X-ray"
                        className={`h-8 text-xs ${
                          isHighlighted("investigations")
                            ? "ring-2 ring-accent bg-accent/10"
                            : ""
                        }`}
                      />
                    )}

                    {/* Notes */}
                    <Input
                      value={inv.notes ?? ""}
                      onChange={(e) =>
                        updateInvestigation(inv.id, "notes", e.target.value)
                      }
                      placeholder="Optional notes"
                      className="h-8 text-xs"
                    />

                    {/* Document Upload / Status */}
                    <div className="flex items-center gap-1 min-w-0">
                      {inv.documentUrl ? (
                        <div className="flex items-center gap-1 text-[10px] truncate w-full">
                          <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                          <span className="truncate text-muted-foreground">
                            {inv.documentFileName || "Uploaded"}
                          </span>
                          <a
                            href={inv.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex-shrink-0"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                          {/* Re-upload button */}
                          <button
                            type="button"
                            onClick={() => fileInputRefs.current[inv.id]?.click()}
                            className="text-[10px] text-primary hover:underline flex-shrink-0"
                            title="Replace file"
                          >
                            (change)
                          </button>
                        </div>
                      ) : (
                        <>
                          <input
                            type="file"
                            ref={(el) => { fileInputRefs.current[inv.id] = el; }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(inv.id, file);
                            }}
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-[10px] w-full"
                            onClick={() => fileInputRefs.current[inv.id]?.click()}
                            disabled={uploadingId === inv.id}
                          >
                            {uploadingId === inv.id ? (
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                              <Upload className="h-3 w-3 mr-1" />
                            )}
                            {uploadingId === inv.id ? "Uploading..." : "Upload"}
                          </Button>
                        </>
                      )}
                    </div>

                    {/* Delete */}
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeInvestigation(inv.id)}
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
