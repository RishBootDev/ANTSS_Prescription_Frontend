"use client";

import { ReactElement, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Heart, Scale, Calendar, Info, Activity } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { PatientData } from "../patient-form-fields/types";
import { VoiceContext } from "@/hooks/useConsultationVoice";

type Props = {
  data: PatientData;

  updateField: <K extends keyof PatientData>(
    field: K,
    value: PatientData[K]
  ) => void;

  inputClass?: (field: keyof PatientData) => string;
  sectionPulseClass?: (field: keyof PatientData) => string;

  wrapWithMic?: (
    context: VoiceContext,
    node: ReactElement
  ) => ReactElement | null;

  registerFieldRef?: (fieldName: string, element: HTMLElement | null) => void;
};

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
      className={`border-slate-200 shadow-sm rounded-xl bg-white ${sectionPulseClass(
        "bloodPressureSystolic"
      )}`}
    >
      <CardHeader className="pb-3 pt-5 px-5 border-b border-slate-50 mb-3">
        <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          {wrapWithMic(
            { mode: "COMPONENT", component: "Vitals" },
            <div className="flex items-center gap-2 cursor-pointer">
              <Activity className="h-4 w-4 text-slate-500" />
              Vitals Entry
            </div>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-5 pb-5">
        <div className="grid gap-4 grid-cols-2">

          {/* Blood Pressure */}
          <div className="space-y-1.5 col-span-2 sm:col-span-1">
            <Label className="text-xs font-medium text-slate-700">Blood Pressure (mmHg)</Label>
            <div className="flex items-center gap-2">
              {wrapWithMic(
                { mode: "FIELD", field: "bloodPressureSystolic", component: "Vitals" },
                <Input
                  ref={(el) => { if (el && registerFieldRef) registerFieldRef("bloodPressureSystolic", el); }}
                  type="number"
                  min={60}
                  max={200}
                  placeholder="120"
                  value={data.bloodPressureSystolic ?? ""}
                  onChange={(e) =>
                    updateField(
                      "bloodPressureSystolic",
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className={`w-full text-sm focus-visible:ring-sky-500 rounded-lg text-center bg-slate-50 ${inputClass("bloodPressureSystolic")}`}
                />
              )}
              <span className="text-slate-400 font-medium">/</span>
              {wrapWithMic(
                { mode: "FIELD", field: "bloodPressureDiastolic", component: "Vitals" },
                <Input
                  ref={(el) => { if (el && registerFieldRef) registerFieldRef("bloodPressureDiastolic", el); }}
                  type="number"
                  min={40}
                  max={130}
                  placeholder="80"
                  value={data.bloodPressureDiastolic ?? ""}
                  onChange={(e) =>
                    updateField(
                      "bloodPressureDiastolic",
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className={`w-full text-sm focus-visible:ring-sky-500 rounded-lg text-center bg-slate-50 ${inputClass("bloodPressureDiastolic")}`}
                />
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">Normal: 120/80</p>
          </div>

          {/* Pulse */}
          <div className="space-y-1.5 col-span-2 sm:col-span-1">
            <Label className="text-xs font-medium text-slate-700">Pulse</Label>
            <div className="relative">
              {wrapWithMic(
                { mode: "FIELD", field: "pulse", component: "Vitals" },
                <Input
                  ref={(el) => { if (el && registerFieldRef) registerFieldRef("pulse", el); }}
                  type="number"
                  min={30}
                  max={250}
                  placeholder="72"
                  value={data.pulse ?? ""}
                  onChange={(e) =>
                    updateField("pulse", e.target.value ? Number(e.target.value) : null)
                  }
                  className={`w-full pr-12 text-sm focus-visible:ring-sky-500 rounded-lg bg-slate-50 ${inputClass("pulse")}`}
                />
              )}
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium select-none pointer-events-none">
                bpm
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">Normal: 60-100</p>
          </div>

          {/* SpO2 */}
          <div className="space-y-1.5 col-span-2 sm:col-span-1">
            <Label className="text-xs font-medium text-slate-700">SpO2</Label>
            <div className="relative">
              {wrapWithMic(
                { mode: "FIELD", field: "oxygenSaturation", component: "Vitals" },
                <Input
                  ref={(el) => { if (el && registerFieldRef) registerFieldRef("oxygenSaturation", el); }}
                  type="number"
                  min={50}
                  max={100}
                  placeholder="98"
                  value={data.oxygenSaturation ?? ""}
                  onChange={(e) =>
                    updateField("oxygenSaturation", e.target.value ? Number(e.target.value) : null)
                  }
                  className={`w-full pr-12 text-sm focus-visible:ring-sky-500 rounded-lg bg-slate-50 ${inputClass("oxygenSaturation")}`}
                />
              )}
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium select-none pointer-events-none">
                %
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">Normal: 95-100</p>
          </div>

          {/* Temperature */}
          <div className="space-y-1.5 col-span-2 sm:col-span-1">
            <Label className="text-xs font-medium text-slate-700">Temperature</Label>
            <div className="relative">
              {wrapWithMic(
                { mode: "FIELD", field: "temperature", component: "Vitals" },
                <Input
                  ref={(el) => { if (el && registerFieldRef) registerFieldRef("temperature", el); }}
                  type="number"
                  step="0.1"
                  min={90}
                  max={110}
                  placeholder="98.6"
                  value={data.temperature ?? ""}
                  onChange={(e) =>
                    updateField("temperature", e.target.value ? Number(e.target.value) : null)
                  }
                  className={`w-full pr-12 text-sm focus-visible:ring-sky-500 rounded-lg bg-slate-50 ${inputClass("temperature")}`}
                />
              )}
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium select-none pointer-events-none">
                °F
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">Normal: 97-99</p>
          </div>

          {/* BMI Display */}
          <div className="col-span-2 mt-2 p-3 bg-slate-50/80 rounded-lg border border-slate-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-6">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold mb-0.5">Height (cm)</span>
                {wrapWithMic(
                  { mode: "FIELD", field: "height", component: "Vitals" },
                  <Input
                    ref={(el) => { if (el && registerFieldRef) registerFieldRef("height", el); }}
                    type="number"
                    min={30}
                    max={250}
                    placeholder="175"
                    value={data.height ?? ""}
                    onChange={(e) =>
                      updateField("height", e.target.value ? Number(e.target.value) : null)
                    }
                    className={`h-7 w-20 text-sm p-1 text-center bg-white border-slate-200 ${inputClass("height")}`}
                  />
                )}
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold mb-0.5">Weight (kg)</span>
                {wrapWithMic(
                  { mode: "FIELD", field: "weight", component: "Vitals" },
                  <Input
                    ref={(el) => { if (el && registerFieldRef) registerFieldRef("weight", el); }}
                    type="number"
                    min={1}
                    max={500}
                    placeholder="70"
                    value={data.weight ?? ""}
                    onChange={(e) =>
                      updateField("weight", e.target.value ? Number(e.target.value) : null)
                    }
                    className={`h-7 w-20 text-sm p-1 text-center bg-white border-slate-200 ${inputClass("weight")}`}
                  />
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold mb-0.5">BMI</span>
                <span className="text-lg font-bold text-slate-800 leading-none">
                  {bmi !== null ? String(bmi) : "---"}
                </span>
              </div>
              {bmiCategory && (
                <Badge className={`border-none shadow-none font-semibold rounded-md ${bmiCategory.color}`}>
                  {bmiCategory.label}
                </Badge>
              )}
            </div>
          </div>



          {/* Respiratory Rate */}
          <div className="space-y-1.5 col-span-2 sm:col-span-1">
            <Label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Resp. Rate</Label>
            <div className="relative">
              {wrapWithMic(
                { mode: "FIELD", field: "respiratoryRate", component: "Vitals" },
                <Input
                  ref={(el) => { if (el && registerFieldRef) registerFieldRef("respiratoryRate", el); }}
                  type="number"
                  min={5}
                  max={60}
                  placeholder="16"
                  value={data.respiratoryRate ?? ""}
                  onChange={(e) =>
                    updateField("respiratoryRate", e.target.value ? Number(e.target.value) : null)
                  }
                  className={`w-full pr-12 text-sm focus-visible:ring-sky-500 rounded-lg bg-slate-50 ${inputClass("respiratoryRate")}`}
                />
              )}
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium select-none pointer-events-none">
                br/min
              </span>
            </div>
          </div>



          {/* LMP Date */}
          <div className="space-y-1.5 col-span-2 sm:col-span-1">
            <Label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">LMP Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  ref={(el) => { if (el && registerFieldRef) registerFieldRef("lmp", el); }}
                  variant="outline"
                  className={cn(
                    "w-full h-9 justify-start text-left font-normal px-3 text-sm focus-visible:ring-sky-500 rounded-lg bg-slate-50",
                    !data.lmp && "text-muted-foreground",
                    inputClass("lmp")
                  )}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {data.lmp
                    ? format(parseLocalDate(data.lmp), "dd/MM/yyyy")
                    : <span>Select</span>
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={data.lmp ? parseLocalDate(data.lmp) : undefined}
                  onSelect={(date) => {
                    if (date) {
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
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
