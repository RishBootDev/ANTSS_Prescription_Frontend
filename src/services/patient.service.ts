import { apiClient } from "./axios";
import { BackendPatient, BackendPatientRegistration } from "../../types/backend";

export const patientService = {
  createPatient: (patientData: BackendPatient): Promise<BackendPatient> => {
    return apiClient.post<BackendPatient>("/api/patients", patientData);
  },

  getPatientById: (patientId: number): Promise<BackendPatient> => {
    return apiClient.get<BackendPatient>(`/api/patients/${patientId}`);
  },

  getAllPatients: (): Promise<BackendPatient[]> => {
    return apiClient.get<BackendPatient[]>("/api/patients");
  },

  updatePatient: (patientId: number, patientData: BackendPatient): Promise<BackendPatient> => {
    return apiClient.put<BackendPatient>(`/api/patients/${patientId}`, patientData);
  },

  deletePatient: (patientId: number): Promise<string> => {
    return apiClient.delete<string>(`/api/patients/${patientId}`);
  },

  createRegistration: (registrationData: Partial<BackendPatientRegistration>): Promise<BackendPatientRegistration> => {
    return apiClient.post<BackendPatientRegistration>("/api/patient-registrations", registrationData);
  },

  getAllRegistrations: (): Promise<BackendPatientRegistration[]> => {
    return apiClient.get<BackendPatientRegistration[]>("/api/patient-registrations");
  },

  getRegistrationById: (registrationId: number): Promise<BackendPatientRegistration> => {
    return apiClient.get<BackendPatientRegistration>(`/api/patient-registrations/${registrationId}`);
  },

  getRegistrationsByClinic: (clinicId: number): Promise<BackendPatientRegistration[]> => {
    return apiClient.get<BackendPatientRegistration[]>(`/api/patient-registrations/clinic/${clinicId}`);
  },

  getRegistrationsByHospital: (hospitalId: number): Promise<BackendPatientRegistration[]> => {
    return apiClient.get<BackendPatientRegistration[]>(`/api/patient-registrations/hospital/${hospitalId}`);
  },

  updateRegistration: (
    registrationId: number,
    registrationData: Partial<BackendPatientRegistration>
  ): Promise<BackendPatientRegistration> => {
    return apiClient.put<BackendPatientRegistration>(`/api/patient-registrations/${registrationId}`, registrationData);
  },

  deleteRegistration: (registrationId: number): Promise<string> => {
    return apiClient.delete<string>(`/api/patient-registrations/${registrationId}`);
  },
};
