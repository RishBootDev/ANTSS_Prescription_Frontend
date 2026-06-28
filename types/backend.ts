// --- Requests ---

export interface PatientRequest {
  patientName: string;
  mobileNumber?: string;
  gender: string;
  dateOfBirth?: string;
  age?: number;
  address?: string;
  state?: string;
  city?: string;
  pincode?: string;
}

export interface PatientRegistrationRequest {
  patientId?: number;
  patient?: PatientRequest;
  clinicId?: number;
  hospitalId?: number;
  status?: string;
}

export interface ChiefComplaintRequest {
  complaintName: string;
  complaintFrequency?: string;
  severity?: string;
  complaintDuration?: string;
}

export interface PastMedicalHistoryRequest {
  allergies?: string;
  currentMedicine?: string;
  medicalHistory?: string;
}

export interface DiagnosisRequest {
  diagnosisName: string;
  diagnosisCode?: string;
  diagnosisDuration?: string;
}

export interface DiagnosticRequest {
  testName: string;
  notes?: string;
}

export interface InvestigationRequest {
  investigationName?: string;
  notes?: string;
  documentUrl?: string;
  documentFileName?: string;
}

export interface TestRequestedRequest {
  testName?: string;
  notes?: string;
}

export interface MedicineRequest {
  medicineName: string;
  strength?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instruction?: string;
  quantity?: string;
}

export interface DocumentRequest {
  fileName: string;
  url: string;
}

export interface SavePrescriptionRequest {
  consultationId?: number;
  
  height?: number;
  weight?: number;
  temperature?: number;
  pulse?: number;
  spo2?: number;
  bp?: string;
  respiratoryRate?: number;

  complaints?: ChiefComplaintRequest[];
  generalExaminations?: string[];
  pastMedicalHistories?: PastMedicalHistoryRequest[];
  diagnoses?: DiagnosisRequest[];
  diagnostics?: DiagnosticRequest[];
  investigations?: InvestigationRequest[];
  testRequested?: TestRequestedRequest[];
  
  registrationId: number;
  advice?: string;
  followUpDate?: string; 
  notes?: string;
  medicines?: MedicineRequest[];
  documents?: DocumentRequest[];
}

export interface UpdatePrescriptionRequest extends Omit<SavePrescriptionRequest, "consultationId" | "registrationId"> {}

// --- Responses ---

export interface PatientResponse {
  patientId: number;
  patientName: string;
  mobileNumber: string;
  gender: string;
  dateOfBirth?: string;
  age: number;
  address?: string;
  state?: string;
  city?: string;
  pincode?: string;
  createdAt: string;
  updatedAt: string;
  docs?: DocumentResponse[];
}

export interface PatientRegistrationResponse {
  registrationId: number;
  registrationNumber: string;
  patient: PatientResponse;
  clinicId?: number;
  clinicName?: string;
  hospitalId?: number;
  hospitalName?: string;
}

export interface ConsultationResponse {
  consultationId: number;
  consultationNumber: string;
  doctorId: string;
  doctorName: string;
  doctorCode: string;
  specialization: string;
  qualification: string;
  doctorRegistrationNo: string;
  doctorSignatureUrl: string;
  clinicId: number;
  clinicName: string;
  clinicAddress: string;
  clinicPhone: string;
  hospitalId: number;
  hospitalName: string;
  hospitalAddress: string;
  hospitalPhone: string;
  registrationId: number;
  registrationNumber: string;
  patientId: number;
  patientName: string;
  mobileNumber: string;
  gender: string;
  age: number;
  patientAddress: string;
  cheifComplaintId: number;
  complaintName: string;
  complaintFrequency: string;
  severity: string;
  complaintDuration: string;
  generalExaminationId: number;
  generalExamination: string;
  diagnosisId: number;
  diagnosisName: string;
  diagnosisCode: string;
  diagnosisDuration: string;
  historyId: number;
  allergies: string;
  currentMedicine: string;
  medicalHistory: string;
  vitalId: number;
  height: number;
  weight: number;
  temperature: number;
  pulse: number;
  spo2: number;
  bp: string;
  respiratoryRate: number;
  advice: string;
  followUpDate: string;
  createdAt: string;
  updatedAt: string;
  complaints?: ChiefComplaintResponse[];
  generalExaminations?: string[];
  diagnoses?: DiagnosisResponse[];
  pastMedicalHistories?: PastMedicalHistoryResponse[];
}

export interface ChiefComplaintResponse {
  cheifComplaintId: number;
  complaintName: string;
  complaintFrequency: string;
  severity: string;
  complaintDuration: string;
}

export interface DiagnosisResponse {
  diagnosisId: number;
  diagnosisName: string;
  diagnosisCode: string;
  diagnosisDuration: string;
}

export interface PastMedicalHistoryResponse {
  historyId: number;
  allergies: string;
  currentMedicine: string;
  medicalHistory: string;
}

export type DiagnosticStatus = "REQUESTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface DetailedPrescriptionResponse {
  prescriptionId: number;
  notes: string;
  createdAt: string;
  consultation: ConsultationResponse;
  medicines: MedicineDetailResponse[];
  diagnostics: DiagnosticDetailResponse[];
  investigations: InvestigationDetailResponse[];
  testRequested: TestRequestedDetailResponse[];
  documents: DocumentDetailResponse[];
}

export interface MedicineDetailResponse {
  prescriptionMedicineId: number;
  medicineName: string;
  strength: string;
  dosage: string;
  frequency: string;
  duration: string;
  instruction: string;
  quantity: string;
}

export interface DiagnosticDetailResponse {
  id: number;
  testName: string;
  notes: string;
  resultSummary: string;
  status: DiagnosticStatus;
  requestedAt: string;
  completedAt: string;
  reportDocumentId: number;
}

export interface InvestigationDetailResponse {
  id: number;
  investigationName: string;
  notes: string;
  createdAt: string;
  documentUrl: string;
  documentFileName: string;
}

export interface TestRequestedDetailResponse {
  id: number;
  testName: string;
  notes: string;
  createdAt: string;
}

export interface DocumentDetailResponse {
  id: number;
  fileName: string;
  url: string;
}

export interface DocumentResponse {
  id: number;
  fileName: string;
  url: string;
}

export interface DiagnosticOrderResponse {
  id: number;
  testName: string;
  notes: string;
  resultSummary: string;
  status: DiagnosticStatus;
  registrationId?: number;
  prescriptionId?: number;
  reportDocumentId?: number;
  requestedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
}
