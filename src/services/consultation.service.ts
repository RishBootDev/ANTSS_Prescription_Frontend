import { apiClient } from "./axios";

export interface BackendConsultation {
  consultationId?: number;
  registrationId?: number;
  bp?: string | null;
  pulse?: string | null;
  temperature?: string | null;
  spo2?: string | null;
  weight?: string | null;
  height?: string | null;
  complaintName?: string | null;
  complaintFrequency?: string | null;
  severity?: string | null;
  complaintDuration?: string | null;
  generalExamination?: string | null;
  diagnosisName?: string | null;
  diagnosisCode?: string | null;
  diagnosisDuration?: string | null;
  advice?: string | null;
  notes?: string | null;
  allergies?: string | null;
  medicalHistory?: string | null;
  currentMedicine?: string | null;
  followUpDate?: string | null;
}

export const consultationService = {
  saveConsultation: (data: BackendConsultation): Promise<any> => {
    return apiClient.post<any>("/api/consultations", data);
  },

  getConsultationById: (id: number): Promise<any> => {
    return apiClient.get<any>(`/api/consultations/${id}`);
  },

  getAllConsultations: (): Promise<any[]> => {
    return apiClient.get<any[]>("/api/consultations");
  },

  getConsultationsByDoctor: (doctorId: string): Promise<any[]> => {
    return apiClient.get<any[]>(`/api/consultations/doctor/${doctorId}`);
  },

  updateConsultation: (id: number, data: BackendConsultation): Promise<any> => {
    return apiClient.put<any>(`/api/consultations/${id}`, data);
  },

  deleteConsultation: (id: number): Promise<string> => {
    return apiClient.delete<string>(`/api/consultations/${id}`);
  },
};
