import { apiClient } from "./axios";
import { SavePrescriptionRequest } from "../../types/backend";

export const prescriptionService = {
  savePrescription: (prescriptionData: SavePrescriptionRequest): Promise<any> => {
    return apiClient.post<any>("/api/prescription/save", prescriptionData);
  },

  getPrescriptionById: (prescriptionId: number): Promise<any> => {
    return apiClient.get<any>(`/api/prescription/${prescriptionId}`);
  },

  getAllPrescriptions: (): Promise<any[]> => {
    return apiClient.get<any[]>("/api/prescription/all");
  },

  getPrescriptionsByPatientId: (patientId: number): Promise<any[]> => {
    return apiClient.get<any[]>(`/api/prescription/patient/${patientId}`);
  },

  getPrescriptionsByRegistrationId: (registrationId: number): Promise<any[]> => {
    return apiClient.get<any[]>(`/api/prescription/registration/${registrationId}`);
  },

  getDetailedPrescriptionById: (prescriptionId: number): Promise<any> => {
    return apiClient.get<any>(`/api/prescription/detail/${prescriptionId}`);
  },

  getDetailedPrescriptionsByPatientId: (patientId: number): Promise<any[]> => {
    return apiClient.get<any[]>(`/api/prescription/patient/${patientId}/detail`);
  },

  updatePrescription: (prescriptionId: number, updateData: Partial<SavePrescriptionRequest>): Promise<any> => {
    return apiClient.put<any>(`/api/prescription/update/${prescriptionId}`, updateData);
  },

  deletePrescription: (prescriptionId: number): Promise<string> => {
    return apiClient.delete<string>(`/api/prescription/delete/${prescriptionId}`);
  },
};
