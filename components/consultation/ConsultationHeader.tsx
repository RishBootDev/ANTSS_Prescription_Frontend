"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Save,
  RotateCcw,
  CheckCircle,
  Syringe,
  Plus
} from "lucide-react"

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
  hasTodayPrescription
}: ConsultationHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={goBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2 ml-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Syringe className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                Consultation
                {hasTodayPrescription && (
                  <Badge variant="default" className="bg-green-600/10 text-green-600 hover:bg-green-600/20 text-[9px] h-4 px-1 py-0 border-none font-semibold">
                    Today's Prescription Exists
                  </Badge>
                )}
              </h1>
              <p className="text-[10px] text-muted-foreground">AI Voice-Enabled Form</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isReadOnly ? (
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-2 text-primary border-primary hover:bg-primary/10">
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
    </header>
  )
}
