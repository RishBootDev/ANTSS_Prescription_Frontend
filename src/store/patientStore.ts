import { create } from "zustand";
import { patientService } from "../services/patient.service";
import { BackendPatient } from "../../types/backend";

interface PatientState {
  patients: BackendPatient[];
  loading: boolean;
  error: string | null;
  activePatient: BackendPatient | null;
  fetchPatients: () => Promise<void>;
  setActivePatient: (patient: BackendPatient | null) => void;
  registerPatient: (data: any) => Promise<any>;
}

export const usePatientStore = create<PatientState>((set) => ({
  patients: [],
  loading: false,
  error: null,
  activePatient: null,

  fetchPatients: async () => {
    set({ loading: true, error: null });
    try {
      const data = await patientService.getAllPatients();
      set({ patients: data, loading: false });
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
