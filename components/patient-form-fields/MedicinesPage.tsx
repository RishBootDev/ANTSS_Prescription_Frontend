"use client";

import React, { JSX, ReactElement } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pill, Plus, Trash2 } from "lucide-react";
import { PatientData } from "../patient-form";

type Props = {
  data: PatientData;

  addMedicine: () => void;
  removeMedicine: (id: string) => void;

  updateMedicine: (
    id: string,
    field: "name" | "dose" | "frequency" | "duration" | "instructions",
    value: string
  ) => void;

  inputClass?: (field: keyof PatientData) => string;
  isHighlighted?: (section: string) => boolean;

  // ✅ FIXED TYPE
  wrapWithMic?: (
      fieldId: string,
      element: ReactElement<{ className?: string }>
    ) => JSX .Element;
  };
  

export default function MedicinesPage({
  data,
  addMedicine,
  removeMedicine,
  updateMedicine,
  inputClass = () => "",
  isHighlighted = () => false,
  wrapWithMic,
}: Props) {
  return (
    <Card>
      <CardHeader className="pb-1.5 px-3 pt-2.5">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-1.5 text-sm font-semibold">
            <Pill className="h-3.5 w-3.5 text-accent" />
            Prescribed medicines
          </CardTitle>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={addMedicine}
            className="h-6 gap-1 text-[10px]"
          >
            <Plus className="h-3 w-3" />
            Add medicine
          </Button>
        </div>
      </CardHeader>

      <CardContent className="px-3 pb-2.5">
        {data.medicines.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-md border bg-card/30 py-3 text-center text-muted-foreground">
            <Pill className="mb-1.5 h-6 w-6 opacity-50" />
            <p className="text-sm">No medicines added yet</p>
            <p className="text-xs mt-0.5">
              Use voice or click "Add medicine".
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[980px]">

              {/* Header */}
              <div className="grid grid-cols-[52px_1.3fr_0.9fr_0.9fr_0.9fr_1fr_36px] items-center gap-1.5 rounded-md bg-muted/30 px-2 py-1 text-[10px] font-medium text-muted-foreground">
                <div>#</div>
                <div>Medicine</div>
                <div>Dose</div>
                <div>Frequency</div>
                <div>Duration</div>
                <div>Instructions</div>
                <div />
              </div>

              {/* Rows */}
              <div className="space-y-1.5 pt-1.5">
                {data.medicines.map((m, index) => (
                  <div
                    key={m.id}
                    className="grid grid-cols-[52px_1.3fr_0.9fr_0.9fr_0.9fr_1fr_36px] items-start gap-1.5 rounded-md border bg-card px-2 py-1.5"
                  >
                    <div className="pt-1.5 text-center text-[11px] text-muted-foreground">
                      {index + 1}
                    </div>

                    {wrapWithMic?.(
                      `medicines.${m.id}.name`,
                      <Input
                        value={m.name}
                        onChange={(e) =>
                          updateMedicine(m.id, "name", e.target.value)
                        }
                        placeholder="Medicine name"
                        className={`h-8 text-sm ${
                          isHighlighted("medicines")
                            ? "ring-2 ring-accent bg-accent/10 animate-pulse"
                            : ""
                        }`}
                      />
                    )}

                    {wrapWithMic?.(
                      `medicines.${m.id}.dose`,
                      <Input
                        value={m.dose}
                        onChange={(e) =>
                          updateMedicine(m.id, "dose", e.target.value)
                        }
                        placeholder="e.g., 500mg"
                        className="h-8 text-sm"
                      />
                    )}

                    {wrapWithMic?.(
                      `medicines.${m.id}.frequency`,
                      <Input
                        value={m.frequency}
                        onChange={(e) =>
                          updateMedicine(m.id, "frequency", e.target.value)
                        }
                        placeholder="e.g., twice daily"
                        className="h-8 text-sm"
                      />
                    )}

                    {wrapWithMic?.(
                      `medicines.${m.id}.duration`,
                      <Input
                        value={m.duration}
                        onChange={(e) =>
                          updateMedicine(m.id, "duration", e.target.value)
                        }
                        placeholder="e.g., 5 days"
                        className="h-8 text-sm"
                      />
                    )}

                    {wrapWithMic?.(
                      `medicines.${m.id}.instructions`,
                      <Input
                        value={m.instructions}
                        onChange={(e) =>
                          updateMedicine(m.id, "instructions", e.target.value)
                        }
                        placeholder="e.g., after food"
                        className="h-8 text-sm"
                      />
                    )}

                    <div className="flex justify-end pt-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeMedicine(m.id)}
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