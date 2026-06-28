import { z } from "zod";

export const medicineSchema = z.object({
  medicineName: z.string().describe("Name of the medicine/drug"),
  dosage: z.string().nullable().describe("Dosage amount (e.g., 500mg, 10ml, 2 tablets)"),
  frequency: z.string().nullable().describe("How often to take (e.g., twice daily, every 8 hours, SOS)"),
  duration: z.string().nullable().describe("How long to take (e.g., 5 days, 1 week, 10 days)"),
  instruction: z.string().nullable().describe("Special instructions (e.g., after food, with water, before bed)"),
  strength: z.string().nullable().describe("Strength of the medicine"),
  quantity: z.string().nullable().describe("Quantity of the medicine to dispense"),
});

export const complaintSchema = z.object({
  complaintName: z.string().describe("Complaint text (what the patient reports)"),
  complaintFrequency: z.string().nullable().describe("Frequency of complaint if mentioned (e.g., 3 days, every day)"),
  severity: z.string().nullable().describe("Severity if mentioned (e.g., mild/moderate/severe)"),
  complaintDuration: z.string().nullable().describe("Duration if mentioned (e.g., 2 days, 1 week)"),
});

export const diagnosisSchema = z.object({
  diagnosisName: z.string().describe("Diagnosis text"),
  diagnosisCode: z.string().nullable().describe("SNOMED code if mentioned"),
  diagnosisDuration: z.string().nullable().describe("Duration if mentioned"),
});

export const generalExaminationSchema = z.object({
  finding: z.string().describe("General examination finding (e.g., Pallor, Cyanosis)"),
  status: z.string().describe("Status of the finding (e.g., Present, Absent)"),
  severity: z.string().optional().nullable().describe("Severity of the finding if mentioned (e.g., Mild)"),
  notes: z.string().optional().nullable().describe("Additional notes regarding the finding"),
});

export const pastMedicalHistorySchema = z.object({
  disease: z.string().describe("Name of the disease or condition (e.g., Diabetes)"),
  duration: z.string().describe("Duration of the condition (e.g., 10 years, Since 2018)"),
  status: z.string().describe("Status of the condition (e.g., Active, Controlled)"),
  notes: z.string().optional().nullable().describe("Additional notes regarding the condition"),
});

export const investigationSchema = z.object({
  test: z.string().describe("Name of the test or investigation (e.g., Hb, WBC)"),
  value: z.string().describe("Value or result of the investigation (e.g., 11, 9000)"),
  notes: z.string().optional().nullable().describe("Additional notes regarding the investigation result"),
});

export const testRequestedSchema = z.object({
  name: z.string().describe("Name of the requested test (e.g., CBC, LFT)"),
  notes: z.string().optional().nullable().describe("Additional notes regarding the requested test"),
});

export const patientSchema = z.object({
  // Demographics / vitals
  name: z.string().nullable().describe("Patient's full name"),
  age: z.number().nullable().describe("Patient's age in years"),
  gender: z.string().nullable().describe("Patient's gender (Male/Female/Other)"),
  weight: z.number().nullable().describe("Patient's weight in kg"),
  height: z.number().nullable().describe("Patient's height in cm"),
  bloodPressureSystolic: z.number().nullable().describe("Systolic blood pressure (top number)"),
  bloodPressureDiastolic: z.number().nullable().describe("Diastolic blood pressure (bottom number)"),
  pulse: z.number().nullable().describe("Heart rate / pulse in beats per minute"),
  temperature: z.number().nullable().describe("Body temperature in Fahrenheit"),
  oxygenSaturation: z.number().nullable().describe("Oxygen saturation (SpO2) percentage"),

  visitDate: z.string().nullable().describe("Date of visit if mentioned (keep as spoken/parsed text)"),

  // History
  allergies: z.string().nullable().describe("Known allergies"),
  currentMedications: z.string().nullable().describe("Current medications the patient is already taking"),
  chiefComplaint: z.string().nullable().describe("Main reason for visit / chief complaint"),
  symptoms: z.string().nullable().describe("Current symptoms described"),
  medicalHistory: z.string().nullable().describe("Relevant medical history"),

  // Complaints / exam / diagnosis
  quickNotes: z.string().nullable().describe("Quick notes if explicitly mentioned"),
  complaints: z.array(complaintSchema).describe("List of complaints mentioned"),
  generalExaminations: z.array(generalExaminationSchema).describe("List of general examination findings mentioned"),
  pastMedicalHistories: z.array(pastMedicalHistorySchema).describe("List of past medical history conditions mentioned"),
  diagnoses: z.array(diagnosisSchema).describe("List of diagnoses mentioned"),

  // Plan / follow-up
  advice: z.string().nullable().describe("Doctor's advice if explicitly mentioned"),
  testsRequested: z.array(testRequestedSchema).describe("List of tests requested mentioned"),
  nextVisit: z.string().nullable().describe("Next visit plan if explicitly mentioned"),
  investigations: z.array(investigationSchema).describe("List of investigations mentioned"),
  payment: z.string().nullable().describe("Payment details if explicitly mentioned"),
  followUp: z.string().nullable().describe("Follow-up plan if explicitly mentioned"),

  // Contact
  contactNumber: z.string().nullable().describe("Contact phone number"),
  emergencyContact: z.string().nullable().describe("Emergency contact name and number"),
  insuranceId: z.string().nullable().describe("Insurance ID or policy number"),

  // Medicines
  medicines: z.array(medicineSchema).describe("List of prescribed medicines mentioned"),
});

export type AIPrescriptionData = z.infer<typeof patientSchema>;
