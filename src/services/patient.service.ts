import { apiClient } from "./axios";
import { PatientRequest, PatientResponse, PatientRegistrationRequest, PatientRegistrationResponse } from "../../types/backend";

export const patientService = {
  createPatient: (patientData: PatientRequest): Promise<PatientResponse> => {
    return apiClient.post<PatientResponse>("/api/patients", patientData);
  },

  getPatientById: (patientId: number): Promise<PatientResponse> => {
    return apiClient.get<PatientResponse>(`/api/patients/${patientId}`);
  },

  getAllPatients: (): Promise<PatientResponse[]> => {
    return apiClient.get<PatientResponse[]>("/api/patients");
  },

  updatePatient: (patientId: number, patientData: PatientRequest): Promise<PatientResponse> => {
    return apiClient.put<PatientResponse>(`/api/patients/${patientId}`, patientData);
  },

  deletePatient: (patientId: number): Promise<string> => {
    return apiClient.delete<string>(`/api/patients/${patientId}`);
  },

  createRegistration: (registrationData: Partial<PatientRegistrationRequest>): Promise<PatientRegistrationResponse> => {
    return apiClient.post<PatientRegistrationResponse>("/api/patient-registrations", registrationData);
  },

  getAllRegistrations: (): Promise<PatientRegistrationResponse[]> => {
    return apiClient.get<PatientRegistrationResponse[]>("/api/patient-registrations");
  },

  getRegistrationById: (registrationId: number): Promise<PatientRegistrationResponse> => {
    return apiClient.get<PatientRegistrationResponse>(`/api/patient-registrations/${registrationId}`);
  },

  getRegistrationsByClinic: (clinicId: number): Promise<PatientRegistrationResponse[]> => {
    return apiClient.get<PatientRegistrationResponse[]>(`/api/patient-registrations/clinic/${clinicId}`);
  },

  getRegistrationsByHospital: (hospitalId: number): Promise<PatientRegistrationResponse[]> => {
    return apiClient.get<PatientRegistrationResponse[]>(`/api/patient-registrations/hospital/${hospitalId}`);
  },

  updateRegistration: (
    registrationId: number,
    registrationData: Partial<PatientRegistrationRequest>
  ): Promise<PatientRegistrationResponse> => {
    return apiClient.put<PatientRegistrationResponse>(`/api/patient-registrations/${registrationId}`, registrationData);
  },

  deleteRegistration: (registrationId: number): Promise<string> => {
    return apiClient.delete<string>(`/api/patient-registrations/${registrationId}`);
  },
};
