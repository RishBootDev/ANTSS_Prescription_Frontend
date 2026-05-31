"use client";

import { JSX, ReactElement } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign } from "lucide-react";
import { PatientData } from "../patient-form";

type Props = {
  data: PatientData;

  updateField: <K extends keyof PatientData>(
    field: K,
    value: PatientData[K]
  ) => void;

  inputClass?: (field: keyof PatientData) => string;

  wrapWithMic?: (
    fieldId: string,
    element: ReactElement<{ className?: string }>
  ) => JSX.Element;
};

export default function BillingPage({
  data,
  updateField,
  inputClass = () => "",
  wrapWithMic = (_, el) => el,
}: Props) {
  return (
    <Card>
      <CardHeader className="pb-1.5 px-3 pt-2.5">
        <CardTitle className="flex items-center gap-1.5 text-sm font-semibold">
          <DollarSign className="h-3.5 w-3.5 text-primary" />
          Billing
        </CardTitle>
      </CardHeader>

      <CardContent className="px-3 pb-2.5">
        <div className="grid gap-1">
          <Label className="text-[10px]">Payment</Label>
          {wrapWithMic(
            "payment",
            <Input
              value={data.payment ?? ""}
              onChange={(e) =>
                updateField("payment", e.target.value || null)
              }
              placeholder="Payment amount / status"
              className={inputClass("payment")}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}