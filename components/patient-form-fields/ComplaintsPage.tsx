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
import { Calendar as CalendarIcon, ClipboardList, Plus, Trash2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { PatientData, ComplaintEntry } from "../patient-form";

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
    fieldId: string,
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
    <Card className="border-border/50 shadow-sm">
      
      {/* Header */}
      <CardHeader className="pb-1.5 px-3 pt-2.5">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-1.5 text-sm font-semibold">
            <ClipboardList className="h-3.5 w-3.5 text-primary" />
            Chief Complaints
          </CardTitle>

          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-6 px-2 text-[10px]"
            onClick={addComplaint}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="px-3 pb-2.5">
        {data.complaints.length === 0 ? (
          <div className="rounded-md border bg-card/30 py-2 px-2 text-center text-xs text-muted-foreground">
            No complaints yet. Use voice or click "Add".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[820px]">

              {/* Header Row */}
              <div className="grid grid-cols-[40px_1.2fr_0.8fr_0.7fr_0.7fr_0.8fr_32px] items-center gap-1 rounded-md bg-muted/30 px-2 py-1 text-[10px] font-medium text-muted-foreground">
                <div>#</div>
                <div>Complaint</div>
                <div>Freq</div>
                <div>Sev</div>
                <div>Dur</div>
                <div>Date</div>
                <div />
              </div>

              {/* Rows */}
              <div className="space-y-1.5 pt-1.5">
                {data.complaints.map((c, index) => (
                  <div
                    key={c.id}
                    className="grid grid-cols-[40px_1.2fr_0.8fr_0.7fr_0.7fr_0.8fr_32px] items-center gap-1 rounded-md border bg-card px-2 py-1.5"
                  >
                    {/* Index */}
                    <div className="text-center text-[11px] text-muted-foreground">
                      {index + 1}
                    </div>

                    {/* Complaint */}
                    {wrapWithMic(
                      `complaints.${c.id}.complaint`,
                      <Input
                        value={c.complaint}
                        onChange={(e) =>
                          updateComplaint(c.id, "complaint", e.target.value)
                        }
                        placeholder="cough"
                        className={`h-8 text-xs ${
                          isHighlighted("complaints")
                            ? "ring-2 ring-accent bg-accent/10"
                            : ""
                        }`}
                      />
                    )}

                    {/* Frequency */}
                    {wrapWithMic(
                      `complaints.${c.id}.frequency`,
                      <Input
                        value={c.frequency ?? ""}
                        onChange={(e) =>
                          updateComplaint(c.id, "frequency", e.target.value)
                        }
                        placeholder="3d"
                        className="h-8 text-xs"
                      />
                    )}

                    {/* Severity */}
                    {wrapWithMic(
                      `complaints.${c.id}.severity`,
                      <Input
                        value={c.severity ?? ""}
                        onChange={(e) =>
                          updateComplaint(c.id, "severity", e.target.value)
                        }
                        placeholder="mild"
                        className="h-8 text-xs"
                      />
                    )}

                    {/* Duration */}
                    {wrapWithMic(
                      `complaints.${c.id}.duration`,
                      <Input
                        value={c.duration ?? ""}
                        onChange={(e) =>
                          updateComplaint(c.id, "duration", e.target.value)
                        }
                        placeholder="1w"
                        className="h-8 text-xs"
                      />
                    )}

                    {/* Date */}
                    <Popover>
                      <PopoverTrigger asChild>
                        {wrapWithMic(
                          `complaints.${c.id}.date`,
                          <Button
                            variant="outline"
                            className={cn(
                              "h-8 justify-start text-left font-normal px-2 text-xs",
                              !c.date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            {c.date ? format(new Date(c.date), "dd/MM/yyyy") : <span>Date</span>}
                          </Button>
                        )}
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={c.date ? new Date(c.date) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              updateComplaint(c.id, "date", date.toISOString().split('T')[0]);
                            } else {
                              updateComplaint(c.id, "date", "");
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    {/* Delete */}
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
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