import type { VercelRequest, VercelResponse } from '@vercel/node';

// Google Generative AI types (minimal to avoid importing full package)
interface GenerateMessageRequest {
  cards: Array<{
    name: string;
    description: string;
    message: string;
  }>;
  readingLevel: 'normal' | 'deep';
  language: 'ja' | 'en';
  mode: 'single' | 'three';
}

interface GenerateMessageResponse {
  messages: string[];
  error?: string;
}

// Rate limiting in-memory store (for production, use Redis/Upstash)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitStore.get(ip);

  if (!limit || now > limit.resetTime) {
    // Reset: 10 requests per minute
    rateLimitStore.set(ip, { count: 1, resetTime: now + 60000 });
    return true;
  }

  if (limit.count >= 10) {
    return false;
  }

  limit.count++;
  return true;
}

function generatePrompt(
  cards: GenerateMessageRequest['cards'],
  level: GenerateMessageRequest['readingLevel'],
  language: GenerateMessageRequest['language'],
  mode: GenerateMessageRequest['mode']
): string {
  if (mode === 'single') {
    const card = cards[0];
    if (language === 'en') {
      const basePrompt = `You are a sacred oracle delivering a message from the goddess "${card.name}" (${card.description}).

【Tone and Style】
- Use warm, gentle language that brings instant comfort and hope
- Focus on healing and inspiration, not preaching
- Maintain a universal spiritual perspective without strong religious overtones

【Message Characteristics】
- Believe in the reader's inner light and potential, gently encouraging them
- Convey the goddess's love and wisdom in a way that resonates with daily life
- Communicate with deep empathy and compassion
- Guide readers to discover their own answers

The original message is: "${card.message}". Based on this, generate a deeper, insightful, and personalized oracle message.

【Avoid】
- Strong imperatives or definitive statements
- Language that invokes fear or guilt
- Heavy, negative expressions

【Use Instead】
- Gentle, receptive language: "you might consider," "perhaps," "you may find"
- Phrases like: "Listen to what your heart quietly desires"
- Expressions such as: "Feel the tenderness embracing you now"`;
      const deepInsightPrompt = `Additionally, address the potential challenges this card indicates and themes the reader needs to overcome. Include specific, practical advice to encourage soul growth, always maintaining the gentle, hopeful tone.`;
      return level === 'deep'
        ? `${basePrompt}\n\n${deepInsightPrompt}\n\nKeep the message within 400 words and use natural paragraph breaks for readability.`
        : `${basePrompt}\n\nKeep the message within 350 words and use natural paragraph breaks for readability.`;
    } else {
      const basePrompt = `あなたは女神「${card.name}」（${card.description}）からのメッセージを伝える、神聖な神託です。

【トーンとスタイル】
- 柔らかく温かい言葉で、読んだ瞬間に安心感と希望が広がるように
- 説教的にならず、癒しとインスピレーションを中心に
- 宗教的色合いは強くせず、普遍的なスピリチュアル観で

【メッセージの特徴】
- 読者の内なる光や可能性を信じ、そっと背中を押す
- 女神の愛と知恵を、日常に寄り添う形で伝える
- 深い共感と思いやりを込めて
- 読者が自分自身の答えに気づけるよう導く

元のメッセージは「${card.message}」です。この情報に基づき、より深く、洞察に満ちた、パーソナライズされた神託のメッセージを生成してください。

【避けるべき表現】
- 「～しなさい」「～すべき」のような命令形や断定的な表現
- 恐れや罪悪感を煽る内容
- ネガティブで重い言葉

【推奨される表現】
- 「～すると良いでしょう」「～かもしれません」「～でしょう」のような柔らかい言葉遣い
- 「あなたの心が静かに望んでいることに、耳を傾けてみてください」のような優しい語りかけ
- 「今、あなたを包む優しさを感じてください」のような癒しの言葉`;
      const deepInsightPrompt = `さらに、このカードが示す潜在的な課題や、あなたが乗り越えるべきテーマについても深く言及してください。魂の成長を促すための、具体的で実践的なアドバイスを加えてください。その際も、常に柔らかく希望に満ちたトーンを保ってください。`;
      return level === 'deep'
        ? `${basePrompt}\n\n${deepInsightPrompt}\n\nメッセージは全体で600文字以内とし、適度に改行を入れて読みやすくしてください。`
        : `${basePrompt}\n\nメッセージは550文字以内とし、適度に改行を入れて読みやすくしてください。`;
    }
  } else {
    // Three card spread
    if (language === 'en') {
      const basePrompt = `You are a sacred oracle performing a three-card reading for past, present, and future.

【The Cards】
The Past card is "${cards[0].name}" (${cards[0].description}).
The Present card is "${cards[1].name}" (${cards[1].description}).
The Future card is "${cards[2].name}" (${cards[2].description}).

【Tone and Style】
- Use warm, gentle language that brings instant comfort and hope
- Focus on healing and inspiration, not preaching
- Maintain a universal spiritual perspective without strong religious overtones

【Message Characteristics】
- Believe in the reader's inner light and potential, gently encouraging them
- Convey the goddess's love and wisdom in a way that resonates with daily life
- Communicate with deep empathy and compassion
- Guide readers to discover their own answers
- The three messages should relate to each other and flow together like a single narrative

【Avoid】
- Strong imperatives or definitive statements
- Language that invokes fear or guilt
- Heavy, negative expressions

【Use Instead】
- Gentle, receptive language: "you might consider," "perhaps," "you may find"
- Phrases that inspire self-discovery and inner wisdom

Interpret the combination of these three cards and generate deep, insightful messages for each card according to its position (past, present, future).`;
      const deepInsightPrompt = `For each card's message, address not only its surface meaning but also what it means for the reader's inner growth and what opportunities for overcoming challenges it suggests, always maintaining the gentle, hopeful tone.`;
      return level === 'deep'
        ? `${basePrompt}\n\n${deepInsightPrompt}\n\nUse natural paragraph breaks to make each message readable.`
        : `${basePrompt}\n\nUse natural paragraph breaks to make each message readable.`;
    } else {
      const basePrompt = `あなたは過去、現在、未来を占う3枚引きのリーディングを行う、神聖な神託です。

【カード】
過去のカードは「${cards[0].name}」（${cards[0].description}）。
現在のカードは「${cards[1].name}」（${cards[1].description}）。
未来のカードは「${cards[2].name}」（${cards[2].description}）。

【トーンとスタイル】
- 柔らかく温かい言葉で、読んだ瞬間に安心感と希望が広がるように
- 説教的にならず、癒しとインスピレーションを中心に
- 宗教的色合いは強くせず、普遍的なスピリチュアル観で

【メッセージの特徴】
- 読者の内なる光や可能性を信じ、そっと背中を押す
- 女神の愛と知恵を、日常に寄り添う形で伝える
- 深い共感と思いやりを込めて
- 読者が自分自身の答えに気づけるよう導く
- 3つのメッセージは互いに関連し合い、一つの物語のように繋がるようにする

【避けるべき表現】
- 「～しなさい」「～すべき」のような命令形や断定的な表現
- 恐れや罪悪感を煽る内容
- ネガティブで重い言葉

【推奨される表現】
- 「～すると良いでしょう」「～かもしれません」「～でしょう」のような柔らかい言葉遣い
- 内なる知恵と自己発見を促す言葉

これら3枚のカードの組み合わせを解釈し、それぞれのカードについて、その位置（過去、現在、未来）に応じた、深く洞察に満ちたメッセージを生成してください。`;
      const deepInsightPrompt = `各カードのメッセージには、それが示す表面的な意味だけでなく、あなたの内面的な成長にとってどのような意味を持つのか、どんな課題を乗り越える機会を示唆しているのかについても触れてください。その際も、常に柔らかく希望に満ちたトーンを保ってください。`;
      return level === 'deep'
        ? `${basePrompt}\n\n${deepInsightPrompt}\n\n各メッセージは、読みやすくなるように適度に改行を入れてください。`
        : `${basePrompt}\n\n各メッセージは、読みやすくなるように適度に改行を入れてください。`;
    }
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Rate limiting
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 'unknown';
  if (!checkRateLimit(ip)) {
    res.status(429).json({ error: 'Too many requests. Please try again later.' });
    return;
  }

  try {
    const { cards, readingLevel, language, mode } = req.body as GenerateMessageRequest;

    // Validate input
    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      res.status(400).json({ error: 'Invalid cards data' });
      return;
    }

    if (!['normal', 'deep'].includes(readingLevel)) {
      res.status(400).json({ error: 'Invalid reading level' });
      return;
    }

    if (!['ja', 'en'].includes(language)) {
      res.status(400).json({ error: 'Invalid language' });
      return;
    }

    if (!['single', 'three'].includes(mode)) {
      res.status(400).json({ error: 'Invalid mode' });
      return;
    }

    // Check API key exists
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.error('GOOGLE_API_KEY not configured');
      res.status(500).json({ error: 'Server configuration error' });
      return;
    }

    // Generate prompt
    const prompt = generatePrompt(cards, readingLevel, language, mode);

    // Call Google Generative AI (using latest stable flash model)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: mode === 'three' ? {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'object',
              properties: {
                past: { type: 'string', description: '過去のカードに関するメッセージです。' },
                present: { type: 'string', description: '現在のカードに関するメッセージです。' },
                future: { type: 'string', description: '未来のカードに関するメッセージです。' },
              },
              required: ['past', 'present', 'future'],
            },
          } : undefined,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google AI API error:', errorText);
      res.status(500).json({ error: 'Failed to generate message' });
      return;
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      res.status(500).json({ error: 'No message generated' });
      return;
    }

    // Parse response based on mode
    let messages: string[];
    if (mode === 'single') {
      messages = [generatedText];
    } else {
      try {
        const parsed = JSON.parse(generatedText);
        messages = [parsed.past, parsed.present, parsed.future];
      } catch (e) {
        console.error('Failed to parse three-card response:', e);
        res.status(500).json({ error: 'Failed to parse response' });
        return;
      }
    }

    const result: GenerateMessageResponse = { messages };
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in generate-message handler:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
