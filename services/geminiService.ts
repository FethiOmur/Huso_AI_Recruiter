import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CandidateAnalysis, HiringRecommendation } from "../types";

// Define the structured output schema strictly using the Type enum
const candidateSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    candidate_name: {
      type: Type.STRING,
      description: "The full name of the candidate extracted from the resume.",
    },
    match_score: {
      type: Type.INTEGER,
      description: "A score from 0 to 100 indicating how well the candidate fits the job description.",
    },
    key_strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of the candidate's top strengths relevant to the JD.",
    },
    missing_skills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of critical skills from the JD that the candidate is missing.",
    },
    hiring_recommendation: {
      type: Type.STRING,
      enum: [
        HiringRecommendation.STRONG_HIRE,
        HiringRecommendation.INTERVIEW,
        HiringRecommendation.KEEP_ON_FILE,
        HiringRecommendation.REJECT
      ],
      description: "The final recommendation based on the analysis.",
    },
    summary: {
      type: Type.STRING,
      description: "A brief professional summary of the analysis. Do not include phone numbers or emails (PII).",
    },
  },
  required: ["candidate_name", "match_score", "key_strengths", "missing_skills", "hiring_recommendation", "summary"],
};

/**
 * Converts a File object to a Base64 string for the API
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the Data-URI prefix (e.g., "data:application/pdf;base64,")
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Helper to clean Markdown code blocks from JSON response
 */
const cleanJsonString = (text: string): string => {
  let cleanText = text.trim();
  // Remove markdown code blocks if present (```json ... ``` or just ``` ... ```)
  if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/^```(json)?/, '').replace(/```$/, '');
  }
  return cleanText.trim();
};

/**
 * Analyzes a single resume against a job description
 */
export const analyzeResume = async (
  file: File,
  jobDescription: string,
  apiKey?: string,
  modelName: string = "gemini-2.5-flash"
): Promise<CandidateAnalysis> => {
  try {
    // Require the user-provided API key for every request (no env fallback)
    const finalApiKey = apiKey?.trim();
    
    if (!finalApiKey) {
      throw new Error("API Key is missing. Please configure it in settings.");
    }

    const ai = new GoogleGenAI({ apiKey: finalApiKey });
    const base64Data = await fileToBase64(file);

    // Prompt construction (concise + strict JSON intent)
    const promptText = `
      You are an expert HR recruiter. Analyze the attached resume PDF against the Job Description.

      JOB DESCRIPTION:
      ${jobDescription}

      Output must strictly match the provided JSON schema; do not wrap in markdown.

      Rules:
      - Derive candidate_name from the resume; if missing, infer from context (not from JD).
      - match_score: 0-100, grounded in JD requirements (not arbitrary).
      - key_strengths: only JD-relevant strengths; short bullet phrases.
      - missing_skills: critical JD gaps only; keep concise.
      - hiring_recommendation: pick one of the allowed enum values, consistent with the score.
      - summary: 2-4 sentences, JD-focused, no contact info or PII. Omit phone, email, address.
      - If data is ambiguous, state uncertainty briefly in summary rather than hallucinating.
    `;

    const executeCall = async () => {
      return ai.models.generateContent({
        model: modelName, 
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: "application/pdf",
                data: base64Data,
              },
            },
            {
              text: promptText,
            },
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: candidateSchema,
          temperature: 0.1, // Lower temperature for more deterministic JSON
        },
      });
    };

    let response;
    try {
      response = await executeCall();
    } catch (err: any) {
      const message = err?.message || "";
      if (message.includes("503") || message.includes("UNAVAILABLE") || message.includes("overloaded")) {
        // simple one-time retry after short backoff
        await new Promise((res) => setTimeout(res, 1200));
        response = await executeCall();
      } else {
        throw err;
      }
    }

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const cleanedText = cleanJsonString(text);
    const data = JSON.parse(cleanedText);

    return {
      ...data,
      id: crypto.randomUUID(),
      fileName: file.name,
    };

  } catch (error) {
    console.error("Error analyzing resume:", error);
    
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
      // Handle 404 specifically to give a better hint
      if (errorMessage.includes("404") || errorMessage.includes("not found")) {
        errorMessage = `Model '${modelName}' not found. Check your API Key permissions or try 'gemini-2.5-flash'.`;
      }
    }

    return {
      id: crypto.randomUUID(),
      candidate_name: "Error Processing",
      fileName: file.name,
      match_score: 0,
      key_strengths: [],
      missing_skills: ["Analysis Failed"],
      hiring_recommendation: HiringRecommendation.REJECT,
      summary: `Failed to analyze file: ${errorMessage}`,
    };
  }
};
