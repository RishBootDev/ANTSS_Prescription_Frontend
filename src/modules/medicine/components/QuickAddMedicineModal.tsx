"use client";

import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  MedicineMaster,
  MedicineMasterPayload,
  medicineService,
} from "@/src/services/medicine.service";
import MedicineMasterForm from "./MedicineMasterForm";

type Props = {
  open: boolean;
  medicineName: string;
  onOpenChange: (open: boolean) => void;
  onCreated: (medicine: MedicineMaster) => void;
};

export default function QuickAddMedicineModal({
  open,
  medicineName,
  onOpenChange,
  onCreated,
}: Props) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) setSaving(false);
  }, [open]);

  const handleSubmit = async (payload: MedicineMasterPayload) => {
    setSaving(true);
    try {
      const created = await medicineService.createMedicine(payload);
      toast({ title: "Medicine added successfully." });
      onCreated(created);
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Unable to add medicine",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Medicine</DialogTitle>
          <DialogDescription>
            Save this medicine to the master list and use it in the prescription.
          </DialogDescription>
        </DialogHeader>

        <MedicineMasterForm
          defaultName={medicineName}
          saving={saving}
          submitLabel="Add medicine"
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
