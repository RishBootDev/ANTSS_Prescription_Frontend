"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import {
  ArrowLeft,
  CheckCircle2,
  Edit,
  FileSpreadsheet,
  Languages,
  Loader2,
  Pill,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  XCircle,
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

type InstructionLanguage = "hindi" | "english" | "maithili" | "bhojpuri";
type TimeSlot = "morning" | "afternoon" | "night";

type ImportMedicineRow = MedicineMasterPayload & {
  rowNo: number;
  status: "extracted" | "importing" | "success" | "failed";
  error?: string;
};

const timeLabels: Record<InstructionLanguage, Record<TimeSlot, string>> = {
  hindi: { morning: "सुबह", afternoon: "दोपहर", night: "रात" },
  english: { morning: "morning", afternoon: "afternoon", night: "night" },
  maithili: { morning: "भोर", afternoon: "दुपहर", night: "राति" },
  bhojpuri: { morning: "भिनसारे", afternoon: "दुपहरिया", night: "रात" },
};

const sentenceTemplates: Record<
  InstructionLanguage,
  {
    halfWord: string;
    doseNoun: (n: number) => string;
    suffixAfterTime: string;
    joiner: string;
    build: (parts: string) => string;
  }
> = {
  hindi: {
    halfWord: "आधा",
    doseNoun: () => "खुराक",
    suffixAfterTime: " में",
    joiner: " और ",
    build: (parts) => `${parts} लें`,
  },
  english: {
    halfWord: "half",
    doseNoun: (n) => (n === 1 ? "dose" : "doses"),
    suffixAfterTime: "",
    joiner: " and ",
    build: (parts) => `Take ${parts}`,
  },
  maithili: {
    halfWord: "आध",
    doseNoun: () => "खुराक",
    suffixAfterTime: " मे",
    joiner: " आ ",
    build: (parts) => `${parts} लिय`,
  },
  bhojpuri: {
    halfWord: "आधा",
    doseNoun: () => "खुराक",
    suffixAfterTime: " में",
    joiner: " आ ",
    build: (parts) => `${parts} लीं`,
  },
};

function parseDoseToken(token: string): number {
  const t = token.trim();
  if (!t) return 0;

  if (t.includes("/")) {
    const [numRaw, denRaw] = t.split("/");
    const num = parseFloat(numRaw);
    const den = parseFloat(denRaw);

    if (!num || !den) return 0;
    return num / den;
  }

  const n = parseFloat(t);
  return Number.isNaN(n) ? 0 : n;
}

function formatDoseCount(n: number, language: InstructionLanguage): string {
  const tpl = sentenceTemplates[language];

  if (n === 0.5) return `${tpl.halfWord} ${tpl.doseNoun(n)}`;
  if (Number.isInteger(n)) return `${n} ${tpl.doseNoun(n)}`;

  return `${n} ${tpl.doseNoun(n)}`;
}

function getInstruction(dosage: string, language: InstructionLanguage): string {
  const slots: TimeSlot[] = ["morning", "afternoon", "night"];
  const tokens = dosage.trim().split("-");

  if (tokens.length !== 3) return "";

  const labels = timeLabels[language];
  const tpl = sentenceTemplates[language];

  const pieces = slots
    .map((slot, index) => {
      const value = parseDoseToken(tokens[index]);
      if (!value) return null;

      return `${labels[slot]}${tpl.suffixAfterTime} ${formatDoseCount(
        value,
        language
      )}`;
    })
    .filter(Boolean) as string[];

  if (pieces.length === 0) return "";

  return tpl.build(pieces.join(tpl.joiner));
}

const dosagePresets: { value: string; label: string }[] = [
  { value: "1-0-1", label: "1-0-1 (Morning & Night)" },
  { value: "1-1-1", label: "1-1-1 (Morning, Afternoon & Night)" },
  { value: "1-0-0", label: "1-0-0 (Morning only)" },
  { value: "0-1-0", label: "0-1-0 (Afternoon only)" },
  { value: "0-0-1", label: "0-0-1 (Night only)" },
  { value: "1/2-0-1/2", label: "1/2-0-1/2 (Half Morning & Half Night)" },
  { value: "1/2-0-0", label: "1/2-0-0 (Half Morning only)" },
  { value: "0-0-1/2", label: "0-0-1/2 (Half Night only)" },
  { value: "1-0-1/2", label: "1-0-1/2 (Full Morning, Half Night)" },
  { value: "1/2-1/2-1/2", label: "1/2-1/2-1/2 (Half thrice a day)" },
  { value: "2-0-2", label: "2-0-2 (2 Morning & 2 Night)" },
  { value: "2-2-2", label: "2-2-2 (2 thrice a day)" },
  { value: "custom", label: "Custom (type manually)" },
];

function getExcelValue(row: any, keys: string[]) {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null) {
      return String(row[key]).trim();
    }
  }

  return "";
}

function MedicineMasterForm({
  initialMedicine,
  saving,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initialMedicine: MedicineMaster | null;
  saving: boolean;
  submitLabel: string;
  onSubmit: (payload: MedicineMasterPayload) => void;
  onCancel: () => void;
}) {
  const [language, setLanguage] = useState<InstructionLanguage>("hindi");
  const [dosageMode, setDosageMode] = useState<"preset" | "custom">("preset");

  const [form, setForm] = useState<any>({
    id: "",
    medicineName: "",
    genericName: "",
    strength: "",
    dosageForm: "",
    dosage: "",
    instructions: "",
    manufacturer: "",
    active: true,
  });

  useEffect(() => {
    if (initialMedicine) {
      const dosageValue = initialMedicine.dosage || "";
      const isKnownPreset = dosagePresets.some(
        (preset) => preset.value === dosageValue && preset.value !== "custom"
      );

      setForm({
        ...initialMedicine,
        id: getMedicineId(initialMedicine) || "",
        medicineName: initialMedicine.medicineName || "",
        genericName: initialMedicine.genericName || "",
        strength: initialMedicine.strength || "",
        dosageForm: initialMedicine.dosageForm || "",
        dosage: dosageValue,
        instructions: initialMedicine.instructions || "",
        manufacturer: initialMedicine.manufacturer || "",
        active: getMedicineActive(initialMedicine),
      });

      setDosageMode(isKnownPreset || !dosageValue ? "preset" : "custom");
    } else {
      setForm({
        id: "",
        medicineName: "",
        genericName: "",
        strength: "",
        dosageForm: "",
        dosage: "",
        instructions: "",
        manufacturer: "",
        active: true,
      });

      setLanguage("hindi");
      setDosageMode("preset");
    }
  }, [initialMedicine]);

  const updateField = (field: string, value: any) => {
    setForm((current: any) => ({
      ...current,
      [field]: value,
    }));
  };

  const applyDosage = (value: string, lang: InstructionLanguage) => {
    const autoInstruction = getInstruction(value, lang);

    setForm((current: any) => ({
      ...current,
      dosage: value,
      instructions: autoInstruction || current.instructions,
    }));
  };

  const handlePresetSelect = (value: string) => {
    if (value === "custom") {
      setDosageMode("custom");
      applyDosage("", language);
      return;
    }

    setDosageMode("preset");
    applyDosage(value, language);
  };

  const handleCustomDosageChange = (value: string) => {
    applyDosage(value, language);
  };

  const handleLanguageChange = (selectedLanguage: InstructionLanguage) => {
    setLanguage(selectedLanguage);

    const autoInstruction = getInstruction(form.dosage || "", selectedLanguage);

    if (autoInstruction) {
      updateField("instructions", autoInstruction);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    onSubmit({
      ...form,
      active: Boolean(form.active),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-3">
        <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-700">
          <Languages className="h-4 w-4 text-blue-600" />
          Instruction Language
        </div>

        <div className="flex flex-wrap gap-2">
          {(["hindi", "english", "maithili", "bhojpuri"] as const).map(
            (item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleLanguageChange(item)}
                className={`rounded-full border px-4 py-1.5 text-xs font-bold transition ${
                  language === item
                    ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                }`}
              >
                {item === "hindi"
                  ? "हिंदी"
                  : item === "english"
                  ? "English"
                  : item === "maithili"
                  ? "मैथिली"
                  : "भोजपुरी"}
              </button>
            )
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Medicine Name *</Label>
          <Input
            value={form.medicineName}
            onChange={(e) => updateField("medicineName", e.target.value)}
            placeholder="Paracetamol"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label>Generic Name</Label>
          <Input
            value={form.genericName}
            onChange={(e) => updateField("genericName", e.target.value)}
            placeholder="Acetaminophen"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Strength</Label>
          <Input
            value={form.strength}
            onChange={(e) => updateField("strength", e.target.value)}
            placeholder="500mg"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Dosage Form</Label>
          <Input
            value={form.dosageForm}
            onChange={(e) => updateField("dosageForm", e.target.value)}
            placeholder="Tablet / Syrup / Injection"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Dosage</Label>
          <Select
            value={dosageMode === "custom" ? "custom" : form.dosage || undefined}
            onValueChange={handlePresetSelect}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select dosage pattern" />
            </SelectTrigger>

            <SelectContent>
              {dosagePresets.map((preset) => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {dosageMode === "custom" && (
            <Input
              value={form.dosage}
              onChange={(e) => handleCustomDosageChange(e.target.value)}
              placeholder="e.g. 1/2-1-1/2"
              className="mt-2 font-semibold"
            />
          )}

          <p className="text-[11px] text-muted-foreground">
            Format: morning-afternoon-night. Use 1/2 for half dose, e.g.
            1/2-0-1/2
          </p>
        </div>

        <div className="space-y-1.5">
          <Label>Manufacturer</Label>
          <Input
            value={form.manufacturer}
            onChange={(e) => updateField("manufacturer", e.target.value)}
            placeholder="Company name"
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label>Instructions</Label>
          <Input
            value={form.instructions}
            onChange={(e) => updateField("instructions", e.target.value)}
            placeholder="Auto-filled according to dosage and language"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>

        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

export default function MedicineMasterPage() {
  const { toast } = useToast();

  const [medicines, setMedicines] = useState<MedicineMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] =
    useState<MedicineMaster | null>(null);

  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importRows, setImportRows] = useState<ImportMedicineRow[]>([]);
  const [importing, setImporting] = useState(false);

  const filteredMedicines = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    if (!keyword) return medicines;

    return medicines.filter((medicine) =>
      [
        medicine.medicineName,
        medicine.genericName,
        medicine.strength,
        medicine.dosageForm,
        medicine.dosage,
        medicine.instructions,
        medicine.manufacturer,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(keyword))
    );
  }, [medicines, searchText]);

  const importSummary = useMemo(() => {
    return {
      total: importRows.length,
      extracted: importRows.filter((row) => row.status === "extracted").length,
      importing: importRows.filter((row) => row.status === "importing").length,
      success: importRows.filter((row) => row.status === "success").length,
      failed: importRows.filter((row) => row.status === "failed").length,
    };
  }, [importRows]);

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

    const handleRouteChange = (event: any) => {
      if (event.detail === "/medicine-master") {
        loadMedicines();
      }
    };

    window.addEventListener("app-route-change", handleRouteChange);

    return () => {
      window.removeEventListener("app-route-change", handleRouteChange);
    };
  }, []);

  const openCreateDialog = () => {
    setEditingMedicine(null);
    setDialogOpen(true);
  };

  const openEditDialog = (medicine: MedicineMaster) => {
    setEditingMedicine(medicine);
    setDialogOpen(true);
  };

  const openImportDialog = () => {
    setImportRows([]);
    setImportDialogOpen(true);
  };

  const handleSubmit = async (payload: MedicineMasterPayload) => {
    setSaving(true);

    try {
      await medicineService.saveMedicine(payload);

      toast({
        title: editingMedicine
          ? "Medicine updated successfully."
          : "Medicine added successfully.",
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

      toast({
        title: "Medicine deleted successfully.",
      });

      setMedicines((current) =>
        current.filter((item) => getMedicineId(item) !== id)
      );
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

  const handleExcelUpload = async (file: File) => {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];

      if (!sheetName) {
        toast({
          title: "Invalid Excel file",
          description: "No sheet found in the uploaded file.",
          variant: "destructive",
        });
        return;
      }

      const sheet = workbook.Sheets[sheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, {
        defval: "",
      });

      const mappedRows: ImportMedicineRow[] = rows
        .map((row, index) => {
          const dosage = getExcelValue(row, [
            "Dosage",
            "dosage",
            "Dose",
            "dose",
          ]);

          const instructions =
            getExcelValue(row, [
              "Instructions",
              "Instruction",
              "instructions",
              "instruction",
            ]) || getInstruction(dosage, "hindi");

         return {
  rowNo: index + 2,
  medicineName: getExcelValue(row, [
    "Medicine Name",
    "medicineName",
    "Medicine",
    "medicine",
    "Name",
    "name",
  ]),
  genericName: getExcelValue(row, [
    "Generic Name",
    "genericName",
    "Generic",
    "generic",
  ]),
  strength: getExcelValue(row, [
    "Strength",
    "strength",
    "Power",
    "power",
  ]),
  dosageForm: getExcelValue(row, [
    "Dosage Form",
    "dosageForm",
    "Form",
    "form",
    "Type",
    "type",
  ]),
  dosage,
  instructions,
  manufacturer: getExcelValue(row, [
    "Manufacturer",
    "manufacturer",
    "Company",
    "company",
  ]),
  active: true,
  status: "extracted" as const,
};
        })
        .filter((row) => row.medicineName);

      setImportRows(mappedRows);

      toast({
        title: `${mappedRows.length} medicines extracted from Excel.`,
      });
    } catch (error: any) {
      toast({
        title: "Unable to read Excel file",
        description: error?.message || "Please upload a valid Excel file.",
        variant: "destructive",
      });
    }
  };

  const importExcelMedicines = async () => {
    if (importRows.length === 0) return;

    setImporting(true);

    for (const row of importRows) {
      if (row.status === "success") continue;

      setImportRows((current) =>
        current.map((item) =>
          item.rowNo === row.rowNo
            ? { ...item, status: "importing", error: undefined }
            : item
        )
      );

      try {
        const { rowNo, status, error, ...payload } = row;

        await medicineService.saveMedicine({
          ...payload,
          active: true,
        });

        setImportRows((current) =>
          current.map((item) =>
            item.rowNo === row.rowNo
              ? { ...item, status: "success", error: undefined }
              : item
          )
        );
      } catch (error: any) {
        setImportRows((current) =>
          current.map((item) =>
            item.rowNo === row.rowNo
              ? {
                  ...item,
                  status: "failed",
                  error: error?.message || "Failed to import medicine",
                }
              : item
          )
        );
      }
    }

    setImporting(false);
    await loadMedicines();

    toast({
      title: "Excel import completed.",
    });
  };

  const downloadSampleExcel = () => {
    const sampleData = [
      {
        "Medicine Name": "Dolo 650",
        "Generic Name": "Paracetamol",
        Strength: "650mg",
        "Dosage Form": "Tablet",
        Dosage: "1-0-1",
        Instructions: "सुबह में 1 खुराक और रात में 1 खुराक लें",
        Manufacturer: "Micro Labs",
      },
      {
        "Medicine Name": "Pantocid 40",
        "Generic Name": "Pantoprazole",
        Strength: "40mg",
        "Dosage Form": "Tablet",
        Dosage: "1-0-0",
        Instructions: "सुबह में 1 खुराक लें",
        Manufacturer: "Sun Pharma",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Medicines");
    XLSX.writeFile(workbook, "medicine-master-sample.xlsx");
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
              <p className="text-xs text-muted-foreground">
                Reusable medicine data for prescriptions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="gap-1">
              <Link href="/patients">
                <ArrowLeft className="h-3.5 w-3.5" />
                Patients
              </Link>
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={openImportDialog}
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              Import Excel
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
                Add, edit, delete, import, and manage medicine master records.
              </p>
            </div>

            <div className="flex w-full gap-2 sm:w-auto">
              <div className="relative min-w-0 flex-1 sm:w-80">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  placeholder="Search medicine, generic, strength"
                  className="pl-8"
                />
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={loadMedicines}
                disabled={loading}
              >
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

                <div className="mt-4 flex justify-center gap-2">
                  <Button
                    className="gap-1"
                    size="sm"
                    variant="outline"
                    onClick={openImportDialog}
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    Import Excel
                  </Button>

                  <Button
                    className="gap-1"
                    size="sm"
                    onClick={openCreateDialog}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Medicine
                  </Button>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine</TableHead>
                    <TableHead>Generic</TableHead>
                    <TableHead>Dosage</TableHead>
                    <TableHead>Instructions</TableHead>
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
                          <div className="font-medium">
                            {medicine.medicineName}
                          </div>

                          <div className="text-xs text-muted-foreground">
                            {[medicine.strength, medicine.dosageForm]
                              .filter(Boolean)
                              .join(" • ") || "No strength/form"}
                          </div>
                        </TableCell>

                        <TableCell>{medicine.genericName || "-"}</TableCell>

                        <TableCell>
                          <div className="text-sm">
                            {medicine.dosage || "-"}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="max-w-xs truncate text-sm">
                            {medicine.instructions || "-"}
                          </div>
                        </TableCell>

                        <TableCell>{medicine.manufacturer || "-"}</TableCell>

                        <TableCell>
                          <Badge
                            variant={
                              getMedicineActive(medicine)
                                ? "default"
                                : "secondary"
                            }
                          >
                            {getMedicineActive(medicine)
                              ? "Active"
                              : "Inactive"}
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
            <DialogTitle>
              {editingMedicine ? "Edit Medicine" : "Add Medicine"}
            </DialogTitle>

            <DialogDescription>
              Select language, pick a dosage pattern or type a custom one, and
              instructions will auto-fill.
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

      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-6xl">
          <DialogHeader>
            <DialogTitle>Import Medicines from Excel</DialogTitle>

            <DialogDescription>
              Upload an Excel sheet, preview extracted medicines, then import
              them one by one with live status.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="rounded-2xl border border-dashed bg-muted/30 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                    <Upload className="h-5 w-5 text-primary" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      Upload Excel / CSV file
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Required column: Medicine Name. Optional: Generic Name,
                      Strength, Dosage Form, Dosage, Instructions,
                      Manufacturer.
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={downloadSampleExcel}
                >
                  Download Sample Excel
                </Button>
              </div>

              <Input
                type="file"
                accept=".xlsx,.xls,.csv"
                disabled={importing}
                className="mt-4"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) handleExcelUpload(file);
                }}
              />
            </div>

            {importRows.length > 0 && (
              <>
                <div className="grid gap-3 sm:grid-cols-5">
                  <div className="rounded-xl border p-3">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-xl font-bold">{importSummary.total}</p>
                  </div>

                  <div className="rounded-xl border p-3">
                    <p className="text-xs text-muted-foreground">Extracted</p>
                    <p className="text-xl font-bold">
                      {importSummary.extracted}
                    </p>
                  </div>

                  <div className="rounded-xl border p-3">
                    <p className="text-xs text-muted-foreground">Adding</p>
                    <p className="text-xl font-bold">
                      {importSummary.importing}
                    </p>
                  </div>

                  <div className="rounded-xl border p-3">
                    <p className="text-xs text-muted-foreground">Added</p>
                    <p className="text-xl font-bold text-green-600">
                      {importSummary.success}
                    </p>
                  </div>

                  <div className="rounded-xl border p-3">
                    <p className="text-xs text-muted-foreground">Failed</p>
                    <p className="text-xl font-bold text-red-600">
                      {importSummary.failed}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">
                      Extracted Medicine Preview
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Each row will visually change from Extracted → Adding →
                      Added / Failed.
                    </p>
                  </div>

                  <Button onClick={importExcelMedicines} disabled={importing}>
                    {importing && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Import Medicines
                  </Button>
                </div>

                <div className="max-h-[420px] overflow-auto rounded-xl border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Row</TableHead>
                        <TableHead>Medicine</TableHead>
                        <TableHead>Generic</TableHead>
                        <TableHead>Strength</TableHead>
                        <TableHead>Form</TableHead>
                        <TableHead>Dosage</TableHead>
                        <TableHead>Manufacturer</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {importRows.map((row) => (
                        <TableRow key={row.rowNo}>
                          <TableCell>{row.rowNo}</TableCell>

                          <TableCell>
                            <div className="font-medium">
                              {row.medicineName}
                            </div>
                            <div className="max-w-xs truncate text-xs text-muted-foreground">
                              {row.instructions || "No instruction"}
                            </div>
                          </TableCell>

                          <TableCell>{row.genericName || "-"}</TableCell>
                          <TableCell>{row.strength || "-"}</TableCell>
                          <TableCell>{row.dosageForm || "-"}</TableCell>
                          <TableCell>{row.dosage || "-"}</TableCell>
                          <TableCell>{row.manufacturer || "-"}</TableCell>

                          <TableCell>
                            {row.status === "extracted" && (
                              <Badge variant="secondary">Extracted</Badge>
                            )}

                            {row.status === "importing" && (
                              <Badge className="gap-1">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Adding
                              </Badge>
                            )}

                            {row.status === "success" && (
                              <Badge className="gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Added
                              </Badge>
                            )}

                            {row.status === "failed" && (
                              <div className="space-y-1">
                                <Badge variant="destructive" className="gap-1">
                                  <XCircle className="h-3 w-3" />
                                  Failed
                                </Badge>

                                {row.error && (
                                  <p className="max-w-xs text-xs text-red-600">
                                    {row.error}
                                  </p>
                                )}
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}