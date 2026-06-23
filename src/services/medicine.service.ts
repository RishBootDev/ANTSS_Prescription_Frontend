import { apiClient } from "./axios";

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

const withParams = (params?: Record<string, any>) => ({
  params: {
    ...(params || {}),
  },
});

export const getMedicineId = (medicine: MedicineMaster) =>
  medicine.id ?? medicine.medicineId;

export const getMedicineActive = (medicine: MedicineMaster) =>
  medicine.activeStatus ?? medicine.active ?? true;

export const medicineService = {
  createMedicine: (medicine: MedicineMasterPayload, doctorUserId?: string): Promise<MedicineMaster> => {
    return apiClient
      .post<any>("/api/medicines", medicine)
      .then(normalizeMedicine);
  },

  saveMedicine: (medicine: MedicineMasterPayload, doctorUserId?: string): Promise<MedicineMaster> => {
    return apiClient
      .post<any>("/api/medicines", medicine)
      .then(normalizeMedicine);
  },

  getMedicines: async (doctorUserId?: string): Promise<MedicineMaster[]> => {
    const response = await apiClient.get<any>("/api/medicines");
    return normalizeList(response);
  },

  getMedicineById: (id: number | string, doctorUserId?: string): Promise<MedicineMaster> => {
    return apiClient
      .get<any>(`/api/medicines/${id}`)
      .then(normalizeMedicine);
  },

  searchMedicines: async (keyword: string, doctorUserId?: string): Promise<MedicineMaster[]> => {
    const response = await apiClient.get<any>("/api/medicines/search", withParams({ keyword }));
    return normalizeList(response);
  },

  deleteMedicine: (id: number | string, doctorUserId?: string): Promise<void> => {
    return apiClient.delete<void>(`/api/medicines/${id}`);
  },
};
