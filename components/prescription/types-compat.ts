import { ReactNode } from "react";

export interface Medicine {
  id: string;
  genericName: string;
  brandName?: string;
  dosage: string;
  frequency: string;
  instructions: string;
  duration: string;
}

export interface Vital {
  label: string;
  value: string;
  unit: string;
  icon?: ReactNode;
}

export interface DiagnosticTest {
  id: string;
  name: string;
  priority: "routine" | "urgent";
  labName?: string;
}
