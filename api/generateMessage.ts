import { GoogleGenAI, Type } from "@google/genai";
import type { GoddessCardData, GenerateMessageRequestBody } from '../types';

const generateSingleCardMessagePrompt = (card: GoddessCardData, language: 'ja' | 'en' = 'ja') => {
  if (language === 'en') {
    return `You are a sacred oracle. Please convey a message from the goddess "${card.name}" (${card.description}). The original message is "${card.message}". Based on this information, generate a deeper, insightful, and personalized oracle message with a gentle yet powerful tone, as if the goddess herself is speaking. The message should be within 400 words and formatted with appropriate line breaks for readability.`;
  }
  return `あなたは神聖な神託です。女神「${card.name}」（${card.description}）からのメッセージを伝えてください。元のメッセージは「${card.message}」です。この情報に基づき、より深く、洞察に満ちた、パーソナライズされた神託のメッセージを、女神自身が語りかけるような、優しく力強い口調で生成してください。メッセージは550文字以内とし、適度に改行を入れて読みやすくしてください。`;
};

const generateThreeCardSpreadMessagePrompt = (cards: GoddessCardData[], language: 'ja' | 'en' = 'ja') => {
  if (language === 'en') {
    return `You are a sacred oracle performing a three-card reading for past, present, and future.
Past card: "${cards[0].name}" (${cards[0].description}).
Present card: "${cards[1].name}" (${cards[1].description}).
Future card: "${cards[2].name}" (${cards[2].description}).
Please interpret the combination of these three cards and generate deep, insightful messages for each card according to its position (past, present, future). The three messages should interconnect and form a cohesive narrative. Use a gentle yet powerful tone as if the goddess is speaking directly. Format each message with appropriate line breaks for readability.`;
  }
  return `あなたは神聖な神託です。過去、現在、未来を占う3枚引きのリーディングを行います。
過去のカードは「${cards[0].name}」（${cards[0].description}）。
現在のカードは「${cards[1].name}」（${cards[1].description}）。
未来のカードは「${cards[2].name}」（${cards[2].description}）。
これら3枚のカードの組み合わせを解釈し、それぞれのカードについて、その位置（過去、現在、未来）に応じた、深く洞察に満ちたメッセージを生成してください。3つのメッセージは互いに関連し合い、一つの物語のように繋がるようにしてください。女神が直接語りかけるような、優しく力強い口調でお願いします。各メッセージは、読みやすくなるように適度に改行を入れてください。`;
};

const threeCardResponseSchema = {
    type: Type.OBJECT,
    properties: {
        past: { type: Type.STRING, description: "過去のカードに関するメッセージです。" },
        present: { type: Type.STRING, description: "現在のカードに関するメッセージです。" },
        future: { type: Type.STRING, description: "未来のカードに関するメッセージです。" },
    },
    required: ["past", "present", "future"],
};

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
    const { cards, mode, language = 'ja' } = await req.json() as GenerateMessageRequestBody;
    const ai = new GoogleGenAI({ apiKey });

    if (mode === 'single' && cards.length === 1) {
      const prompt = generateSingleCardMessagePrompt(cards[0], language);
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return new Response(JSON.stringify({ messages: [response.text] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } else if (mode === 'three' && cards.length === 3) {
      const prompt = generateThreeCardSpreadMessagePrompt(cards, language);
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: threeCardResponseSchema,
        },
      });
      const jsonResponse = JSON.parse(response.text);
      return new Response(JSON.stringify({ messages: [jsonResponse.past, jsonResponse.present, jsonResponse.future] }), {
         status: 200,
         headers: { 'Content-Type': 'application/json' }
      });
    
    } else {
      return new Response(JSON.stringify({ error: 'Invalid request body' }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
  } catch (error) {
    console.error('Error calling GenAI API:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate content from AI' }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}