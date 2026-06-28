import { create } from "zustand";
import { AIPrescriptionData } from "../services/ai/validation";

export type AIState = "idle" | "listening" | "processing" | "speaking" | "error";

interface AIStoreState {
  state: AIState;
  transcript: string;
  error: string | null;
  extractedData: AIPrescriptionData | null;
  
  // Actions
  setTranscript: (text: string) => void;
  appendTranscript: (text: string) => void;
  setState: (state: AIState) => void;
  setError: (error: string | null) => void;
  setExtractedData: (data: AIPrescriptionData | null) => void;
  reset: () => void;
}

export const useAIStore = create<AIStoreState>((set) => ({
  state: "idle",
  transcript: "",
  error: null,
  extractedData: null,

  setTranscript: (text) => set({ transcript: text }),
  
  appendTranscript: (text) => set((state) => {
    // Prevent duplicate appends if the speech recognition fires multiple times
    if (state.transcript.endsWith(text)) return state;
    return { transcript: state.transcript ? `${state.transcript} ${text}` : text };
  }),
  
  setState: (newState) => set({ state: newState }),
  
  setError: (error) => set({ error, state: error ? "error" : "idle" }),
  
  setExtractedData: (data) => set({ extractedData: data }),
  
  reset: () => set({ 
    state: "idle", 
    transcript: "", 
    error: null, 
    extractedData: null 
  }),
}));
