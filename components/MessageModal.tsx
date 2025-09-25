import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import type { GoddessCardData, NewReading, ReadingLevel } from '../types';
import { saveReading } from '../utils/storage';
import type { Language, Translations } from '../utils/i18n';
import { retryWithExponentialBackoff, parseAPIError, type APIError } from '../utils/errorHandling';
import Modal from './shared/Modal';
import LoadingSpinner from './shared/LoadingSpinner';
import ErrorMessage from './shared/ErrorMessage';
import CardTheme from './ui/CardTheme';
import CardAffirmation from './ui/CardAffirmation';
import CardGuidance from './ui/CardGuidance';

interface MessageModalProps {
  cards: GoddessCardData[];
  isOpen: boolean;
  onClose: () => void;
  readingLevel: ReadingLevel;
  language: Language;
  t: Translations;
  onSave?: () => void;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generateSingleCardMessagePrompt = (card: GoddessCardData, level: ReadingLevel) => {
  const basePrompt = `あなたは神聖な神託です。女神「${card.name}」（${card.description}）からのメッセージを伝えてください。元のメッセージは「${card.message}」です。この情報に基づき、より深く、洞察に満ちた、パーソナライズされた神託のメッセージを生成してください。口調は、女神が直接語りかけるように、優雅で、共感的で、包み込むような女性的なものにしてください。「～しなさい」や「～だろう」のような強い命令形や断定的な表現は避け、「～すると良いでしょう」「～かもしれません」「～でしょう」のように、柔らかく、受け入れやすい言葉遣いを徹底してください。`;
  const deepInsightPrompt = `さらに、このカードが示す潜在的な課題や、あなたが乗り越えるべきテーマについても深く言及してください。魂の成長を促すための、具体的で実践的なアドバイスを加えてください。`;
  const finalPrompt = level === 'deep'
    ? `${basePrompt} ${deepInsightPrompt} メッセージは全体で600文字以内とし、適度に改行を入れて読みやすくしてください。`
    : `${basePrompt} メッセージは550文字以内とし、適度に改行を入れて読みやすくしてください。`;
  return finalPrompt;
};

const generateThreeCardSpreadMessagePrompt = (cards: GoddessCardData[], level: ReadingLevel) => {
  const basePrompt = `あなたは神聖な神託です。過去、現在、未来を占う3枚引きのリーディングを行います。
過去のカードは「${cards[0].name}」（${cards[0].description}）。
現在のカードは「${cards[1].name}」（${cards[1].description}）。
未来のカードは「${cards[2].name}」（${cards[2].description}）。
これら3枚のカードの組み合わせを解釈し、それぞれのカードについて、その位置（過去、現在、未来）に応じた、深く洞察に満ちたメッセージを生成してください。3つのメッセージは互いに関連し合い、一つの物語のように繋がるようにしてください。口調は、女神が直接語りかけるように、優雅で、共感的で、包み込むような女性的なものにしてください。「～しなさい」や「～だろう」のような強い命令形や断定的な表現は避け、「～すると良いでしょう」「～かもしれません」「～でしょう」のように、柔らかく、受け入れやすい言葉遣いを徹底してください。`;
  const deepInsightPrompt = `各カードのメッセージには、それが示す表面的な意味だけでなく、あなたの内面的な成長にとってどのような意味を持つのか、どんな課題を乗り越える機会を示唆しているのかについても触れてください。`;
  const finalPrompt = level === 'deep'
    ? `${basePrompt} ${deepInsightPrompt} 各メッセージは、読みやすくなるように適度に改行を入れてください。`
    : `${basePrompt} 各メッセージは、読みやすくなるように適度に改行を入れてください。`;
  return finalPrompt;
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

const SingleCardView: React.FC<{
  card: GoddessCardData;
  isMessageLoading: boolean;
  isImageLoading: boolean;
  generatedMessage: string | null;
  generatedImageUrl: string | null;
  messageError: APIError | null;
  imageError: APIError | null;
  onRetryMessage: () => void;
  onRetryImage: () => void;
  t: Translations;
  language: Language;
}> = ({ card, isMessageLoading, isImageLoading, generatedMessage, generatedImageUrl, messageError, imageError, onRetryMessage, onRetryImage, t, language }) => (
  <div className="text-center w-full">
    <div className="w-full max-w-xs mx-auto aspect-[3/4] bg-amber-100 rounded-lg mb-6 flex items-center justify-center border border-amber-200/50 shadow-inner overflow-hidden">
      {isImageLoading ? (
        <LoadingSpinner text="女神の姿を顕現中..." />
      ) : imageError ? (
        <div className="p-4 w-full">
          <ErrorMessage
            error={imageError}
            language={language}
            onRetry={onRetryImage}
            className="text-xs"
          />
        </div>
      ) : generatedImageUrl ? (
        <img src={generatedImageUrl} alt={`An artistic depiction of ${card.name}`} className="w-full h-full object-cover rounded-lg animate-fadeIn" />
      ) : (
        <div className="text-amber-700/50 p-4 text-center text-sm">画像の表示に失敗しました。</div>
      )}
    </div>

    <h2 className="text-4xl sm:text-5xl font-bold text-orange-800 tracking-wide">{card.name}</h2>
    <p className="text-md sm:text-lg text-amber-700 mt-2 italic">
      {card.description}
    </p>

    <div className="mt-4 mb-4">
      <CardTheme theme={card.theme} label={t.theme} />
    </div>

    {messageError && (
      <div className="mb-4">
        <ErrorMessage
          error={messageError}
          language={language}
          onRetry={onRetryMessage}
        />
      </div>
    )}

    {isMessageLoading ? (
        <div className="min-h-[6rem] flex items-center justify-center">
          <LoadingSpinner text="女神からのメッセージを受信中..." />
        </div>
      ) : generatedMessage ? (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200/50 shadow-inner max-w-3xl mx-auto my-4">
          <p className="text-slate-700 leading-relaxed whitespace-pre-line text-sm sm:text-base font-medium text-left">
            {generatedMessage}
          </p>
        </div>
      ) : null
    }

    <div className="mt-6 mb-4">
      <CardAffirmation affirmation={card.affirmation} label={t.affirmation} />
    </div>

    <div className="mt-4">
      <CardGuidance guidance={card.dailyGuidance} label={t.dailyGuidance} />
    </div>
  </div>
);

const MessageModal: React.FC<MessageModalProps> = ({ cards, isOpen, onClose, readingLevel, language, t, onSave }) => {
  const [generatedMessages, setGeneratedMessages] = useState<(string | null)[]>([]);
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const [messageError, setMessageError] = useState<APIError | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageError, setImageError] = useState<APIError | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Helper functions for content generation
  const generateMessages = async (): Promise<(string | null)[]> => {
    const mode = cards.length === 1 ? 'single' : 'three';

    return await retryWithExponentialBackoff(async () => {
      if (mode === 'single') {
        const prompt = generateSingleCardMessagePrompt(cards[0], readingLevel);
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        return [response.text];
      } else {
        const prompt = generateThreeCardSpreadMessagePrompt(cards, readingLevel);
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: threeCardResponseSchema,
          },
        });
        const jsonResponse = JSON.parse(response.text);
        return [jsonResponse.past, jsonResponse.present, jsonResponse.future];
      }
    });
  };

  const generateImage = async (card: GoddessCardData): Promise<string | null> => {
    return await retryWithExponentialBackoff(async () => {
      const imagePrompt = `「${card.name}」（${card.description}）の、神々しく美しい芸術的な肖像画。幻想的で優美な雰囲気で。`;
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: imagePrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '3:4',
        },
      });

      if (!response.generatedImages || response.generatedImages.length === 0 || !response.generatedImages[0].image) {
        throw new Error('No image data in response');
      }

      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    });
  };

  const getFallbackMessages = (): (string | null)[] => {
    if (cards.length === 1) {
      return [cards[0].message];
    } else {
      return cards.map(card => card.message);
    }
  };

  // Retry handlers for user-initiated retries
  const handleRetryMessages = async () => {
    setMessageError(null);
    setIsMessageLoading(true);

    try {
      const messages = await generateMessages();
      setGeneratedMessages(messages);
    } catch (error) {
      const apiError = parseAPIError(error);
      setMessageError(apiError);
      setGeneratedMessages(getFallbackMessages());
    } finally {
      setIsMessageLoading(false);
    }
  };

  const handleRetryImage = async () => {
    if (cards.length !== 1) return;

    setImageError(null);
    setIsImageLoading(true);

    try {
      const imageUrl = await generateImage(cards[0]);
      setGeneratedImageUrl(imageUrl);
    } catch (error) {
      const apiError = parseAPIError(error);
      setImageError(apiError);
    } finally {
      setIsImageLoading(false);
    }
  };

  const generateAllContent = useCallback(async () => {
    if (!isOpen || cards.length === 0) return;

    // Reset all states
    setMessageError(null);
    setImageError(null);
    setGeneratedMessages([]);
    setGeneratedImageUrl(null);
    setIsMessageLoading(true);

    const mode = cards.length === 1 ? 'single' : 'three';

    try {
      // Generate messages first (critical functionality)
      const messagePromise = generateMessages();

      // Generate image concurrently for single card mode
      let imagePromise: Promise<string | null> = Promise.resolve(null);
      if (mode === 'single') {
        setIsImageLoading(true);
        imagePromise = generateImage(cards[0]);
      }

      // Wait for both operations
      const [messages, imageUrl] = await Promise.allSettled([messagePromise, imagePromise]);

      // Handle message results
      if (messages.status === 'fulfilled') {
        setGeneratedMessages(messages.value);
      } else {
        const apiError = parseAPIError(messages.reason);
        setMessageError(apiError);
        setGeneratedMessages(getFallbackMessages());
      }

      // Handle image results (less critical)
      if (imageUrl.status === 'fulfilled') {
        setGeneratedImageUrl(imageUrl.value);
      } else if (mode === 'single') {
        const apiError = parseAPIError(imageUrl.reason);
        setImageError(apiError);
      }

    } catch (error) {
      console.error('Unexpected error in generateAllContent:', error);
    } finally {
      setIsMessageLoading(false);
      setIsImageLoading(false);
    }
  }, [cards, readingLevel, isOpen]);

  useEffect(() => {
    if (isOpen && cards.length > 0) {
      generateAllContent();
      setIsSaved(false);
    }
  }, [generateAllContent, isOpen, cards.length]);

  const handleSaveReading = async () => {
    try {
      const newReading: NewReading = {
        mode: cards.length === 1 ? 'single' : 'three',
        cards,
        generatedMessages,
        generatedImageUrl,
        readingLevel,
      };

      console.log('Attempting to save reading:', newReading);

      const saveSuccess = saveReading(newReading);

      if (saveSuccess) {
        console.log('Reading saved successfully');
        setIsSaved(true);
        onSave?.();
        setTimeout(() => setIsSaved(false), 3000);
      } else {
        console.error('Failed to save reading: saveReading returned false');
        // Could show an error message to user here if needed
      }
    } catch (error) {
      console.error('Failed to save reading:', error);
    }
  };

  if (cards.length === 1) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="bg-white rounded-xl shadow-2xl w-full">
          <div className="p-6 sm:p-8">
            <SingleCardView
              card={cards[0]}
              isMessageLoading={isMessageLoading}
              isImageLoading={isImageLoading}
              generatedMessage={generatedMessages[0]}
              generatedImageUrl={generatedImageUrl}
              messageError={messageError}
              imageError={imageError}
              onRetryMessage={handleRetryMessages}
              onRetryImage={handleRetryImage}
              t={t}
              language={language}
            />

            <div className="flex justify-center space-x-4 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleSaveReading}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  isSaved
                    ? 'bg-green-600 text-white'
                    : 'bg-amber-600 hover:bg-amber-500 text-white'
                }`}
              >
                {isSaved ? t.saved : t.saveReading}
              </button>
              <button
                onClick={onClose}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  // Three card layout (simplified for now)
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full">
        <div className="p-6 sm:p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-orange-800 tracking-wide mb-2">
              {t.threeCardSpread}
            </h2>
          </div>

          {messageError && (
            <div className="mb-6">
              <ErrorMessage
                error={messageError}
                language={language}
                onRetry={handleRetryMessages}
              />
            </div>
          )}

          {isMessageLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner text="三つの時の流れを読み取っています..." />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {cards.map((card, index) => (
                <div key={card.id} className="text-center">
                  <h3 className="text-xl font-bold text-amber-800 mb-4">
                    {index === 0 ? t.past : index === 1 ? t.present : t.future}
                  </h3>
                  <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
                    <h4 className="text-lg font-semibold text-orange-800 mb-2">{card.name}</h4>
                    <p className="text-sm text-amber-700 mb-4">{card.description}</p>
                    {generatedMessages[index] && (
                      <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line text-left">
                        {generatedMessages[index]}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-center space-x-4 pt-6 border-t border-gray-200">
            <button
              onClick={handleSaveReading}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                isSaved
                  ? 'bg-green-600 text-white'
                  : 'bg-amber-600 hover:bg-amber-500 text-white'
              }`}
            >
              {isSaved ? t.saved : t.saveReading}
            </button>
            <button
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {t.close}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default MessageModal;