import { apiClient } from "./axios";
import type { DiagnosticResponse, DiagnosticStatus } from "../../types/backend";

export interface DiagnosticOrderRequest {
  testName: string;
  notes?: string;
  registrationId?: number;
  prescriptionId?: number;
  reportDocumentId?: number;
}

export interface DiagnosticStatusRequest {
  status: DiagnosticStatus;
  resultSummary?: string;
  reportDocumentId?: number;
}

export const diagnosticService = {
  createDiagnostic: (data: DiagnosticOrderRequest): Promise<DiagnosticResponse> => {
    return apiClient.post<DiagnosticResponse>("/api/diagnostics", data);
  },

  getDiagnosticById: (id: number): Promise<DiagnosticResponse> => {
    return apiClient.get<DiagnosticResponse>(`/api/diagnostics/${id}`);
  },

  getDiagnosticsByRegistration: (registrationNumber: string): Promise<DiagnosticResponse[]> => {
    return apiClient.get<DiagnosticResponse[]>(`/api/diagnostics/registration/${registrationNumber}`);
  },

  getDiagnosticsByPrescription: (prescriptionId: number): Promise<DiagnosticResponse[]> => {
    return apiClient.get<DiagnosticResponse[]>(`/api/diagnostics/prescription/${prescriptionId}`);
  },

  getDiagnosticsByDocument: (documentId: number): Promise<DiagnosticResponse[]> => {
    return apiClient.get<DiagnosticResponse[]>(`/api/diagnostics/document/${documentId}`);
  },

  updateDiagnosticStatus: (id: number, data: DiagnosticStatusRequest): Promise<DiagnosticResponse> => {
    return apiClient.patch<DiagnosticResponse>(`/api/diagnostics/${id}/status`, data);
  },

  deleteDiagnostic: (id: number): Promise<void> => {
    return apiClient.delete<void>(`/api/diagnostics/${id}`);
  },
};
