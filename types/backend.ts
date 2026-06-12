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

  // Chief Complaint
  complaintName?: string;
  complaintFrequency?: string;
  severity?: string;
  complaintDuration?: string;

  // General Examination
  generalExamination?: string;

  // Past Medical History
  allergies?: string;
  currentMedicine?: string;
  medicalHistory?: string;

  // Diagnosis
  diagnosisName?: string;
  diagnosisCode?: string;
  diagnosisDuration?: string;

  // Consultation
  registrationId: number;
  advice?: string;
  followUpDate?: string; // ISO String

  // Prescription
  notes?: string;

  // Medicines
  medicines: MedicineRequest[];
}
