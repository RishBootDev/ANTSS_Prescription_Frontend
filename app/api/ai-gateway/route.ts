import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { patientSchema, AIPrescriptionData } from "@/src/services/ai/validation";
import { getSystemPrompt } from "@/src/services/ai/promptBuilder";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

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

    // 1. Send Audio to Groq Whisper API
    const whisperFormData = new FormData();
    whisperFormData.append("file", file, "audio.webm"); // Groq accepts webm
    whisperFormData.append("model", "whisper-large-v3");
    whisperFormData.append("response_format", "json");
    // English language code to improve accuracy if dictation is in English
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
    const transcript = whisperData.text;

    if (!transcript || transcript.trim() === "") {
      return Response.json({ error: "No speech detected" }, { status: 400 });
    }

    // 2. Send Transcript to Groq LLM
    const { text: responseText } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      messages: [
        {
          role: "system",
          content: getSystemPrompt(),
        },
        {
          role: "user",
          content: `Extract patient information and respond conversationally for this spoken text:\n\n"${transcript}"`,
        },
      ],
    });

    // 3. Parse & Validate
    let parsed: unknown;
    try {
      const cleanedText = responseText.trim();
      const withoutFences = cleanedText
        .replace(/^```[a-z0-9]*\s*/i, "")
        .replace(/```$/i, "")
        .trim();

      const firstBrace = withoutFences.indexOf("{");
      const lastBrace = withoutFences.lastIndexOf("}");
      const jsonCandidate =
        firstBrace !== -1 && lastBrace !== -1 ? withoutFences.slice(firstBrace, lastBrace + 1) : withoutFences;

      parsed = JSON.parse(jsonCandidate);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError, "Response:", responseText);
      return Response.json({ error: "Invalid response from AI", transcript }, { status: 500 });
    }

    const responseObj = parsed as { result?: Record<string, unknown>; reply?: string };
    
    // Validate the result against schema
    const result: AIPrescriptionData = patientSchema.parse(responseObj.result || parsed);
    const reply = responseObj.reply || null;

    // Return the transcript as well so the UI can show what was heard
    return Response.json({ transcript, result, reply });
  } catch (error) {
    console.error("AI Gateway error:", error);
    const details = error instanceof Error ? error.message : String(error);
    return Response.json({ error: "AI processing failed", details }, { status: 500 });
  }
}
