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
import { PatientData, MedicineEntry } from "../patient-form-fields/types";
import { VoiceContext } from "@/hooks/useConsultationVoice";
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
      context: VoiceContext,
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
    <Card className="border-slate-200 shadow-sm rounded-xl bg-white overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 px-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            {wrapWithMic?.(
              { mode: "COMPONENT", component: "Medicines" },
              <div className="flex items-center gap-2 cursor-pointer">
                <Pill className="h-4 w-4 text-slate-500" />
                Prescribed medicines
              </div>
            ) ?? (
              <>
                <Pill className="h-4 w-4 text-slate-500" />
                Prescribed medicines
              </>
            )}
          </CardTitle>

          <div className="flex items-center gap-1.5">
            <Button asChild type="button" size="sm" variant="ghost" className="h-7 gap-1 text-[10px] text-slate-500 hover:text-slate-800">
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
              className="h-7 px-3 text-xs bg-white hover:bg-slate-50 text-slate-600 border-slate-200 gap-1"
            >
              <Plus className="h-3 w-3" />
              Add medicine
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {(data.medicines?.length ?? 0) === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-md border bg-card/30 py-3 text-center text-muted-foreground">
            <Pill className="mb-1.5 h-6 w-6 opacity-50" />
            <p className="text-sm">No medicines added yet</p>
            <p className="text-xs mt-0.5">
              Use voice or click "Add medicine".
            </p>
          </div>
        ) : (
          <div className="w-full">
            <div className="w-full">
              {/* Header */}
              <div className="hidden lg:grid grid-cols-[40px_1.2fr_0.7fr_0.7fr_0.8fr_0.8fr_0.8fr_0.7fr_36px] items-center gap-2 rounded-md px-2 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
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
              <div className="space-y-4 lg:space-y-2 pt-1">
                {(data.medicines || []).map((m, index) => (
                  <div
                    key={m.id}
                    className="relative grid grid-cols-1 lg:grid-cols-[40px_1.2fr_0.7fr_0.7fr_0.8fr_0.8fr_0.8fr_0.7fr_36px] items-start gap-3 lg:gap-2 p-3 lg:p-0 lg:px-2 border lg:border-none border-slate-100 rounded-lg bg-slate-50/50 lg:bg-transparent"
                  >
                    {/* 1. Index (Desktop) */}
                    <div className="hidden lg:block pt-2 text-center text-[11px] font-medium text-slate-400">
                      {index + 1}
                    </div>

                    {/* Mobile Index (Hidden on Desktop) */}
                    <div className="lg:hidden flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-slate-700">Medicine #{index + 1}</span>
                    </div>

                    {/* 2. Medicine Name */}
                    <div className="flex flex-col gap-1 lg:block lg:gap-0">
                      <label className="lg:hidden text-[10px] uppercase text-slate-500 font-semibold">Medicine Name</label>
                      {wrapWithMic?.(
                        { mode: "FIELD", field: `medicines.${m.id}.medicineName` },
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
                          className={`bg-slate-50 border-slate-200 focus-visible:ring-sky-500 rounded-md ${
                            isHighlighted("medicines")
                              ? "ring-2 ring-sky-500 bg-sky-50 animate-pulse"
                              : ""
                          }`}
                        />
                      )}
                    </div>

                    {/* 3 & 4. Strength and Dose */}
                    <div className="grid grid-cols-2 gap-3 lg:contents">
                      <div className="flex flex-col gap-1 lg:block lg:gap-0">
                        <label className="lg:hidden text-[10px] uppercase text-slate-500 font-semibold">Strength</label>
                        {wrapWithMic?.(
                          { mode: "FIELD", field: `medicines.${m.id}.strength` },
                          <Input
                            value={getMedicineField(m, "strength")}
                            onChange={(e) =>
                              updateMedicine(m.id, "strength", e.target.value)
                            }
                            placeholder="e.g., 500mg"
                            className="h-8 text-xs bg-slate-50 border-slate-200 focus-visible:ring-sky-500"
                          />
                        )}
                      </div>

                      <div className="flex flex-col gap-1 lg:block lg:gap-0">
                        <label className="lg:hidden text-[10px] uppercase text-slate-500 font-semibold">Dose</label>
                        {wrapWithMic?.(
                          { mode: "FIELD", field: `medicines.${m.id}.dosage` },
                          <Input
                            value={getMedicineField(m, "dosage")}
                            onChange={(e) =>
                              updateMedicine(m.id, "dosage", e.target.value)
                            }
                            placeholder="e.g., 1 tab"
                            className="h-8 text-xs bg-slate-50 border-slate-200 focus-visible:ring-sky-500"
                          />
                        )}
                      </div>
                    </div>

                    {/* 5 & 6. Freq and Duration */}
                    <div className="grid grid-cols-2 gap-3 lg:contents">
                      <div className="flex flex-col gap-1 lg:block lg:gap-0">
                        <label className="lg:hidden text-[10px] uppercase text-slate-500 font-semibold">Freq</label>
                        {wrapWithMic?.(
                          { mode: "FIELD", field: `medicines.${m.id}.frequency` },
                          <Input
                            value={getMedicineField(m, "frequency")}
                            onChange={(e) =>
                              updateMedicine(m.id, "frequency", e.target.value)
                            }
                            placeholder="e.g., BD"
                            className="h-8 text-xs bg-slate-50 border-slate-200 focus-visible:ring-sky-500"
                          />
                        )}
                      </div>

                      <div className="flex flex-col gap-1 lg:block lg:gap-0">
                        <label className="lg:hidden text-[10px] uppercase text-slate-500 font-semibold">Duration</label>
                        {wrapWithMic?.(
                          { mode: "FIELD", field: `medicines.${m.id}.duration` },
                          <Input
                            value={getMedicineField(m, "duration")}
                            onChange={(e) =>
                              updateMedicine(m.id, "duration", e.target.value)
                            }
                            placeholder="e.g., 5 days"
                            className="h-8 text-xs bg-slate-50 border-slate-200 focus-visible:ring-sky-500"
                          />
                        )}
                      </div>
                    </div>

                    {/* 7 & 8. Instructions and Qty */}
                    <div className="grid grid-cols-2 gap-3 lg:contents">
                      <div className="flex flex-col gap-1 lg:block lg:gap-0">
                        <label className="lg:hidden text-[10px] uppercase text-slate-500 font-semibold">Instructions</label>
                        {wrapWithMic?.(
                          { mode: "FIELD", field: `medicines.${m.id}.instruction` },
                          <Input
                            value={getMedicineField(m, "instruction")}
                            onChange={(e) =>
                              updateMedicine(m.id, "instruction", e.target.value)
                            }
                            placeholder="e.g., after food"
                            className="h-8 text-xs bg-slate-50 border-slate-200 focus-visible:ring-sky-500"
                          />
                        )}
                      </div>

                      <div className="flex flex-col gap-1 lg:block lg:gap-0">
                        <label className="lg:hidden text-[10px] uppercase text-slate-500 font-semibold">Qty</label>
                        {wrapWithMic?.(
                          { mode: "FIELD", field: `medicines.${m.id}.quantity` },
                          <Input
                            value={getMedicineField(m, "quantity")}
                            onChange={(e) =>
                              updateMedicine(m.id, "quantity", e.target.value)
                            }
                            placeholder="e.g., 10"
                            className="h-8 text-xs bg-slate-50 border-slate-200 focus-visible:ring-sky-500"
                          />
                        )}
                      </div>
                    </div>

                    {/* 9. Trash Button */}
                    <div className="absolute top-2 right-2 lg:static lg:flex lg:justify-end lg:pt-1 z-10">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
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
