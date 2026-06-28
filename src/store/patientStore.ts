import { create } from "zustand";
import { patientService } from "../services/patient.service";
import { doctorService } from "../services/doctor.service";
import { consultationService } from "../services/consultation.service";
import { PatientResponse } from "../../types/backend";

import { useAuthStore } from "./authStore";

interface PatientState {
  patients: PatientResponse[];
  consultations: any[];
  loading: boolean;
  error: string | null;
  activePatient: PatientResponse | null;
  fetchPatients: () => Promise<void>;
  setActivePatient: (patient: PatientResponse | null) => void;
  registerPatient: (data: any) => Promise<any>;
}

export const usePatientStore = create<PatientState>((set) => ({
  patients: [],
  consultations: [],
  loading: false,
  error: null,
  activePatient: null,

  fetchPatients: async () => {
    set({ loading: true, error: null });
    try {
      // 1. Fetch all accessible registrations for patient list
      const registrationsResponse = await patientService.getAllRegistrations();
      const registrations = (registrationsResponse as any)?.data || registrationsResponse;
      
      const mappedPatients = Array.isArray(registrations) ? registrations.map((r: any) => {
        const p = r.patient || {};
        return {
          patientId: p.patientId,
          patientName: p.patientName,
          mobileNumber: p.mobileNumber,
          gender: p.gender,
          age: p.age,
          address: p.address,
          state: p.state,
          city: p.city,
          pincode: p.pincode,
          dateOfBirth: p.dateOfBirth || null,
          createdAt: r.createdAt || p.createdAt,
          updatedAt: r.updatedAt || p.updatedAt || new Date().toISOString(),
          registrationId: r.registrationId,
          registrationNumber: r.registrationNumber,
        };
      }) : [];

      // 2. Try fetching consultations for follow-ups
      let consultations: any[] = [];
      try {
        const { user } = useAuthStore.getState();
        let doctorId = user?.doctorId;
        
        if (!doctorId && user?.userType === "DOCTOR") {
          const profileResponse = await doctorService.getDoctorProfile();
          doctorId = profileResponse?.data?.id || profileResponse?.id;
        }

        if (doctorId) {
          const consultationsResponse = await consultationService.getConsultationsByDoctor(doctorId);
          consultations = (consultationsResponse as any)?.data || consultationsResponse;
        } else {
          // If not a doctor, fetch all consultations within the user's clinical scope
          const consultationsResponse = await consultationService.getAllConsultations();
          consultations = (consultationsResponse as any)?.data || consultationsResponse;
        }

        if (!Array.isArray(consultations)) {
          consultations = [];
        }
      } catch (err) {
        console.warn("Failed to fetch consultations for follow-ups", err);
      }

      set({ patients: mappedPatients, consultations, loading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch patients", loading: false });
    }
  },

  setActivePatient: (patient) => {
    set({ activePatient: patient });
  },

  registerPatient: async (data) => {
    set({ loading: true });
    try {
      const newPatient = await patientService.createPatient(data);
      set((state) => ({
        patients: [...state.patients, newPatient],
        loading: false,
      }));
      return newPatient;
    } catch (err: any) {
      set({ error: err.message || "Registration failed", loading: false });
      throw err;
    }
  },
}));
