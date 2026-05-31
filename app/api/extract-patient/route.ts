import { generateText } from "ai"
import { createGroq } from "@ai-sdk/groq"
import { z } from "zod"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

const medicineSchema = z.object({
  name: z.string().describe("Name of the medicine/drug"),
  dose: z.string().nullable().describe("Dosage amount (e.g., 500mg, 10ml, 2 tablets)"),
  frequency: z.string().nullable().describe("How often to take (e.g., twice daily, every 8 hours, SOS)"),
  duration: z.string().nullable().describe("How long to take (e.g., 5 days, 1 week, 10 days)"),
  instructions: z.string().nullable().describe("Special instructions (e.g., after food, with water, before bed)"),
})

const complaintSchema = z.object({
  complaint: z.string().describe("Complaint text (what the patient reports)"),
  frequency: z.string().nullable().describe("Frequency of complaint if mentioned (e.g., 3 days, every day)"),
  severity: z.string().nullable().describe("Severity if mentioned (e.g., mild/moderate/severe)"),
  duration: z.string().nullable().describe("Duration if mentioned (e.g., 2 days, 1 week)"),
  date: z.string().nullable().describe("Date if mentioned"),
})

const diagnosisSchema = z.object({
  diagnosis: z.string().describe("Diagnosis text"),
  snomedCode: z.string().nullable().describe("SNOMED code if mentioned"),
  duration: z.string().nullable().describe("Duration if mentioned"),
  date: z.string().nullable().describe("Date if mentioned"),
})

const patientSchema = z.object({
  // Demographics / vitals
  name: z.string().nullable().describe("Patient's full name"),
  age: z.number().nullable().describe("Patient's age in years"),
  gender: z.string().nullable().describe("Patient's gender (Male/Female/Other)"),
  weight: z.number().nullable().describe("Patient's weight in kg"),
  height: z.number().nullable().describe("Patient's height in cm"),
  bloodPressureSystolic: z.number().nullable().describe("Systolic blood pressure (top number)"),
  bloodPressureDiastolic: z.number().nullable().describe("Diastolic blood pressure (bottom number)"),
  pulse: z.number().nullable().describe("Heart rate / pulse in beats per minute"),
  temperature: z.number().nullable().describe("Body temperature in Fahrenheit"),
  oxygenSaturation: z.number().nullable().describe("Oxygen saturation (SpO2) percentage"),
  bloodGroup: z.string().nullable().describe("Blood group (A+, A-, B+, B-, AB+, AB-, O+, O-)"),
  visitDate: z.string().nullable().describe("Date of visit if mentioned (keep as spoken/parsed text)"),

  // History
  allergies: z.string().nullable().describe("Known allergies"),
  currentMedications: z.string().nullable().describe("Current medications the patient is already taking"),
  chiefComplaint: z.string().nullable().describe("Main reason for visit / chief complaint"),
  symptoms: z.string().nullable().describe("Current symptoms described"),
  medicalHistory: z.string().nullable().describe("Relevant medical history"),

  // Complaints / exam / diagnosis
  quickNotes: z.string().nullable().describe("Quick notes if explicitly mentioned"),
  complaints: z.array(complaintSchema).describe("List of complaints mentioned"),
  generalExamination: z.string().nullable().describe("General examination findings if explicitly mentioned"),
  diagnoses: z.array(diagnosisSchema).describe("List of diagnoses mentioned"),

  // Plan / follow-up
  advice: z.string().nullable().describe("Doctor's advice if explicitly mentioned"),
  testsRequested: z.string().nullable().describe("Tests requested if explicitly mentioned"),
  nextVisit: z.string().nullable().describe("Next visit plan if explicitly mentioned"),
  investigations: z.string().nullable().describe("Investigations if explicitly mentioned"),
  payment: z.string().nullable().describe("Payment details if explicitly mentioned"),
  followUp: z.string().nullable().describe("Follow-up plan if explicitly mentioned"),

  // Contact
  contactNumber: z.string().nullable().describe("Contact phone number"),
  emergencyContact: z.string().nullable().describe("Emergency contact name and number"),
  insuranceId: z.string().nullable().describe("Insurance ID or policy number"),

  // Medicines
  medicines: z.array(medicineSchema).describe("List of prescribed medicines mentioned"),
})

type PatientData = z.infer<typeof patientSchema>

export async function POST(req: Request) {
  try {
    const { text } = await req.json()

    if (!text || typeof text !== "string") {
      return Response.json({ error: "No text provided" }, { status: 400 })
    }

    const { text: responseText } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      messages: [
        {
          role: "system",
          content: `You are a conversational medical AI assistant. Your job is to:
1. Extract structured patient data from spoken text
2. Respond conversationally like a helpful medical assistant

IMPORTANT RULES FOR DATA EXTRACTION:
- Extract ONLY information that is explicitly mentioned.
- For string/number fields not mentioned: return null.
- For arrays (medicines, complaints, diagnoses): return [] if none are mentioned.
- For blood pressure: extract both systolic and diastolic numbers separately.
- Convert units if necessary (e.g., pounds to kg, feet to cm).
- For temperature, use Fahrenheit.
- Be precise with medical data - don't guess.
- Clean up any speech recognition errors if the intent is clear.

CONVERSATIONAL BEHAVIOR (as "Compounder" - a helpful medical assistant):
- Keep replies SHORT (1 sentence max)
- Address the doctor respectfully as "Doctor" or "Sir/Ma'am"
- Confirm what you captured in a professional manner
- Ask relevant follow-up questions to complete the patient record
- Be efficient and helpful like an experienced compounder
- Examples of good replies:
  * "Recorded, Doctor. What about the patient's vitals?"
  * "Noted, Sir. Should I add any allergies?"
  * "Filled, Ma'am. What's the chief complaint?"
  * "Added to the file, Doctor. Any medications to prescribe?"
  * "Done, Sir. Should I note the blood pressure?"
  * "Entered, Doctor. What about the patient's age and gender?"
  * "Captured, Ma'am. Any other symptoms to record?"
  * "Updated, Doctor. Should I add the diagnosis?"

Return your response in this EXACT JSON format:
{
  "result": { ... patient data object ... },
  "reply": "your short conversational response here"
}

The patient data object structure:
{
  "name": string | null,
  "age": number | null,
  "gender": string | null,
  "weight": number | null,
  "height": number | null,
  "bloodPressureSystolic": number | null,
  "bloodPressureDiastolic": number | null,
  "pulse": number | null,
  "temperature": number | null,
  "oxygenSaturation": number | null,
  "bloodGroup": string | null,
  "visitDate": string | null,
  "allergies": string | null,
  "currentMedications": string | null,
  "chiefComplaint": string | null,
  "symptoms": string | null,
  "medicalHistory": string | null,
  "quickNotes": string | null,
  "complaints": [{ "complaint": string, "frequency": string | null, "severity": string | null, "duration": string | null, "date": string | null }],
  "generalExamination": string | null,
  "diagnoses": [{ "diagnosis": string, "snomedCode": string | null, "duration": string | null, "date": string | null }],
  "advice": string | null,
  "testsRequested": string | null,
  "nextVisit": string | null,
  "investigations": string | null,
  "payment": string | null,
  "followUp": string | null,
  "contactNumber": string | null,
  "emergencyContact": string | null,
  "insuranceId": string | null,
  "medicines": [{ "name": string, "dose": string, "frequency": string, "duration": string, "instructions": string }]
}`,
        },
        {
          role: "user",
          content: `Extract patient information and respond conversationally for this spoken text:\n\n"${text}"`,
        },
      ],
    })

    // Parse the JSON response
    let parsed: unknown
    try {
      // Clean up the response in case it has markdown code fences and/or extra text
      const cleanedText = responseText.trim()
      const withoutFences = cleanedText
        .replace(/^```[a-z0-9]*\s*/i, "")
        .replace(/```$/i, "")
        .trim()

      // As a last resort, extract the first JSON object substring
      const firstBrace = withoutFences.indexOf("{")
      const lastBrace = withoutFences.lastIndexOf("}")
      const jsonCandidate =
        firstBrace !== -1 && lastBrace !== -1 ? withoutFences.slice(firstBrace, lastBrace + 1) : withoutFences

      parsed = JSON.parse(jsonCandidate)
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError, "Response:", responseText)
      return Response.json({ error: "Invalid response from AI" }, { status: 500 })
    }

    // The parsed response should have 'result' and optionally 'reply'
    const responseObj = parsed as { result?: Record<string, unknown>; reply?: string }
    
    // Validate the result against schema
    const result: PatientData = patientSchema.parse(responseObj.result || parsed)
    
    // Extract the conversational reply
    const reply = responseObj.reply || null

    return Response.json({ result, reply })
  } catch (error) {
    console.error("AI processing error:", error)
    const details = error instanceof Error ? error.message : String(error)
    return Response.json({ error: "AI processing failed", details }, { status: 500 })
  }
}
