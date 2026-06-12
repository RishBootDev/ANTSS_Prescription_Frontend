import { create } from "zustand";
import { consultationService, BackendConsultation } from "../services/consultation.service";

interface ConsultationState {
  currentConsultation: BackendConsultation | null;
  loading: boolean;
  error: string | null;
  saveConsultation: (data: BackendConsultation) => Promise<any>;
  updateConsultation: (id: number, data: BackendConsultation) => Promise<any>;
  loadConsultation: (id: number) => Promise<void>;
  resetConsultation: () => void;
}

export const useConsultationStore = create<ConsultationState>((set) => ({
  currentConsultation: null,
  loading: false,
  error: null,

  saveConsultation: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await consultationService.saveConsultation(data);
      set({ currentConsultation: res, loading: false });
      return res;
    } catch (err: any) {
      set({ error: err.message || "Failed to save consultation", loading: false });
      throw err;
    }
  },

  updateConsultation: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const res = await consultationService.updateConsultation(id, data);
      set({ currentConsultation: res, loading: false });
      return res;
    } catch (err: any) {
      set({ error: err.message || "Failed to update consultation", loading: false });
      throw err;
    }
  },

  loadConsultation: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await consultationService.getConsultationById(id);
      set({ currentConsultation: res, loading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to load consultation", loading: false });
    }
  },

  resetConsultation: () => {
    set({ currentConsultation: null, error: null });
  },
}));
