import { apiClient } from "./axios";

export interface HospitalRequest {
  hospitalName: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  pincode?: string;
  email: string;
  mobileNumber: string;
}

export interface ClinicRequest {
  clinicName: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  pincode?: string;
  email: string;
  mobileNumber: string;
}

export interface HospitalResponse extends HospitalRequest {
  id: number;
  userId: string;
  hospitalCode?: string;
  registrationNumber?: string;
  maxDoctorLimit?: number;
  activeDoctorCount?: number;
  status?: string;
}

export interface ClinicResponse extends ClinicRequest {
  id: number;
  userId: string;
  clinicCode?: string;
  registrationNumber?: string;
  maxDoctorLimit?: number;
  activeDoctorCount?: number;
  status?: string;
}

const unwrap = <T>(response: any): T => response?.data ?? response;

export const facilityService = {
  createHospital: (data: HospitalRequest): Promise<HospitalResponse> =>
    apiClient.post<any>("/api/hospitals", data).then(unwrap<HospitalResponse>),

  listHospitals: (): Promise<HospitalResponse[]> =>
    apiClient.get<any>("/api/hospitals").then(unwrap<HospitalResponse[]>),

  getHospitalById: (id: number): Promise<HospitalResponse> =>
    apiClient.get<any>(`/api/hospitals/${id}`).then(unwrap<HospitalResponse>),

  createClinic: (data: ClinicRequest): Promise<ClinicResponse> =>
    apiClient.post<any>("/api/clinics", data).then(unwrap<ClinicResponse>),

  listClinics: (): Promise<ClinicResponse[]> =>
    apiClient.get<any>("/api/clinics").then(unwrap<ClinicResponse[]>),

  getClinicById: (id: number): Promise<ClinicResponse> =>
    apiClient.get<any>(`/api/clinics/${id}`).then(unwrap<ClinicResponse>),
};
