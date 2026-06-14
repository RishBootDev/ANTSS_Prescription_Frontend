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
import { PatientData, TestRequestedEntry } from "../patient-form";

type Props = {
  data: PatientData;

  addTestRequested: () => void;
  removeTestRequested: (id: string) => void;

  updateTestRequested: (
    id: string,
    field: keyof Omit<TestRequestedEntry, "id">,
    value: string
  ) => void;

  isHighlighted?: (field: string) => boolean;

  wrapWithMic?: (
    fieldId: string,
    element: ReactElement<{ className?: string }>
  ) => JSX.Element;
};

export default function TestRequestedPage({
  data,
  addTestRequested,
  removeTestRequested,
  updateTestRequested,
  isHighlighted = () => false,
  wrapWithMic = (_, el) => el,
}: Props) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-1.5 px-3 pt-2.5">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-1.5 text-sm font-semibold">
            <ClipboardList className="h-3.5 w-3.5 text-primary" />
            Test Requested
          </CardTitle>

          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-6 px-2 text-[10px]"
            onClick={addTestRequested}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>

      <CardContent className="px-3 pb-2.5">
        {(data.testsRequested?.length ?? 0) === 0 ? (
          <div className="rounded-md border bg-card/30 py-2 px-2 text-center text-xs text-muted-foreground">
            No tests requested yet. Click "Add" to add one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">

              {/* Header Row */}
              <div className="grid grid-cols-[40px_1.5fr_1fr_32px] items-center gap-1 rounded-md bg-muted/30 px-2 py-1 text-[10px] font-medium text-muted-foreground">
                <div>#</div>
                <div>Test Name</div>
                <div>Notes</div>
                <div />
              </div>

              {/* Rows */}
              <div className="space-y-1.5 pt-1.5">
                {(data.testsRequested || []).map((tr, index) => (
                  <div
                    key={tr.id}
                    className="grid grid-cols-[40px_1.5fr_1fr_32px] items-center gap-1 rounded-md border bg-card px-2 py-1.5"
                  >
                    {/* Index */}
                    <div className="text-center text-[11px] text-muted-foreground">
                      {index + 1}
                    </div>

                    {/* Test Name */}
                    {wrapWithMic(
                      `testsRequested.${tr.id}.name`,
                      <Input
                        value={tr.testName}
                        onChange={(e) =>
                          updateTestRequested(tr.id, "testName", e.target.value)
                        }
                        placeholder="e.g., CBC, Lipid Profile"
                        className={`h-8 text-xs ${
                          isHighlighted("testsRequested")
                            ? "ring-2 ring-accent bg-accent/10"
                            : ""
                        }`}
                      />
                    )}

                    {/* Notes */}
                    <Input
                      value={tr.notes ?? ""}
                      onChange={(e) =>
                        updateTestRequested(tr.id, "notes", e.target.value)
                      }
                      placeholder="Optional notes"
                      className="h-8 text-xs"
                    />

                    {/* Delete */}
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeTestRequested(tr.id)}
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