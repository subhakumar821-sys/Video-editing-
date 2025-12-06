import { GoogleGenAI, Modality, Type } from "@google/genai";
import { TTSVoice } from "../types";

// Helper to get a fresh instance, especially important for Veo where key might change
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateImage = async (prompt: string, highQuality: boolean = false): Promise<string> => {
  const ai = getAI();
  const model = highQuality ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
  
  // For pro model, we can use tools if needed, but for simple generation sticking to content
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: highQuality ? { imageSize: '1K' } : undefined
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image data found in response");
};

export const generateVideo = async (
  prompt: string, 
  inputImageBase64?: string | null
): Promise<string> => {
  // Ensure we have the latest key selected for Veo
  const ai = getAI();
  const model = 'veo-3.1-fast-generate-preview'; // Defaulting to fast for responsiveness

  let operation;
  
  if (inputImageBase64) {
    // Image-to-Video
    // Extract base64 data if it has a prefix
    const base64Data = inputImageBase64.split(',')[1] || inputImageBase64;
    
    operation = await ai.models.generateVideos({
      model,
      prompt: prompt || "Animate this image", // Prompt is optional but recommended
      image: {
        imageBytes: base64Data,
        mimeType: 'image/png', // Assuming PNG from our file input or prev gen
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9' // Pan effects usually look good in landscape
      }
    });
  } else {
    // Text-to-Video
    operation = await ai.models.generateVideos({
      model,
      prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });
  }

  // Polling loop
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed or returned no URI");

  // Fetch the actual video blob
  const videoRes = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  if (!videoRes.ok) throw new Error("Failed to download generated video");
  
  const blob = await videoRes.blob();
  return URL.createObjectURL(blob);
};

export const generateSpeech = async (text: string, voice: TTSVoice): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voice },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio data generated");
  return base64Audio;
};

export const generateLyrics = async (seed: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Write lyrics for a song based on this idea: "${seed}". 
    Format it clearly with [Verse], [Chorus], [Bridge] tags. 
    Keep it rhythmic and catchy.`,
    config: {
      systemInstruction: "You are a professional songwriter.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            lyrics: { type: Type.STRING }
        }
      }
    }
  });

  return response.text;
};