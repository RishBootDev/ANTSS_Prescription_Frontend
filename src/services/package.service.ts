import { apiClient } from "./axios";

export type DurationType = "MONTHLY" | "QUARTERLY" | "SIX_MONTH" | "ONE_YEAR" | "TWO_YEAR" | "YEARLY" | "LIFETIME";

export interface PackageRequest {
  packageName: string;
  durationType: DurationType;
  baseDoctorLimit: number;
  packagePrice: number;
  extraDoctorPrice: number;
  features?: string;
  active?: boolean;
}

export interface PackageResponse extends PackageRequest {
  id: number;
}

const unwrap = <T>(response: any): T => response?.data ?? response;

export const packageService = {
  listPackages: (): Promise<PackageResponse[]> =>
    apiClient.get<any>("/api/packages").then(unwrap<PackageResponse[]>),

  createPackage: (data: PackageRequest): Promise<PackageResponse> =>
    apiClient.post<any>("/api/packages", data).then(unwrap<PackageResponse>),

  updatePackage: (id: number, data: PackageRequest): Promise<PackageResponse> =>
    apiClient.put<any>(`/api/packages/${id}`, data).then(unwrap<PackageResponse>),

  deletePackage: (id: number): Promise<void> =>
    apiClient.delete<any>(`/api/packages/${id}`).then(() => undefined),
};
