"use client";

import { ReactElement, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Scale, Calendar } from "lucide-react";
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
      return (data.weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return null;
  }, [data.height, data.weight]);

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
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          
          {/* Blood Pressure */}
          <div className="grid gap-1">
            <Label className="text-[10px]">Blood pressure (mmHg)</Label>
            <div className="flex items-center gap-2">
              {wrapWithMic(
                "bloodPressureSystolic",
                <Input
                  ref={(el) => {
                    if (el && registerFieldRef) {
                      registerFieldRef("bloodPressureSystolic", el)
                    }
                  }}
                  type="number"
                  placeholder="Systolic"
                  value={data.bloodPressureSystolic ?? ""}
                  onChange={(e) =>
                    updateField(
                      "bloodPressureSystolic",
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className={inputClass("bloodPressureSystolic")}
                />
              )}

              <span className="text-muted-foreground text-sm">/</span>

              {wrapWithMic(
                "bloodPressureDiastolic",
                <Input
                  ref={(el) => {
                    if (el && registerFieldRef) {
                      registerFieldRef("bloodPressureDiastolic", el)
                    }
                  }}
                  type="number"
                  placeholder="Diastolic"
                  value={data.bloodPressureDiastolic ?? ""}
                  onChange={(e) =>
                    updateField(
                      "bloodPressureDiastolic",
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className={inputClass("bloodPressureDiastolic")}
                />
              )}
            </div>
          </div>

          {/* Pulse */}
          <div className="grid gap-1">
            <Label className="text-[10px]">Pulse (bpm)</Label>
            {wrapWithMic(
              "pulse",
              <Input
                ref={(el) => {
                  if (el && registerFieldRef) {
                    registerFieldRef("pulse", el)
                  }
                }}
                type="number"
                placeholder="bpm"
                value={data.pulse ?? ""}
                onChange={(e) =>
                  updateField(
                    "pulse",
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                className={inputClass("pulse")}
              />
            )}
          </div>

          {/* Height */}
          <div className="grid gap-1">
            <Label className="text-[10px]">Height (cm)</Label>
            {wrapWithMic(
              "height",
              <Input
                ref={(el) => {
                  if (el && registerFieldRef) {
                    registerFieldRef("height", el)
                  }
                }}
                type="number"
                placeholder="cm"
                value={data.height ?? ""}
                onChange={(e) =>
                  updateField(
                    "height",
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                className={inputClass("height")}
              />
            )}
          </div>

          {/* Weight */}
          <div className="grid gap-1">
            <Label className="text-[10px]">Weight (kg)</Label>
            {wrapWithMic(
              "weight",
              <Input
                ref={(el) => {
                  if (el && registerFieldRef) {
                    registerFieldRef("weight", el)
                  }
                }}
                type="number"
                placeholder="kg"
                value={data.weight ?? ""}
                onChange={(e) =>
                  updateField(
                    "weight",
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                className={inputClass("weight")}
              />
            )}
          </div>

          {/* BMI - Read Only */}
          <div className="grid gap-1">
            <Label className="text-[10px]">BMI</Label>
            <div className="flex items-center gap-2">
              <Scale className="h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="text"
                readOnly
                value={bmi ?? "---"}
                className="bg-muted/50 text-xs"
              />
            </div>
          </div>

          {/* Temperature */}
          <div className="grid gap-1">
            <Label className="text-[10px]">Temperature (°F)</Label>
            {wrapWithMic(
              "temperature",
              <Input
                ref={(el) => {
                  if (el && registerFieldRef) {
                    registerFieldRef("temperature", el)
                  }
                }}
                type="number"
                step="0.1"
                placeholder="°F"
                value={data.temperature ?? ""}
                onChange={(e) =>
                  updateField(
                    "temperature",
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                className={inputClass("temperature")}
              />
            )}
          </div>

          {/* SpO2 */}
          <div className="grid gap-1">
            <Label className="text-[10px]">SpO2 (%)</Label>
            {wrapWithMic(
              "oxygenSaturation",
              <Input
                ref={(el) => {
                  if (el && registerFieldRef) {
                    registerFieldRef("oxygenSaturation", el)
                  }
                }}
                type="number"
                placeholder="%"
                value={data.oxygenSaturation ?? ""}
                onChange={(e) =>
                  updateField(
                    "oxygenSaturation",
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                className={inputClass("oxygenSaturation")}
              />
            )}
          </div>

          {/* Blood Group */}
          <div className="grid gap-1">
            <Label className="text-[10px]">Blood Group</Label>
            <Select
              value={data.bloodGroup ?? ""}
              onValueChange={(value) => updateField("bloodGroup", value || null)}
            >
              <SelectTrigger 
                ref={(el) => {
                  if (el && registerFieldRef) {
                    registerFieldRef("bloodGroup", el)
                  }
                }}
                className={inputClass("bloodGroup")}
              >
                <SelectValue placeholder="Select" />
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

          {/* LMP Date */}
          <div className="grid gap-1">
            <Label className="text-[10px]">LMP</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  ref={(el) => {
                    if (el && registerFieldRef) {
                      registerFieldRef("lmp", el)
                    }
                  }}
                  variant="outline"
                  className={cn(
                    "h-8 justify-start text-left font-normal px-2 text-xs",
                    !data.lmp && "text-muted-foreground"
                  )}
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  {data.lmp ? format(new Date(data.lmp), "dd/MM/yyyy") : <span>Select date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={data.lmp ? new Date(data.lmp) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      updateField("lmp", date.toISOString().split('T')[0]);
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
