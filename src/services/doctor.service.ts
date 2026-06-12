import { apiClient } from "./axios";

export interface Doctor {
  id: string;
  doctorCode: string;
  doctorName: string;
  specialization: string;
  qualification: string;
  mobileNumber: string;
  email: string;
}

export const doctorService = {
  addDoctor: (data: any): Promise<any> => {
    return apiClient.post<any>("/api/doctors", data);
  },

  updateDoctor: (id: string, data: any): Promise<any> => {
    return apiClient.put<any>(`/api/doctors/${id}`, data);
  },

  deleteDoctor: (id: string): Promise<any> => {
    return apiClient.delete<any>(`/api/doctors/${id}`);
  },

  listDoctors: (): Promise<any> => {
    return apiClient.get<any>("/api/doctors");
  },

  getDoctorById: (id: string): Promise<any> => {
    return apiClient.get<any>(`/api/doctors/${id}`);
  },

  getDoctorProfile: (): Promise<any> => {
    return apiClient.get<any>("/api/doctors/profile");
  },
};
