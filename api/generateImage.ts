
import { GoogleGenAI } from "@google/genai";
// FIX: Corrected the imported type to GenerateImageRequestBody.
import type { GenerateImageRequestBody } from '../types';

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { 
      status: 405, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key is not configured.' }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }

  try {
    // FIX: Corrected the type cast to GenerateImageRequestBody.
    const { prompt } = await req.json() as GenerateImageRequestBody;
    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '3:4',
      },
    });

    if (!response.generatedImages || response.generatedImages.length === 0 || !response.generatedImages[0].image) {
      console.error('Image generation failed: No image data in response.', response);
      return new Response(JSON.stringify({ error: 'Failed to generate image from AI: No image data in response' }), { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;

    return new Response(JSON.stringify({ imageUrl }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error('Error calling Imagen API:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate image from AI' }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}