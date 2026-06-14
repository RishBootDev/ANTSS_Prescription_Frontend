"use client";

import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  MedicineMaster,
  MedicineMasterPayload,
  getMedicineActive,
  getMedicineId,
} from "@/src/services/medicine.service";

const DOSAGE_FORMS = [
  "Tablet",
  "Capsule",
  "Syrup",
  "Injection",
  "Cream",
  "Drops",
  "Ointment",
  "Gel",
  "Inhaler",
  "Powder",
  "Suspension",
  "Other",
];

type MedicineFormState = {
  medicineName: string;
  strength: string;
  dosageForm: string;
  defaultDosage: string;
  defaultFrequency: string;
  defaultDuration: string;
  defaultInstruction: string;
  manufacturer: string;
  active: boolean;
};

type Props = {
  initialMedicine?: MedicineMaster | null;
  defaultName?: string;
  saving?: boolean;
  submitLabel?: string;
  onSubmit: (payload: MedicineMasterPayload) => Promise<void> | void;
  onCancel?: () => void;
};

const emptyState = (defaultName = ""): MedicineFormState => ({
  medicineName: defaultName,
  strength: "",
  dosageForm: "Tablet",
  defaultDosage: "",
  defaultFrequency: "",
  defaultDuration: "",
  defaultInstruction: "",
  manufacturer: "",
  active: true,
});

export function buildMedicinePayload(
  state: MedicineFormState,
  initialMedicine?: MedicineMaster | null
): MedicineMasterPayload {
  const id = initialMedicine ? getMedicineId(initialMedicine) : undefined;

  return {
    id,
    medicineId: id,
    medicineName: state.medicineName.trim(),
    strength: state.strength.trim(),
    dosageForm: state.dosageForm,
    defaultDosage: state.defaultDosage.trim(),
    defaultFrequency: state.defaultFrequency.trim(),
    defaultDuration: state.defaultDuration.trim(),
    defaultInstruction: state.defaultInstruction.trim(),
    manufacturer: state.manufacturer.trim(),
    active: state.active,
    activeStatus: state.active,
  };
}

export default function MedicineMasterForm({
  initialMedicine,
  defaultName = "",
  saving = false,
  submitLabel = "Save medicine",
  onSubmit,
  onCancel,
}: Props) {
  const [form, setForm] = useState<MedicineFormState>(() => emptyState(defaultName));
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (initialMedicine) {
      setForm({
        medicineName: initialMedicine.medicineName || "",
        strength: initialMedicine.strength || "",
        dosageForm: initialMedicine.dosageForm || "Tablet",
        defaultDosage: initialMedicine.defaultDosage || "",
        defaultFrequency: initialMedicine.defaultFrequency || "",
        defaultDuration: initialMedicine.defaultDuration || "",
        defaultInstruction: initialMedicine.defaultInstruction || "",
        manufacturer: initialMedicine.manufacturer || "",
        active: getMedicineActive(initialMedicine),
      });
      return;
    }

    setForm(emptyState(defaultName));
  }, [defaultName, initialMedicine]);

  const updateField = <K extends keyof MedicineFormState>(
    field: K,
    value: MedicineFormState[K]
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (field === "medicineName") setNameError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.medicineName.trim()) {
      setNameError("Medicine name is required.");
      return;
    }

    await onSubmit(buildMedicinePayload(form, initialMedicine));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="medicineName">Medicine Name</Label>
          <Input
            id="medicineName"
            value={form.medicineName}
            onChange={(event) => updateField("medicineName", event.target.value)}
            aria-invalid={Boolean(nameError)}
            placeholder="e.g., Paracetamol"
          />
          {nameError ? <p className="text-xs text-destructive">{nameError}</p> : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="strength">Strength</Label>
          <Input
            id="strength"
            value={form.strength}
            onChange={(event) => updateField("strength", event.target.value)}
            placeholder="e.g., 650mg"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Dosage Form</Label>
          <Select
            value={form.dosageForm}
            onValueChange={(value) => updateField("dosageForm", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select form" />
            </SelectTrigger>
            <SelectContent>
              {DOSAGE_FORMS.map((formName) => (
                <SelectItem key={formName} value={formName}>
                  {formName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="defaultDosage">Default Dosage</Label>
          <Input
            id="defaultDosage"
            value={form.defaultDosage}
            onChange={(event) => updateField("defaultDosage", event.target.value)}
            placeholder="e.g., 1 tablet"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="defaultFrequency">Default Frequency</Label>
          <Input
            id="defaultFrequency"
            value={form.defaultFrequency}
            onChange={(event) => updateField("defaultFrequency", event.target.value)}
            placeholder="e.g., BD"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="defaultDuration">Default Duration</Label>
          <Input
            id="defaultDuration"
            value={form.defaultDuration}
            onChange={(event) => updateField("defaultDuration", event.target.value)}
            placeholder="e.g., 5 days"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="defaultInstruction">Default Instruction</Label>
          <Input
            id="defaultInstruction"
            value={form.defaultInstruction}
            onChange={(event) => updateField("defaultInstruction", event.target.value)}
            placeholder="e.g., after food"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="manufacturer">Manufacturer</Label>
          <Input
            id="manufacturer"
            value={form.manufacturer}
            onChange={(event) => updateField("manufacturer", event.target.value)}
            placeholder="Manufacturer"
          />
        </div>

        <div className="flex items-center justify-between rounded-md border px-3 py-2">
          <Label htmlFor="activeStatus" className="text-sm">
            Active Status
          </Label>
          <Switch
            id="activeStatus"
            checked={form.active}
            onCheckedChange={(checked) => updateField("active", checked)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
