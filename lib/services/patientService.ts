import { apiRequest } from '../api';
import { PatientRequest, PatientResponse } from '../../types/backend';

export const PatientService = {
  /**
   * Create a new patient
   */
  createPatient: async (patientData: PatientRequest): Promise<PatientResponse> => {
    return await apiRequest('/api/patients', {
      method: 'POST',
      body: JSON.stringify(patientData),
    });
  },

  /**
   * Get a patient by ID
   */
  getPatientById: async (patientId: number): Promise<PatientResponse> => {
    return await apiRequest(`/api/patients/${patientId}`, {
      method: 'GET',
    });
  },

  /**
   * Get all patients
   */
  getAllPatients: async (): Promise<PatientResponse[]> => {
    return await apiRequest('/api/patients', {
      method: 'GET',
    });
  },

  /**
   * Update an existing patient
   */
  updatePatient: async (patientId: number, patientData: PatientRequest): Promise<PatientResponse> => {
    return await apiRequest(`/api/patients/${patientId}`, {
      method: 'PUT',
      body: JSON.stringify(patientData),
    });
  },

  /**
   * Delete a patient
   */
  deletePatient: async (patientId: number): Promise<string> => {
    return await apiRequest(`/api/patients/${patientId}`, {
      method: 'DELETE',
    });
  },
};
