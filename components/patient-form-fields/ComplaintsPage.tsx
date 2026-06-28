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
import { ClipboardList, Plus, Trash2 } from "lucide-react";
import { PatientData, ComplaintEntry } from "../patient-form-fields/types";
import { VoiceContext } from "@/hooks/useConsultationVoice";

type Props = {
  data: PatientData;

  updateComplaint: (
    id: string,
    field: keyof Omit<ComplaintEntry, "id">,
    value: string
  ) => void;

  addComplaint: () => void;
  removeComplaint: (id: string) => void;

  isHighlighted?: (field: string) => boolean;

  wrapWithMic?: (
    context: VoiceContext,
    element: ReactElement<{ className?: string }>
  ) => JSX.Element;
};

export default function ComplaintsPage({
  data,
  updateComplaint,
  addComplaint,
  removeComplaint,
  isHighlighted = () => false,
  wrapWithMic = (_, el) => el,
}: Props) {
  return (
    <Card className="border-slate-200 shadow-sm rounded-xl bg-white overflow-hidden">
      
      {/* Header */}
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            {wrapWithMic(
              { mode: "COMPONENT", component: "Complaints" },
              <div className="flex items-center gap-2 cursor-pointer">
                <ClipboardList className="h-4 w-4 text-slate-500" />
                Chief Complaints
              </div>
            )}
          </CardTitle>

          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 px-3 text-xs bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
            onClick={addComplaint}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="p-4">
        {(data.complaints?.length ?? 0) === 0 ? (
          <div className="rounded-md border bg-card/30 py-2 px-2 text-center text-xs text-muted-foreground">
            No complaints yet. Use voice or click "Add".
          </div>
        ) : (
          <div className="w-full">
            <div className="w-full">

              {/* Header Row */}
              <div className="hidden lg:grid grid-cols-[40px_1.2fr_0.8fr_0.7fr_0.7fr_32px] items-center gap-2 rounded-md px-2 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                <div>#</div>
                <div>Complaint</div>
                <div>Freq</div>
                <div>Sev</div>
                <div>Dur</div>
                <div />
              </div>

              {/* Rows */}
              <div className="space-y-4 lg:space-y-2 pt-1">
                {(data.complaints || []).map((c, index) => (
                  <div
                    key={c.id}
                    className="relative grid grid-cols-1 lg:grid-cols-[40px_1.2fr_0.8fr_0.7fr_0.7fr_32px] items-start gap-3 lg:gap-2 p-3 lg:p-0 lg:px-2 border lg:border-none border-slate-100 rounded-lg bg-slate-50/50 lg:bg-transparent"
                  >
                    {/* Index */}
                    <div className="hidden lg:block pt-2 text-center text-[11px] font-medium text-slate-400">
                      {index + 1}
                    </div>

                    <div className="lg:hidden flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-slate-700">Complaint #{index + 1}</span>
                    </div>

                    {/* Complaint Name */}
                    <div className="flex flex-col gap-1 lg:block lg:gap-0">
                      <label className="lg:hidden text-[10px] uppercase text-slate-500 font-semibold">Complaint</label>
                      {wrapWithMic(
                        { mode: "FIELD", field: `complaints.${c.id}.complaintName` },
                        <Input
                          value={c.complaintName}
                          onChange={(e) =>
                            updateComplaint(c.id, "complaintName", e.target.value)
                          }
                          placeholder="cough"
                          className={`h-8 text-sm lg:text-xs bg-slate-50 border-slate-200 focus-visible:ring-sky-500 ${
                            isHighlighted("complaints")
                              ? "ring-2 ring-sky-500 bg-sky-50"
                              : ""
                          }`}
                        />
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-3 lg:contents">
                      {/* Frequency */}
                      <div className="flex flex-col gap-1 lg:block lg:gap-0">
                        <label className="lg:hidden text-[10px] uppercase text-slate-500 font-semibold">Freq</label>
                        {wrapWithMic(
                          { mode: "FIELD", field: `complaints.${c.id}.complaintFrequency` },
                          <Input
                            value={c.complaintFrequency ?? ""}
                            onChange={(e) =>
                              updateComplaint(c.id, "complaintFrequency", e.target.value)
                            }
                            placeholder="3d"
                            className="h-8 text-sm lg:text-xs bg-slate-50 border-slate-200 focus-visible:ring-sky-500"
                          />
                        )}
                      </div>

                      {/* Severity */}
                      <div className="flex flex-col gap-1 lg:block lg:gap-0">
                        <label className="lg:hidden text-[10px] uppercase text-slate-500 font-semibold">Severity</label>
                        {wrapWithMic(
                          { mode: "FIELD", field: `complaints.${c.id}.severity` },
                          <Input
                            value={c.severity ?? ""}
                            onChange={(e) =>
                              updateComplaint(c.id, "severity", e.target.value)
                            }
                            placeholder="mild"
                            className="h-8 text-sm lg:text-xs bg-slate-50 border-slate-200 focus-visible:ring-sky-500"
                          />
                        )}
                      </div>

                      {/* Duration */}
                      <div className="flex flex-col gap-1 lg:block lg:gap-0">
                        <label className="lg:hidden text-[10px] uppercase text-slate-500 font-semibold">Duration</label>
                        {wrapWithMic(
                          { mode: "FIELD", field: `complaints.${c.id}.complaintDuration` },
                          <Input
                            value={c.complaintDuration ?? ""}
                            onChange={(e) =>
                              updateComplaint(c.id, "complaintDuration", e.target.value)
                            }
                            placeholder="1w"
                            className="h-8 text-sm lg:text-xs bg-slate-50 border-slate-200 focus-visible:ring-sky-500"
                          />
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
                        onClick={() => removeComplaint(c.id)}
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