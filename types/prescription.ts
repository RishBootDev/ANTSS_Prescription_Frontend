import { ReactNode } from "react";

// Raw API Response Types matching the Spring Boot DTOs

export interface ApiMedicineResponse {
  prescriptionMedicineId: number;
  medicineName: string;
  strength?: string;
  dosage: string;
  frequency: string;
  duration: string;
  instruction?: string;
  quantity?: string;
}

export interface ApiInvestigationResponse {
  id: number;
  investigationName: string;
  createdAt: string;
}

export interface ApiTestRequestedResponse {
  id: number;
  testName: string;
  createdAt: string;
}

export interface ApiDocumentResponse {
  id: number;
  fileName: string;
  url: string;
}

export interface ApiConsultationResponse {
  consultationId: number;
  consultationNumber: string;
  
  // Doctor details on consultation
  doctorId: string; // UUID
  doctorName: string;
  doctorCode: string;
  specialization: string;
  qualification: string;

  // Patient registration details
  registrationId: number;
  registrationNumber: string;

  // Patient details
  patientId: number;
  patientName: string;
  mobileNumber: string;
  gender: string;
  age: number;

  // Clinical data
  chiefComplaintId?: number;
  complaintName?: string;
  complaintFrequency?: string;
  severity?: string;
  complaintDuration?: string;

  generalExaminationId?: number;
  generalExamination?: string;

  diagnosisId?: number;
  diagnosisName?: string;
  diagnosisCode?: string;
  diagnosisDuration?: string;

  historyId?: number;
  allergies?: string;
  currentMedicine?: string;
  medicalHistory?: string;

  vitalId?: number;
  height?: number;
  weight?: number;
  temperature?: number;
  pulse?: number;
  spo2?: number;
  bp?: string;
  respiratoryRate?: number;

  advice?: string;
  followUpDate?: string; // ISO LocalDateTime
  createdAt: string;
  updatedAt: string;
}

export interface ApiDetailedPrescriptionResponse {
  prescriptionId: number;
  notes?: string;
  createdAt: string; // ISO LocalDateTime
  consultation: ApiConsultationResponse;
  medicines: ApiMedicineResponse[];
  investigations: ApiInvestigationResponse[];
  testRequested: ApiTestRequestedResponse[];
  documents: ApiDocumentResponse[];
}

// Doctor response from /api/doctors/{id}
export interface ApiDoctorResponse {
  id: string; // UUID
  doctorName: string;
  doctorCode: string;
  specialization: string;
  qualification: string;
  experienceYears?: number;
  email: string;
  mobileNumber: string;
  registrationNumber: string;
  signatureUrl?: string;
  hospitalId?: number;
  clinicId?: number;
  status: string;
}

// Hospital response from /api/hospitals/{id}
export interface ApiHospitalResponse {
  id: number;
  userId: string;
  hospitalName: string;
  hospitalCode: string;
  registrationNumber?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  pincode?: string;
  email?: string;
  mobileNumber?: string;
  maxDoctorLimit?: number;
  activeDoctorCount?: number;
  status: string;
}

// Clinic response from /api/clinics/{id}
export interface ApiClinicResponse {
  id: number;
  userId: string;
  clinicName: string;
  clinicCode: string;
  registrationNumber?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  pincode?: string;
  email?: string;
  mobileNumber?: string;
  maxDoctorLimit?: number;
  activeDoctorCount?: number;
  status: string;
}

// Custom API Envelope (standard backend wrapping for list/profile/etc.)
export interface ApiResponseEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}


// Clean Frontend Mapped Types for UI Components

export interface MappedClinicInfo {
  name: string;
  address: string;
  phone: string;
  timings?: string;
  logo?: string;
}

export interface MappedDoctorInfo {
  name: string;
  qualification: string;
  registrationNo: string;
  specialization: string;
  signatureUrl?: string;
}

export interface MappedPatientInfo {
  id: string;
  name: string;
  age: number;
  gender: string;
  contactNumber?: string;
  visitDate: string;
  visitTime?: string;
  prescriptionId: string;
  address?: string;
}

export interface MappedVital {
  label: string;
  value: string;
  unit: string;
  icon?: ReactNode;
}

export interface MappedMedicine {
  id: string | number;
  genericName: string;
  brandName?: string;
  dosage: string;
  frequency: string;
  instructions: string;
  duration: string;
  quantity?: string;
}

export interface MappedTest {
  id: string | number;
  name: string;
  notes?: string;
}

export interface MappedPrescription {
  prescriptionId: number;
  clinic: MappedClinicInfo;
  doctor: MappedDoctorInfo;
  patient: MappedPatientInfo;
  vitals: MappedVital[];
  chiefComplaints: string[];
  clinicalFindings: string[];
  pastHistory: string[];
  allergies: string[];
  diagnosis: string;
  medicines: MappedMedicine[];
  testsRecommended: MappedTest[];
  advice: string[];
  followUp?: {
    days: number;
    date?: string;
    note?: string;
  };
  additionalNotes?: string;
  documents?: ApiDocumentResponse[];
}
