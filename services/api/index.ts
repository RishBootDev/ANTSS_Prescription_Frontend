import { apiClient } from "@/src/services/axios";
import { 
  ApiDetailedPrescriptionResponse, 
  ApiDoctorResponse, 
  ApiHospitalResponse, 
  ApiClinicResponse,
  ApiResponseEnvelope 
} from "@/types/prescription";

export const prescriptionApi = {
  /**
   * Fetches detailed prescription by ID (includes consultation, medicines, investigations, documents)
   */
  getDetailedPrescription: async (id: number): Promise<ApiDetailedPrescriptionResponse> => {
    return apiClient.get<ApiDetailedPrescriptionResponse>(`/api/prescription/detail/${id}`);
  },

  /**
   * Fetches doctor details by UUID (contains signatureUrl, hospitalId, clinicId)
   */
  getDoctorDetails: async (id: string): Promise<ApiResponseEnvelope<ApiDoctorResponse>> => {
    return apiClient.get<ApiResponseEnvelope<ApiDoctorResponse>>(`/api/doctors/${id}`);
  },

  /**
   * Fetches hospital details by ID
   */
  getHospitalDetails: async (id: number): Promise<ApiResponseEnvelope<ApiHospitalResponse>> => {
    return apiClient.get<ApiResponseEnvelope<ApiHospitalResponse>>(`/api/hospitals/${id}`);
  },

  /**
   * Fetches clinic details by ID
   */
  getClinicDetails: async (id: number): Promise<ApiResponseEnvelope<ApiClinicResponse>> => {
    return apiClient.get<ApiResponseEnvelope<ApiClinicResponse>>(`/api/clinics/${id}`);
  },

  /**
   * Fetches current logged-in doctor's profile
   */
  getDoctorProfile: async (): Promise<ApiResponseEnvelope<ApiDoctorResponse>> => {
    return apiClient.get<ApiResponseEnvelope<ApiDoctorResponse>>("/api/doctors/profile");
  }
};
