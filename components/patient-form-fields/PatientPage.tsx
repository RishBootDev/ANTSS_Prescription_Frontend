"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Calendar, ChevronDown, Phone, UserRound } from "lucide-react";
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

  const wrapWithMic = (
    context: VoiceContext,
    element: React.ReactElement<{ className?: string }>
  ) => {
    if (!mic) return element;
    const isActive =
      mic.activeVoiceContext?.mode === context.mode &&
      mic.activeVoiceContext?.field === context.field &&
      mic.activeVoiceContext?.component === context.component;

    return (
      <VoiceMicField
        isListening={mic.isListening}
        isProcessing={mic.isProcessing}
        isActive={isActive}
        onMicToggle={() => mic.onMicToggle(context)}
        variant={context.mode === "COMPONENT" ? "section" : "field"}
      >
        {element}
      </VoiceMicField>
    );
  };

  return (
    <div className="patient-bar bg-white">
      <div className="flex min-h-[72px] flex-wrap items-center gap-x-5 gap-y-2 px-4 py-2.5 lg:px-6">
        <div className="flex min-w-[250px] items-center gap-3">
          <div className="patient-avatar flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <UserRound className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="max-w-[220px]">
              {wrapWithMic(
                { mode: "FIELD", field: "name", component: "Patient" },
                <Input
                  ref={(el) => registerFieldRef?.("name", el)}
                  value={data.name ?? ""}
                  onChange={(e) => updateField("name", e.target.value || null)}
                  placeholder="Patient name"
                  className={`h-7 border-0 bg-transparent px-0 text-sm font-bold text-slate-900 shadow-none focus-visible:ring-0 ${inputClass("name")}`}
                />
              )}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <span>UHID: <b className="text-slate-700">{data.registrationNumber || "—"}</b></span>
              <span className="h-3 w-px bg-slate-200" />
              <span>{data.contactNumber || "No contact"}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 border-l border-slate-200 pl-5">
          <div className="w-24 min-w-[90px]">
  {wrapWithMic(
    { mode: "FIELD", field: "age", component: "Patient" },
    <Input
      ref={(el) => registerFieldRef?.("age", el)}
      type="number"
      value={data.age ?? ""}
      onChange={(e) =>
        updateField("age", e.target.value ? Number(e.target.value) : null)
      }
      placeholder="Age"
      className={`h-8 text-sm text-center ${inputClass("age")}`}
    />
  )}
</div>
          <div className="w-24">
            <Select value={data.gender ?? ""} onValueChange={(value) => updateField("gender", value || null)}>
              <SelectTrigger
                ref={(el) => registerFieldRef?.("gender", el)}
                className={`h-7 text-xs ${inputClass("gender")}`}
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
        </div>

        <div className="border-l border-slate-200 pl-5">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Visit date</p>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <Input
              ref={(el) => registerFieldRef?.("visitDate", el)}
              type="date"
              value={data.visitDate ?? ""}
              onChange={(e) => updateField("visitDate", e.target.value || null)}
              className={`h-7 w-[130px] border-0 px-0 text-xs shadow-none focus-visible:ring-0 ${inputClass("visitDate")}`}
            />
          </div>
        </div>

        <div className="border-l border-slate-200 pl-5">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Past visits</p>
          <p className="text-xs font-semibold text-slate-700">{prescriptionHistoryLength} prescriptions</p>
        </div>

        {data.allergies && data.allergies !== "None" && data.allergies !== "N/A" && (
          <div className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-[11px] font-semibold text-red-700">
            <AlertTriangle className="h-3.5 w-3.5" />
            Allergy: {data.allergies}
          </div>
        )}

        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="ml-auto flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium text-slate-500 hover:bg-slate-50"
        >
          More
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      </div>

      {expanded && (
        <div className="grid gap-3 border-t border-slate-100 bg-slate-50/70 px-4 py-3 sm:grid-cols-3 lg:px-6">
          <label className="space-y-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Contact number
            <div className="relative">
              <Phone className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                value={data.contactNumber ?? ""}
                onChange={(e) => updateField("contactNumber", e.target.value.replace(/\D/g, "").slice(0, 10) || null)}
                className="h-8 bg-white pl-8 text-xs"
                maxLength={10}
              />
            </div>
          </label>
          <label className="space-y-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Emergency contact
            <Input
              value={data.emergencyContact ?? ""}
              onChange={(e) => updateField("emergencyContact", e.target.value.replace(/\D/g, "").slice(0, 10) || null)}
              className="h-8 bg-white text-xs"
              maxLength={10}
            />
          </label>
          <label className="space-y-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Insurance ID
            <Input
              value={data.insuranceId ?? ""}
              onChange={(e) => updateField("insuranceId", e.target.value || null)}
              className="h-8 bg-white text-xs"
            />
          </label>
        </div>
      )}
    </div>
  );
}
