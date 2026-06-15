import React from "react";
import { MappedPatientInfo, MappedVital } from "@/types/prescription";

interface PatientInformationProps {
  patient: MappedPatientInfo;
  vitals: MappedVital[];
}

export const PatientInformation: React.FC<PatientInformationProps> = ({ patient, vitals }) => {
  // Find specific vital values
  const weightVital = vitals.find(v => v.label.toLowerCase().includes('weight'));
  const heightVital = vitals.find(v => v.label.toLowerCase().includes('height'));
  const bpVital = vitals.find(v => v.label.toLowerCase().includes('pressure') || v.label.toLowerCase() === 'bp');

  const weightVal = weightVital ? weightVital.value : '---';
  const heightVal = heightVital ? heightVital.value : '---';
  const bpVal = bpVital ? bpVital.value : '---';

  let bmiVal = '---';
  if (weightVital && heightVital) {
    const w = parseFloat(weightVital.value);
    const h = parseFloat(heightVital.value);
    if (w && h) {
      bmiVal = (w / Math.pow(h / 100, 2)).toFixed(2);
    }
  }

  // Other vitals (e.g. pulse, temp, spo2)
  const extraVitals: string[] = [];
  vitals.forEach(v => {
    const labelLower = v.label.toLowerCase();
    if (!labelLower.includes('weight') && !labelLower.includes('height') && !labelLower.includes('pressure') && labelLower !== 'bp') {
      extraVitals.push(`${v.label}: ${v.value} ${v.unit || ''}`);
    }
  });

  return (
    <div className="space-y-1 text-slate-900">
      {/* Row 1 */}
      <div className="flex justify-between items-center text-[12px] font-bold">
        <div>
          ID: {patient.prescriptionId} - {patient.name.toUpperCase()} ({patient.gender === 'Male' ? 'M' : patient.gender === 'Female' ? 'F' : 'O'}) / {patient.age} Y
        </div>
        <div>
          {patient.contactNumber && `Mob. No.: ${patient.contactNumber}`}
        </div>
        <div>
          Date: {patient.visitDate} {patient.visitTime && `@ ${patient.visitTime}`}
        </div>
      </div>
      {/* Row 2 */}
      <div className="text-[11px] leading-tight text-slate-800">
        Address: {patient.address?.toUpperCase() || 'PUNE'}
      </div>
      {/* Row 3: Vitals */}
      <div className="text-[11px] leading-tight text-slate-700">
        Weight (Kg): {weightVal}, Height (Cm): {heightVal} {bmiVal !== '---' && `(B.M.I. = ${bmiVal})`}, BP: {bpVal} mmHg
        {extraVitals.length > 0 && `, ${extraVitals.join(', ')}`}
      </div>
    </div>
  );
};
