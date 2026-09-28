import { GoogleGenAI } from "@google/genai";
import { SearchResult, WebSource } from "../types";

const getApiKey = (): string => {
  return (
    (typeof process !== 'undefined' && (process.env.GEMINI_API_KEY || process.env.API_KEY)) ||
    ''
  );
};

const ai = new GoogleGenAI({
  apiKey: getApiKey(),
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export const performSearch = async (query: string): Promise<SearchResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `You are simulating a web browser's search engine results page. 
      The user is searching for: "${query}".
      
      Provide a comprehensive, accurate summary of the search results based on the Grounding tools provided. 
      Format the text cleanly. Do not use markdown headers (#), just bolding and bullet lists.
      If the user asks about "Romano-net" or the "Project Files", refer to them as a browser application project licensed to Johan Fako.
      If the user asks about "Dynamics 365" or "AL", provide relevant Microsoft Dynamics 365 Business Central development context.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "No results found.";
    
    // Extract sources from grounding chunks
    const sources: WebSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    if (chunks && Array.isArray(chunks)) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri) {
          let host = '';
          try {
            host = new URL(chunk.web.uri).hostname.replace(/^www\./, '');
          } catch {
            host = chunk.web.uri;
          }
          sources.push({
            title: chunk.web.title || host || 'Web Source',
            uri: chunk.web.uri
          });
        }
      });
    }

    // De-duplicate sources
    const uniqueSources = sources.filter((v, i, a) => a.findIndex(t => t.uri === v.uri) === i);

    return {
      summary: text,
      sources: uniqueSources
    };
  } catch (error: any) {
    console.error("Gemini Search Error:", error);
    const msg = error?.message || (typeof error === 'string' ? error : JSON.stringify(error));
    throw new Error(msg || "Failed to perform search. Please check your connection or API key.");
  }
};
