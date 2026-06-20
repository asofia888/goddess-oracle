import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

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
  fingerprint?: string; // Client fingerprint for additional security
}

interface GenerateMessageResponse {
  messages: string[];
  error?: string;
}

// Security constants
const MAX_REQUESTS_PER_HOUR = 20;
const MAX_VIOLATIONS = 3;
const BAN_DURATION_SECONDS = 86400; // 24 hours

// Upstream AI request timeout. Kept below the function's maxDuration so a slow
// or hung upstream returns a clean error instead of being killed by the platform.
const GEMINI_TIMEOUT_MS = 25000;

// Allowed origins (configure based on your deployment)
const ALLOWED_ORIGINS = [
  'https://goddess-oracle.vercel.app',
  'http://localhost:5173', // Development
  'http://localhost:4173', // Preview
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
].filter(Boolean);

// --- Upstash Redis Rate Limiting ---
// Initialize Redis and Ratelimit only when environment variables are available
function createRatelimiter() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  const redis = Redis.fromEnv();

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(MAX_REQUESTS_PER_HOUR, '1 h'),
    prefix: 'goddess-oracle:ratelimit',
  });

  return { redis, limiter };
}

// Lazy singleton — created once per cold start
let _upstash: ReturnType<typeof createRatelimiter> | undefined;
function getUpstash() {
  if (_upstash === undefined) {
    _upstash = createRatelimiter();
  }
  return _upstash;
}

// In-memory fallback for local development (when Redis is not configured)
const memoryStore = new Map<string, { count: number; resetTime: number; violations: number }>();

function checkRateLimitMemory(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = memoryStore.get(ip);

  if (entry) {
    if (entry.violations >= MAX_VIOLATIONS && now < entry.resetTime) {
      return { allowed: false, retryAfter: Math.ceil((entry.resetTime - now) / 1000) };
    }
    if (now > entry.resetTime) {
      memoryStore.set(ip, { count: 1, resetTime: now + 3600000, violations: 0 });
      return { allowed: true };
    }
    if (entry.count >= MAX_REQUESTS_PER_HOUR) {
      entry.violations++;
      entry.resetTime = now + (entry.violations >= MAX_VIOLATIONS ? BAN_DURATION_SECONDS * 1000 : 3600000);
      return { allowed: false, retryAfter: Math.ceil((entry.resetTime - now) / 1000) };
    }
    entry.count++;
    return { allowed: true };
  }

  memoryStore.set(ip, { count: 1, resetTime: now + 3600000, violations: 0 });
  return { allowed: true };
}

/**
 * Distributed rate limiting with Upstash Redis.
 * Falls back to in-memory rate limiting when Redis is not configured.
 */
async function checkRateLimit(ip: string, fingerprint?: string): Promise<{ allowed: boolean; retryAfter?: number }> {
  const upstash = getUpstash();

  // Fallback to in-memory for local development
  if (!upstash) {
    return checkRateLimitMemory(ip);
  }

  const { redis, limiter } = upstash;

  // Check if IP is banned
  const banKey = `goddess-oracle:ban:${ip}`;
  const isBanned = await redis.get(banKey);
  if (isBanned) {
    const ttl = await redis.ttl(banKey);
    return { allowed: false, retryAfter: ttl > 0 ? ttl : BAN_DURATION_SECONDS };
  }

  // Check IP-based rate limit
  const { success, reset } = await limiter.limit(ip);

  if (!success) {
    // Track violations
    const violationKey = `goddess-oracle:violations:${ip}`;
    const violations = await redis.incr(violationKey);
    await redis.expire(violationKey, 3600); // Violations reset after 1 hour

    if (violations >= MAX_VIOLATIONS) {
      // Ban for 24 hours
      await redis.set(banKey, '1', { ex: BAN_DURATION_SECONDS });
      return { allowed: false, retryAfter: BAN_DURATION_SECONDS };
    }

    const retryAfter = Math.ceil((reset - Date.now()) / 1000);
    return { allowed: false, retryAfter: retryAfter > 0 ? retryAfter : 3600 };
  }

  // Also check fingerprint if provided
  if (fingerprint) {
    const fpResult = await limiter.limit(`fp:${fingerprint}`);
    if (!fpResult.success) {
      const retryAfter = Math.ceil((fpResult.reset - Date.now()) / 1000);
      return { allowed: false, retryAfter: retryAfter > 0 ? retryAfter : 3600 };
    }
  }

  return { allowed: true };
}

/**
 * Validate and sanitize card data
 */
function validateCardData(cards: any[]): boolean {
  if (!Array.isArray(cards) || cards.length === 0 || cards.length > 3) {
    return false;
  }

  for (const card of cards) {
    // Check required fields
    if (!card.name || !card.description || !card.message) {
      return false;
    }

    // Type validation
    if (typeof card.name !== 'string' ||
        typeof card.description !== 'string' ||
        typeof card.message !== 'string') {
      return false;
    }

    // Length validation (prevent injection attacks)
    if (card.name.length > 100 ||
        card.description.length > 500 ||
        card.message.length > 1000) {
      return false;
    }

    // Character validation (prevent code injection)
    const dangerousPatterns = /<script|javascript:|onerror=|onclick=/i;
    if (dangerousPatterns.test(card.name) ||
        dangerousPatterns.test(card.description) ||
        dangerousPatterns.test(card.message)) {
      return false;
    }
  }

  return true;
}

/**
 * Check origin to prevent CSRF
 */
// Vercel preview deployments use origins like
// https://goddess-oracle-<deployment-id>.vercel.app
const VERCEL_PREVIEW_ORIGIN = /^https:\/\/goddess-oracle-[a-z0-9-]+\.vercel\.app$/;

function isValidOrigin(origin: string | undefined): boolean {
  if (!origin) return false;
  // Exact allow-list match, plus this project's Vercel preview deployments.
  // NOTE: never use startsWith() here — it would let
  // https://goddess-oracle.vercel.app.evil.com slip through.
  return ALLOWED_ORIGINS.includes(origin) || VERCEL_PREVIEW_ORIGIN.test(origin);
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

The original message is: "${card.message}". Based on this, generate a deeper, insightful, and personalized oracle message as a flowing narrative.

Your message should be written entirely in a narrative, storytelling style - like the goddess herself is speaking directly to the reader's heart. Use warm, gentle language that brings instant comfort and hope the moment they read it. Focus on healing and inspiration, never preaching or instructing. Maintain a universal spiritual perspective without strong religious overtones.

Believe in the reader's inner light and potential, gently encouraging them. Convey the goddess's love and wisdom in a way that resonates with daily life. Communicate with deep empathy and compassion, guiding readers to discover their own answers within themselves.

CRITICAL: Never use bullet points, numbered lists, headings, or any structured formatting. Write everything as continuous prose, like a gentle letter or spoken guidance from the goddess. Even when giving multiple pieces of advice or addressing different themes, weave them together into flowing paragraphs.

Avoid strong imperatives, definitive statements, language that invokes fear or guilt, and heavy, negative expressions. Instead, use gentle, receptive language such as "you might consider," "perhaps," "you may find." Include phrases like "Listen to what your heart quietly desires" or "Feel the tenderness embracing you now."`;
      const deepInsightPrompt = `Additionally, address the potential challenges this card indicates and themes the reader needs to overcome. Include specific, practical advice to encourage soul growth. Remember: weave all of this into the flowing narrative without using headings, bullet points, or lists. Maintain the gentle, hopeful tone throughout, as if speaking tenderly to a dear friend.`;
      return level === 'deep'
        ? `${basePrompt}\n\n${deepInsightPrompt}\n\nKeep the message within 400 words. Structure your message in 4-5 natural paragraphs, with each paragraph separated by a single blank line. Each paragraph should flow naturally into the next, creating a cohesive narrative.`
        : `${basePrompt}\n\nKeep the message within 350 words. Structure your message in 3-4 natural paragraphs, with each paragraph separated by a single blank line. Each paragraph should flow naturally into the next, creating a cohesive narrative.`;
    } else {
      const basePrompt = `あなたは女神「${card.name}」（${card.description}）からのメッセージを伝える、神聖な神託です。

元のメッセージは「${card.message}」です。この情報に基づき、より深く、洞察に満ちた、パーソナライズされた神託のメッセージを、流れるような語り口で生成してください。

メッセージは完全に物語のような語り口調で書いてください。女神自身が読者の心に直接語りかけるように。柔らかく温かい言葉で、読んだ瞬間に安心感と希望が広がるように書いてください。説教的にならず、癒しとインスピレーションを中心に。宗教的色合いは強くせず、普遍的なスピリチュアル観で。

読者の内なる光や可能性を信じ、そっと背中を押してください。女神の愛と知恵を、日常に寄り添う形で伝え、深い共感と思いやりを込めて、読者が自分自身の答えに気づけるよう導いてください。

重要：箇条書き、番号付きリスト、見出し、構造化された書式は絶対に使わないでください。すべてを連続した文章として、女神からの優しい手紙や語りかけのように書いてください。複数のアドバイスや異なるテーマを扱う場合でも、それらを流れるような段落の中に織り込んでください。

「～しなさい」「～すべき」のような命令形や断定的な表現、恐れや罪悪感を煽る内容、ネガティブで重い言葉は避けてください。代わりに、「～すると良いでしょう」「～かもしれません」「～でしょう」のような柔らかい言葉遣いを使ってください。「あなたの心が静かに望んでいることに、耳を傾けてみてください」のような優しい語りかけや、「今、あなたを包む優しさを感じてください」のような癒しの言葉を含めてください。`;
      const deepInsightPrompt = `さらに、このカードが示す潜在的な課題や、あなたが乗り越えるべきテーマについても深く言及してください。魂の成長を促すための、具体的で実践的なアドバイスを加えてください。ただし、見出しや箇条書き、リストは使わず、すべてを流れるような語り口の中に織り込んでください。常に柔らかく希望に満ちたトーンを保ち、親しい友人に優しく語りかけるように書いてください。`;
      return level === 'deep'
        ? `${basePrompt}\n\n${deepInsightPrompt}\n\nメッセージは全体で600文字以内とし、4〜5段落で構成してください。各段落は空行（改行1つ）で区切り、自然に流れるように繋げてください。`
        : `${basePrompt}\n\nメッセージは550文字以内とし、3〜4段落で構成してください。各段落は空行（改行1つ）で区切り、自然に流れるように繋げてください。`;
    }
  } else {
    // Three card spread
    if (language === 'en') {
      const basePrompt = `You are a sacred oracle performing a three-card reading for past, present, and future.

The Past card is "${cards[0].name}" (${cards[0].description}).
The Present card is "${cards[1].name}" (${cards[1].description}).
The Future card is "${cards[2].name}" (${cards[2].description}).

Interpret the combination of these three cards and generate deep, insightful messages for each card according to its position (past, present, future). Each message should be written entirely in a narrative, storytelling style - like the goddess herself is speaking directly to the reader's heart.

Use warm, gentle language that brings instant comfort and hope. Focus on healing and inspiration, never preaching or instructing. Maintain a universal spiritual perspective without strong religious overtones. Believe in the reader's inner light and potential, gently encouraging them. Convey the goddess's love and wisdom in a way that resonates with daily life.

The three messages should relate to each other and flow together like chapters of a single narrative, showing how past, present, and future are connected threads in the reader's journey.

CRITICAL: Never use bullet points, numbered lists, headings (like "Past:", "Present:", "Future:"), or any structured formatting in the messages themselves. Write each message as continuous prose, like a gentle letter or spoken guidance from the goddess. Even when giving multiple pieces of advice or addressing different themes, weave them together into flowing paragraphs.

Avoid strong imperatives, definitive statements, language that invokes fear or guilt, and heavy, negative expressions. Instead, use gentle, receptive language such as "you might consider," "perhaps," "you may find," and phrases that inspire self-discovery and inner wisdom.`;
      const deepInsightPrompt = `For each card's message, address not only its surface meaning but also what it means for the reader's inner growth and what opportunities for overcoming challenges it suggests. Remember: weave all of this into the flowing narrative without using headings, bullet points, or lists. Maintain the gentle, hopeful tone throughout, as if speaking tenderly to a dear friend.`;
      return level === 'deep'
        ? `${basePrompt}\n\n${deepInsightPrompt}\n\nFor each card's message, structure it in 2-3 natural paragraphs, with each paragraph separated by a single blank line. Each paragraph should flow naturally into the next.`
        : `${basePrompt}\n\nFor each card's message, structure it in 2-3 natural paragraphs, with each paragraph separated by a single blank line. Each paragraph should flow naturally into the next.`;
    } else {
      const basePrompt = `あなたは過去、現在、未来を占う3枚引きのリーディングを行う、神聖な神託です。

過去のカードは「${cards[0].name}」（${cards[0].description}）。
現在のカードは「${cards[1].name}」（${cards[1].description}）。
未来のカードは「${cards[2].name}」（${cards[2].description}）。

これら3枚のカードの組み合わせを解釈し、それぞれのカードについて、その位置（過去、現在、未来）に応じた、深く洞察に満ちたメッセージを生成してください。各メッセージは完全に物語のような語り口調で書いてください。女神自身が読者の心に直接語りかけるように。

柔らかく温かい言葉で、読んだ瞬間に安心感と希望が広がるように書いてください。説教的にならず、癒しとインスピレーションを中心に。宗教的色合いは強くせず、普遍的なスピリチュアル観で。読者の内なる光や可能性を信じ、そっと背中を押してください。女神の愛と知恵を、日常に寄り添う形で伝えてください。

3つのメッセージは互いに関連し合い、一つの物語の章のように繋がり、過去、現在、未来がどのように繋がった糸であるかを示してください。

重要：メッセージ本文の中で、箇条書き、番号付きリスト、見出し（「過去：」「現在：」「未来：」のような）、構造化された書式は絶対に使わないでください。各メッセージを連続した文章として、女神からの優しい手紙や語りかけのように書いてください。複数のアドバイスや異なるテーマを扱う場合でも、それらを流れるような段落の中に織り込んでください。

「～しなさい」「～すべき」のような命令形や断定的な表現、恐れや罪悪感を煽る内容、ネガティブで重い言葉は避けてください。代わりに、「～すると良いでしょう」「～かもしれません」「～でしょう」のような柔らかい言葉遣いや、内なる知恵と自己発見を促す言葉を使ってください。`;
      const deepInsightPrompt = `各カードのメッセージには、それが示す表面的な意味だけでなく、あなたの内面的な成長にとってどのような意味を持つのか、どんな課題を乗り越える機会を示唆しているのかについても触れてください。ただし、見出しや箇条書き、リストは使わず、すべてを流れるような語り口の中に織り込んでください。常に柔らかく希望に満ちたトーンを保ち、親しい友人に優しく語りかけるように書いてください。`;
      return level === 'deep'
        ? `${basePrompt}\n\n${deepInsightPrompt}\n\n各カードのメッセージは2〜3段落で構成してください。各段落は空行（改行1つ）で区切り、自然に流れるように繋げてください。`
        : `${basePrompt}\n\n各カードのメッセージは2〜3段落で構成してください。各段落は空行（改行1つ）で区切り、自然に流れるように繋げてください。`;
    }
  }
}

// Give the function enough execution time for the upstream AI call.
// Must exceed GEMINI_TIMEOUT_MS so the AbortController can fire first.
export const maxDuration = 30;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // CORS headers with origin validation
  const origin = req.headers.origin;

  if (isValidOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin as string);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else if (process.env.NODE_ENV === 'development') {
    // Allow all origins in development only
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

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

  // Verify origin for POST requests (CSRF protection)
  if (!isValidOrigin(origin) && process.env.NODE_ENV !== 'development') {
    res.status(403).json({ error: 'Forbidden: Invalid origin' });
    return;
  }

  // Extract IP with proper header fallback
  const ip = (
    req.headers['x-real-ip'] as string ||
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    'unknown'
  );

  // Get fingerprint from request body (if provided by client)
  const fingerprint = req.body?.fingerprint;

  // Distributed rate limiting (Upstash Redis)
  const rateLimitResult = await checkRateLimit(ip, fingerprint);
  if (!rateLimitResult.allowed) {
    res.setHeader('Retry-After', String(rateLimitResult.retryAfter || 3600));
    res.status(429).json({
      error: 'Too many requests. Please try again later.',
      retryAfter: rateLimitResult.retryAfter
    });
    return;
  }

  try {
    const { cards, readingLevel, language, mode } = req.body as GenerateMessageRequest;

    // Enhanced input validation with sanitization
    if (!validateCardData(cards)) {
      res.status(400).json({ error: 'Invalid or malicious card data' });
      return;
    }

    // Validate mode and card count consistency
    if (mode === 'single' && cards.length !== 1) {
      res.status(400).json({ error: 'Single mode requires exactly 1 card' });
      return;
    }

    if (mode === 'three' && cards.length !== 3) {
      res.status(400).json({ error: 'Three card mode requires exactly 3 cards' });
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
      // Don't expose internal configuration details
      console.error('[SECURITY] GOOGLE_API_KEY not configured');
      res.status(500).json({ error: 'Service temporarily unavailable' });
      return;
    }

    // Generate prompt
    const prompt = generatePrompt(cards, readingLevel, language, mode);

    // Call Google Generative AI (using latest stable flash model) with a timeout so
    // a slow or hung upstream returns a clean error instead of holding the function.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
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
    } catch (fetchError) {
      if ((fetchError as any)?.name === 'AbortError') {
        console.error('[API ERROR] Google AI request timed out:', {
          timeoutMs: GEMINI_TIMEOUT_MS,
          timestamp: new Date().toISOString(),
        });
        res.status(504).json({ error: 'Request timed out. Please try again.' });
        return;
      }
      throw fetchError;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errorText = await response.text();
      // Log detailed error server-side only
      console.error('[API ERROR] Google AI API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        timestamp: new Date().toISOString()
      });

      // Return generic error to client (don't expose API details)
      res.status(500).json({ error: 'Failed to generate message' });
      return;
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      console.error('[API ERROR] No message generated:', {
        data: JSON.stringify(data).substring(0, 200),
        timestamp: new Date().toISOString()
      });
      res.status(500).json({ error: 'Failed to generate message' });
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

        // Validate parsed messages
        if (!messages.every(msg => typeof msg === 'string' && msg.length > 0)) {
          throw new Error('Invalid message format in parsed response');
        }
      } catch (e) {
        console.error('[API ERROR] Failed to parse three-card response:', {
          error: e instanceof Error ? e.message : String(e),
          responsePreview: generatedText.substring(0, 200),
          timestamp: new Date().toISOString()
        });
        res.status(500).json({ error: 'Failed to generate message' });
        return;
      }
    }

    const result: GenerateMessageResponse = { messages };
    res.status(200).json(result);
  } catch (error) {
    // Log detailed error server-side
    console.error('[API ERROR] Unexpected error in generate-message handler:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });

    // Return generic error to client (prevent information leakage)
    res.status(500).json({ error: 'Service temporarily unavailable' });
  }
}
