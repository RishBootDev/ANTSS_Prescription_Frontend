"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { User, Plus, Minus, Calendar, Phone, Activity, Thermometer, Droplet, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VoiceMicField } from "../voice-mic-field";
import type { PatientData } from "../patient-form-fields/types";
import { VoiceContext } from "@/hooks/useConsultationVoice";

interface PatientPageProps {
  data: PatientData;
  updateField: <K extends keyof PatientData>(field: K, value: PatientData[K]) => void;
  inputClass?: (field: string) => string;
  mic?: {
    isListening: boolean;
    isProcessing: boolean;
    activeVoiceContext?: VoiceContext | null;
    onMicToggle: (context: VoiceContext) => void;
  };
  registerFieldRef?: (fieldName: string, element: HTMLElement | null) => void;
  prescriptionHistoryLength?: number;
}

export default function PatientPage({
  data,
  updateField,
  inputClass = () => "",
  mic,
  registerFieldRef,
  prescriptionHistoryLength = 0,
}: PatientPageProps) {
  const [expanded, setExpanded] = useState(false);

  const wrapWithMic = (context: VoiceContext, element: any) => {
    if (!mic) return element;

    const isActive = 
      mic?.activeVoiceContext?.mode === context.mode &&
      mic?.activeVoiceContext?.field === context.field &&
      mic?.activeVoiceContext?.component === context.component;

    return (
      <VoiceMicField
        isListening={mic.isListening}
        isProcessing={mic.isProcessing}
        isActive={isActive}
        onMicToggle={() => mic.onMicToggle(context)}
      >
        {element}
      </VoiceMicField>
    );
  };

  return (
    <Card className="bg-sky-50/50 border-sky-100 shadow-sm rounded-xl overflow-hidden relative">
      {prescriptionHistoryLength > 0 && (
        <div className="absolute top-3 right-3 hidden sm:block">
          <Badge variant="outline" className="bg-white border-sky-200 text-sky-700 rounded-md px-2 py-0.5 text-[10px]">
            Past Visits: {prescriptionHistoryLength}
          </Badge>
        </div>
      )}
      <CardContent className="p-4 sm:p-5">
        <div className="flex gap-3 sm:gap-4 items-start mt-1">
          <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-sky-200 flex items-center justify-center text-sky-700 shrink-0">
            <User className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="space-y-2 w-full">
            {/* Row 1: Name and Expand button */}
            <div className="flex items-center justify-between">
              <div className="flex-1 max-w-[200px]">
                {wrapWithMic(
                  { mode: "FIELD", field: "name", component: "Patient" },
                  <Input
                    ref={(el) => {
                      if (el && registerFieldRef) registerFieldRef("name", el);
                    }}
                    value={data.name ?? ""}
                    onChange={(e) => updateField("name", e.target.value || null)}
                    placeholder="Patient Name"
                    className={`h-7 sm:h-8 text-sm font-semibold text-slate-800 bg-transparent border-slate-200 shadow-none px-2 ${inputClass("name")}`}
                  />
                )}
              </div>
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="p-1.5 rounded-md hover:bg-sky-100 text-sky-700 transition"
                title="Expand Contact Details"
              >
                {expanded ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </button>
            </div>

            {/* Row 2: Age, Gender, Visit Date */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="w-16">
                {wrapWithMic(
                  { mode: "FIELD", field: "age", component: "Patient" },
                  <Input
                    ref={(el) => {
                      if (el && registerFieldRef) registerFieldRef("age", el);
                    }}
                    type="number"
                    value={data.age ?? ""}
                    onChange={(e) =>
                      updateField("age", e.target.value ? Number(e.target.value) : null)
                    }
                    placeholder="Age"
                    className={`h-7 text-xs bg-white border-slate-200 ${inputClass("age")}`}
                  />
                )}
              </div>
              <div className="w-24">
                <Select
                  value={data.gender ?? ""}
                  onValueChange={(v) => updateField("gender", v || null)}
                >
                  <SelectTrigger 
                    ref={(el) => {
                      if (el && registerFieldRef) registerFieldRef("gender", el);
                    }}
                    className={`h-7 text-xs bg-white border-slate-200 ${inputClass("gender")}`}
                  >
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-32 flex items-center gap-1 bg-white border border-slate-200 rounded-md px-2 overflow-hidden h-7">
                <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                <Input
                  ref={(el) => {
                    if (el && registerFieldRef) registerFieldRef("visitDate", el);
                  }}
                  type="date"
                  value={data.visitDate ?? ""}
                  onChange={(e) => updateField("visitDate", e.target.value || null)}
                  className={`h-full border-none shadow-none text-xs px-1 ${inputClass("visitDate")}`}
                />
              </div>
            </div>

            {/* Row 3: Quick Vitals */}
            <div className="flex flex-wrap items-center text-xs gap-x-4 gap-y-1 pt-1.5">
              {data.pulse && (
                <span className="flex items-center gap-1 font-medium text-slate-600">
                  <Activity className="h-3.5 w-3.5 text-rose-500" /> {data.pulse} bpm
                </span>
              )}
              {data.temperature && (
                <span className="flex items-center gap-1 font-medium text-slate-600">
                  <Thermometer className="h-3.5 w-3.5 text-orange-500" /> {data.temperature}°F
                </span>
              )}
              {data.oxygenSaturation && (
                <span className="flex items-center gap-1 font-medium text-slate-600">
                  <Droplet className="h-3.5 w-3.5 text-sky-500" /> {data.oxygenSaturation}%
                </span>
              )}
              {data.bloodPressureSystolic && data.bloodPressureDiastolic && (
                <span className="flex items-center gap-1 font-medium text-slate-600">
                  <Activity className="h-3.5 w-3.5 text-indigo-500" /> {data.bloodPressureSystolic}/{data.bloodPressureDiastolic} mmHg
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Expanded Contact Info */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            expanded ? "max-h-[200px] opacity-100 mt-3" : "max-h-0 opacity-0 pointer-events-none mt-0"
          }`}
        >
          <div className="grid gap-2 sm:gap-3 grid-cols-2 md:grid-cols-3 pt-2 border-t border-sky-100">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 font-semibold uppercase">Contact Number</label>
              <div className="relative">
                <Phone className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                <Input
                  value={data.contactNumber ?? ""}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 10);
                    updateField("contactNumber", v || null);
                  }}
                  placeholder="Contact"
                  className="h-7 text-xs pl-6 bg-white border-slate-200"
                  maxLength={10}
                  inputMode="numeric"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 font-semibold uppercase">Emergency Contact</label>
              <Input
                value={data.emergencyContact ?? ""}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 10);
                  updateField("emergencyContact", v || null);
                }}
                placeholder="Emergency Contact"
                className="h-7 text-xs bg-white border-slate-200"
                maxLength={10}
                inputMode="numeric"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 font-semibold uppercase">Insurance ID</label>
              <Input
                value={data.insuranceId ?? ""}
                onChange={(e) => updateField("insuranceId", e.target.value || null)}
                placeholder="Insurance ID"
                className="h-7 text-xs bg-white border-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Tags / Badges */}
        {(data.allergies && data.allergies !== "None" && data.allergies !== "N/A") && (
          <div className="mt-4 flex gap-2 flex-wrap">
            <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-200 border-none rounded-md px-2 py-0.5 text-[11px] font-medium">
              Allergies: {data.allergies}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}