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
  genericName: string;
  strength: string;
  dosageForm: string;
  dosage: string;
  instructions: string;
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
  genericName: "",
  strength: "",
  dosageForm: "Tablet",
  dosage: "",
  instructions: "",
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
    genericName: state.genericName.trim(),
    strength: state.strength.trim(),
    dosageForm: state.dosageForm,
    dosage: state.dosage.trim(),
    instructions: state.instructions.trim(),
    manufacturer: state.manufacturer.trim(),
    active: state.active,
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
  const [form, setForm] = useState<MedicineFormState>(() =>
    emptyState(defaultName)
  );

  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (initialMedicine) {
      setForm({
        medicineName: initialMedicine.medicineName || "",
        genericName: initialMedicine.genericName || "",
        strength: initialMedicine.strength || "",
        dosageForm: initialMedicine.dosageForm || "Tablet",
        dosage: initialMedicine.dosage || "",
        instructions: initialMedicine.instructions || "",
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
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (field === "medicineName") {
      setNameError("");
    }
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
            onChange={(event) =>
              updateField("medicineName", event.target.value)
            }
            aria-invalid={Boolean(nameError)}
            placeholder="e.g., Paracetamol"
          />
          {nameError ? (
            <p className="text-xs text-destructive">{nameError}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="genericName">Generic Name</Label>
          <Input
            id="genericName"
            value={form.genericName}
            onChange={(event) =>
              updateField("genericName", event.target.value)
            }
            placeholder="e.g., Acetaminophen"
          />
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
          <Label htmlFor="dosage">Dosage</Label>
          <Input
            id="dosage"
            value={form.dosage}
            onChange={(event) => updateField("dosage", event.target.value)}
            placeholder="e.g., 1 tablet"
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <Label htmlFor="instructions">Instructions</Label>
          <Input
            id="instructions"
            value={form.instructions}
            onChange={(event) =>
              updateField("instructions", event.target.value)
            }
            placeholder="e.g., after food"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="manufacturer">Manufacturer</Label>
          <Input
            id="manufacturer"
            value={form.manufacturer}
            onChange={(event) =>
              updateField("manufacturer", event.target.value)
            }
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
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={saving}
          >
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