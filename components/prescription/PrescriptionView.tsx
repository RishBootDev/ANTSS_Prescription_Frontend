"use client";

import { Printer } from "lucide-react";

// Prescription Data Types
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
  icon?: React.ReactNode;
}

export interface DiagnosticTest {
  id: string;
  name: string;
  priority: "routine" | "urgent";
  labName?: string;
}

export interface Investigation {
  id: number | string;
  investigationName: string;
  createdAt?: string;
}

export interface TestRequested {
  id: number | string;
  testName: string;
  createdAt?: string;
}

export interface Document {
  id: number | string;
  fileName: string;
  url: string;
}

export interface Prescription {
  // Clinic & Doctor Info
  clinic: {
    name: string;
    address: string;
    phone: string;
    timings?: string;
    logo?: string;
  };
  doctor: {
    name: string;
    qualification: string;
    registrationNo: string;
    specialization: string;
  };
  
  // Patient Info
  patient: {
    name: string;
    age: number;
    gender: "Male" | "Female" | "Other";
    abhaId?: string;
    contactNumber?: string;
    visitDate: string;
    prescriptionId: string;
    address?: string;
  };
  
  // Clinical Data
  vitals: Vital[];
  chiefComplaints: string[];
  clinicalFindings?: string[];
  pastHistory: string[];
  allergies: string[];
  diagnosis: string;
  
  // Treatment Plan
  medicines: Medicine[];
  diagnostics: DiagnosticTest[];
  advice: string[];
  followUp?: {
    days: number;
    note?: string;
    date?: string;
  };

  // New fields
  investigations: Investigation[];
  testRequested: TestRequested[];
  documents: Document[];
}

// Default Clinic & Doctor Info matching the reference layout
const defaultClinicInfo = {
  name: "SMS hospital",
  address: "B/503, Business Center, MG Road, Pune - 411000.",
  phone: "5465647658",
  timings: "Timing: 09:00 AM - 01:00 PM, 06:00 PM - 08:00 PM | Closed: Sunday",
  logo: "/_DOCTOR.jpeg"
};

const defaultDoctorInfo = {
  name: "Dr. Akshara",
  qualification: "M.S.",
  registrationNo: "MMC 2018",
  specialization: "General Physician"
};

const formatFrequency = (frequency: string) => {
  const normalized = frequency.trim().toLowerCase();

  const frequencyMap: Record<string, string> = {
    "1-0-0": "1 Morning",
    "once daily": "1 Daily",
    "daily": "1 Daily",
    "od": "1 Daily",
    "1-0-1": "1 Morning, 1 Night (After Food)",
    "twice daily": "1 Morning, 1 Night",
    "bd": "1 Morning, 1 Night",
    "1-1-1": "1 Morning, 1 Afternoon, 1 Night",
    "three times daily": "1 Morning, 1 Afternoon, 1 Night",
    "tds": "1 Morning, 1 Afternoon, 1 Night",
    "0-0-1": "1 Night (At Bedtime)",
    "bedtime": "1 At Bedtime",
    "hs": "1 At Bedtime"
  };

  return frequencyMap[normalized] || frequency;
};

const calculateTotalQty = (frequency: string, duration: string) => {
  // Try to parse days out of duration (e.g., "5 days" or "5")
  const daysMatch = duration.match(/(\d+)\s*day/i) || duration.match(/^(\d+)$/);
  if (!daysMatch) return null;
  const days = parseInt(daysMatch[1]);
  
  let perDay = 0;
  const normalizedFreq = frequency.toLowerCase().trim();
  if (normalizedFreq.includes('-')) {
    perDay = normalizedFreq.split('-').reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
  } else if (normalizedFreq === 'od' || normalizedFreq === 'once daily' || normalizedFreq === 'daily') {
    perDay = 1;
  } else if (normalizedFreq === 'bd' || normalizedFreq === 'twice daily') {
    perDay = 2;
  } else if (normalizedFreq === 'tds' || normalizedFreq === 'three times daily') {
    perDay = 3;
  } else if (normalizedFreq === 'hs' || normalizedFreq === 'bedtime') {
    perDay = 1;
  }
  
  if (days && perDay) {
    return days * perDay;
  }
  return null;
};

// Convert PatientData to Prescription format
export function convertPatientDataToPrescription(
  patientData: any,
  clinicInfo?: typeof defaultClinicInfo,
  doctorInfo?: typeof defaultDoctorInfo
): Prescription {
  const visitDateObj = new Date();
  
  // Format visit date as DD-MMM-YYYY
  const formattedVisitDate = visitDateObj.toLocaleDateString('en-IN', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  }).replace(/ /g, '-');
  
  // Convert vitals
  const vitals: Vital[] = [];
  if (patientData.bloodPressureSystolic || patientData.bloodPressureDiastolic) {
    vitals.push({
      label: "Blood Pressure",
      value: `${patientData.bloodPressureSystolic || '---'}/${patientData.bloodPressureDiastolic || '---'}`,
      unit: "mmHg"
    });
  }
  if (patientData.pulse) {
    vitals.push({
      label: "Pulse",
      value: patientData.pulse.toString(),
      unit: "bpm"
    });
  }
  if (patientData.temperature) {
    vitals.push({
      label: "Temperature",
      value: patientData.temperature.toString(),
      unit: "°F"
    });
  }
  if (patientData.oxygenSaturation) {
    vitals.push({
      label: "SpO2",
      value: patientData.oxygenSaturation.toString(),
      unit: "%"
    });
  }
  if (patientData.weight) {
    vitals.push({
      label: "Weight",
      value: patientData.weight.toString(),
      unit: "kg"
    });
  }
  if (patientData.height) {
    vitals.push({
      label: "Height",
      value: patientData.height.toString(),
      unit: "cm"
    });
  }

  // Convert complaints
  const chiefComplaints: string[] = [];
  if (patientData.complaints && patientData.complaints.length > 0) {
    patientData.complaints.forEach((c: any) => {
      if (c.complaint) {
        let str = c.complaint.toUpperCase();
        const details = [];
        if (c.severity) details.push(c.severity.toUpperCase());
        if (c.frequency) details.push(c.frequency.toUpperCase());
        if (c.duration) details.push(c.duration.toUpperCase());
        if (details.length > 0) {
          str += ` (${details.join(', ')})`;
        }
        chiefComplaints.push(str);
      }
    });
  } else if (patientData.chiefComplaint) {
    chiefComplaints.push(patientData.chiefComplaint.toUpperCase());
  }

  // Convert general examination to Clinical Findings
  const clinicalFindings: string[] = [];
  if (patientData.generalExamination) {
    patientData.generalExamination.split('\n').forEach((line: string) => {
      const trimmed = line.trim();
      if (trimmed) {
        clinicalFindings.push(trimmed.toUpperCase());
      }
    });
  }

  // Convert allergies and history
  const allergies: string[] = [];
  if (patientData.allergies) {
    allergies.push(patientData.allergies);
  }

  // Also check pastMedicalHistories array
  if (patientData.pastMedicalHistories && patientData.pastMedicalHistories.length > 0) {
    patientData.pastMedicalHistories.forEach((pmh: any) => {
      if (pmh.allergies) {
        allergies.push(pmh.allergies);
      }
    });
  }

  const pastHistory: string[] = [];
  if (patientData.medicalHistory) {
    pastHistory.push(patientData.medicalHistory);
  }
  if (patientData.currentMedications) {
    pastHistory.push(`Current Medications: ${patientData.currentMedications}`);
  }

  // Also check pastMedicalHistories array
  if (patientData.pastMedicalHistories && patientData.pastMedicalHistories.length > 0) {
    patientData.pastMedicalHistories.forEach((pmh: any) => {
      if (pmh.medicalHistory) {
        pastHistory.push(pmh.medicalHistory);
      }
      if (pmh.currentMedicine) {
        pastHistory.push(`Current Medications: ${pmh.currentMedicine}`);
      }
    });
  }

  // Convert diagnosis
  let diagnosis = "";
  if (patientData.diagnoses && patientData.diagnoses.length > 0) {
    diagnosis = patientData.diagnoses.map((d: any) => 
      `${d.diagnosis.toUpperCase()}${d.snomedCode ? ` (${d.snomedCode})` : ''}`
    ).join(", ");
  }

  // Convert medicines
  const medicines: Medicine[] = patientData.medicines?.map((m: any) => ({
    id: m.id || Math.random().toString(36).substr(2, 9),
    genericName: m.medicineName || m.name || "Unknown Medicine",
    brandName: m.medicineName || m.name,
    dosage: m.dosage || m.dose || "---",
    frequency: m.frequency || "---",
    instructions: m.instructions || "",
    duration: m.duration || "---"
  })) || [];

  // Convert diagnostics/tests from testRequested array
  const diagnostics: DiagnosticTest[] = [];
  
  // From testRequested array (new structure)
  if (patientData.testRequested && patientData.testRequested.length > 0) {
    patientData.testRequested.forEach((tr: any, i: number) => {
      if (tr.testName) {
        diagnostics.push({
          id: tr.id || `test-${i}`,
          name: tr.testName,
          priority: "routine"
        });
      }
    });
  }
  
  // Fallback to old testsRequested string field
  if (patientData.testsRequested && typeof patientData.testsRequested === 'string') {
    patientData.testsRequested.split(',').forEach((test: string, i: number) => {
      const trimmed = test.trim();
      if (trimmed) {
        diagnostics.push({
          id: `test-${i}`,
          name: trimmed,
          priority: "routine"
        });
      }
    });
  }

  // Convert documents array
  const documents: Document[] = [];
  if (patientData.documents && patientData.documents.length > 0) {
    patientData.documents.forEach((doc: any, i: number) => {
      documents.push({
        id: doc.id || `doc-${i}`,
        fileName: doc.fileName,
        url: doc.url
      });
    });
  }

  // Convert advice
  const advice: string[] = [];
  if (patientData.advice) {
    patientData.advice.split('\n').forEach((line: string) => {
      const trimmed = line.trim();
      if (trimmed) advice.push(trimmed.toUpperCase());
    });
  }

  // Convert follow-up
  let followUp = undefined;
  if (patientData.followUp) {
    const days = parseInt(patientData.followUp) || 5;
    const dateObj = new Date();
    dateObj.setDate(dateObj.getDate() + days);
    const formattedFollowUpDate = dateObj.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).replace(/ /g, '-');
    
    followUp = {
      days,
      note: `Review after ${days} days`,
      date: formattedFollowUpDate
    };
  }

  return {
    clinic: clinicInfo || defaultClinicInfo,
    doctor: doctorInfo || defaultDoctorInfo,
    patient: {
      name: patientData.name || "Unknown Patient",
      age: patientData.age || 0,
      gender: patientData.gender || "Other",
      abhaId: undefined,
      contactNumber: patientData.contactNumber || undefined,
      visitDate: formattedVisitDate,
      prescriptionId: patientData.registrationNumber || patientData.registrationId?.toString() || `RX-${visitDateObj.getTime().toString().slice(-6)}`,
      address: patientData.address || "PUNE"
    },
    vitals,
    chiefComplaints,
    clinicalFindings,
    pastHistory,
    allergies,
    diagnosis,
    medicines,
    diagnostics,
    advice,
    followUp,
    investigations,
    testRequested: patientData.testRequested && patientData.testRequested.length > 0 
      ? patientData.testRequested.map((tr: any, i: number) => ({
          id: tr.id || `test-${i}`,
          testName: tr.testName,
          createdAt: tr.createdAt
        }))
      : diagnostics.map(d => ({ id: d.id, testName: d.name })), // For backward compatibility
    documents
  };
}

export default function PrescriptionView({ 
  prescription 
}: { 
  prescription: Prescription 
}) {
  const handlePrint = () => {
    window.print();
  };

  // Find specific vital values
  const weightVital = prescription.vitals.find(v => v.label.toLowerCase().includes('weight'));
  const heightVital = prescription.vitals.find(v => v.label.toLowerCase().includes('height'));
  const bpVital = prescription.vitals.find(v => v.label.toLowerCase().includes('pressure') || v.label.toLowerCase() === 'bp');

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

  // Other vitals
  const extraVitals: string[] = [];
  prescription.vitals.forEach(v => {
    const labelLower = v.label.toLowerCase();
    if (!labelLower.includes('weight') && !labelLower.includes('height') && !labelLower.includes('pressure') && labelLower !== 'bp') {
      extraVitals.push(`${v.label}: ${v.value} ${v.unit || ''}`);
    }
  });

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 flex flex-col items-center justify-start print:bg-white print:py-0 print:px-0">
      
      {/* Control bar - Hidden during print */}
      <div className="w-[210mm] max-w-full mb-6 flex justify-between items-center no-print">
        <span className="text-sm font-semibold text-slate-600">Prescription Preview (A4 Size)</span>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-md text-sm font-medium"
        >
          <Printer className="w-4 h-4" />
          Print Prescription
        </button>
      </div>

      {/* Main A4 Document Container */}
      <div className="w-[210mm] min-h-[297mm] bg-white text-black font-serif shadow-2xl p-[15mm] flex flex-col justify-between relative print:shadow-none print:w-full print:h-full print:p-0 print:m-0 print:min-h-0 print:overflow-visible">
        
        {/* Top & Body Container */}
        <div>
          
          {/* Header Block */}
          <div className="flex justify-between items-start gap-4">
            {/* Left Column: Doctor Details */}
            <div className="w-[38%] text-left">
              <h2 className="text-lg font-bold text-slate-900 leading-tight">{prescription.doctor.name}</h2>
              <p className="text-xs text-slate-800 font-medium mt-0.5">{prescription.doctor.qualification}</p>
              <p className="text-[11px] text-slate-600 mt-1">Reg. No: {prescription.doctor.registrationNo}</p>
              {prescription.doctor.specialization && (
                <p className="text-[11px] text-slate-500 mt-0.5">{prescription.doctor.specialization}</p>
              )}
            </div>
            
            {/* Center Column: Logo */}
            <div className="w-[24%] flex justify-center items-center">
              <img 
                src={prescription.clinic.logo || "/_DOCTOR.jpeg"} 
                alt="Clinic Logo" 
                className="h-14 w-auto object-contain max-h-14 max-w-full" 
              />
            </div>

            {/* Right Column: Clinic Details */}
            <div className="w-[38%] text-right">
              <h1 className="text-xl font-bold text-blue-600 leading-tight uppercase">{prescription.clinic.name}</h1>
              <p className="text-[11px] text-slate-800 mt-1 leading-normal">{prescription.clinic.address}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                Ph: {prescription.clinic.phone} <br />
                {prescription.clinic.timings || "Timing: 09:00 AM - 01:00 PM, 06:00 PM - 08:00 PM | Closed: Sunday"}
              </p>
            </div>
          </div>

          {/* Thin grey separator */}
          <div className="border-b border-slate-300 my-3" />

          {/* Patient Information Block */}
          <div className="space-y-1 text-slate-900">
            {/* Row 1 */}
            <div className="flex justify-between items-center text-[12px] font-bold">
              <div>
                ID: {prescription.patient.prescriptionId} - {prescription.patient.name.toUpperCase()} ({prescription.patient.gender === 'Male' ? 'M' : prescription.patient.gender === 'Female' ? 'F' : 'O'}) / {prescription.patient.age} Y
              </div>
              <div>
                {prescription.patient.contactNumber && `Mob. No.: ${prescription.patient.contactNumber}`}
              </div>
              <div>
                Date: {prescription.patient.visitDate}
              </div>
            </div>
            {/* Row 2 */}
            <div className="text-[11px] leading-tight text-slate-800">
              Address: {prescription.patient.address?.toUpperCase() || 'PUNE'}
            </div>
            {/* Row 3: Vitals */}
            <div className="text-[11px] leading-tight text-slate-700">
              Weight (Kg): {weightVal}, Height (Cm): {heightVal} {bmiVal !== '---' && `(B.M.I. = ${bmiVal})`}, BP: {bpVal} mmHg
              {extraVitals.length > 0 && `, ${extraVitals.join(', ')}`}
            </div>
          </div>

          {/* Thin grey separator */}
          <div className="border-b border-slate-300 my-3" />

          {/* Two Column Layout: Chief Complaints & Clinical Findings */}
          <div className="grid grid-cols-2 border-t border-b border-slate-300 py-3.5 gap-x-6">
            
            {/* Left Column: Chief Complaints */}
            <div className="border-r border-slate-300 pr-4">
              <h3 className="text-[12px] font-bold text-slate-900 mb-2 uppercase tracking-wide">Chief Complaints</h3>
              {prescription.chiefComplaints && prescription.chiefComplaints.length > 0 ? (
                <ul className="space-y-1.5">
                  {prescription.chiefComplaints.map((item, index) => (
                    <li key={index} className="text-[11px] text-slate-800 flex items-start gap-1">
                      <span className="font-bold">*</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px] text-slate-400 italic">None reported</p>
              )}
            </div>

            {/* Right Column: Clinical Findings */}
            <div className="pl-2">
              <h3 className="text-[12px] font-bold text-slate-900 mb-2 uppercase tracking-wide">Clinical Findings</h3>
              {prescription.clinicalFindings && prescription.clinicalFindings.length > 0 ? (
                <ul className="space-y-1.5">
                  {prescription.clinicalFindings.map((item, index) => (
                    <li key={index} className="text-[11px] text-slate-800 flex items-start gap-1">
                      <span className="font-bold">*</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px] text-slate-400 italic">None noted</p>
              )}
            </div>
          </div>

          {/* Diagnosis Section */}
          <div className="mt-4">
            <h3 className="text-[12px] font-bold text-slate-900 mb-1.5 uppercase tracking-wide">Diagnosis:</h3>
            {prescription.diagnosis ? (
              <ul className="space-y-1">
                {prescription.diagnosis.split(',').map((diag, index) => (
                  <li key={index} className="text-[11px] text-slate-800 flex items-start gap-1 font-semibold">
                    <span className="font-bold">*</span>
                    <span>{diag.trim()}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[11px] text-slate-400 italic">None entered</p>
            )}
          </div>

          {/* Thin grey separator */}
          <div className="border-b border-slate-300 my-4" />

          {/* Rx Section */}
          <div className="mt-3">
            <div className="text-xl font-bold text-slate-900 font-serif italic mb-2.5">Rx</div>
            
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-t border-b border-slate-400 text-[11px] font-bold text-slate-900">
                  <th className="text-left py-2 w-[55%]">Medicine Name</th>
                  <th className="text-left py-2 w-[30%]">Dosage</th>
                  <th className="text-left py-2 w-[15%]">Duration</th>
                </tr>
              </thead>
              <tbody>
                {prescription.medicines && prescription.medicines.length > 0 ? (
                  prescription.medicines.map((med, index) => {
                    const totalQty = calculateTotalQty(med.frequency, med.duration);
                    return (
                      <tr key={med.id || index} className="border-b border-slate-200 text-[11px] text-slate-800 align-top">
                        {/* Name Column */}
                        <td className="py-2.5 pr-4">
                          <div className="font-bold text-slate-900">{index + 1}) {med.brandName?.toUpperCase() || med.genericName?.toUpperCase()}</div>
                          {/* Generic Composition in small blue capital text */}
                          {med.genericName && med.genericName !== med.brandName && (
                            <div className="text-[9px] text-blue-600 font-bold uppercase mt-0.5 tracking-wide">
                              {med.genericName}
                            </div>
                          )}
                        </td>
                        
                        {/* Dosage Column */}
                        <td className="py-2.5 pr-4">
                          <div className="font-semibold text-slate-900">{formatFrequency(med.frequency)}</div>
                          {med.instructions && (
                            <div className="text-[10px] text-slate-500 mt-0.5 italic">
                              ({med.instructions})
                            </div>
                          )}
                        </td>
                        
                        {/* Duration Column */}
                        <td className="py-2.5">
                          <div className="font-semibold text-slate-900">{med.duration}</div>
                          {totalQty !== null && (
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              (Tot: {totalQty} Tab)
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-[11px] text-slate-400 italic">
                      No medicines prescribed
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Advice Section */}
          {prescription.advice && prescription.advice.length > 0 && (
            <div className="mt-5">
              <h3 className="text-[12px] font-bold text-slate-900 mb-1.5 uppercase tracking-wide">Advice:</h3>
              <ul className="space-y-1">
                {prescription.advice.map((item, index) => (
                  <li key={index} className="text-[11px] text-slate-800 flex items-start gap-1">
                    <span className="font-bold">*</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Bottom Area (Follow Up, Signature, Footer) */}
        <div className="mt-12">
          {/* Follow Up & Doctor Signature Block */}
          <div className="flex justify-between items-end mb-6">
            <div className="text-[12px] font-bold text-slate-900">
              {prescription.followUp && (
                <span>Follow Up: {prescription.followUp.date}</span>
              )}
            </div>
            
            {/* Signature Placement */}
            <div className="text-center pr-4">
              <div className="h-14 w-36 border-b border-dashed border-slate-300 mb-1"></div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Doctor Signature / Stamp</div>
            </div>
          </div>

          {/* Footer Divider & Disclaimer */}
          <div className="border-t border-slate-300 pt-2 text-center">
            <p className="text-[10px] text-slate-500 italic">
              Substitute with equivalent Generics as required.
            </p>
          </div>
        </div>
      </div>

      {/* Global CSS style overrides for accurate A4 print layouts */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          
          /* Enforce backgrounds/colors */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          html, body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            font-family: 'Times New Roman', Times, serif !important;
          }
          
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}