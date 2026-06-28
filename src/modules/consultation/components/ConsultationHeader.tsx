import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, RotateCcw, CheckCircle, Syringe, Plus } from "lucide-react";
import { TemplateSelector, TemplateId } from "@/components/TemplateSelector";

interface ConsultationHeaderProps {
  goBack: () => void;
  handleReset: () => void;
  handleSave: () => void;
  saveStatus: "idle" | "saving" | "saved";
  isReadOnly: boolean;
  hasTodayPrescription?: boolean;
}

export function ConsultationHeader({
  goBack,
  handleReset,
  handleSave,
  saveStatus,
  isReadOnly,
  hasTodayPrescription,
}: ConsultationHeaderProps) {
  const [template, setTemplate] = useState<TemplateId>("EMR");

  useEffect(() => {
    const stored = localStorage.getItem("preferred_prescription_template") as TemplateId;
    if (stored) {
      setTemplate(stored);
    }
  }, []);

  const handleTemplateSelect = (newTemplate: TemplateId) => {
    setTemplate(newTemplate);
    localStorage.setItem("preferred_prescription_template", newTemplate);
    window.dispatchEvent(new CustomEvent("templateChanged", { detail: newTemplate }));
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="mx-auto flex min-h-14 flex-wrap max-w-7xl items-center justify-between px-4 lg:px-6 py-2 gap-y-3">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="sm" onClick={goBack} className="gap-1 sm:gap-2 px-2 sm:px-3">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="flex items-center gap-2 ml-1 sm:ml-2">
            <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Syringe className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-1.5">
                Consultation
                {hasTodayPrescription && (
                  <Badge
                    variant="default"
                    className="bg-green-600/10 text-green-600 hover:bg-green-600/20 text-[9px] h-4 px-1 py-0 border-none font-semibold"
                  >
                    Today's Rx Exists
                  </Badge>
                )}
              </h1>
              <p className="text-[10px] text-muted-foreground hidden sm:block">AI Voice-Enabled Form</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 ml-auto">
          
          <TemplateSelector currentTemplate={template} onSelect={handleTemplateSelect} />

          <div className="flex items-center gap-2 border-l border-border pl-2 sm:pl-4">
            {isReadOnly ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-2 text-primary border-primary hover:bg-primary/10"
              >
                <Plus className="h-4 w-4" />
                New Consultation
              </Button>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>

                <Button size="sm" onClick={handleSave} disabled={saveStatus === "saving"}>
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
                      Save
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
