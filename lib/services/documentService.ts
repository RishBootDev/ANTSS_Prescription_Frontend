import { apiClient } from '../../src/services/axios';

export interface UploadedDocument {
  id: number;
  fileName: string;
  url: string;
}

/**
 * Upload a document for a patient using the DocumentController API.
 * POST /api/patients/{patientId}/documents
 */
export async function uploadPatientDocument(
  patientId: number,
  file: File,
  type: string = "INVESTIGATION"
): Promise<UploadedDocument> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);

  return await apiClient.post(`/api/patients/${patientId}/documents`, formData);
}

/**
 * Get all documents for a patient.
 * GET /api/patients/{patientId}/documents
 */
export async function getPatientDocuments(patientId: number): Promise<UploadedDocument[]> {
  return await apiClient.get(`/api/patients/${patientId}/documents`);
}

/**
 * Get one document for a patient.
 * GET /api/patients/{patientId}/documents/{documentId}
 */
export async function getPatientDocument(
  patientId: number,
  documentId: number
): Promise<UploadedDocument> {
  return await apiClient.get(`/api/patients/${patientId}/documents/${documentId}`);
}

/**
 * Delete a document.
 * DELETE /api/patients/{patientId}/documents/{documentId}
 */
export async function deletePatientDocument(
  patientId: number,
  documentId: number
): Promise<void> {
  await apiClient.delete(`/api/patients/${patientId}/documents/${documentId}`);
}
