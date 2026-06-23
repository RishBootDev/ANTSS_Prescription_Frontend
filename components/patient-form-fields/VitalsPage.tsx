"use client";

import { ReactElement, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Heart, Scale, Calendar, Info } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { PatientData } from "../patient-form";

type Props = {
  data: PatientData;

  updateField: <K extends keyof PatientData>(
    field: K,
    value: PatientData[K]
  ) => void;

  inputClass?: (field: keyof PatientData) => string;
  sectionPulseClass?: (field: keyof PatientData) => string;

  wrapWithMic?: (
    field: keyof PatientData,
    node: ReactElement
  ) => ReactElement | null;

  registerFieldRef?: (fieldName: string, element: HTMLElement | null) => void;
};

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// Parse a "YYYY-MM-DD" string as local midnight (avoids UTC-off-by-one)
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// Get BMI category
function getBmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: "Underweight", color: "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30" };
  if (bmi < 25)   return { label: "Normal",      color: "bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30" };
  if (bmi < 30)   return { label: "Overweight",  color: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30" };
  return               { label: "Obese",         color: "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30" };
}

export default function VitalsPage({
  data,
  updateField,
  inputClass = () => "",
  sectionPulseClass = () => "",
  wrapWithMic = (_, node) => node,
  registerFieldRef,
}: Props) {
  // Calculate BMI when height/weight changes
  const bmi = useMemo(() => {
    if (data.height && data.weight && data.height > 0) {
      const heightInMeters = data.height / 100;
      return parseFloat((data.weight / (heightInMeters * heightInMeters)).toFixed(1));
    }
    return null;
  }, [data.height, data.weight]);

  const bmiCategory = bmi !== null ? getBmiCategory(bmi) : null;

  return (
    <Card
      className={`border-border/50 shadow-sm ${sectionPulseClass(
        "bloodPressureSystolic"
      )}`}
    >
      <CardHeader className="pb-1.5 px-3 pt-2.5">
        <CardTitle className="flex items-center gap-1.5 text-sm font-semibold">
          <Heart className="h-3.5 w-3.5 text-destructive" />
          Vitals
        </CardTitle>
      </CardHeader>

      <CardContent className="px-3 pb-2.5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">

          {/* Blood Pressure */}
          <div className="grid gap-1">
            <Label className="text-[10px] font-medium">Blood Pressure (mmHg)</Label>
            <div className="flex items-center gap-1.5">
              {wrapWithMic(
                "bloodPressureSystolic",
                <Input
                  ref={(el) => { if (el && registerFieldRef) registerFieldRef("bloodPressureSystolic", el); }}
                  type="number"
                  min={60}
                  max={200}
                  placeholder="Systolic"
                  value={data.bloodPressureSystolic ?? ""}
                  onChange={(e) =>
                    updateField(
                      "bloodPressureSystolic",
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className={`${inputClass("bloodPressureSystolic")}`}
                />
              )}
              <span className="text-muted-foreground text-sm font-medium">/</span>
              {wrapWithMic(
                "bloodPressureDiastolic",
                <Input
                  ref={(el) => { if (el && registerFieldRef) registerFieldRef("bloodPressureDiastolic", el); }}
                  type="number"
                  min={40}
                  max={130}
                  placeholder="Diastolic"
                  value={data.bloodPressureDiastolic ?? ""}
                  onChange={(e) =>
                    updateField(
                      "bloodPressureDiastolic",
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className={`${inputClass("bloodPressureDiastolic")}`}
                />
              )}
            </div>
            <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Info className="h-2.5 w-2.5 flex-shrink-0" />
              Normal: 90–120 / 60–80 mmHg
            </p>
          </div>

          {/* Pulse */}
          <div className="grid gap-1">
            <Label className="text-[10px] font-medium">Pulse (bpm)</Label>
            {wrapWithMic(
              "pulse",
              <Input
                ref={(el) => { if (el && registerFieldRef) registerFieldRef("pulse", el); }}
                type="number"
                min={30}
                max={250}
                placeholder="e.g., 72"
                value={data.pulse ?? ""}
                onChange={(e) =>
                  updateField("pulse", e.target.value ? Number(e.target.value) : null)
                }
                className={inputClass("pulse")}
              />
            )}
            <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Info className="h-2.5 w-2.5 flex-shrink-0" />
              Normal: 60–100 bpm
            </p>
          </div>

          {/* Height */}
          <div className="grid gap-1">
            <Label className="text-[10px] font-medium">Height (cm)</Label>
            {wrapWithMic(
              "height",
              <Input
                ref={(el) => { if (el && registerFieldRef) registerFieldRef("height", el); }}
                type="number"
                min={30}
                max={250}
                placeholder="e.g., 170"
                value={data.height ?? ""}
                onChange={(e) =>
                  updateField("height", e.target.value ? Number(e.target.value) : null)
                }
                className={inputClass("height")}
              />
            )}
          </div>

          {/* Weight */}
          <div className="grid gap-1">
            <Label className="text-[10px] font-medium">Weight (kg)</Label>
            {wrapWithMic(
              "weight",
              <Input
                ref={(el) => { if (el && registerFieldRef) registerFieldRef("weight", el); }}
                type="number"
                min={1}
                max={500}
                placeholder="e.g., 70"
                value={data.weight ?? ""}
                onChange={(e) =>
                  updateField("weight", e.target.value ? Number(e.target.value) : null)
                }
                className={inputClass("weight")}
              />
            )}
          </div>

          {/* BMI - Read Only with category badge */}
          <div className="grid gap-1">
            <Label className="text-[10px] font-medium">BMI</Label>
            <div className="flex items-center gap-2">
              <Scale className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <Input
                type="text"
                readOnly
                value={bmi !== null ? String(bmi) : "---"}
                className="bg-muted/50 text-xs"
              />
            </div>
            {bmiCategory && (
              <span
                className={`inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[9px] font-semibold ${bmiCategory.color}`}
              >
                {bmiCategory.label}
              </span>
            )}
          </div>

          {/* Temperature */}
          <div className="grid gap-1">
            <Label className="text-[10px] font-medium">Temperature (°F)</Label>
            {wrapWithMic(
              "temperature",
              <Input
                ref={(el) => { if (el && registerFieldRef) registerFieldRef("temperature", el); }}
                type="number"
                step="0.1"
                min={90}
                max={110}
                placeholder="e.g., 98.6"
                value={data.temperature ?? ""}
                onChange={(e) =>
                  updateField("temperature", e.target.value ? Number(e.target.value) : null)
                }
                className={inputClass("temperature")}
              />
            )}
            <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Info className="h-2.5 w-2.5 flex-shrink-0" />
              Normal: 97–99°F
            </p>
          </div>

          {/* SpO2 */}
          <div className="grid gap-1">
            <Label className="text-[10px] font-medium">SpO₂ (%)</Label>
            {wrapWithMic(
              "oxygenSaturation",
              <Input
                ref={(el) => { if (el && registerFieldRef) registerFieldRef("oxygenSaturation", el); }}
                type="number"
                min={50}
                max={100}
                placeholder="e.g., 98"
                value={data.oxygenSaturation ?? ""}
                onChange={(e) =>
                  updateField("oxygenSaturation", e.target.value ? Number(e.target.value) : null)
                }
                className={inputClass("oxygenSaturation")}
              />
            )}
            <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Info className="h-2.5 w-2.5 flex-shrink-0" />
              Normal: ≥ 95%
            </p>
          </div>

          {/* Respiratory Rate */}
          <div className="grid gap-1">
            <Label className="text-[10px] font-medium">Resp. Rate (breaths/min)</Label>
            {wrapWithMic(
              "respiratoryRate",
              <Input
                ref={(el) => { if (el && registerFieldRef) registerFieldRef("respiratoryRate", el); }}
                type="number"
                min={5}
                max={60}
                placeholder="e.g., 16"
                value={data.respiratoryRate ?? ""}
                onChange={(e) =>
                  updateField("respiratoryRate", e.target.value ? Number(e.target.value) : null)
                }
                className={inputClass("respiratoryRate")}
              />
            )}
            <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Info className="h-2.5 w-2.5 flex-shrink-0" />
              Normal: 12–20 breaths/min
            </p>
          </div>

          {/* Blood Group */}
          <div className="grid gap-1">
            <Label className="text-[10px] font-medium">Blood Group</Label>
            <Select
              value={data.bloodGroup ?? ""}
              onValueChange={(value) => updateField("bloodGroup", value || null)}
            >
              <SelectTrigger
                ref={(el) => { if (el && registerFieldRef) registerFieldRef("bloodGroup", el); }}
                className={inputClass("bloodGroup")}
              >
                <SelectValue placeholder="Select blood group" />
              </SelectTrigger>
              <SelectContent>
                {bloodGroups.map((bg) => (
                  <SelectItem key={bg} value={bg}>
                    {bg}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* LMP Date — uses local date parsing to avoid UTC off-by-one */}
          <div className="grid gap-1">
            <Label className="text-[10px] font-medium">LMP (Last Menstrual Period)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  ref={(el) => { if (el && registerFieldRef) registerFieldRef("lmp", el); }}
                  variant="outline"
                  className={cn(
                    "h-8 justify-start text-left font-normal px-2 text-xs",
                    !data.lmp && "text-muted-foreground"
                  )}
                >
                  <Calendar className="h-3 w-3 mr-1.5" />
                  {data.lmp
                    ? format(parseLocalDate(data.lmp), "dd/MM/yyyy")
                    : <span>Select date</span>
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={data.lmp ? parseLocalDate(data.lmp) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      // Store as local YYYY-MM-DD (no UTC shift)
                      const y = date.getFullYear();
                      const m = String(date.getMonth() + 1).padStart(2, "0");
                      const d = String(date.getDate()).padStart(2, "0");
                      updateField("lmp", `${y}-${m}-${d}`);
                    } else {
                      updateField("lmp", null);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <p className="text-[10px] text-muted-foreground">For female patients</p>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
