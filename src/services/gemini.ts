import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface HairstyleOptions {
  length: string;
  color: string;
  style: string;
}

export async function editHairstyle(
  base64Image: string,
  mimeType: string,
  options: HairstyleOptions
): Promise<string | null> {
  const prompt = `Change the person's hair in this image. 
  New hair characteristics:
  - Length: ${options.length}
  - Color: ${options.color}
  - Style: ${options.style}
  
  Please modify ONLY the hair. Keep the person's facial features, expression, and the background exactly the same. The result should look natural and realistic.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.split(",")[1], // Remove the data:image/png;base64, prefix
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error editing hairstyle:", error);
    throw error;
  }
}
