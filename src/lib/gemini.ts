import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const generateAlertMessage = async (description: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Convert this missing person description into a short, urgent emergency alert message (max 160 chars) for SMS/WhatsApp: "${description}"`,
  });
  return response.text;
};

export const compareImages = async (originalImageBase64: string, sightingImageBase64: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { text: "Compare these two images. Are they likely the same person? Return a JSON object with 'match' (boolean) and 'confidence' (0-100)." },
        { inlineData: { mimeType: "image/jpeg", data: originalImageBase64 } },
        { inlineData: { mimeType: "image/jpeg", data: sightingImageBase64 } },
      ],
    },
    config: {
      responseMimeType: "application/json",
    }
  });
  return JSON.parse(response.text || '{"match": false, "confidence": 0}');
};
