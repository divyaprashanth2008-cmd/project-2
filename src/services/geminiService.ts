import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface ResumeAnalysis {
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  skillsMatch: { skill: string; match: boolean }[];
  experienceMatch: string;
  recommendation: "Strong Hire" | "Potential" | "Not Recommended";
}

export async function analyzeResume(resumeText: string, jobDescription: string): Promise<ResumeAnalysis> {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Analyze the following resume against the job description. Provide a detailed scoring and breakdown.
    
    JOB DESCRIPTION:
    ${jobDescription}
    
    RESUME TEXT:
    ${resumeText}
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.INTEGER, description: "Matching score from 0 to 100" },
          summary: { type: Type.STRING, description: "Brief summary of the candidate's profile" },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key strengths found" },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Missing skills or gaps" },
          skillsMatch: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                skill: { type: Type.STRING },
                match: { type: Type.BOOLEAN }
              },
              required: ["skill", "match"]
            }
          },
          experienceMatch: { type: Type.STRING, description: "Analysis of how experience aligns" },
          recommendation: { type: Type.STRING, enum: ["Strong Hire", "Potential", "Not Recommended"] }
        },
        required: ["score", "summary", "strengths", "weaknesses", "skillsMatch", "experienceMatch", "recommendation"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}
