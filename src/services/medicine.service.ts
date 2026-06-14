import { apiClient } from "./axios";
import { tokenService } from "@/src/modules/auth/services/token.service";

export type MedicineMaster = {
  id?: number | string;
  medicineId?: number | string;
  medicineName: string;
  strength?: string;
  dosageForm?: string;
  defaultDosage?: string;
  defaultFrequency?: string;
  defaultDuration?: string;
  defaultInstruction?: string;
  manufacturer?: string;
  active?: boolean;
  activeStatus?: boolean;
};

export type MedicineMasterPayload = {
  id?: number | string;
  medicineId?: number | string;
  medicineName: string;
  strength?: string;
  dosageForm?: string;
  defaultDosage?: string;
  defaultFrequency?: string;
  defaultDuration?: string;
  defaultInstruction?: string;
  manufacturer?: string;
  active?: boolean;
  activeStatus?: boolean;
};

const normalizeList = (response: any): MedicineMaster[] => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.content)) return response.content;
  return [];
};

const normalizeMedicine = (response: any): MedicineMaster => {
  if (response?.data && !Array.isArray(response.data)) return response.data;
  return response;
};

const getLoggedInUserId = () => {
  const user = tokenService.getUser() as any;
  const userId = user?.id ?? user?.userId;

  if (!userId) {
    throw new Error("Logged-in user id was not found. Please login again.");
  }

  return userId;
};

const withUserId = (params?: Record<string, any>) => ({
  params: {
    ...(params || {}),
    userId: getLoggedInUserId(),
  },
});

export const getMedicineId = (medicine: MedicineMaster) =>
  medicine.id ?? medicine.medicineId;

export const getMedicineActive = (medicine: MedicineMaster) =>
  medicine.activeStatus ?? medicine.active ?? true;

export const medicineService = {
  createMedicine: (medicine: MedicineMasterPayload): Promise<MedicineMaster> => {
    return apiClient
      .post<any>("/api/medicines", medicine, withUserId())
      .then(normalizeMedicine);
  },

  saveMedicine: (medicine: MedicineMasterPayload): Promise<MedicineMaster> => {
    return apiClient
      .post<any>("/api/medicines", medicine, withUserId())
      .then(normalizeMedicine);
  },

  getMedicines: async (): Promise<MedicineMaster[]> => {
    const response = await apiClient.get<any>("/api/medicines", withUserId());
    return normalizeList(response);
  },

  getMedicineById: (id: number | string): Promise<MedicineMaster> => {
    return apiClient
      .get<any>(`/api/medicines/${id}`, withUserId())
      .then(normalizeMedicine);
  },

  searchMedicines: async (keyword: string): Promise<MedicineMaster[]> => {
    const response = await apiClient.get<any>("/api/medicines/search", withUserId({ keyword }));
    return normalizeList(response);
  },

  deleteMedicine: (id: number | string): Promise<void> => {
    return apiClient.delete<void>(`/api/medicines/${id}`, withUserId());
  },
};
