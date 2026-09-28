import { GoogleGenAI } from "@google/genai";
import { SearchResult, WebSource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const performSearch = async (query: string): Promise<SearchResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are simulating a web browser's search engine results page. 
      The user is searching for: "${query}".
      
      Provide a comprehensive summary of the search results based on the Grounding tools provided. 
      Format the text cleanly. Do not use markdown headers (#), just bolding and lists.
      If the user asks about "Romano-net" or the "Project Files", refer to them as a browser application project licensed to Johan Fako.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "No results found.";
    
    // Extract sources from grounding chunks
    const sources: WebSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          sources.push({
            title: chunk.web.title,
            uri: chunk.web.uri
          });
        }
      });
    }

    // De-duplicate sources
    const uniqueSources = sources.filter((v, i, a) => a.findIndex(t => (t.uri === v.uri)) === i);

    return {
      summary: text,
      sources: uniqueSources
    };
  } catch (error) {
    console.error("Gemini Search Error:", error);
    throw new Error("Failed to perform search. Please check your connection or API key.");
  }
};