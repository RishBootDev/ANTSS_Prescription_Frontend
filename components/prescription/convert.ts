import { MappedPrescription, MappedVital, MappedMedicine, MappedTest } from "@/types/prescription";

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

export function convertPatientDataToPrescription(
  patientData: any,
  clinicInfo?: typeof defaultClinicInfo,
  doctorInfo?: typeof defaultDoctorInfo
): MappedPrescription {
  const visitDateObj = new Date();
  
  // Format visit date as DD-MMM-YYYY
  const formattedVisitDate = visitDateObj.toLocaleDateString('en-IN', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  }).replace(/ /g, '-');
  
  // Convert vitals
  const vitals: MappedVital[] = [];
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
      if (c.complaint || c.complaintName) {
        const name = c.complaint || c.complaintName;
        let str = name.toUpperCase();
        const details = [];
        if (c.severity) details.push(c.severity.toUpperCase());
        if (c.frequency || c.complaintFrequency) details.push((c.frequency || c.complaintFrequency).toUpperCase());
        if (c.duration || c.complaintDuration) details.push((c.duration || c.complaintDuration).toUpperCase());
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
    diagnosis = patientData.diagnoses.map((d: any) => {
      const name = d.diagnosis || d.diagnosisName || "";
      const code = d.snomedCode || d.diagnosisCode || "";
      return `${name.toUpperCase()}${code ? ` (${code})` : ''}`;
    }).join(", ");
  }

  // Convert medicines
  const medicines: MappedMedicine[] = patientData.medicines?.map((m: any, idx: number) => ({
    id: m.id || idx,
    genericName: m.medicineName || m.name || "Unknown Medicine",
    brandName: m.medicineName || m.name,
    dosage: m.dosage || m.dose || "---",
    frequency: m.frequency || "---",
    instructions: m.instruction || m.instructions || "",
    duration: m.duration || "---",
    quantity: m.quantity
  })) || [];

  // Convert diagnostics/tests from testRequested array
  const diagnostics: MappedTest[] = [];
  if (patientData.testRequested && patientData.testRequested.length > 0) {
    patientData.testRequested.forEach((tr: any, i: number) => {
      if (tr.testName) {
        diagnostics.push({
          id: tr.id || `test-${i}`,
          name: tr.testName
        });
      }
    });
  }
  
  if (patientData.testsRequested && typeof patientData.testsRequested === 'string') {
    patientData.testsRequested.split(',').forEach((test: string, i: number) => {
      const trimmed = test.trim();
      if (trimmed) {
        diagnostics.push({
          id: `test-${i}`,
          name: trimmed
        });
      }
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
    prescriptionId: Number(patientData.prescriptionId) || 0,
    clinic: clinicInfo || defaultClinicInfo,
    doctor: doctorInfo || defaultDoctorInfo,
    patient: {
      id: patientData.registrationNumber || patientData.registrationId?.toString() || `RX-${visitDateObj.getTime().toString().slice(-6)}`,
      name: patientData.name || "Unknown Patient",
      age: patientData.age || 0,
      gender: patientData.gender || "Other",
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
    testsRecommended: diagnostics,
    advice,
    followUp,
    additionalNotes: patientData.quickNotes
  };
}
