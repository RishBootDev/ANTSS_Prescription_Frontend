import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { patientSchema, AIPrescriptionData } from "@/src/services/ai/validation";
import { getSystemPrompt } from "@/src/services/ai/promptBuilder";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

// Force the serverless function to run longer to prevent timeouts on complex extractions
export const maxDuration = 60; // 60 seconds

export async function POST(req: Request) {
  try {
    const { transcript, mode = "GLOBAL", component, field } = await req.json();

    if (!transcript || typeof transcript !== "string") {
      return Response.json({ error: "No transcript provided" }, { status: 400 });
    }

    const { text: responseText } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      messages: [
        {
          role: "system",
          content: getSystemPrompt(mode, component, field),
        },
        {
          role: "user",
          content: `Extract patient information for this transcript:\n\n"${transcript}"`,
        },
      ],
    });

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

      // Safe evaluation of simple math expressions the LLM might output (e.g. 64 * 2.54)
      let safeJsonCandidate = jsonCandidate;
      // Loop to handle potential multiple operations or just a single binary operation
      safeJsonCandidate = safeJsonCandidate.replace(/:\s*([\d.]+)\s*([*/+-])\s*([\d.]+)/g, (match, p1, operator, p2) => {
        const num1 = parseFloat(p1);
        const num2 = parseFloat(p2);
        let result = 0;
        if (operator === '*') result = num1 * num2;
        else if (operator === '/') result = num1 / num2;
        else if (operator === '+') result = num1 + num2;
        else if (operator === '-') result = num1 - num2;
        return `: ${result}`;
      });

      parsed = JSON.parse(safeJsonCandidate);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError, "Response:", responseText);
      return Response.json({ error: "Invalid response from AI" }, { status: 500 });
    }

    const responseObj = parsed as { result?: Record<string, unknown>; reply?: string };
    const result = patientSchema.partial().parse(responseObj.result || parsed) as Partial<AIPrescriptionData>;
    const reply = responseObj.reply || null;

    return Response.json({ result, reply });
  } catch (error) {
    console.error("Extraction error:", error);
    const details = error instanceof Error ? error.message : String(error);
    return Response.json({ error: "Extraction failed", details }, { status: 500 });
  }
}
