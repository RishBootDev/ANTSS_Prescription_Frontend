import { useState, useRef, useCallback } from "react";

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      // Use a timeslice to ensure data is available frequently
      mediaRecorder.start(500); 
      setIsRecording(true);
    } catch (err: any) {
      console.error("Microphone access error:", err);
      setError("Microphone access denied or not available. Please check permissions.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  const getAccumulatedAudio = useCallback(async (): Promise<Blob | null> => {
    if (!mediaRecorderRef.current || chunksRef.current.length === 0) {
      return null;
    }
    
    // Request the latest data to be flushed into chunksRef
    if (mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.requestData();
    }
    
    // We need a tiny delay to ensure requestData() completes before we read chunksRef
    await new Promise(resolve => setTimeout(resolve, 50));
    
    if (chunksRef.current.length === 0) return null;
    
    return new Blob(chunksRef.current, { type: 'audio/webm' });
  }, []);

  return {
    isRecording,
    error,
    startRecording,
    stopRecording,
    getAccumulatedAudio,
    isSupported: typeof window !== "undefined" && !!navigator.mediaDevices?.getUserMedia
  };
}
