import React from "react";
import { MappedPatientInfo, MappedVital } from "@/types/prescription";

interface PatientInformationProps {
  patient: MappedPatientInfo;
  vitals: MappedVital[];
}

export const PatientInformation: React.FC<PatientInformationProps> = ({ patient, vitals }) => {
  const weightVital = vitals.find(v => v.label.toLowerCase().includes('weight'));
  const heightVital = vitals.find(v => v.label.toLowerCase().includes('height'));

  let bmiVal: string | null = null;
  if (weightVital && heightVital) {
    const w = parseFloat(weightVital.value);
    const h = parseFloat(heightVital.value);
    if (w && h) {
      bmiVal = (w / Math.pow(h / 100, 2)).toFixed(2);
    }
  }

  const vitalText = vitals
    .filter((v) => String(v.value ?? "").trim())
    .map((v) => `${v.label}: ${v.value}${v.unit ? ` ${v.unit}` : ""}`);

  if (bmiVal) {
    vitalText.push(`BMI: ${bmiVal}`);
  }

  const demographics = [
    patient.gender
      ? patient.gender === "Male"
        ? "M"
        : patient.gender === "Female"
          ? "F"
          : patient.gender
      : "",
    patient.age ? `${patient.age} Y` : "",
  ].filter(Boolean);
  const patientLabel = patient.name
    ? `${patient.name.toUpperCase()}${demographics.length ? ` (${demographics.join(" / ")})` : ""}`
    : "";
  const identityParts = [
    patient.prescriptionId ? `ID: ${patient.prescriptionId}` : "",
    patientLabel,
  ].filter(Boolean);

  return (
    <div className="space-y-1 text-slate-900">
      {/* Row 1 */}
      <div className="flex justify-between items-center text-[12px] font-bold">
        {identityParts.length > 0 && <div>{identityParts.join(" - ")}</div>}
        {patient.contactNumber && <div>Mob. No.: {patient.contactNumber}</div>}
        {patient.visitDate && (
          <div>
            Date: {patient.visitDate} {patient.visitTime && `@ ${patient.visitTime}`}
          </div>
        )}
      </div>
      {/* Row 2 */}
      {patient.address && (
        <div className="text-[11px] leading-tight text-slate-800">
          Address: {patient.address.toUpperCase()}
        </div>
      )}
      {/* Row 3: Vitals */}
      {vitalText.length > 0 && (
        <div className="text-[11px] leading-tight text-slate-700">
          {vitalText.join(", ")}
        </div>
      )}
    </div>
  );
};
