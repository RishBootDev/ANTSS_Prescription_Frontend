export interface BackendPatient {
  patientId?: number;
  patientName: string;
  mobileNumber: string;
  gender: string;
  dateOfBirth?: string;
  age?: number;
  address?: string;
  state?: string;
  city?: string;
  pincode?: string;
  registrationId?: number;
  registrationNumber?: string;
  bloodGroup?: string | null;
}

export interface BackendPatientRegistration {
  registrationId?: number;
  registrationNumber?: string;
  patient?: BackendPatient;
  patientId?: number;
  clinicId?: number;
  hospitalId?: number;
  clinic?: any; // Add clinic interface if needed
  hospital?: any; // Add hospital interface if needed
  status?: string;
}

export interface MedicineRequest {
  medicineName: string;
  strength?: string;
  dosage: string;
  frequency: string;
  duration: string;
  instruction: string;
  quantity?: string;
}

// New interfaces for the updated API structure
export interface ComplaintEntry {
  complaintName: string;
  complaintFrequency?: string;
  severity?: string;
  complaintDuration?: string;
}

export interface PastMedicalHistoryEntry {
  allergies?: string;
  currentMedicine?: string;
  medicalHistory?: string;
}

export interface DiagnosisEntry {
  diagnosisName: string;
  diagnosisCode?: string;
  diagnosisDuration?: string;
}

export interface DiagnosticEntry {
  testName: string;
  notes?: string;
}

export interface DocumentEntry {
  fileName: string;
  url: string;
}

export interface SavePrescriptionRequest {
  consultationId?: number;
  registrationNumber?: string;
  
  // Vitals
  height?: number;
  weight?: number;
  temperature?: number;
  pulse?: number;
  spo2?: number;
  bp?: string;
  respiratoryRate?: number;

  // Chief Complaint - Now an array of objects
  complaints?: ComplaintEntry[];

  // General Examination - Now an array of strings
  generalExaminations?: string[];

  // Past Medical History - Now an array of objects
  pastMedicalHistories?: PastMedicalHistoryEntry[];

  // Diagnosis - Now an array of objects
  diagnoses?: DiagnosisEntry[];

  diagnostics?: DiagnosticEntry[];

  // Documents - New field (array of objects)
  documents?: DocumentEntry[];

  // Consultation
  registrationId: number;
  advice?: string;
  followUpDate?: string; // ISO String

  // Prescription
  notes?: string;

  // Medicines
  medicines: MedicineRequest[];
}

// Response types for detailed prescription
export type DiagnosticStatus = "REQUESTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface DiagnosticResponse {
  id: number;
  testName: string;
  notes?: string;
  resultSummary?: string;
  status: DiagnosticStatus;
  registrationId?: number;
  prescriptionId?: number;
  reportDocumentId?: number;
  requestedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
}

export interface DocumentResponse {
  id: number;
  fileName: string;
  url: string;
}

export interface DetailedPrescriptionResponse extends SavePrescriptionRequest {
  id: number;
  // Override array fields with response types that include id and createdAt
  diagnostics?: DiagnosticResponse[];
  documents?: DocumentResponse[];
  createdAt?: string;
  updatedAt?: string;
}
