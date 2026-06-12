import { create } from "zustand";
import { prescriptionService } from "../services/prescription.service";
import { SavePrescriptionRequest } from "../../types/backend";

interface PrescriptionState {
  prescriptionsList: any[];
  loading: boolean;
  error: string | null;
  fetchPatientPrescriptions: (patientId: number) => Promise<any[]>;
  savePrescription: (data: SavePrescriptionRequest) => Promise<any>;
  updatePrescription: (prescriptionId: number, data: Partial<SavePrescriptionRequest>) => Promise<any>;
}

export const usePrescriptionStore = create<PrescriptionState>((set) => ({
  prescriptionsList: [],
  loading: false,
  error: null,

  fetchPatientPrescriptions: async (patientId) => {
    set({ loading: true, error: null });
    try {
      const history = await prescriptionService.getDetailedPrescriptionsByPatientId(patientId);
      set({ prescriptionsList: history, loading: false });
      return history;
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch prescriptions", loading: false });
      return [];
    }
  },

  savePrescription: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await prescriptionService.savePrescription(data);
      set({ loading: false });
      return res;
    } catch (err: any) {
      set({ error: err.message || "Failed to save prescription", loading: false });
      throw err;
    }
  },

  updatePrescription: async (prescriptionId, data) => {
    set({ loading: true, error: null });
    try {
      const res = await prescriptionService.updatePrescription(prescriptionId, data);
      set({ loading: false });
      return res;
    } catch (err: any) {
      set({ error: err.message || "Failed to update prescription", loading: false });
      throw err;
    }
  },
}));
