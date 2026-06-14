export interface MedicineEntry {
  id: string
  medicineName: string
  strength: string
  dosage: string
  frequency: string
  duration: string
  instruction: string
  quantity: string
}

export interface ComplaintEntry {
  id: string
  complaintName: string
  complaintFrequency: string | null
  severity: string | null
  complaintDuration: string | null
}

export interface DiagnosisEntry {
  id: string
  diagnosisName: string
  diagnosisCode: string | null
  diagnosisDuration: string | null
}

export interface GeneralExaminationEntry {
  id: string
  examinationName: string
}

export interface PastMedicalHistoryEntry {
  id: string
  allergies: string | null
  currentMedicine: string | null
  medicalHistory: string | null
}

export interface InvestigationEntry {
  id: string
  investigationName: string
  notes: string | null
  documentUrl: string | null   // uploaded document URL for this investigation
  documentFileName: string | null  // uploaded file name for display
}

export interface TestRequestedEntry {
  id: string
  testName: string
  notes: string | null
}

export interface DocumentEntry {
  id: string
  fileName: string
  url: string
}

export interface PatientData {
  registrationId?: number | null
  registrationNumber?: string | null
  patientId?: number | null  // backend patient ID for document uploads
  name: string | null
  age: number | null
  gender: string | null
  weight: number | null
  height: number | null
  bloodPressureSystolic: number | null
  bloodPressureDiastolic: number | null
  pulse: number | null
  temperature: number | null
  oxygenSaturation: number | null
  respiratoryRate?: number | null
  bloodGroup: string | null
  lmp: string | null
  visitDate: string | null

  // Past Medical History - now dynamic lists
  allergies: string | null
  currentMedications: string | null
  chiefComplaint: string | null
  symptoms: string | null
  medicalHistory: string | null

  quickNotes: string | null
  complaints: ComplaintEntry[]
  generalExaminations: GeneralExaminationEntry[]
  pastMedicalHistories: PastMedicalHistoryEntry[]
  diagnoses: DiagnosisEntry[]

  advice: string | null
  testsRequested: TestRequestedEntry[]
  nextVisit: string | null
  investigations: InvestigationEntry[]
  payment: string | null
  followUp: string | null

  contactNumber: string | null
  emergencyContact: string | null
  insuranceId: string | null

  medicines: MedicineEntry[]
  documents: DocumentEntry[]
}
