
import { GoogleGenAI, Type } from "@google/genai";
import { AnimationConfig } from "../types.ts";

export const getThemeSuggestion = async (prompt: string): Promise<Partial<AnimationConfig>> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Propose an animation configuration for a tech background based on: "${prompt}". 
      Choose a style from: 'plexus', 'flow', 'matrix', 'boids', 'stars' (3D hyperspace), 'dna' (3D helix), or 'lattice' (3D grid).
      Return a JSON object with: color (hex), particleCount (50-250), speed (0.5-5.0), matrixRain (boolean), themeName, and animationStyle.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            color: { type: Type.STRING },
            particleCount: { type: Type.NUMBER },
            speed: { type: Type.NUMBER },
            matrixRain: { type: Type.BOOLEAN },
            themeName: { type: Type.STRING },
            animationStyle: { type: Type.STRING }
          },
          required: ["color", "particleCount", "speed", "matrixRain", "themeName", "animationStyle"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    return JSON.parse(text);
  } catch (e) {
    console.error("Gemini theme suggestion failed:", e);
    throw e; // Re-throw to be handled by the UI
  }
};

export const explainAnimation = async (config: AnimationConfig): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Explain the '${config.animationStyle}' algorithm in this animation. 
      Settings: Color ${config.color}, Particles ${config.particleCount}. 
      If it's 'stars', 'dna', or 'lattice', explain the 3D perspective projection and rotation math.`,
    });
    return response.text || "No explanation available at this time.";
  } catch (e) {
    console.error("Gemini explanation failed:", e);
    return "Error: Could not retrieve algorithm explanation. Please check your connection and API status.";
  }
};
