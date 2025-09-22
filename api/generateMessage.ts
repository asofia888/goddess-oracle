import { GoogleGenAI, Type } from "@google/genai";
import type { GoddessCardData, GenerateMessageRequestBody } from '../types';

const generateSingleCardMessagePrompt = (card: GoddessCardData, language: 'ja' | 'en' = 'ja') => {
  if (language === 'en') {
    return `You are channeling ${card.name}, the ${card.origin} goddess specializing in "${card.theme}".

    Create a loving, encouraging oracle message in Doreen Virtue's style:
    - Focus on the theme: ${card.theme}
    - Keywords to naturally include: ${card.keywords.join(', ')}
    - Element energy: ${card.element}
    - Include 2-3 practical daily guidance steps
    - Add the affirmation: "${card.affirmation}"
    - Tone: loving, supportive, empowering, gentle
    - Length: 100-150 words
    - Include symbolism from: ${card.symbols.join(', ')}

    Format:
    **${card.name}'s Message - ${card.theme}**
    [Loving guidance paragraph mentioning ${card.element} element]
    [2-3 practical daily steps as bullet points]
    [Closing encouragement with affirmation]`;
  }

  return `あなたは${card.origin}の女神「${card.name}」からのメッセージを伝える神託です。

  Doreen Virtue風の愛に満ちたオラクルメッセージを作成してください：
  - テーマ：${card.theme}
  - 自然に含めるキーワード：${card.keywords.join('、')}
  - エレメントエネルギー：${card.element}
  - 実践的な日常ガイダンス（2-3つの具体的ステップ）
  - アファメーション：「${card.affirmation}」
  - トーン：愛に満ちた、励まし、力づける、優しい
  - 長さ：100-150文字
  - シンボリズム：${card.symbols.join('、')}

  フォーマット：
  **${card.name}からのメッセージ - ${card.theme}**
  [${card.element}のエネルギーを含む愛のガイダンス段落]
  [実践的な日常ステップを箇条書きで2-3個]
  [アファメーションを含む励ましの締めくくり]`;
};

const generateThreeCardSpreadMessagePrompt = (cards: GoddessCardData[], language: 'ja' | 'en' = 'ja') => {
  if (language === 'en') {
    return `You are a sacred oracle performing a three-card reading for past, present, and future in Doreen Virtue's style.

Past card: "${cards[0].name}" - ${cards[0].theme} (${cards[0].origin}).
Present card: "${cards[1].name}" - ${cards[1].theme} (${cards[1].origin}).
Future card: "${cards[2].name}" - ${cards[2].theme} (${cards[2].origin}).

Create three interconnected messages that form a cohesive spiritual narrative:
- Each message should focus on its card's specific theme
- Include the element energies naturally: ${cards.map(c => c.element).join(', ')}
- Tone: loving, encouraging, gentle guidance
- Messages should flow together as one story of growth
- Include practical guidance within each message
- Length: Each message 80-120 words

Format as JSON with past, present, future keys.`;
  }
  return `あなたは神聖な神託です。Doreen Virtue風の過去、現在、未来を占う3枚引きのリーディングを行います。

過去のカード：「${cards[0].name}」- ${cards[0].theme}（${cards[0].origin}）
現在のカード：「${cards[1].name}」- ${cards[1].theme}（${cards[1].origin}）
未来のカード：「${cards[2].name}」- ${cards[2].theme}（${cards[2].origin}）

一つの霊的な成長物語として繋がる3つのメッセージを作成してください：
- 各メッセージはそのカードの特別なテーマに焦点を当てる
- エレメントエネルギーを自然に含める：${cards.map(c => c.element).join('、')}
- トーン：愛に満ちた、励まし、優しいガイダンス
- メッセージは成長の一つの物語として流れるように
- 実践的なガイダンスを各メッセージに含める
- 長さ：各メッセージ80-120文字

past、present、futureキーでJSONフォーマットで回答してください。`;
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