import { ReactNode, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Save,
  RotateCcw,
  CheckCircle,
  Stethoscope,
  Plus,
  Printer,
  Sun,
  Moon,
  Palette,
} from "lucide-react";
import { TemplateSelector, TemplateId } from "@/components/TemplateSelector";

export type ConsultationTheme = "light" | "dark" | "colourful";

const themes: {
  id: ConsultationTheme;
  label: string;
  icon: typeof Sun;
}[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "colourful", label: "Colourful", icon: Palette },
];

interface ConsultationHeaderProps {
  goBack: () => void;
  handleReset: () => void;
  handleSave: () => void;
  saveStatus: "idle" | "saving" | "saved";
  isReadOnly: boolean;
  hasTodayPrescription?: boolean;
  theme: ConsultationTheme;
  onThemeChange: (theme: ConsultationTheme) => void;
  canPrint: boolean;
  assistantNode?: ReactNode;
}

export function ConsultationHeader({
  goBack,
  handleReset,
  handleSave,
  saveStatus,
  isReadOnly,
  hasTodayPrescription,
  theme,
  onThemeChange,
  canPrint,
  assistantNode,
}: ConsultationHeaderProps) {
  const [template, setTemplate] = useState<TemplateId>("EMR");

  useEffect(() => {
    const stored = localStorage.getItem(
      "preferred_prescription_template"
    ) as TemplateId;

    if (stored) {
      setTemplate(stored);
    }
  }, []);

  const handleTemplateSelect = (newTemplate: TemplateId) => {
    setTemplate(newTemplate);
    localStorage.setItem("preferred_prescription_template", newTemplate);
    window.dispatchEvent(
      new CustomEvent("templateChanged", { detail: newTemplate })
    );
  };

  const handleThemeSelect = (newTheme: ConsultationTheme) => {
    onThemeChange(newTheme);
  };

  return (
    <header className="consultation-header sticky top-0 z-50 border-b border-red-100 bg-white/95 shadow-sm backdrop-blur">
      <div className="flex min-h-16 flex-wrap items-center justify-between gap-y-2 px-3 py-2.5 lg:px-6">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={goBack}
            className="h-9 gap-1.5 rounded-xl px-2.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>

          <div className="flex items-center gap-2 border-l border-red-100 pl-3">
            <div className="brand-mark flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 shadow-lg shadow-red-600/20">
              <Stethoscope className="h-[18px] w-[18px] text-white" />
            </div>

            <div>
              <h1 className="flex items-center gap-1.5 text-[13px] font-black tracking-[0.18em] text-slate-800">
                ANTSS
                {hasTodayPrescription && (
                  <Badge
                    variant="default"
                    className="h-4 border-none bg-red-50 px-1.5 py-0 text-[9px] font-semibold text-red-600 hover:bg-red-50"
                  >
                    Today's Rx
                  </Badge>
                )}
              </h1>
              <p className="hidden text-[10px] font-medium text-slate-400 sm:block">
                Prescription workspace
              </p>
            </div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
          {assistantNode && (
            <div className="flex items-center border-r border-red-100 pr-2 sm:pr-3">
              {assistantNode}
            </div>
          )}

          <div
            className="theme-switcher flex h-9 items-center gap-0.5 rounded-xl border border-red-100 bg-white p-1 shadow-sm"
            role="group"
            aria-label="Workspace theme"
          >
            {themes.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleThemeSelect(id)}
                aria-label={`${label} theme`}
                aria-pressed={theme === id}
                title={`${label} theme`}
                className={`flex h-7 items-center gap-1.5 rounded-lg px-2 text-[11px] font-semibold transition-all ${
                  theme === id
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-slate-500 hover:bg-red-50 hover:text-red-600"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className={theme === id ? "hidden 2xl:inline" : "hidden"}>
                  {label}
                </span>
              </button>
            ))}
          </div>

          <TemplateSelector
            currentTemplate={template}
            onSelect={handleTemplateSelect}
          />

          <div className="hidden items-center gap-1 md:flex">
            

            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                document.getElementById("print-prescription-action")?.click()
              }
              aria-disabled={!canPrint}
              title={canPrint ? "Print prescription" : "Save changes before printing"}
              className={`h-8 gap-1.5 text-xs text-slate-500 hover:bg-red-50 hover:text-red-600 ${
                !canPrint ? "opacity-45" : ""
              }`}
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </Button>
          </div>

          <div className="flex items-center gap-2 border-l border-red-100 pl-2 sm:pl-3">
            {isReadOnly ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="h-8 gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Plus className="h-4 w-4" />
                New Consultation
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="h-8 text-slate-500 hover:bg-red-50 hover:text-red-600"
                >
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </Button>

                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saveStatus === "saving"}
                  className="h-8 rounded-lg bg-red-600 px-4 text-xs text-white hover:bg-red-700"
                >
                  {saveStatus === "saved" ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Saved
                    </>
                  ) : saveStatus === "saving" ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin">⏳</span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Complete
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default ConsultationHeader;
