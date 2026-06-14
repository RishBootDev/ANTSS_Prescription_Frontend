"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Loader2,
  Pill,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  MedicineMaster,
  MedicineMasterPayload,
  getMedicineActive,
  getMedicineId,
  medicineService,
} from "@/src/services/medicine.service";
import MedicineMasterForm from "../components/MedicineMasterForm";

export default function MedicineMasterPage() {
  const { toast } = useToast();
  const [medicines, setMedicines] = useState<MedicineMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<MedicineMaster | null>(null);

  const filteredMedicines = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return medicines;

    return medicines.filter((medicine) =>
      [
        medicine.medicineName,
        medicine.strength,
        medicine.dosageForm,
        medicine.defaultDosage,
        medicine.defaultFrequency,
        medicine.manufacturer,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(keyword))
    );
  }, [medicines, searchText]);

  const loadMedicines = async () => {
    setLoading(true);
    try {
      const list = await medicineService.getMedicines();
      setMedicines(list);
    } catch (error: any) {
      toast({
        title: "Unable to load medicines",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  const openCreateDialog = () => {
    setEditingMedicine(null);
    setDialogOpen(true);
  };

  const openEditDialog = (medicine: MedicineMaster) => {
    setEditingMedicine(medicine);
    setDialogOpen(true);
  };

  const handleSubmit = async (payload: MedicineMasterPayload) => {
    setSaving(true);
    try {
      await medicineService.saveMedicine(payload);
      toast({
        title: editingMedicine ? "Medicine updated successfully." : "Medicine added successfully.",
      });
      setDialogOpen(false);
      setEditingMedicine(null);
      await loadMedicines();
    } catch (error: any) {
      toast({
        title: "Unable to save medicine",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (medicine: MedicineMaster) => {
    const id = getMedicineId(medicine);
    if (!id) {
      toast({
        title: "Unable to delete medicine",
        description: "Medicine id was not returned by the server.",
        variant: "destructive",
      });
      return;
    }

    const confirmed = window.confirm(`Delete ${medicine.medicineName}?`);
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await medicineService.deleteMedicine(id);
      toast({ title: "Medicine deleted successfully." });
      setMedicines((current) => current.filter((item) => getMedicineId(item) !== id));
    } catch (error: any) {
      toast({
        title: "Unable to delete medicine",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/70">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Pill className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Medicine Master</h1>
              <p className="text-xs text-muted-foreground">Reusable defaults for prescriptions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="gap-1">
              <Link href="/doctor">
                <ArrowLeft className="h-3.5 w-3.5" />
                Dashboard
              </Link>
            </Button>
            <Button size="sm" className="gap-1" onClick={openCreateDialog}>
              <Plus className="h-3.5 w-3.5" />
              Add Medicine
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-5 px-4 py-6 lg:px-6">
        <Card>
          <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">Medicine List</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Add, edit, delete, and keep defaults ready for prescription entry.
              </p>
            </div>
            <div className="flex w-full gap-2 sm:w-auto">
              <div className="relative min-w-0 flex-1 sm:w-80">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Search medicines"
                  className="pl-8"
                />
              </div>
              <Button variant="outline" size="icon" onClick={loadMedicines} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="sr-only">Refresh</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading medicines...
              </div>
            ) : filteredMedicines.length === 0 ? (
              <div className="rounded-md border border-dashed py-12 text-center">
                <Pill className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">No medicines found.</p>
                <Button className="mt-4 gap-1" size="sm" onClick={openCreateDialog}>
                  <Plus className="h-3.5 w-3.5" />
                  Add Medicine
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine</TableHead>
                    <TableHead>Defaults</TableHead>
                    <TableHead>Manufacturer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMedicines.map((medicine, index) => {
                    const id = getMedicineId(medicine) ?? index;
                    return (
                      <TableRow key={String(id)}>
                        <TableCell>
                          <div className="font-medium">{medicine.medicineName}</div>
                          <div className="text-xs text-muted-foreground">
                            {[medicine.strength, medicine.dosageForm].filter(Boolean).join(" • ") || "No strength/form"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {[medicine.defaultDosage, medicine.defaultFrequency, medicine.defaultDuration]
                              .filter(Boolean)
                              .join(" • ") || "-"}
                          </div>
                          {medicine.defaultInstruction ? (
                            <div className="text-xs text-muted-foreground">{medicine.defaultInstruction}</div>
                          ) : null}
                        </TableCell>
                        <TableCell>{medicine.manufacturer || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={getMedicineActive(medicine) ? "default" : "secondary"}>
                            {getMedicineActive(medicine) ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(medicine)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={deletingId === id}
                              onClick={() => handleDelete(medicine)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              {deletingId === id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingMedicine ? "Edit Medicine" : "Add Medicine"}</DialogTitle>
            <DialogDescription>
              Medicine name is required. Defaults are used only to auto-fill prescriptions.
            </DialogDescription>
          </DialogHeader>
          <MedicineMasterForm
            initialMedicine={editingMedicine}
            saving={saving}
            submitLabel={editingMedicine ? "Update medicine" : "Add medicine"}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
