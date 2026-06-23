import { apiClient } from "./axios";

export type SubscriptionStatus = "ACTIVE" | "PENDING" | "EXPIRED" | "SUSPENDED" | "CANCELLED" | string;
export type FacilityType = "HOSPITAL" | "CLINIC";

export interface DoctorAddonRequest {
  userSubscriptionId: string;
  additionalDoctors: number;
  entityId: number;
  entityType: FacilityType;
}

export interface DoctorAddonResponse {
  id: number;
  userSubscriptionId: string;
  additionalDoctors: number;
  yearlyPricePerDoctor?: number;
  remainingMonths?: number;
  prorataAmount?: number;
  startDate?: string;
  endDate?: string;
  paymentStatus?: string;
  approvalStatus?: string;
  entityId?: number;
  entityType?: string;
  entityName?: string;
}

export interface SubscriptionResponse {
  id: string;
  userId: string;
  packageId: number;
  packageName: string;
  startDate: string;
  endDate: string;
  allowedDoctors: number;
  usedDoctors: number;
  paymentStatus: string;
  subscriptionStatus: SubscriptionStatus;
}

const unwrap = <T>(response: any): T => response?.data ?? response;

const postQuery = <T>(path: string, params: Record<string, string | number | undefined>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) query.set(key, String(value));
  });
  return apiClient.post<T>(`${path}?${query.toString()}`);
};

export const subscriptionService = {
  requestAddonDoctors: (data: DoctorAddonRequest): Promise<DoctorAddonResponse> =>
    apiClient.post<any>("/api/subscriptions/addons", data).then(unwrap<DoctorAddonResponse>),

  listActiveSubscriptions: (): Promise<SubscriptionResponse[]> =>
    apiClient.get<any>("/api/subscriptions/active").then(unwrap<SubscriptionResponse[]>),

  listAddonRequests: (): Promise<DoctorAddonResponse[]> =>
    apiClient.get<any>("/api/subscriptions/addons").then(unwrap<DoctorAddonResponse[]>),

  getSummary: (userId: string): Promise<any> =>
    apiClient.get<any>(`/api/user/subscriptions/${userId}/summary`).then(unwrap<any>),

  isValid: (userId: string): Promise<boolean> =>
    apiClient.get<boolean>(`/api/user/subscriptions/${userId}/valid`),

  getRemainingDoctorSlots: (userId: string): Promise<number> =>
    apiClient.get<number>(`/api/user/subscriptions/${userId}/doctor-slots`),

  getHistory: (userId: string): Promise<any[]> =>
    apiClient.get<any[]>(`/api/user/subscriptions/${userId}/history`),

  canAddDoctor: (userId: string): Promise<boolean> =>
    apiClient.get<boolean>(`/api/user/subscriptions/${userId}/can-add-doctor`),

  canAddHospital: (userId: string): Promise<boolean> =>
    apiClient.get<boolean>(`/api/user/subscriptions/${userId}/can-add-hospital`),

  canAddClinic: (userId: string): Promise<boolean> =>
    apiClient.get<boolean>(`/api/user/subscriptions/${userId}/can-add-clinic`),

  canCreatePrescription: (userId: string): Promise<boolean> =>
    apiClient.get<boolean>(`/api/user/subscriptions/${userId}/can-create-prescription`),

  renew: (subscriptionId: string): Promise<any> =>
    apiClient.post<any>(`/api/user/subscriptions/${subscriptionId}/renew`).then(unwrap<any>),

  upgrade: (userId: string, newPackageId: number): Promise<any> =>
    postQuery<any>(`/api/user/subscriptions/${userId}/upgrade`, { newPackageId }).then(unwrap<any>),

  requestSubscriptionAddon: (
    subscriptionId: string,
    additionalDoctors: number,
    facilityId: number,
    facilityType: FacilityType,
  ): Promise<number> =>
    postQuery<number>(`/api/user/subscriptions/${subscriptionId}/addons/request`, {
      additionalDoctors,
      facilityId,
      facilityType,
    }),

  getLinkedHospitals: (userId: string): Promise<any[]> =>
    apiClient.get<any[]>(`/api/user/subscriptions/${userId}/linked-hospitals`),

  getLinkedClinics: (userId: string): Promise<any[]> =>
    apiClient.get<any[]>(`/api/user/subscriptions/${userId}/linked-clinics`),
};
