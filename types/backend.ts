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
}

export interface BackendPatientRegistration {
  registrationId?: number;
  registrationNumber?: string;
  patient: BackendPatient;
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

export interface InvestigationEntry {
  investigationName: string;
  notes?: string;
}

export interface TestRequestedEntry {
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

  // Investigations - New field (array of objects)
  investigations?: InvestigationEntry[];

  // Test Requested - New field (array of objects)
  testRequested?: TestRequestedEntry[];

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
export interface InvestigationResponse {
  id: number;
  investigationName: string;
  createdAt: string;
}

export interface TestRequestedResponse {
  id: number;
  testName: string;
  createdAt: string;
}

export interface DocumentResponse {
  id: number;
  fileName: string;
  url: string;
}

export interface DetailedPrescriptionResponse extends SavePrescriptionRequest {
  id: number;
  // Override array fields with response types that include id and createdAt
  investigations?: InvestigationResponse[];
  testRequested?: TestRequestedResponse[];
  documents?: DocumentResponse[];
  createdAt?: string;
  updatedAt?: string;
}