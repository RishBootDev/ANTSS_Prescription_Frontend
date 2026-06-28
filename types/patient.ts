export interface MedicineEntry {
  id: string
  name: string
  dose: string
  frequency: string
  duration: string
  instructions: string
}

export interface ComplaintEntry {
  id: string
  complaint: string
  frequency: string | null
  severity: string | null
  duration: string | null
  date: string | null
}

export interface DiagnosisEntry {
  id: string
  diagnosis: string
  snomedCode: string | null
  duration: string | null
  date: string | null
}

export interface PatientData {
  id?: string
  registrationId?: number
  registrationNumber?: string | null
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

  lmp: string | null
  dateOfBirth: string | null
  visitDate: string | null

  state: string | null
  district: string | null
  pincode: string | null
  localAddress: string | null

  allergies: string | null
  currentMedications: string | null
  chiefComplaint: string | null
  symptoms: string | null
  medicalHistory: string | null

  quickNotes: string | null
  complaints: ComplaintEntry[]
  generalExamination: string | null
  diagnoses: DiagnosisEntry[]

  advice: string | null
  testsRequested: string | null
  nextVisit: string | null
  investigations: string | null
  payment: string | null
  followUp: string | null

  contactNumber: string | null
  emergencyContact: string | null
  insuranceId: string | null

  medicines: MedicineEntry[]
}

export const emptyPatientData: Omit<PatientData, "id"> = {
  registrationNumber: null,
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

  lmp: null,
  dateOfBirth: null,
  visitDate: null,

  state: null,
  district: null,
  pincode: null,
  localAddress: null,

  allergies: null,
  currentMedications: null,
  chiefComplaint: null,
  symptoms: null,
  medicalHistory: null,
  quickNotes: null,
  complaints: [],
  generalExamination: null,
  diagnoses: [],
  advice: null,
  testsRequested: null,
  nextVisit: null,
  investigations: null,
  payment: null,
  followUp: null,
  contactNumber: null,
  emergencyContact: null,
  insuranceId: null,
  medicines: [],
}
