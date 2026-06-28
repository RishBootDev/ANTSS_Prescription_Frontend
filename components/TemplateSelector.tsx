import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LayoutTemplate, FileText, LayoutDashboard, Zap } from "lucide-react";

export type TemplateId = "CLASSIC" | "EMR" | "QUICK_OPD";

export interface TemplateSelectorProps {
  currentTemplate: TemplateId;
  onSelect: (template: TemplateId) => void;
}

const TEMPLATES: {
  id: TemplateId;
  name: string;
  description: string;
  icon: React.ReactNode;
  recommended: string;
}[] = [
  {
    id: "EMR",
    name: "Modern EMR",
    description: "Standard two-column hospital layout. All clinical notes on the left, orders and prescriptions on the right.",
    icon: <LayoutDashboard className="w-8 h-8 text-blue-500" />,
    recommended: "Hospitals & Multi-specialty Clinics",
  },
  {
    id: "CLASSIC",
    name: "Classic Prescription",
    description: "Traditional single-column pad. Top to bottom flow: Patient, Complaints, Diagnosis, Medicines, Advice.",
    icon: <FileText className="w-8 h-8 text-emerald-500" />,
    recommended: "General Physicians & Specialists",
  },
  {
    id: "QUICK_OPD",
    name: "Quick OPD",
    description: "Extremely streamlined interface. Brings Vitals, Diagnosis, and Medicines to the absolute top. Hides secondary sections.",
    icon: <Zap className="w-8 h-8 text-amber-500" />,
    recommended: "High-Volume Clinics (50+ patients/day)",
  },
];

export function TemplateSelector({ currentTemplate, onSelect }: TemplateSelectorProps) {
  const [open, setOpen] = useState(false);

  // Sync state if controlled from outside
  useEffect(() => {
    // We can also ensure the URL or localStorage is updated here if we want,
    // but better handled by the parent component.
  }, [currentTemplate]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-md transition-colors text-sm font-medium border border-slate-300 shadow-sm"
        >
          <LayoutTemplate className="w-4 h-4" />
          Layout: {TEMPLATES.find((t) => t.id === currentTemplate)?.name || "EMR"}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Choose Prescription Layout</DialogTitle>
          <DialogDescription>
            Select the interface that best matches your clinical workflow. This will instantly change how the consultation page is displayed without losing any patient data.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {TEMPLATES.map((template) => {
            const isActive = currentTemplate === template.id;
            return (
              <div
                key={template.id}
                onClick={() => {
                  onSelect(template.id);
                  setOpen(false);
                }}
                className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                  isActive
                    ? "border-teal-500 bg-teal-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                {isActive && (
                  <div className="absolute top-2 right-2 bg-teal-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Active
                  </div>
                )}
                <div className="mb-4 bg-slate-50 p-3 rounded-lg w-fit inline-block border border-slate-100">
                  {template.icon}
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{template.name}</h3>
                <p className="text-xs text-slate-500 flex-1">{template.description}</p>
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-[11px] font-medium text-slate-600">
                    <span className="text-slate-400 block mb-0.5">Best For:</span>
                    {template.recommended}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
