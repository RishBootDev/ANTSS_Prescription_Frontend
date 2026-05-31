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
import { User, Plus, Minus, Calendar } from "lucide-react";
import { VoiceMicField } from "../voice-mic-field";
import type { PatientData } from "../patient-form";

interface PatientPageProps {
  data: PatientData;
  updateField: <K extends keyof PatientData>(field: K, value: PatientData[K]) => void;
  inputClass?: (field: string) => string;
  mic?: {
    isListening: boolean;
    isProcessing: boolean;
    activeVoiceField: string | null;
    onMicToggle: (fieldId: string) => void;
  };
  registerFieldRef?: (fieldName: string, element: HTMLElement | null) => void;
}

export default function PatientPage({
  data,
  updateField,
  inputClass = () => "",
  mic,
  registerFieldRef,
}: PatientPageProps) {
  const [expanded, setExpanded] = useState(false);

  const wrapWithMic = (fieldId: keyof PatientData, element: any) => {
    if (!mic) return element;

    return (
      <VoiceMicField
        isListening={mic.isListening}
        isProcessing={mic.isProcessing}
        isActive={mic.activeVoiceField === fieldId}
        onMicToggle={() => mic.onMicToggle(String(fieldId))}
      >
        {element}
      </VoiceMicField>
    );
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="px-3 py-1 space-y-1">

        {/* HEADER ROW (ALWAYS VISIBLE) */}
        <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <div className="grid grid-cols-5 gap-2">
              {/* Name */}
              {wrapWithMic(
                "name",
                <Input
                  ref={(el) => {
                    if (el && registerFieldRef) {
                      registerFieldRef("name", el)
                    }
                  }}
                  value={data.name ?? ""}
                  onChange={(e) => updateField("name", e.target.value || null)}
                  placeholder="Name"
                  className={`h-8 text-sm ${inputClass("name")}`}
                />
              )}

              {/* Age */}
              {wrapWithMic(
                "age",
                <Input
                  ref={(el) => {
                    if (el && registerFieldRef) {
                      registerFieldRef("age", el)
                    }
                  }}
                  type="number"
                  value={data.age ?? ""}
                  onChange={(e) =>
                    updateField("age", e.target.value ? Number(e.target.value) : null)
                  }
                  placeholder="Age"
                  className={`h-8 text-sm ${inputClass("age")}`}
                />
              )}

              {/* Gender */}
              <Select
                value={data.gender ?? ""}
                onValueChange={(v) => updateField("gender", v || null)}
              >
                <SelectTrigger 
                  ref={(el) => {
                    if (el && registerFieldRef) {
                      registerFieldRef("gender", el)
                    }
                  }}
                  className={`h-8 w-auto text-sm ${inputClass("gender")}`}
                >
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>

             

              {/* Visit Date */}
              <Input
                ref={(el) => {
                  if (el && registerFieldRef) {
                    registerFieldRef("visitDate", el)
                  }
                }}
                type="date"
                value={data.visitDate ?? ""}
                onChange={(e) =>
                  updateField("visitDate", e.target.value || null)
                }
                className={`h-8 text-sm ${inputClass("visitDate")}`}
              />
            </div>
          </div>

          {/* TOGGLE BUTTON */}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="p-1 rounded-md hover:bg-muted transition"
          >
            {expanded ? (
              <Minus className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* EXPANDABLE SECTION - Contact Details Only */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            expanded
              ? "max-h-[200px] opacity-100"
              : "max-h-0 opacity-0 pointer-events-none"
          }`}
        >
          {/* Contact */}
          <div className="grid gap-2 md:grid-cols-3 pt-2">
            <Input
              value={data.contactNumber ?? ""}
              onChange={(e) =>
                updateField("contactNumber", e.target.value || null)
              }
              placeholder="Contact Number"
              className="h-8 text-sm"
            />

            <Input
              value={data.emergencyContact ?? ""}
              onChange={(e) =>
                updateField("emergencyContact", e.target.value || null)
              }
              placeholder="Emergency Contact"
              className="h-8 text-sm"
            />

            <Input
              value={data.insuranceId ?? ""}
              onChange={(e) =>
                updateField("insuranceId", e.target.value || null)
              }
              placeholder="Insurance ID"
              className="h-8 text-sm"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}