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
import {
  Database,
  Pill,
  Plus,
  Trash2,
  Tablets,
  ClipboardPlus,
} from "lucide-react";
import { PatientData, MedicineEntry } from "../patient-form-fields/types";
import { VoiceContext } from "@/hooks/useConsultationVoice";
import MedicineAutocomplete from "@/src/modules/medicine/components/MedicineAutocomplete";
import { MedicineMaster } from "@/src/services/medicine.service";

const getMedicineField = (
  medicine: MedicineEntry,
  field: keyof Omit<MedicineEntry, "id">
) => {
  const legacyMedicine = medicine as MedicineEntry & {
    name?: string;
    dose?: string;
    instructions?: string;
  };

  if (field === "medicineName")
    return medicine.medicineName ?? legacyMedicine.name ?? "";

  if (field === "dosage")
    return medicine.dosage ?? legacyMedicine.dose ?? "";

  if (field === "instruction")
    return medicine.instruction ?? legacyMedicine.instructions ?? "";

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
  const medicines = data.medicines || [];

  const renderWithMic = (
    context: VoiceContext,
    element: ReactElement<{ className?: string }>
  ) => {
    return wrapWithMic ? wrapWithMic(context, element) : element;
  };

  const handleSelectMedicine = (rowId: string, medicine: MedicineMaster) => {
    if (applyMedicineMaster) {
      applyMedicineMaster(rowId, medicine);
      return;
    }

    updateMedicine(rowId, "medicineName", medicine.medicineName || "");
    updateMedicine(rowId, "strength", medicine.strength || "");
    updateMedicine(rowId, "dosage", medicine.dosage || "");
    updateMedicine(rowId, "instruction", medicine.instructions || "");
  };

  const commonInputClass = (field: string) =>
    `h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 shadow-none
     placeholder:text-slate-400 transition-all
     hover:border-blue-300 focus-visible:border-blue-500 focus-visible:bg-white
     focus-visible:ring-2 focus-visible:ring-blue-100 ${inputClass(field)}`;

  return (
    <Card className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-white px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-800">
            {renderWithMic(
              { mode: "COMPONENT", component: "Medicines" },
              <div className="flex cursor-pointer items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
                  <Pill className="h-4.5 w-4.5" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    Prescribed Medicines
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600">
                      Rx
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] font-medium normal-case tracking-normal text-slate-400">
                    Medicines, dose, frequency, duration and instructions
                  </p>
                </div>
              </div>
            )}
          </CardTitle>

          <div className="flex items-center gap-2">
            <Button
              asChild
              type="button"
              size="sm"
              variant="outline"
              className="h-8 rounded-xl border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              <Link href="/medicine-master">
                <Database className="mr-1 h-3.5 w-3.5" />
                Master
              </Link>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={addMedicine}
              className="h-8 rounded-xl bg-blue-600 px-3 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="bg-gradient-to-b from-indigo-50/35 to-white p-4">
        {medicines.length === 0 ? (
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-indigo-200 bg-white px-4 py-8 text-center shadow-sm">
            <div>
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Tablets className="h-6 w-6" />
              </div>

              <p className="text-sm font-bold text-slate-800">
                No medicines added
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Use voice or click Add to prescribe medicine.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {medicines.map((m, index) => (
              <div
                key={m.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-indigo-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50/50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-xs font-bold text-indigo-600 ring-1 ring-indigo-100">
                      {index + 1}
                    </span>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-700">
                        Medicine Details
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Search from master or enter manually
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-9 w-9 rounded-xl p-0 text-slate-400 hover:bg-red-50 hover:text-red-500"
                    onClick={() => removeMedicine(m.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-12">
                  <div className="lg:col-span-4">
                    <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Medicine Name
                    </label>

                    {renderWithMic(
                      {
                        mode: "FIELD",
                        field: `medicines.${m.id}.medicineName`,
                      },
                      <MedicineAutocomplete
                        value={getMedicineField(m, "medicineName")}
                        onChange={(value) =>
                          updateMedicine(m.id, "medicineName", value)
                        }
                        onSelectMedicine={(medicine) =>
                          handleSelectMedicine(m.id, medicine)
                        }
                        placeholder="Search medicine"
                        className={`h-10 rounded-xl border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-100 ${
                          isHighlighted("medicines")
                            ? "animate-pulse bg-blue-50 ring-2 ring-blue-200"
                            : ""
                        }`}
                      />
                    )}
                  </div>

                  <div className="lg:col-span-2">
                    <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Strength
                    </label>

                    {renderWithMic(
                      { mode: "FIELD", field: `medicines.${m.id}.strength` },
                      <Input
                        value={getMedicineField(m, "strength")}
                        onChange={(e) =>
                          updateMedicine(m.id, "strength", e.target.value)
                        }
                        placeholder="500mg"
                        className={commonInputClass("medicines")}
                      />
                    )}
                  </div>

                  <div className="lg:col-span-2">
                    <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Dose
                    </label>

                    {renderWithMic(
                      { mode: "FIELD", field: `medicines.${m.id}.dosage` },
                      <Input
                        value={getMedicineField(m, "dosage")}
                        onChange={(e) =>
                          updateMedicine(m.id, "dosage", e.target.value)
                        }
                        placeholder="1 tab"
                        className={commonInputClass("medicines")}
                      />
                    )}
                  </div>

                  <div className="lg:col-span-2">
                    <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Frequency
                    </label>

                    {renderWithMic(
                      { mode: "FIELD", field: `medicines.${m.id}.frequency` },
                      <Input
                        value={getMedicineField(m, "frequency")}
                        onChange={(e) =>
                          updateMedicine(m.id, "frequency", e.target.value)
                        }
                        placeholder="BD"
                        className={commonInputClass("medicines")}
                      />
                    )}
                  </div>

                  <div className="lg:col-span-2">
                    <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Duration
                    </label>

                    {renderWithMic(
                      { mode: "FIELD", field: `medicines.${m.id}.duration` },
                      <Input
                        value={getMedicineField(m, "duration")}
                        onChange={(e) =>
                          updateMedicine(m.id, "duration", e.target.value)
                        }
                        placeholder="5 days"
                        className={commonInputClass("medicines")}
                      />
                    )}
                  </div>

                  <div className="lg:col-span-10">
                    <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Instructions
                    </label>

                    {renderWithMic(
                      {
                        mode: "FIELD",
                        field: `medicines.${m.id}.instruction`,
                      },
                      <Input
                        value={getMedicineField(m, "instruction")}
                        onChange={(e) =>
                          updateMedicine(m.id, "instruction", e.target.value)
                        }
                        placeholder="After food / before food / bedtime"
                        className={commonInputClass("medicines")}
                      />
                    )}
                  </div>

                  <div className="lg:col-span-2">
                    <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Quantity
                    </label>

                    {renderWithMic(
                      { mode: "FIELD", field: `medicines.${m.id}.quantity` },
                      <Input
                        value={getMedicineField(m, "quantity")}
                        onChange={(e) =>
                          updateMedicine(m.id, "quantity", e.target.value)
                        }
                        placeholder="10"
                        className={commonInputClass("medicines")}
                      />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-2 text-[11px] font-medium text-slate-500">
                  <ClipboardPlus className="h-3.5 w-3.5 text-indigo-500" />
                  Prescription row #{index + 1}
                </div>
              </div>
            ))}
            <div className="sticky bottom-3 z-10 pt-1">
  <Button
    type="button"
    onClick={addMedicine}
    className="h-11 w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-sm font-bold text-white shadow-lg hover:from-indigo-700 hover:to-blue-700"
  >
    <Plus className="mr-2 h-4 w-4" />
    Add Another Medicine
  </Button>
</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}