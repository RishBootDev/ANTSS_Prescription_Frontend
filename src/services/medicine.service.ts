import { apiClient } from "./axios";

export type MedicineMaster = {
  id?: number | string;
  medicineId?: number | string;
  medicineName: string;
  genericName?: string;
  strength?: string;
  dosageForm?: string;
  dosage?: string;
  dose?: string;
  instructions?: string;
  manufacturer?: string;
  active?: boolean;
  createdAt?: string;
};

export type MedicineMasterPayload = {
  id?: number | string;
  medicineId?: number | string;
  medicineName: string;
  genericName?: string;
  strength?: string;
  dosageForm?: string;
  dosage?: string;
  instructions?: string;
  manufacturer?: string;
  active?: boolean;
};

const normalizeMedicineFields = (medicine: any): MedicineMaster => ({
  ...medicine,
  dosage: medicine?.dosage ?? medicine?.dose ?? "",
});

const normalizeList = (response: any): MedicineMaster[] => {
  const data = response?.data ?? response;

  if (Array.isArray(data)) return data.map(normalizeMedicineFields);
  if (Array.isArray(data?.data)) return data.data.map(normalizeMedicineFields);
  if (Array.isArray(data?.content))
    return data.content.map(normalizeMedicineFields);

  return [];
};

const normalizeMedicine = (response: any): MedicineMaster => {
  const data = response?.data ?? response;

  if (data?.data && !Array.isArray(data.data))
    return normalizeMedicineFields(data.data);

  return normalizeMedicineFields(data);
};

const withParams = (params?: Record<string, any>) => ({
  params: {
    ...(params || {}),
  },
});

export const getMedicineId = (medicine: MedicineMaster) =>
  medicine.medicineId ?? medicine.id;

export const getMedicineActive = (medicine: MedicineMaster) =>
  medicine.active ?? true;

export const medicineService = {
  createMedicine: (
    medicine: MedicineMasterPayload,
    doctorUserId?: string
  ): Promise<MedicineMaster> => {
    return apiClient
      .post<any>("/api/medicines", medicine)
      .then(normalizeMedicine);
  },

  saveMedicine: (
    medicine: MedicineMasterPayload,
    doctorUserId?: string
  ): Promise<MedicineMaster> => {
    const id = medicine.medicineId ?? medicine.id;

    if (id !== undefined && id !== null && id !== "") {
      return apiClient
        .put<any>(`/api/medicines/${id}`, medicine)
        .then(normalizeMedicine);
    }

    return apiClient
      .post<any>("/api/medicines", medicine)
      .then(normalizeMedicine);
  },

  getMedicines: async (
    doctorUserId?: string
  ): Promise<MedicineMaster[]> => {
    const response = await apiClient.get<any>("/api/medicines");
    return normalizeList(response);
  },

  getMedicineById: (
    id: number | string,
    doctorUserId?: string
  ): Promise<MedicineMaster> => {
    return apiClient
      .get<any>(`/api/medicines/${id}`)
      .then(normalizeMedicine);
  },

  searchMedicines: async (
    keyword: string,
    doctorUserId?: string
  ): Promise<MedicineMaster[]> => {
    const response = await apiClient.get<any>(
      "/api/medicines/search",
      withParams({ keyword })
    );

    return normalizeList(response);
  },

  deleteMedicine: (
    id: number | string,
    doctorUserId?: string
  ): Promise<void> => {
    return apiClient.delete<void>(`/api/medicines/${id}`);
  },
};
