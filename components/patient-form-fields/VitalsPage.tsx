"use client";

import { ReactElement, ReactNode, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Calendar,
  HeartPulse,
  Thermometer,
  Droplets,
  Ruler,
  Wind,
} from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function getBmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) {
    return { label: "Underweight", color: "border-blue-200 bg-blue-50 text-blue-700" };
  }

  if (bmi < 25) {
    return { label: "Normal", color: "border-emerald-200 bg-emerald-50 text-emerald-700" };
  }

  if (bmi < 30) {
    return { label: "Overweight", color: "border-amber-200 bg-amber-50 text-amber-700" };
  }

  return { label: "Obese", color: "border-red-200 bg-red-50 text-red-700" };
}

type VitalBoxProps = {
  label: string;
  icon: ReactNode;
  children: ReactNode;
  normal?: string;
  tone?: "blue" | "amber" | "emerald" | "rose" | "cyan" | "purple";
};

function VitalBox({
  label,
  icon,
  children,
  normal,
  tone = "blue",
}: VitalBoxProps) {
  const toneClass = {
    blue: "from-blue-50 to-white border-blue-100",
    amber: "from-amber-50 to-white border-amber-100",
    emerald: "from-emerald-50 to-white border-emerald-100",
    rose: "from-rose-50 to-white border-rose-100",
    cyan: "from-cyan-50 to-white border-cyan-100",
    purple: "from-purple-50 to-white border-purple-100",
  }[tone];

  return (
    <div
      className={`min-w-0 rounded-2xl border bg-gradient-to-br p-3 shadow-sm transition-all hover:shadow-md ${toneClass}`}
    >
      <Label className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
        {icon}
        <span className="min-w-0 truncate">{label}</span>
      </Label>

      {children}

      {normal && (
        <p className="mt-1.5 text-[10px] font-medium text-slate-500">
          Normal: {normal}
        </p>
      )}
    </div>
  );
}

export default function VitalsPage({
  data,
  updateField,
  inputClass = () => "",
  sectionPulseClass = () => "",
  wrapWithMic = (_, node) => node,
  registerFieldRef,
}: Props) {
  const bmi = useMemo(() => {
    if (data.height && data.weight && data.height > 0) {
      const heightInMeters = data.height / 100;
      return Number((data.weight / (heightInMeters * heightInMeters)).toFixed(1));
    }

    return null;
  }, [data.height, data.weight]);

  const bmiCategory = bmi !== null ? getBmiCategory(bmi) : null;

  const inputBaseClass =
    "h-10 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-800 shadow-sm focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-100";

  return (
    <Card
      className={`rounded-2xl border border-blue-100 bg-white shadow-sm ${sectionPulseClass(
        "bloodPressureSystolic"
      )}`}
    >
      <CardHeader className="border-b border-slate-100 bg-white px-4 py-3">
        <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-800">
          {wrapWithMic(
            { mode: "COMPONENT", component: "Vitals" },
            <div className="flex cursor-pointer items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                <Activity className="h-4.5 w-4.5" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  Today&apos;s Vitals
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                    Live
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] font-medium normal-case tracking-normal text-slate-400">
                  BP, pulse, SpO2, temperature and body metrics
                </p>
              </div>
            </div>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="bg-gradient-to-b from-blue-50/35 to-white p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <VitalBox
  label="Blood Pressure"
  normal="120/80 mmHg"
  tone="amber"
  icon={<HeartPulse className="h-3.5 w-3.5 shrink-0 text-amber-600" />}
>
  <div
    className={`flex h-10 items-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 ${inputClass(
      "bloodPressureSystolic"
    )}`}
  >
    <Input
      ref={(el) => {
  if (el) {
    registerFieldRef?.("bloodPressureSystolic", el);
  }
}}
      aria-label="Systolic blood pressure"
      placeholder="120"
      value={data.bloodPressureSystolic ?? ""}
      onChange={(e) => {
        const value = e.target.value.replace(/\D/g, "").slice(0, 3);
        updateField(
          "bloodPressureSystolic",
          value ? Number(value) : null
        );
      }}
      inputMode="numeric"
      maxLength={3}
      className="h-10 flex-1 rounded-none border-0 bg-transparent px-2 text-center text-sm font-bold shadow-none focus-visible:ring-0"
    />

    <span className="select-none text-lg font-bold text-slate-500">/</span>

    <Input
      ref={(el) => {
  if (el) {
    registerFieldRef?.("bloodPressureDiastolic", el);
  }
}}
      aria-label="Diastolic blood pressure"
      placeholder="80"
      value={data.bloodPressureDiastolic ?? ""}
      onChange={(e) => {
        const value = e.target.value.replace(/\D/g, "").slice(0, 3);
        updateField(
          "bloodPressureDiastolic",
          value ? Number(value) : null
        );
      }}
      inputMode="numeric"
      maxLength={3}
      className="h-10 flex-1 rounded-none border-0 bg-transparent px-2 text-center text-sm font-bold shadow-none focus-visible:ring-0"
    />
  </div>
</VitalBox>

          <VitalBox
            label="Pulse"
            normal="60-100 bpm"
            tone="emerald"
            icon={<HeartPulse className="h-3.5 w-3.5 shrink-0 text-emerald-600" />}
          >
            <div className="relative">
              {wrapWithMic(
                { mode: "FIELD", field: "pulse", component: "Vitals" },
                <Input
                  ref={(el) => {    
                    if (el) {
                      registerFieldRef?.("pulse", el);
                    }
                  }}
                  type="number"
                  min={30}
                  max={250}
                  placeholder="72"
                  value={data.pulse ?? ""}
                  onChange={(e) =>
                    updateField("pulse", e.target.value ? Number(e.target.value) : null)
                  }
                  className={`${inputBaseClass} pr-14 ${inputClass("pulse")}`}
                />
              )}
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-500">
                bpm
              </span>
            </div>
          </VitalBox>

          <VitalBox
            label="SpO2"
            normal="95-100%"
            tone="cyan"
            icon={<Droplets className="h-3.5 w-3.5 shrink-0 text-cyan-600" />}
          >
            <div className="relative">
              {wrapWithMic(
                {
                  mode: "FIELD",
                  field: "oxygenSaturation",
                  component: "Vitals",
                },
                <Input
                  ref={(el) => {
                    if (el) {
                      registerFieldRef?.("oxygenSaturation", el);
                    }
                  }}
                  type="number"
                  min={50}
                  max={100}
                  placeholder="98"
                  value={data.oxygenSaturation ?? ""}
                  onChange={(e) =>
                    updateField(
                      "oxygenSaturation",
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className={`${inputBaseClass} pr-10 ${inputClass(
                    "oxygenSaturation"
                  )}`}
                />
              )}
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                %
              </span>
            </div>
          </VitalBox>

          <VitalBox
            label="Temperature"
            normal="97-99 °F"
            tone="rose"
            icon={<Thermometer className="h-3.5 w-3.5 shrink-0 text-rose-600" />}
          >
            <div className="relative">
              {wrapWithMic(
                {
                  mode: "FIELD",
                  field: "temperature",
                  component: "Vitals",
                },
                <Input
                  ref={(el) => {
                    if (el) {
                      registerFieldRef?.("temperature", el);
                    }
                  }}
                  type="number"
                  step="0.1"
                  min={90}
                  max={110}
                  placeholder="98.6"
                  value={data.temperature ?? ""}
                  onChange={(e) =>
                    updateField(
                      "temperature",
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className={`${inputBaseClass} pr-10 ${inputClass("temperature")}`}
                />
              )}
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                °F
              </span>
            </div>
          </VitalBox>

          <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-3 shadow-sm sm:col-span-2">
            <Label className="mb-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
              <Ruler className="h-3.5 w-3.5 text-emerald-600" />
              Body Metrics
            </Label>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Height
                </Label>
                {wrapWithMic(
                  { mode: "FIELD", field: "height", component: "Vitals" },
                  <Input
                    ref={(el) => {  
                      if (el) {
                        registerFieldRef?.("height", el);
                      }
                    }}
                    type="number"
                    min={30}
                    max={250}
                    placeholder="175"
                    value={data.height ?? ""}
                    onChange={(e) =>
                      updateField("height", e.target.value ? Number(e.target.value) : null)
                    }
                    className={`${inputBaseClass} px-2 text-center ${inputClass(
                      "height"
                    )}`}
                  />
                )}
                <p className="mt-1 text-[10px] font-medium text-slate-500">cm</p>
              </div>

              <div>
                <Label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Weight
                </Label>
                {wrapWithMic(
                  { mode: "FIELD", field: "weight", component: "Vitals" },
                  <Input
                    ref={(el) => {
  if (el) {
    registerFieldRef?.("weight", el);
  }
}}
                    type="number"
                    min={1}
                    max={500}
                    placeholder="70"
                    value={data.weight ?? ""}
                    onChange={(e) =>
                      updateField("weight", e.target.value ? Number(e.target.value) : null)
                    }
                    className={`${inputBaseClass} px-2 text-center ${inputClass(
                      "weight"
                    )}`}
                  />
                )}
                <p className="mt-1 text-[10px] font-medium text-slate-500">kg</p>
              </div>

              <div>
                <Label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  BMI
                </Label>
                <div className="flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-base font-bold text-slate-800 shadow-sm">
                  {bmi !== null ? bmi : "---"}
                </div>

                {bmiCategory && (
                  <Badge
                    className={`mt-1 w-full justify-center rounded-lg border text-[10px] font-bold shadow-none ${bmiCategory.color}`}
                  >
                    {bmiCategory.label}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <VitalBox
            label="Resp. Rate"
            tone="purple"
            icon={<Wind className="h-3.5 w-3.5 shrink-0 text-purple-600" />}
          >
            <div className="relative">
              {wrapWithMic(
                {
                  mode: "FIELD",
                  field: "respiratoryRate",
                  component: "Vitals",
                },
                <Input
                  ref={(el) => {
                    if (el) {
                      registerFieldRef?.("respiratoryRate", el);
                    }
                  }}
                  type="number"
                  min={5}
                  max={60}
                  placeholder="16"
                  value={data.respiratoryRate ?? ""}
                  onChange={(e) =>
                    updateField(
                      "respiratoryRate",
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className={`${inputBaseClass} pr-16 ${inputClass(
                    "respiratoryRate"
                  )}`}
                />
              )}
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500">
                br/min
              </span>
            </div>
          </VitalBox>

          <VitalBox
            label="LMP Date"
            tone="amber"
            icon={<Calendar className="h-3.5 w-3.5 shrink-0 text-amber-600" />}
          >
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  ref={(el) => {  
                    if (el) {
                      registerFieldRef?.("lmp", el);
                    }
                  }}
                  variant="outline"
                  className={cn(
                    "h-10 w-full justify-start overflow-hidden rounded-xl border-slate-200 bg-white px-2 text-left text-xs font-bold shadow-sm hover:bg-white",
                    !data.lmp && "text-muted-foreground",
                    inputClass("lmp")
                  )}
                >
                  <Calendar className="mr-1.5 h-3.5 w-3.5 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">
                    {data.lmp
                      ? format(parseLocalDate(data.lmp), "dd/MM/yy")
                      : "Select"}
                  </span>
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-auto p-0" align="end">
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
          </VitalBox>
        </div>
      </CardContent>
    </Card>
  );
}
