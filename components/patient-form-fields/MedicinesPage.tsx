"use client";

import React, { JSX, ReactElement } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Database, Pill, Plus, Trash2 } from "lucide-react";
import { PatientData, MedicineEntry } from "../patient-form";
import MedicineAutocomplete from "@/src/modules/medicine/components/MedicineAutocomplete";
import { MedicineMaster } from "@/src/services/medicine.service";

const getMedicineField = (medicine: MedicineEntry, field: keyof Omit<MedicineEntry, "id">) => {
  const legacyMedicine = medicine as MedicineEntry & {
    name?: string;
    dose?: string;
    instructions?: string;
  };

  if (field === "medicineName") return medicine.medicineName ?? legacyMedicine.name ?? "";
  if (field === "dosage") return medicine.dosage ?? legacyMedicine.dose ?? "";
  if (field === "instruction") return medicine.instruction ?? legacyMedicine.instructions ?? "";
  return medicine[field] ?? "";
};

type Props = {
  data: PatientData;

  addMedicine: () => void;
  removeMedicine: (id: string) => void;

  updateMedicine: (
    id: string,
    field: keyof Omit<MedicineEntry, "id">,
    value: string
  ) => void;
  applyMedicineMaster?: (id: string, medicine: MedicineMaster) => void;

  inputClass?: (field: string) => string;
  isHighlighted?: (section: string) => boolean;

  wrapWithMic?: (
      fieldId: string,
      element: ReactElement<{ className?: string }>
    ) => JSX.Element;
};

export default function MedicinesPage({
  data,
  addMedicine,
  removeMedicine,
  updateMedicine,
  applyMedicineMaster,
  inputClass = () => "",
  isHighlighted = () => false,
  wrapWithMic,
}: Props) {
  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-1.5 px-3 pt-2.5">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-1.5 text-sm font-semibold">
            <Pill className="h-3.5 w-3.5 text-accent" />
            Prescribed medicines
          </CardTitle>

          <div className="flex items-center gap-1.5">
            <Button asChild type="button" size="sm" variant="ghost" className="h-6 gap-1 text-[10px]">
              <Link href="/medicine-master">
                <Database className="h-3 w-3" />
                Medicine Master
              </Link>
            </Button>
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
        </div>
      </CardHeader>

      <CardContent className="px-3 pb-2.5">
        {(data.medicines?.length ?? 0) === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-md border bg-card/30 py-3 text-center text-muted-foreground">
            <Pill className="mb-1.5 h-6 w-6 opacity-50" />
            <p className="text-sm">No medicines added yet</p>
            <p className="text-xs mt-0.5">
              Use voice or click "Add medicine".
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[1100px]">

              {/* Header */}
              <div className="grid grid-cols-[40px_1.2fr_0.7fr_0.7fr_0.8fr_0.8fr_0.8fr_0.7fr_36px] items-center gap-1.5 rounded-md bg-muted/30 px-2 py-1 text-[10px] font-medium text-muted-foreground">
                <div>#</div>
                <div>Medicine</div>
                <div>Strength</div>
                <div>Dose</div>
                <div>Freq</div>
                <div>Duration</div>
                <div>Instructions</div>
                <div>Qty</div>
                <div />
              </div>

              {/* Rows */}
              <div className="space-y-1.5 pt-1.5">
                {(data.medicines || []).map((m, index) => (
                  <div
                    key={m.id}
                    className="grid grid-cols-[40px_1.2fr_0.7fr_0.7fr_0.8fr_0.8fr_0.8fr_0.7fr_36px] items-start gap-1.5 rounded-md border bg-card px-2 py-1.5"
                  >
                    <div className="pt-1.5 text-center text-[11px] text-muted-foreground">
                      {index + 1}
                    </div>

                    {wrapWithMic?.(
                      `medicines.${m.id}.medicineName`,
                      <MedicineAutocomplete
                        value={getMedicineField(m, "medicineName")}
                        onChange={(value) => updateMedicine(m.id, "medicineName", value)}
                        onSelectMedicine={(medicine) => {
                          if (applyMedicineMaster) {
                            applyMedicineMaster(m.id, medicine);
                          } else {
                            updateMedicine(m.id, "medicineName", medicine.medicineName);
                          }
                        }}
                        placeholder="Medicine name"
                        className={`${
                          isHighlighted("medicines")
                            ? "ring-2 ring-accent bg-accent/10 animate-pulse"
                            : ""
                        }`}
                      />
                    )}

                    {wrapWithMic?.(
                      `medicines.${m.id}.strength`,
                      <Input
                        value={getMedicineField(m, "strength")}
                        onChange={(e) =>
                          updateMedicine(m.id, "strength", e.target.value)
                        }
                        placeholder="e.g., 500mg"
                        className="h-8 text-sm"
                      />
                    )}

                    {wrapWithMic?.(
                      `medicines.${m.id}.dosage`,
                      <Input
                        value={getMedicineField(m, "dosage")}
                        onChange={(e) =>
                          updateMedicine(m.id, "dosage", e.target.value)
                        }
                        placeholder="e.g., 1 tab"
                        className="h-8 text-sm"
                      />
                    )}

                    {wrapWithMic?.(
                      `medicines.${m.id}.frequency`,
                      <Input
                        value={getMedicineField(m, "frequency")}
                        onChange={(e) =>
                          updateMedicine(m.id, "frequency", e.target.value)
                        }
                        placeholder="e.g., BD"
                        className="h-8 text-sm"
                      />
                    )}

                    {wrapWithMic?.(
                      `medicines.${m.id}.duration`,
                      <Input
                        value={getMedicineField(m, "duration")}
                        onChange={(e) =>
                          updateMedicine(m.id, "duration", e.target.value)
                        }
                        placeholder="e.g., 5 days"
                        className="h-8 text-sm"
                      />
                    )}

                    {wrapWithMic?.(
                      `medicines.${m.id}.instruction`,
                      <Input
                        value={getMedicineField(m, "instruction")}
                        onChange={(e) =>
                          updateMedicine(m.id, "instruction", e.target.value)
                        }
                        placeholder="e.g., after food"
                        className="h-8 text-sm"
                      />
                    )}

                    {wrapWithMic?.(
                      `medicines.${m.id}.quantity`,
                      <Input
                        value={getMedicineField(m, "quantity")}
                        onChange={(e) =>
                          updateMedicine(m.id, "quantity", e.target.value)
                        }
                        placeholder="e.g., 10"
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
