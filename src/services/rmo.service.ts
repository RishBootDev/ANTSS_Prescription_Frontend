import { apiClient } from "./axios";

export interface RmoRequest {
  rmoName: string;
  email: string;
  mobileNumber?: string;
  employeeCode: string;
  hospitalId?: number;
  clinicId?: number;
  role: "RMO" | "NURSE" | "RECEPTIONIST" | "STAFF" | string;
}

export interface RmoResponse extends RmoRequest {
  id: string;
  userId?: string;
  status?: string;
}

const unwrap = <T>(response: any): T => response?.data ?? response;

export const rmoService = {
  addRmo: (data: RmoRequest): Promise<RmoResponse> =>
    apiClient.post<any>("/api/rmos", data).then(unwrap<RmoResponse>),

  updateRmo: (id: string, data: RmoRequest): Promise<RmoResponse> =>
    apiClient.put<any>(`/api/rmos/${id}`, data).then(unwrap<RmoResponse>),

  deleteRmo: (id: string): Promise<void> =>
    apiClient.delete<any>(`/api/rmos/${id}`).then(() => undefined),

  listRmos: (): Promise<RmoResponse[]> =>
    apiClient.get<any>("/api/rmos").then(unwrap<RmoResponse[]>),

  getRmoById: (id: string): Promise<RmoResponse> =>
    apiClient.get<any>(`/api/rmos/${id}`).then(unwrap<RmoResponse>),
};
