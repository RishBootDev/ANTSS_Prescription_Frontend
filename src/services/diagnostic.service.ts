import { apiClient } from "./axios";
import type { DiagnosticOrderResponse, DiagnosticStatus } from "../../types/backend";

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
  createDiagnostic: (data: DiagnosticOrderRequest): Promise<DiagnosticOrderResponse> => {
    return apiClient.post<DiagnosticOrderResponse>("/api/diagnostics", data);
  },

  getDiagnosticById: (id: number): Promise<DiagnosticOrderResponse> => {
    return apiClient.get<DiagnosticOrderResponse>(`/api/diagnostics/${id}`);
  },

  getDiagnosticsByRegistration: (registrationNumber: string): Promise<DiagnosticOrderResponse[]> => {
    return apiClient.get<DiagnosticOrderResponse[]>(`/api/diagnostics/registration/${registrationNumber}`);
  },

  getDiagnosticsByPrescription: (prescriptionId: number): Promise<DiagnosticOrderResponse[]> => {
    return apiClient.get<DiagnosticOrderResponse[]>(`/api/diagnostics/prescription/${prescriptionId}`);
  },

  getDiagnosticsByDocument: (documentId: number): Promise<DiagnosticOrderResponse[]> => {
    return apiClient.get<DiagnosticOrderResponse[]>(`/api/diagnostics/document/${documentId}`);
  },

  updateDiagnosticStatus: (id: number, data: DiagnosticStatusRequest): Promise<DiagnosticOrderResponse> => {
    return apiClient.patch<DiagnosticOrderResponse>(`/api/diagnostics/${id}/status`, data);
  },

  deleteDiagnostic: (id: number): Promise<void> => {
    return apiClient.delete<void>(`/api/diagnostics/${id}`);
  },
};
