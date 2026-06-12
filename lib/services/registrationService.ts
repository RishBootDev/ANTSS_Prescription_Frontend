import { apiRequest } from '../api';
import { BackendPatientRegistration } from '../../types/backend';

export const RegistrationService = {
  /**
   * Create a new patient registration
   */
  createRegistration: async (registrationData: Partial<BackendPatientRegistration>): Promise<BackendPatientRegistration> => {
    return await apiRequest('/api/patient-registrations', {
      method: 'POST',
      body: JSON.stringify(registrationData),
    });
  },

  /**
   * Get registration by ID
   */
  getRegistrationById: async (registrationId: number): Promise<BackendPatientRegistration> => {
    return await apiRequest(`/api/patient-registrations/${registrationId}`, {
      method: 'GET',
    });
  },

  /**
   * Get all registrations
   */
  getAllRegistrations: async (): Promise<BackendPatientRegistration[]> => {
    return await apiRequest('/api/patient-registrations', {
      method: 'GET',
    });
  },

  /**
   * Get registrations by clinic ID
   */
  getRegistrationsByClinic: async (clinicId: number): Promise<BackendPatientRegistration[]> => {
    return await apiRequest(`/api/patient-registrations/clinic/${clinicId}`, {
      method: 'GET',
    });
  },

  /**
   * Get registrations by hospital ID
   */
  getRegistrationsByHospital: async (hospitalId: number): Promise<BackendPatientRegistration[]> => {
    return await apiRequest(`/api/patient-registrations/hospital/${hospitalId}`, {
      method: 'GET',
    });
  },

  /**
   * Update an existing registration
   */
  updateRegistration: async (registrationId: number, registrationData: Partial<BackendPatientRegistration>): Promise<BackendPatientRegistration> => {
    return await apiRequest(`/api/patient-registrations/${registrationId}`, {
      method: 'PUT',
      body: JSON.stringify(registrationData),
    });
  },

  /**
   * Delete a registration
   */
  deleteRegistration: async (registrationId: number): Promise<string> => {
    return await apiRequest(`/api/patient-registrations/${registrationId}`, {
      method: 'DELETE',
    });
  },
};
