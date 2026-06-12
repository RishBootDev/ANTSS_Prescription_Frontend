import { apiRequest } from '../api';
import { SavePrescriptionRequest } from '../../types/backend';

export const PrescriptionService = {
  /**
   * Save a new prescription (Includes Consultation, Vitals, Complaints, Diagnosis, and Medicines)
   * This is the primary workflow for creating clinical records for a visit.
   */
  savePrescription: async (prescriptionData: SavePrescriptionRequest): Promise<any> => {
    return await apiRequest('/api/prescription/save', {
      method: 'POST',
      body: JSON.stringify(prescriptionData),
    });
  },

  /**
   * Get prescription by ID
   */
  getPrescriptionById: async (prescriptionId: number): Promise<any> => {
    return await apiRequest(`/api/prescription/${prescriptionId}`, {
      method: 'GET',
    });
  },

  /**
   * Get all prescriptions
   */
  getAllPrescriptions: async (): Promise<any[]> => {
    return await apiRequest('/api/prescription/all', {
      method: 'GET',
    });
  },

  /**
   * Get prescriptions by patient ID
   */
  getPrescriptionsByPatientId: async (patientId: number): Promise<any[]> => {
    return await apiRequest(`/api/prescription/patient/${patientId}`, {
      method: 'GET',
    });
  },

  /**
   * Get prescriptions by registration ID
   */
  getPrescriptionsByRegistrationId: async (registrationId: number): Promise<any[]> => {
    return await apiRequest(`/api/prescription/registration/${registrationId}`, {
      method: 'GET',
    });
  },

  /**
   * Get detailed prescription by ID
   */
  getDetailedPrescriptionById: async (prescriptionId: number): Promise<any> => {
    return await apiRequest(`/api/prescription/detail/${prescriptionId}`, {
      method: 'GET',
    });
  },

  /**
   * Get detailed prescriptions by patient ID
   */
  getDetailedPrescriptionsByPatientId: async (patientId: number): Promise<any[]> => {
    return await apiRequest(`/api/prescription/patient/${patientId}/detail`, {
      method: 'GET',
    });
  },

  /**
   * Update a prescription
   */
  updatePrescription: async (prescriptionId: number, updateData: Partial<SavePrescriptionRequest>): Promise<any> => {
    return await apiRequest(`/api/prescription/update/${prescriptionId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  /**
   * Delete a prescription
   */
  deletePrescription: async (prescriptionId: number): Promise<string> => {
    return await apiRequest(`/api/prescription/delete/${prescriptionId}`, {
      method: 'DELETE',
    });
  },
};
