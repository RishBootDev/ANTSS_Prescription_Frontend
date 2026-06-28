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
  finding: string
  status: string
  severity?: string
  notes?: string
}

export interface PastMedicalHistoryEntry {
  id: string
  disease: string
  duration: string
  status: string
  notes?: string
}

export interface InvestigationEntry {
  id: string
  test: string
  value: string
  notes?: string
  documentUrl?: string | null   // uploaded document URL for this investigation
  documentFileName?: string | null  // uploaded file name for display
}

export interface TestRequestedEntry {
  id: string
  name: string
  notes?: string
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

export const emptyPatientData: PatientData = {
  registrationId: null,
  registrationNumber: null,
  patientId: null,
  name: null,
  age: null,
  gender: null,
  weight: null,
  height: null,
  bloodPressureSystolic: null,
  bloodPressureDiastolic: null,
  pulse: null,
  temperature: null,
  oxygenSaturation: null,
  respiratoryRate: null,

  lmp: null,
  visitDate: null,
  allergies: null,
  currentMedications: null,
  chiefComplaint: null,
  symptoms: null,
  medicalHistory: null,
  quickNotes: null,
  complaints: [{ id: "comp-new", complaintName: "", complaintFrequency: null, severity: null, complaintDuration: null }],
  generalExaminations: [{ id: "ge-new", finding: "", status: "" }],
  pastMedicalHistories: [{ id: "pmh-new", disease: "", duration: "", status: "" }],
  diagnoses: [{ id: "diag-new", diagnosisName: "", diagnosisCode: null, diagnosisDuration: null }],
  advice: null,
  testsRequested: [{ id: "test-new", name: "" }],
  nextVisit: null,
  investigations: [{ id: "inv-new", test: "", value: "" }],
  payment: null,
  followUp: null,
  contactNumber: null,
  emergencyContact: null,
  insuranceId: null,
  medicines: [{ id: "med-new", medicineName: "", strength: "", dosage: "", frequency: "", duration: "", instruction: "", quantity: "" }],
  documents: [],
};
