import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import type { GoddessCardData, NewReading, ReadingLevel } from '../types';
import { saveReading } from '../utils/storage';
import type { Language, Translations } from '../utils/i18n';
import { retryWithExponentialBackoff, parseAPIError, type APIError } from '../utils/errorHandling';
import { getRandomGoddessImage, preloadImage } from '../utils/imageSelection';
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

const generateSingleCardMessagePrompt = (card: GoddessCardData, level: ReadingLevel, language: Language) => {
  if (language === 'en') {
    const basePrompt = `You are a sacred oracle. Please deliver a message from the goddess "${card.name}" (${card.description}). The original message is: "${card.message}". Based on this information, generate a deeper, insightful, and personalized oracle message. The tone should be graceful, empathetic, and nurturing, as if the goddess is speaking directly to the reader. Avoid strong imperatives or definitive statements. Instead, use gentle, receptive language such as "you might consider," "perhaps," or "you may find."`;
    const deepInsightPrompt = `Additionally, address the potential challenges this card indicates and themes the reader needs to overcome. Include specific, practical advice to encourage soul growth.`;
    const finalPrompt = level === 'deep'
      ? `${basePrompt} ${deepInsightPrompt} Keep the message within 400 words and use natural paragraph breaks for readability.`
      : `${basePrompt} Keep the message within 350 words and use natural paragraph breaks for readability.`;
    return finalPrompt;
  } else {
    const basePrompt = `あなたは神聖な神託です。女神「${card.name}」（${card.description}）からのメッセージを伝えてください。元のメッセージは「${card.message}」です。この情報に基づき、より深く、洞察に満ちた、パーソナライズされた神託のメッセージを生成してください。口調は、女神が直接語りかけるように、優雅で、共感的で、包み込むような女性的なものにしてください。「～しなさい」や「～だろう」のような強い命令形や断定的な表現は避け、「～すると良いでしょう」「～かもしれません」「～でしょう」のように、柔らかく、受け入れやすい言葉遣いを徹底してください。`;
    const deepInsightPrompt = `さらに、このカードが示す潜在的な課題や、あなたが乗り越えるべきテーマについても深く言及してください。魂の成長を促すための、具体的で実践的なアドバイスを加えてください。`;
    const finalPrompt = level === 'deep'
      ? `${basePrompt} ${deepInsightPrompt} メッセージは全体で600文字以内とし、適度に改行を入れて読みやすくしてください。`
      : `${basePrompt} メッセージは550文字以内とし、適度に改行を入れて読みやすくしてください。`;
    return finalPrompt;
  }
};

const generateThreeCardSpreadMessagePrompt = (cards: GoddessCardData[], level: ReadingLevel, language: Language) => {
  if (language === 'en') {
    const basePrompt = `You are a sacred oracle performing a three-card reading for past, present, and future.
The Past card is "${cards[0].name}" (${cards[0].description}).
The Present card is "${cards[1].name}" (${cards[1].description}).
The Future card is "${cards[2].name}" (${cards[2].description}).
Interpret the combination of these three cards and generate deep, insightful messages for each card according to its position (past, present, future). The three messages should relate to each other and flow together like a single narrative. The tone should be graceful, empathetic, and nurturing, as if the goddess is speaking directly to the reader. Avoid strong imperatives or definitive statements. Instead, use gentle, receptive language such as "you might consider," "perhaps," or "you may find."`;
    const deepInsightPrompt = `For each card's message, address not only its surface meaning but also what it means for the reader's inner growth and what opportunities for overcoming challenges it suggests.`;
    const finalPrompt = level === 'deep'
      ? `${basePrompt} ${deepInsightPrompt} Use natural paragraph breaks to make each message readable.`
      : `${basePrompt} Use natural paragraph breaks to make each message readable.`;
    return finalPrompt;
  } else {
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
  }
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
        <LoadingSpinner text={t.loadingGoddessImage} />
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
          <LoadingSpinner text={t.loadingMessage} />
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
  const [generatedImageUrls, setGeneratedImageUrls] = useState<(string | null)[]>([]);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageError, setImageError] = useState<APIError | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Helper functions for content generation
  const generateMessages = async (): Promise<(string | null)[]> => {
    const mode = cards.length === 1 ? 'single' : 'three';

    return await retryWithExponentialBackoff(async () => {
      if (mode === 'single') {
        const prompt = generateSingleCardMessagePrompt(cards[0], readingLevel, language);
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });
        return [response.text];
      } else {
        const prompt = generateThreeCardSpreadMessagePrompt(cards, readingLevel, language);
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

  const loadLocalImage = async (card: GoddessCardData): Promise<string | null> => {
    return await retryWithExponentialBackoff(async () => {
      const imagePath = getRandomGoddessImage(card);
      await preloadImage(imagePath);
      return imagePath;
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
    setImageError(null);
    setIsImageLoading(true);

    try {
      const imagePromises = cards.map(card => loadLocalImage(card));
      const imageResults = await Promise.allSettled(imagePromises);
      const loadedImages = imageResults.map(result =>
        result.status === 'fulfilled' ? result.value : null
      );
      setGeneratedImageUrls(loadedImages);
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
    setGeneratedImageUrls([]);
    setIsMessageLoading(true);
    setIsImageLoading(true);

    try {
      // Generate messages and load images concurrently
      const messagePromise = generateMessages();
      const imagePromises = cards.map(card => loadLocalImage(card));

      const [messages, ...imageResults] = await Promise.allSettled([messagePromise, ...imagePromises]);

      // Handle message results
      if (messages.status === 'fulfilled') {
        setGeneratedMessages(messages.value);
      } else {
        const apiError = parseAPIError(messages.reason);
        setMessageError(apiError);
        setGeneratedMessages(getFallbackMessages());
      }

      // Handle image results
      const loadedImages = imageResults.map(result =>
        result.status === 'fulfilled' ? result.value : null
      );
      setGeneratedImageUrls(loadedImages);

      // Check if any image failed
      const hasImageError = imageResults.some(result => result.status === 'rejected');
      if (hasImageError) {
        const firstError = imageResults.find(result => result.status === 'rejected');
        if (firstError && firstError.status === 'rejected') {
          const apiError = parseAPIError(firstError.reason);
          setImageError(apiError);
        }
      }

    } catch (error) {
      console.error('Unexpected error in generateAllContent:', error);
    } finally {
      setIsMessageLoading(false);
      setIsImageLoading(false);
    }
  }, [cards, readingLevel, language, isOpen]);

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
        generatedImageUrl: generatedImageUrls[0] || null, // For backward compatibility, save first image
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
              generatedImageUrl={generatedImageUrls[0]}
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
              <LoadingSpinner text={t.loadingThreeCards} />
            </div>
          ) : (
            <div className="space-y-8 mb-8">
              {cards.map((card, index) => (
                <div key={card.id} className="max-w-4xl mx-auto">
                  <div className="text-center mb-4">
                    <h3 className="text-2xl font-bold text-amber-800 mb-2">
                      {index === 0 ? t.past : index === 1 ? t.present : t.future}
                    </h3>
                    <h4 className="text-xl font-semibold text-orange-800">{card.name}</h4>
                    <p className="text-amber-700 mt-1">{card.description}</p>
                  </div>

                  {/* Image above the message */}
                  <div className="w-full max-w-xs mx-auto aspect-[3/4] bg-amber-100 rounded-lg mb-4 flex items-center justify-center border border-amber-200/50 shadow-inner overflow-hidden">
                    {isImageLoading ? (
                      <LoadingSpinner text={t.loadingImages} />
                    ) : generatedImageUrls[index] ? (
                      <img
                        src={generatedImageUrls[index]!}
                        alt={`${card.name}の姿`}
                        className="w-full h-full object-cover rounded-lg animate-fadeIn"
                      />
                    ) : (
                      <div className="text-amber-700/50 p-4 text-center text-sm">画像</div>
                    )}
                  </div>

                  {/* Message below the image */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200/50 shadow-inner">
                    {generatedMessages[index] && (
                      <p className="text-slate-700 leading-relaxed whitespace-pre-line text-left text-base">
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