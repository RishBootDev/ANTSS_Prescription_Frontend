"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Thermometer, 
  Activity, 
  AlertTriangle, 
  Stethoscope, 
  TestTube, 
  QrCode,
  Printer,
  Calendar,
  User,
  Phone,
  MapPin,
  FileText,
  FileUp,
  ClipboardList
} from "lucide-react";

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
  icon: React.ReactNode;
  trend?: "up" | "down" | "normal";
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
  };
  
  // Clinical Data
  vitals: Vital[];
  chiefComplaints: string[];
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
  };

  // New fields
  investigations: Investigation[];
  testRequested: TestRequested[];
  documents: Document[];
}

// Default Clinic & Doctor Info (can be customized)
const defaultClinicInfo = {
  name: "City Medical Center",
  address: "123 Health Street, Medical District, City - 400001",
  phone: "+91 98765 43210"
};

const defaultDoctorInfo = {
  name: "Dr. Rajesh Kumar",
  qualification: "MBBS, MD (General Medicine)",
  registrationNo: "MMC-12345",
  specialization: "General Physician"
};

const formatFrequency = (frequency: string) => {
  const normalized = frequency.trim().toLowerCase();

  const frequencyMap: Record<string, string> = {
    "1-0-0": "OD",
    "once daily": "OD",
    daily: "OD",
    od: "OD",
    "1-0-1": "BD",
    "twice daily": "BD",
    bd: "BD",
    "1-1-1": "TDS",
    "three times daily": "TDS",
    tds: "TDS",
    "0-0-1": "HS",
    bedtime: "HS",
    hs: "HS"
  };

  return frequencyMap[normalized] || frequency;
};

// Helper to convert PatientData to Prescription format
export function convertPatientDataToPrescription(
  patientData: any,
  clinicInfo?: typeof defaultClinicInfo,
  doctorInfo?: typeof defaultDoctorInfo
): Prescription {
  const visitDate = new Date();
  
  // Convert vitals
  const vitals: Vital[] = [];
  if (patientData.bloodPressureSystolic || patientData.bloodPressureDiastolic) {
    vitals.push({
      label: "Blood Pressure",
      value: `${patientData.bloodPressureSystolic || '---'}/${patientData.bloodPressureDiastolic || '---'}`,
      unit: "mmHg",
      icon: <Activity className="w-4 h-4" />
    });
  }
  if (patientData.pulse) {
    vitals.push({
      label: "Pulse",
      value: patientData.pulse.toString(),
      unit: "bpm",
      icon: <Thermometer className="w-4 h-4" />
    });
  }
  if (patientData.temperature) {
    vitals.push({
      label: "Temperature",
      value: patientData.temperature.toString(),
      unit: "°F",
      icon: <Thermometer className="w-4 h-4" />
    });
  }
  if (patientData.oxygenSaturation) {
    vitals.push({
      label: "SpO2",
      value: patientData.oxygenSaturation.toString(),
      unit: "%",
      icon: <Activity className="w-4 h-4" />
    });
  }
  if (patientData.weight) {
    vitals.push({
      label: "Weight",
      value: patientData.weight.toString(),
      unit: "kg",
      icon: <Activity className="w-4 h-4" />
    });
  }
  if (patientData.height) {
    vitals.push({
      label: "Height",
      value: patientData.height.toString(),
      unit: "cm",
      icon: <Activity className="w-4 h-4" />
    });
  }

  // Convert chief complaints - only from the consolidated complaints table
  // First row maps to "Chief Complaint", subsequent rows as "Associated Complaints"
  const chiefComplaints: string[] = [];
  if (patientData.complaints && patientData.complaints.length > 0) {
    patientData.complaints.forEach((c: any, index: number) => {
      if (c.complaintName || c.complaint) {
        // Build a structured complaint string with frequency, severity, duration
        let complaintStr = c.complaintName || c.complaint;
        const parts = [];
        if (c.complaintFrequency || c.frequency) parts.push(c.complaintFrequency || c.frequency);
        if (c.severity) parts.push(c.severity);
        if (c.complaintDuration || c.duration) parts.push(c.complaintDuration || c.duration);
        if (parts.length > 0) {
          complaintStr += ` (${parts.join(', ')})`;
        }
        // First complaint is the Chief Complaint, rest are Associated
        if (index === 0) {
          chiefComplaints.unshift(complaintStr);
        } else {
          chiefComplaints.push(complaintStr);
        }
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
  let diagnosis = "Diagnosis Pending";
  if (patientData.diagnoses && patientData.diagnoses.length > 0) {
    diagnosis = patientData.diagnoses.map((d: any) => 
      `${d.diagnosisName || d.diagnosis}${d.diagnosisCode || d.snomedCode ? ` (${d.diagnosisCode || d.snomedCode})` : ''}`
    ).join(", ");
  }

  // Convert medicines
  const medicines: Medicine[] = patientData.medicines?.map((m: any) => ({
    id: m.id || Math.random().toString(36).substr(2, 9),
    genericName: m.medicineName || m.name || "Unknown Medicine",
    brandName: m.medicineName || m.name,
    dosage: m.dosage || m.dose || "---",
    frequency: m.frequency || "---",
    instructions: m.instruction || m.instructions || "As directed",
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

  // Convert investigations array
  const investigations: Investigation[] = [];
  if (patientData.investigations && patientData.investigations.length > 0) {
    patientData.investigations.forEach((inv: any, i: number) => {
      if (inv.investigationName) {
        investigations.push({
          id: inv.id || `inv-${i}`,
          investigationName: inv.investigationName,
          createdAt: inv.createdAt
        });
      }
    });
  }
  
  // Fallback to old investigations string field
  if (patientData.investigations && typeof patientData.investigations === 'string') {
    patientData.investigations.split(',').forEach((test: string, i: number) => {
      const trimmed = test.trim();
      if (trimmed) {
        investigations.push({
          id: `inv-${i}`,
          investigationName: trimmed
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
      if (trimmed) advice.push(trimmed);
    });
  }

  // Convert follow-up
  let followUp = undefined;
  if (patientData.nextVisit) {
    followUp = {
      days: 5, // Default
      note: patientData.nextVisit
    };
  }
  if (patientData.followUp) {
    followUp = {
      days: parseInt(patientData.followUp) || 5,
      note: `Follow-up after ${patientData.followUp} days`
    };
  }

  return {
    clinic: clinicInfo || defaultClinicInfo,
    doctor: doctorInfo || defaultDoctorInfo,
    patient: {
      name: patientData.name || "Unknown Patient",
      age: patientData.age || 0,
      gender: patientData.gender || "Other",
      abhaId: undefined, // Can be added if available
      contactNumber: patientData.contactNumber || undefined,
      visitDate: visitDate.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      }),
      prescriptionId: `RX-${visitDate.getTime().toString().slice(-8)}`
    },
    vitals,
    chiefComplaints,
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

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 print-container">
      {/* Print Button - Hidden during print */}
      <div className="no-print mb-6 flex justify-end">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors shadow-lg"
        >
          <Printer className="w-5 h-5" />
          Print Prescription
        </button>
      </div>

      {/* Main Prescription Container - A4 Optimized */}
      <div className="print-wrapper">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 print:bg-slate-900 print:text-white">
          <div className="flex justify-between items-start">
            {/* Clinic Branding */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{prescription.clinic.name}</h1>
              <div className="flex flex-col gap-1 text-sm opacity-90">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{prescription.clinic.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{prescription.clinic.phone}</span>
                </div>
              </div>
            </div>

            {/* Doctor Details */}
            <div className="text-right ml-8">
              <h2 className="text-xl font-semibold mb-1">{prescription.doctor.name}</h2>
              <p className="text-sm opacity-90 mb-1">{prescription.doctor.qualification}</p>
              <p className="text-sm opacity-90 mb-1">{prescription.doctor.specialization}</p>
              <p className="text-sm font-medium text-teal-300">Reg. No: {prescription.doctor.registrationNo}</p>
            </div>
          </div>
        </div>

        {/* Prescription Info Bar */}
        <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 print:bg-slate-100">
          <div className="flex justify-between items-center text-sm">
            <div className="flex gap-6">
              <span className="font-medium">Rx ID: {prescription.patient.prescriptionId}</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {prescription.patient.visitDate}
              </span>
            </div>
            {prescription.patient.abhaId && (
              <div className="flex items-center gap-2 bg-white px-3 py-1 rounded border border-slate-300">
                <QrCode className="w-4 h-4 text-teal-600" />
                <span className="font-mono text-xs">ABHA: {prescription.patient.abhaId}</span>
              </div>
            )}
          </div>
        </div>

        <CardContent className="p-6 space-y-6">
          
          {/* Patient Info Bar */}
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-200 print:bg-slate-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{prescription.patient.name}</h3>
                <p className="text-sm text-slate-600">
                  {prescription.patient.age} years • {prescription.patient.gender}
                  {prescription.patient.contactNumber && ` • ${prescription.patient.contactNumber}`}
                </p>
              </div>
            </div>
          </div>

          {/* Vitals Card */}
          <Card className="border-l-4 border-l-teal-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-600" />
                Vital Signs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {prescription.vitals.map((vital, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="text-teal-600">{vital.icon}</div>
                    <div>
                      <div className="text-sm font-semibold">
                        {vital.value} <span className="text-xs font-normal text-slate-500">{vital.unit}</span>
                      </div>
                      <div className="text-xs text-slate-500">{vital.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Clinical Context - Two Columns */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Chief Complaints */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-teal-600" />
                  Chief Complaints
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {prescription.chiefComplaints.map((complaint, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-teal-500 mt-1">•</span>
                      <span>{complaint}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Past History & Allergies */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-5 h-5 text-teal-600" />
                    Past History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {prescription.pastHistory.map((history, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-teal-500 mt-1">•</span>
                        <span>{history}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Allergies Alert Box */}
              {prescription.allergies.length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-800 text-sm mb-1">Allergies</h4>
                      <ul className="space-y-1">
                        {prescription.allergies.map((allergy, index) => (
                          <li key={index} className="text-sm text-red-700">
                            • {allergy}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Diagnosis */}
          <div className="bg-teal-50 border border-teal-200 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-teal-800 mb-1">Diagnosis</h4>
            <p className="text-lg font-bold text-teal-900">{prescription.diagnosis}</p>
          </div>

          {/* Medicines - Rx Section */}
          <Card className="rx-section rounded-none border border-slate-400 shadow-none">
            <CardHeader className="px-2 py-1">
              <CardTitle className="text-sm font-semibold">
                Prescription (Rx)
              </CardTitle>
            </CardHeader>

            <CardContent className="rx-table-content p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-400 text-xs leading-tight">
                  <thead>
                    <tr>
                      <th className="w-[4%] border border-slate-400 px-1 py-[3px] text-left font-semibold">#</th>
                      <th className="w-[22%] border border-slate-400 px-1 py-[3px] text-left font-semibold">Medicine</th>
                      <th className="w-[8%] border border-slate-400 px-1 py-[3px] text-left font-semibold">Strength</th>
                      <th className="w-[8%] border border-slate-400 px-1 py-[3px] text-left font-semibold">Dose</th>
                      <th className="w-[8%] border border-slate-400 px-1 py-[3px] text-left font-semibold">Frequency</th>
                      <th className="w-[8%] border border-slate-400 px-1 py-[3px] text-left font-semibold">Duration</th>
                      <th className="w-[28%] border border-slate-400 px-1 py-[3px] text-left font-semibold">Instructions</th>
                      <th className="w-[10%] border border-slate-400 px-1 py-[3px] text-center font-semibold print:hidden">Tracker</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescription.medicines.map((medicine, index) => (
                      <tr key={medicine.id}>
                        <td className="border border-slate-400 px-1 py-[3px] align-top">
                          {index + 1}
                        </td>
                        <td className="border border-slate-400 px-1 py-[3px] align-top">
                          <div className="font-semibold">{medicine.genericName}</div>
                          {medicine.brandName && medicine.brandName !== medicine.genericName && (
                            <div className="text-[10px] leading-tight text-slate-500">
                              {medicine.brandName}
                            </div>
                          )}
                        </td>
                        <td className="border border-slate-400 px-1 py-[3px] align-top">
                          {medicine.dosage}
                        </td>
                        <td className="border border-slate-400 px-1 py-[3px] align-top">
                          {medicine.frequency}
                        </td>
                        <td className="border border-slate-400 px-1 py-[3px] align-top">
                          {formatFrequency(medicine.frequency)}
                        </td>
                        <td className="border border-slate-400 px-1 py-[3px] align-top">
                          {medicine.duration}
                        </td>
                        <td className="border border-slate-400 px-1 py-[3px] align-top text-[10px] leading-tight text-slate-600">
                          {medicine.instructions}
                        </td>
                        <td className="border border-slate-400 px-1 py-[3px] print:hidden">
                          <div className="flex justify-center gap-[2px]">
                            {Array.from({ length: 7 }, (_, i) => (
                              <span
                                key={i}
                                className="block h-3 w-3 border border-slate-400"
                                aria-hidden="true"
                              />
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Investigations */}
          {prescription.investigations && prescription.investigations.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TestTube className="w-5 h-5 text-teal-600" />
                  Investigations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {prescription.investigations.map((inv, index) => (
                    <div key={inv.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                      <span className="text-teal-500 font-medium">{index + 1}.</span>
                      <span className="text-sm font-medium">{inv.investigationName}</span>
                      {inv.createdAt && (
                        <span className="text-xs text-slate-500 ml-auto">
                          {new Date(inv.createdAt).toLocaleDateString('en-IN')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Test Requested */}
          {prescription.testRequested && prescription.testRequested.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-teal-600" />
                  Tests Requested
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {prescription.testRequested.map((test, index) => (
                    <div key={test.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                      <span className="text-teal-500 font-medium">{index + 1}.</span>
                      <span className="text-sm font-medium">{test.testName}</span>
                      {test.createdAt && (
                        <span className="text-xs text-slate-500 ml-auto">
                          {new Date(test.createdAt).toLocaleDateString('en-IN')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          {prescription.documents && prescription.documents.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileUp className="w-5 h-5 text-teal-600" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {prescription.documents.map((doc, index) => (
                    <div key={doc.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                      <span className="text-teal-500 font-medium">{index + 1}.</span>
                      <span className="text-sm font-medium">{doc.fileName}</span>
                      {doc.url && (
                        <a 
                          href={doc.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-teal-600 hover:underline ml-auto"
                        >
                          View Document
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Diagnostics (Legacy - for backward compatibility) */}
          {prescription.diagnostics && prescription.diagnostics.length > 0 && 
           (!prescription.testRequested || prescription.testRequested.length === 0) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TestTube className="w-5 h-5 text-teal-600" />
                  Diagnostic Tests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {prescription.diagnostics.map((test) => (
                    <div key={test.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          test.priority === "urgent" ? "bg-red-500" : "bg-teal-500"
                        }`} />
                        <div>
                          <p className="font-medium text-sm">{test.name}</p>
                          {test.labName && (
                            <p className="text-xs text-slate-500">{test.labName}</p>
                          )}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        test.priority === "urgent" 
                          ? "bg-red-100 text-red-700" 
                          : "bg-teal-100 text-teal-700"
                      }`}>
                        {test.priority.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Advice */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                Medical Advice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid md:grid-cols-2 gap-2">
                {prescription.advice.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm p-2 bg-slate-50 rounded">
                    <span className="text-teal-500 mt-1">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Follow Up */}
          {prescription.followUp && (
            <div className="bg-slate-100 p-4 rounded-lg border-l-4 border-teal-500">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-5 h-5 text-teal-600" />
                <h4 className="font-semibold text-slate-900">Follow Up</h4>
              </div>
              <p className="text-slate-700">
                After <span className="font-bold text-teal-700">{prescription.followUp.days} days</span>
                {prescription.followUp.note && (
                  <span className="text-slate-600"> — {prescription.followUp.note}</span>
                )}
              </p>
            </div>
          )}
        </CardContent>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 print:bg-slate-50">
          <div className="flex justify-between items-center text-xs text-slate-500">
            <div>
              <p>Generated on {new Date().toLocaleString('en-IN')}</p>
              <p className="mt-1">This is a computer-generated prescription. No signature required.</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-slate-700">{prescription.clinic.name}</p>
              <p>Page 1 of 1</p>
            </div>
          </div>
        </div>
      </div>

      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 16mm;
          }
          
          /* Force background colors and images to print */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          /* Reset body and html */
          html, body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
          }
          
          /* Hide non-print elements */
          .no-print,
          .print\\:hidden {
            display: none !important;
          }
          
          /* Print container - center and size for A4 */
          .print-container {
            min-height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
          }
          
          /* Print wrapper - fixed width for A4 */
          .print-wrapper {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            background: white !important;
          }
          
          /* Remove all shadows */
          .print-wrapper,
          .print-wrapper * {
            box-shadow: none !important;
          }
          
          /* Ensure background colors print */
          .bg-gradient-to-r {
            background: #0f172a !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Card styles for print */
          .print-wrapper [data-slot="card"] {
            border: 1px solid #e2e8f0 !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          /* Remove hover effects */
          .print-wrapper [data-slot="card"]:hover {
            border-color: #e2e8f0 !important;
          }
          
          /* Ensure proper spacing */
          .print-wrapper [data-slot="card-content"] {
            padding: 12px 16px !important;
          }

          .print-wrapper .rx-section {
            border: 1px solid #94a3b8 !important;
          }

          .print-wrapper .rx-section [data-slot="card-header"] {
            padding: 4px 8px !important;
          }

          .print-wrapper .rx-table-content {
            padding: 0 !important;
          }

          .print-wrapper .rx-section table,
          .print-wrapper .rx-section th,
          .print-wrapper .rx-section td {
            border: 1px solid #94a3b8 !important;
          }

          .print-wrapper .rx-section th,
          .print-wrapper .rx-section td {
            padding: 3px 4px !important;
            line-height: 1.15 !important;
          }
          
          .print-wrapper [data-slot="card-header"] {
            padding: 8px 16px !important;
          }
          
          /* Typography adjustments */
          .print-wrapper h1 {
            font-size: 18px !important;
            font-weight: 700 !important;
          }
          
          .print-wrapper h2 {
            font-size: 14px !important;
            font-weight: 600 !important;
          }
          
          .print-wrapper h3 {
            font-size: 14px !important;
            font-weight: 600 !important;
          }
          
          .print-wrapper h4 {
            font-size: 12px !important;
            font-weight: 600 !important;
          }
          
          .print-wrapper p,
          .print-wrapper span,
          .print-wrapper li {
            font-size: 11px !important;
            line-height: 1.5 !important;
          }
          
          /* Grid adjustments for print */
          .print-wrapper .grid {
            gap: 12px !important;
          }
          
          .print-wrapper .md\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          
          /* Space between elements */
          .print-wrapper .space-y-6 {
            margin-top: 0 !important;
          }
          
          .print-wrapper .space-y-6 > * + * {
            margin-top: 16px !important;
          }
          
          .print-wrapper .space-y-4 > * + * {
            margin-top: 12px !important;
          }
          
          .print-wrapper .space-y-3 > * + * {
            margin-top: 8px !important;
          }
          
          .print-wrapper .space-y-2 > * + * {
            margin-top: 6px !important;
          }
          
          /* Border adjustments */
          .print-wrapper .border-l-4 {
            border-left-width: 3px !important;
          }
          
          /* Medicine cards */
          .print-wrapper .border.border-slate-200 {
            border-width: 1px !important;
            border-color: #e2e8f0 !important;
            padding: 8px 12px !important;
            margin-bottom: 8px !important;
          }
          
          /* Vitals grid */
          .print-wrapper .grid-cols-2,
          .print-wrapper .md\\:grid-cols-4 {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          
          /* Advice grid */
          .print-wrapper .md\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          
          /* Allergies alert */
          .print-wrapper .bg-red-50 {
            background-color: #fef2f2 !important;
            border-left-color: #ef4444 !important;
          }
          
          /* Diagnosis box */
          .print-wrapper .bg-teal-50 {
            background-color: #f0fdfa !important;
            border-color: #99f6e4 !important;
          }
          
          /* Info bar */
          .print-wrapper .bg-slate-100 {
            background-color: #f1f5f9 !important;
          }
          
          .print-wrapper .bg-slate-50 {
            background-color: #f8fafc !important;
          }
          
          /* Footer */
          .print-wrapper .border-t {
            border-top-width: 1px !important;
            border-top-color: #e2e8f0 !important;
          }
          
          /* Prevent page breaks in critical sections */
          .print-wrapper .border-l-4 {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          /* Icons - ensure they print */
          .print-wrapper svg {
            display: inline !important;
          }
          
          /* Remove transitions and animations */
          .print-wrapper * {
            transition: none !important;
            animation: none !important;
          }
          
          /* Ensure text colors */
          .text-slate-900,
          .text-slate-800,
          .text-slate-700 {
            color: #1e293b !important;
          }
          
          .text-teal-600 {
            color: #0d9488 !important;
          }
          
          .text-teal-700 {
            color: #0f766e !important;
          }
          
          .text-teal-800 {
            color: #115e59 !important;
          }
          
          .text-teal-900 {
            color: #134e4a !important;
          }
          
          .text-red-600,
          .text-red-700,
          .text-red-800 {
            color: #dc2626 !important;
          }
          
          .text-slate-600 {
            color: #475569 !important;
          }
          
          .text-slate-500 {
            color: #64748b !important;
          }
          
          /* Links */
          a {
            text-decoration: none !important;
            color: inherit !important;
          }
        }
      `}</style>
    </div>
  );
}