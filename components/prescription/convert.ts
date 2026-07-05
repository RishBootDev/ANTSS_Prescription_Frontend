import { MappedPrescription, MappedVital, MappedMedicine, MappedTest } from "@/types/prescription";

const cleanText = (value: unknown) =>
  value == null ? "" : String(value).trim();

const joinDetails = (values: unknown[], separator = ", ") =>
  values.map(cleanText).filter(Boolean).join(separator);

const isMeaningfulText = (value: unknown) => {
  const normalized = cleanText(value).toLowerCase();
  return Boolean(normalized) && !["none", "n/a", "na", "null", "undefined"].includes(normalized);
};

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
  specialization: "General Physician",
  signatureUrl: ""
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
  
  const consultation = patientData.consultation || patientData;

  // Convert vitals
  const vitals: MappedVital[] = [];
  if (consultation.bp || consultation.bloodPressureSystolic || consultation.bloodPressureDiastolic) {
    const bloodPressure = cleanText(consultation.bp) || joinDetails(
      [consultation.bloodPressureSystolic, consultation.bloodPressureDiastolic],
      "/"
    );
    vitals.push({
      label: "Blood Pressure",
      value: bloodPressure,
      unit: "mmHg"
    });
  }
  if (consultation.pulse) {
    vitals.push({ label: "Pulse", value: consultation.pulse.toString(), unit: "bpm" });
  }
  if (consultation.temperature) {
    vitals.push({ label: "Temperature", value: consultation.temperature.toString(), unit: "°F" });
  }
  if (consultation.oxygenSaturation || consultation.spo2) {
    vitals.push({ label: "SpO2", value: (consultation.oxygenSaturation || consultation.spo2).toString(), unit: "%" });
  }
  if (consultation.weight) {
    vitals.push({ label: "Weight", value: consultation.weight.toString(), unit: "kg" });
  }
  if (consultation.height) {
    vitals.push({ label: "Height", value: consultation.height.toString(), unit: "cm" });
  }
  if (consultation.respiratoryRate) {
    vitals.push({ label: "Resp Rate", value: consultation.respiratoryRate.toString(), unit: "breaths/min" });
  }

  // Convert complaints
  const chiefComplaints: string[] = [];
  if (consultation.complaints && consultation.complaints.length > 0) {
    consultation.complaints.forEach((c: any) => {
      const name = c.complaint || c.complaintName;
      if (name) {
        let str = name.toUpperCase();
        const details = [];
        if (c.severity) details.push(c.severity.toUpperCase());
        if (c.frequency || c.complaintFrequency) details.push((c.frequency || c.complaintFrequency).toUpperCase());
        if (c.duration || c.complaintDuration) details.push((c.duration || c.complaintDuration).toUpperCase());
        if (details.length > 0) str += ` (${details.join(', ')})`;
        chiefComplaints.push(str);
      }
    });
  } else if (consultation.complaintName) {
    let str = consultation.complaintName.toUpperCase();
    const details = [];
    if (consultation.severity) details.push(consultation.severity.toUpperCase());
    if (consultation.complaintFrequency) details.push(consultation.complaintFrequency.toUpperCase());
    if (consultation.complaintDuration) details.push(consultation.complaintDuration.toUpperCase());
    if (details.length > 0) str += ` (${details.join(', ')})`;
    chiefComplaints.push(str);
  } else if (consultation.chiefComplaint) {
    chiefComplaints.push(consultation.chiefComplaint.toUpperCase());
  }

  // Convert general examination to Clinical Findings
  const clinicalFindings: string[] = [];
  if (Array.isArray(consultation.generalExaminations)) {
    consultation.generalExaminations.forEach((examination: any) => {
      const finding = cleanText(
        examination.finding || examination.generalExamination || examination.name
      );
      if (!finding) return;

      const details = joinDetails([
        examination.status,
        examination.severity,
        examination.notes,
      ]);
      clinicalFindings.push(
        `${finding}${details ? ` (${details})` : ""}`.toUpperCase()
      );
    });
  }
  if (consultation.generalExamination) {
    consultation.generalExamination.split('\n').forEach((line: string) => {
      const trimmed = line.trim();
      if (trimmed) clinicalFindings.push(trimmed.toUpperCase());
    });
  }

  // Convert allergies and history
  const allergies: string[] = [];
  if (isMeaningfulText(consultation.allergies)) allergies.push(consultation.allergies);
  if (consultation.pastMedicalHistories && consultation.pastMedicalHistories.length > 0) {
    consultation.pastMedicalHistories.forEach((pmh: any) => {
      if (isMeaningfulText(pmh.allergies)) allergies.push(pmh.allergies);
    });
  }

  const pastHistory: string[] = [];
  if (consultation.medicalHistory) pastHistory.push(consultation.medicalHistory);
  if (consultation.currentMedicine || consultation.currentMedications) {
    pastHistory.push(`Current Medications: ${consultation.currentMedicine || consultation.currentMedications}`);
  }
  if (consultation.pastMedicalHistories && consultation.pastMedicalHistories.length > 0) {
    consultation.pastMedicalHistories.forEach((pmh: any) => {
      const condition = cleanText(
        pmh.disease || pmh.medicalHistory || pmh.history || pmh.condition
      );
      const details = joinDetails([pmh.duration, pmh.status, pmh.notes]);
      if (condition) {
        pastHistory.push(`${condition}${details ? ` (${details})` : ""}`);
      } else if (details) {
        pastHistory.push(details);
      }
      if (pmh.currentMedicine) pastHistory.push(`Current Medications: ${pmh.currentMedicine}`);
    });
  }

  // Convert diagnosis
  let diagnosis = "";
  if (consultation.diagnoses && consultation.diagnoses.length > 0) {
    diagnosis = consultation.diagnoses.map((d: any) => {
      const name = d.diagnosis || d.diagnosisName || "";
      const code = d.snomedCode || d.diagnosisCode || "";
      return `${name.toUpperCase()}${code ? ` (${code})` : ''}`;
    }).filter((item: string) => item.trim()).join(", ");
  } else if (consultation.diagnosisName) {
    diagnosis = `${consultation.diagnosisName.toUpperCase()}${consultation.diagnosisCode ? ` (${consultation.diagnosisCode})` : ''}`;
  }

  // Convert medicines
  const medicineSource = patientData.medicines || consultation.medicines || [];
  const medicines: MappedMedicine[] = medicineSource
    .filter((m: any) => cleanText(m.medicineName || m.name))
    .map((m: any, idx: number) => {
    let name = cleanText(m.medicineName || m.name);
    if (m.strength) {
      name += ` ${m.strength}`;
    }
    return {
      id: m.prescriptionMedicineId || m.id || idx,
      genericName: name,
      brandName: cleanText(m.medicineName || m.name) || undefined,
      dosage: cleanText(m.dosage || m.dose),
      frequency: cleanText(m.frequency),
      instructions: cleanText(m.instruction || m.instructions),
      duration: cleanText(m.duration),
      quantity: cleanText(m.quantity) || undefined
    };
  });

  const investigations: MappedTest[] = [];
  const investigationSource =
    patientData.investigations || consultation.investigations || [];
  if (Array.isArray(investigationSource)) {
    investigationSource.forEach((investigation: any, index: number) => {
      const name = cleanText(
        investigation.test ||
        investigation.investigationName ||
        investigation.testName ||
        investigation.name
      );
      if (!name) return;

      const notes = joinDetails([
        investigation.value || investigation.result || investigation.resultValue,
        investigation.notes || investigation.note || investigation.remarks,
      ]);
      investigations.push({
        id: investigation.id || `investigation-${index}`,
        name,
        notes: notes || undefined,
      });
    });
  }

  const testsRequested: MappedTest[] = [];
  const requestedTestsSource =
    patientData.testsRequested ||
    patientData.testRequested ||
    consultation.testsRequested ||
    consultation.testRequested ||
    [];

  if (Array.isArray(requestedTestsSource)) {
    requestedTestsSource.forEach((test: any, index: number) => {
      const name = cleanText(test.testName || test.name || test.diagnosticName);
      if (!name) return;
      testsRequested.push({
        id: test.id || `test-${index}`,
        name,
        notes: cleanText(test.notes || test.note) || undefined,
      });
    });
  } else if (typeof requestedTestsSource === "string") {
    requestedTestsSource.split(',').forEach((test: string, i: number) => {
      const trimmed = test.trim();
      if (trimmed) {
        testsRequested.push({
          id: `test-str-${i}`,
          name: trimmed
        });
      }
    });
  }

  // Convert advice
  const advice: string[] = [];
  if (consultation.advice) {
    consultation.advice.split('\n').forEach((line: string) => {
      const trimmed = line.trim();
      if (trimmed) advice.push(trimmed.toUpperCase());
    });
  }

  // Convert follow-up
  let followUp = undefined;
  if (consultation.followUpDate) {
    const fDate = new Date(consultation.followUpDate);
    const formatted = fDate.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    }).replace(/ /g, '-');
    followUp = {
      days: 0,
      note: "",
      date: formatted
    };
  } else if (consultation.followUp || consultation.nextVisit) {
    const followUpValue = consultation.followUp || consultation.nextVisit;
    const parsedDate = new Date(followUpValue);
    const isDateValue = !isNaN(parsedDate.getTime()) && /[-/]/.test(String(followUpValue));
    const days = isDateValue ? 0 : parseInt(followUpValue, 10) || 0;
    const dateObj = isDateValue ? parsedDate : new Date();
    if (!isDateValue && days > 0) {
      dateObj.setDate(dateObj.getDate() + days);
    }
    const formattedFollowUpDate = dateObj.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    }).replace(/ /g, '-');

    followUp = {
      days,
      note: days > 0 ? `Review after ${days} days` : "",
      date: formattedFollowUpDate
    };
  }

  const dynamicClinicInfo = {
    name: consultation.clinicName || consultation.hospitalName || clinicInfo?.name || defaultClinicInfo.name,
    address: consultation.clinicAddress || consultation.hospitalAddress || clinicInfo?.address || defaultClinicInfo.address,
    phone: consultation.clinicPhone || consultation.hospitalPhone || clinicInfo?.phone || defaultClinicInfo.phone,
    timings: clinicInfo?.timings || "",
    logo: clinicInfo?.logo || "/_DOCTOR.jpeg"
  };

  const dynamicDoctorInfo = {
    name: consultation.doctorName || doctorInfo?.name || defaultDoctorInfo.name,
    qualification: consultation.qualification || doctorInfo?.qualification || defaultDoctorInfo.qualification,
    registrationNo: consultation.doctorRegistrationNo || doctorInfo?.registrationNo || defaultDoctorInfo.registrationNo,
    specialization: consultation.specialization || doctorInfo?.specialization || defaultDoctorInfo.specialization,
    signatureUrl: consultation.doctorSignatureUrl || doctorInfo?.signatureUrl
  };

  return {
    prescriptionId: Number(patientData.prescriptionId || consultation.consultationId) || 0,
    clinic: dynamicClinicInfo,
    doctor: dynamicDoctorInfo,
    patient: {
      id: consultation.registrationNumber || consultation.registrationId?.toString() || `RX-${visitDateObj.getTime().toString().slice(-6)}`,
      name: consultation.patientName || consultation.name || "",
      age: consultation.age || 0,
      gender: consultation.gender || "",
      contactNumber: consultation.mobileNumber || consultation.contactNumber || undefined,
      visitDate: formattedVisitDate,
      prescriptionId: consultation.registrationNumber || consultation.registrationId?.toString() || `RX-${visitDateObj.getTime().toString().slice(-6)}`,
      address: consultation.patientAddress || consultation.localAddress || consultation.address || ""
    },
    vitals,
    chiefComplaints,
    clinicalFindings,
    pastHistory,
    allergies,
    diagnosis,
    medicines,
    testsRecommended: testsRequested,
    investigations,
    testsRequested,
    advice,
    followUp,
    additionalNotes: patientData.notes || consultation.quickNotes || patientData.quickNotes
  };
}
