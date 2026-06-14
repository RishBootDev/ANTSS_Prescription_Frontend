import { apiRequest } from '../api';

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

  return await apiRequest(`/api/patients/${patientId}/documents`, {
    method: "POST",
    body: formData,
    // apiRequest skips Content-Type when body is FormData,
    // letting the browser set the correct multipart boundary
  });
}

/**
 * Get all documents for a patient.
 * GET /api/patients/{patientId}/documents
 */
export async function getPatientDocuments(patientId: number): Promise<UploadedDocument[]> {
  return await apiRequest(`/api/patients/${patientId}/documents`, {
    method: "GET",
  });
}

/**
 * Delete a document.
 * DELETE /api/patients/{patientId}/documents/{documentId}
 */
export async function deletePatientDocument(
  patientId: number,
  documentId: number
): Promise<void> {
  await apiRequest(`/api/patients/${patientId}/documents/${documentId}`, {
    method: "DELETE",
  });
}
