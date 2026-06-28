// Force the serverless function to run longer to prevent timeouts on large audio files
export const maxDuration = 60; // 60 seconds

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("audio") as Blob | null;

    if (!file) {
      return Response.json({ error: "No audio file provided" }, { status: 400 });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return Response.json({ error: "GROQ API Key is missing" }, { status: 500 });
    }

    const whisperFormData = new FormData();
    whisperFormData.append("file", file, "audio.webm");
    whisperFormData.append("model", "whisper-large-v3");
    whisperFormData.append("response_format", "json");
    whisperFormData.append("language", "en");

    const whisperResponse = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: whisperFormData,
    });

    if (!whisperResponse.ok) {
      const errorText = await whisperResponse.text();
      console.error("Whisper API Error:", errorText);
      return Response.json({ error: "Speech-to-text failed", details: errorText }, { status: 502 });
    }

    const whisperData = await whisperResponse.json();
    return Response.json({ transcript: whisperData.text || "" });
  } catch (error) {
    console.error("Transcription error:", error);
    const details = error instanceof Error ? error.message : String(error);
    return Response.json({ error: "Transcription failed", details }, { status: 500 });
  }
}
