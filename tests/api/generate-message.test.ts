import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../../api/generate-message';

// Mock fetch for Google AI API
global.fetch = vi.fn();

describe('API: /api/generate-message', () => {
  let req: Partial<VercelRequest>;
  let res: Partial<VercelResponse>;
  let statusCode: number;
  let responseData: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    statusCode = 200;
    responseData = null;

    // Mock request with unique IP for each test to avoid rate limiting
    const randomIp = `127.0.0.${Math.floor(Math.random() * 255)}`;
    req = {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': randomIp,
      },
      body: {
        cards: [
          {
            name: 'Aphrodite',
            description: 'Goddess of Love',
            message: 'Love yourself',
          },
        ],
        readingLevel: 'normal',
        language: 'en',
        mode: 'single',
      },
    };

    // Mock response
    res = {
      status: vi.fn((code: number) => {
        statusCode = code;
        return res as VercelResponse;
      }),
      json: vi.fn((data: any) => {
        responseData = data;
        return res as VercelResponse;
      }),
      setHeader: vi.fn(),
      end: vi.fn(),
    };

    // Mock environment variable
    process.env.GOOGLE_API_KEY = 'test-api-key';
  });

  describe('CORS and Method Validation', () => {
    it('should handle OPTIONS preflight request', async () => {
      req.method = 'OPTIONS';
      await handler(req as VercelRequest, res as VercelResponse);

      expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
      expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'POST, OPTIONS');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.end).toHaveBeenCalled();
    });

    it('should reject non-POST requests', async () => {
      req.method = 'GET';
      await handler(req as VercelRequest, res as VercelResponse);

      expect(statusCode).toBe(405);
      expect(responseData).toEqual({ error: 'Method not allowed' });
    });
  });

  describe('Input Validation', () => {
    it('should reject request with missing cards', async () => {
      req.body = { ...req.body, cards: undefined };
      await handler(req as VercelRequest, res as VercelResponse);

      expect(statusCode).toBe(400);
      expect(responseData).toEqual({ error: 'Invalid cards data' });
    });

    it('should reject request with empty cards array', async () => {
      req.body = { ...req.body, cards: [] };
      await handler(req as VercelRequest, res as VercelResponse);

      expect(statusCode).toBe(400);
      expect(responseData).toEqual({ error: 'Invalid cards data' });
    });

    it('should reject invalid reading level', async () => {
      req.body = { ...req.body, readingLevel: 'invalid' };
      await handler(req as VercelRequest, res as VercelResponse);

      expect(statusCode).toBe(400);
      expect(responseData).toEqual({ error: 'Invalid reading level' });
    });

    it('should reject invalid language', async () => {
      req.body = { ...req.body, language: 'fr' };
      await handler(req as VercelRequest, res as VercelResponse);

      expect(statusCode).toBe(400);
      expect(responseData).toEqual({ error: 'Invalid language' });
    });

    it('should reject invalid mode', async () => {
      req.body = { ...req.body, mode: 'invalid' };
      await handler(req as VercelRequest, res as VercelResponse);

      expect(statusCode).toBe(400);
      expect(responseData).toEqual({ error: 'Invalid mode' });
    });
  });

  describe('Rate Limiting', () => {
    it('should allow first request', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: 'Generated oracle message' }],
              },
            },
          ],
        }),
      };
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      await handler(req as VercelRequest, res as VercelResponse);

      expect(statusCode).toBe(200);
      expect(responseData.messages).toBeDefined();
    });

    it('should reject after exceeding rate limit', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: 'Generated oracle message' }],
              },
            },
          ],
        }),
      };

      // Make 11 requests rapidly (limit is 10)
      for (let i = 0; i < 11; i++) {
        (global.fetch as any).mockResolvedValueOnce(mockResponse);
        await handler(req as VercelRequest, res as VercelResponse);
      }

      expect(statusCode).toBe(429);
      expect(responseData).toEqual({ error: 'Too many requests. Please try again later.' });
    });
  });

  describe('Single Card Message Generation', () => {
    it('should generate message for single card in English', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: 'You are blessed with love and beauty.' }],
              },
            },
          ],
        }),
      };
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      await handler(req as VercelRequest, res as VercelResponse);

      expect(statusCode).toBe(200);
      expect(responseData.messages).toHaveLength(1);
      expect(responseData.messages[0]).toBe('You are blessed with love and beauty.');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('generativelanguage.googleapis.com'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('should generate message for single card in Japanese', async () => {
      req.body = {
        ...req.body,
        language: 'ja',
        cards: [
          {
            name: 'アフロディーテ',
            description: '愛と美の女神',
            message: '自分を愛しなさい',
          },
        ],
      };

      const mockResponse = {
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: 'あなたは愛と美に祝福されています。' }],
              },
            },
          ],
        }),
      };
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      await handler(req as VercelRequest, res as VercelResponse);

      expect(statusCode).toBe(200);
      expect(responseData.messages[0]).toBe('あなたは愛と美に祝福されています。');
    });
  });

  describe('Three Card Message Generation', () => {
    it('should generate messages for three cards', async () => {
      req.body = {
        ...req.body,
        mode: 'three',
        cards: [
          { name: 'Aphrodite', description: 'Love', message: 'Love yourself' },
          { name: 'Athena', description: 'Wisdom', message: 'Seek wisdom' },
          { name: 'Artemis', description: 'Independence', message: 'Be free' },
        ],
      };

      const mockResponse = {
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      past: 'Past message about love',
                      present: 'Present message about wisdom',
                      future: 'Future message about independence',
                    }),
                  },
                ],
              },
            },
          ],
        }),
      };
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      await handler(req as VercelRequest, res as VercelResponse);

      expect(statusCode).toBe(200);
      expect(responseData.messages).toHaveLength(3);
      expect(responseData.messages[0]).toBe('Past message about love');
      expect(responseData.messages[1]).toBe('Present message about wisdom');
      expect(responseData.messages[2]).toBe('Future message about independence');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing API key', async () => {
      delete process.env.GOOGLE_API_KEY;

      await handler(req as VercelRequest, res as VercelResponse);

      expect(statusCode).toBe(500);
      expect(responseData).toEqual({ error: 'Server configuration error' });
    });

    it('should handle Google AI API error', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      };
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      await handler(req as VercelRequest, res as VercelResponse);

      expect(statusCode).toBe(500);
      expect(responseData).toEqual({ error: 'Failed to generate message' });
    });

    it('should handle malformed response from Google AI', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          candidates: [],
        }),
      };
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      await handler(req as VercelRequest, res as VercelResponse);

      expect(statusCode).toBe(500);
      expect(responseData).toEqual({ error: 'No message generated' });
    });

    it('should handle JSON parse error for three-card response', async () => {
      req.body = { ...req.body, mode: 'three' };

      const mockResponse = {
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: 'invalid json' }],
              },
            },
          ],
        }),
      };
      (global.fetch as any).mockResolvedValueOnce(mockResponse);

      await handler(req as VercelRequest, res as VercelResponse);

      expect(statusCode).toBe(500);
      expect(responseData).toEqual({ error: 'Failed to parse response' });
    });
  });
});
