import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import type { GoddessCardData, NewReading, ReadingLevel } from '../types';
import { saveReading } from '../utils/storage';
import type { Language, Translations } from '../utils/i18n';
import Modal from './shared/Modal';
import LoadingSpinner from './shared/LoadingSpinner';
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



const SingleCardView: React.FC<{ card: GoddessCardData; isMessageLoading: boolean; isImageLoading: boolean; generatedMessage: string | null; generatedImageUrl: string | null; t: Translations; }> = ({ card, isMessageLoading, isImageLoading, generatedMessage, generatedImageUrl, t }) => (
  <div className="text-center w-full">
    <div className="w-full max-w-xs mx-auto aspect-[3/4] bg-amber-100 rounded-lg mb-6 flex items-center justify-center border border-amber-200/50 shadow-inner overflow-hidden">
      {isImageLoading ? (
        <LoadingSpinner text="女神の姿を顕現中..." />
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

    {isMessageLoading ? (
        <div className="min-h-[6rem] flex items-center justify-center">
            <LoadingSpinner text="女神からのメッセージを受け取っています..." />
        </div>
    ) : (
        <p className="text-base text-stone-700 mt-6 leading-relaxed min-h-[6rem] whitespace-pre-wrap text-left mb-6">
            {generatedMessage || card.message}
        </p>
    )}

    <div className="space-y-4">
      <CardAffirmation affirmation={card.affirmation} label={t.affirmation} />
      <CardGuidance guidance={card.dailyGuidance} label={t.dailyGuidance} />
    </div>
  </div>
);

const ThreeCardSpread: React.FC<{ cards: GoddessCardData[]; isLoading: boolean; generatedMessages: (string | null)[]; t: Translations; }> = ({ cards, isLoading, generatedMessages, t }) => (
  <div className="flex flex-col items-center w-full">
    <h2 className="text-4xl sm:text-5xl font-bold text-orange-800 tracking-wide mb-6">あなたのリーディング</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-left w-full">
      {cards.map((card, index) => (
        <div key={card.id} className="flex flex-col bg-amber-50/50 p-4 rounded-lg border border-amber-200/50">
          <h3 className="text-xl font-bold text-amber-800 tracking-wide text-center mb-1">
            {['過去', '現在', '未来'][index]}
          </h3>
          <h4 className="text-2xl font-semibold text-orange-800 text-center">{card.name}</h4>
          <p className="text-sm text-amber-700 mt-1 italic text-center">{card.description}</p>

          <div className="mt-3 mb-3">
            <CardTheme theme={card.theme} size="sm" label={t.theme} />
          </div>

          <div className="flex-grow">
            {isLoading ? (
                <LoadingSpinner text="メッセージを生成中..." />
            ) : (
                 <p className="text-base text-stone-700 leading-relaxed font-light whitespace-pre-wrap text-left">{generatedMessages[index] || card.message}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);


const MessageModal: React.FC<MessageModalProps> = ({ cards, isOpen, onClose, readingLevel, language, t }) => {
  const [generatedMessages, setGeneratedMessages] = useState<(string | null)[]>([]);
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Retry logic with exponential backoff
  const retryWithBackoff = async <T,>(fn: () => Promise<T>, maxRetries: number = 3): Promise<T | null> => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        console.warn(`Attempt ${attempt + 1} failed:`, error);
        if (attempt === maxRetries - 1) {
          throw error;
        }
        // Exponential backoff: 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    return null;
  };

  const generateAllContent = useCallback(async () => {
    if (!isOpen || cards.length === 0) return;

    setError(null);
    setGeneratedMessages([]);
    setGeneratedImageUrl(null);
    setIsMessageLoading(true);

    const mode = cards.length === 1 ? 'single' : 'three';
    let finalImageUrl: string | null = null;
    let finalMessages: (string | null)[] = [];
    let hasPartialFailure = false;

    try {
      if (mode === 'single') {
        setIsImageLoading(true);

        const imagePromise = retryWithBackoff(async () => {
          const imagePrompt = `「${cards[0].name}」（${cards[0].description}）の、神々しく美しい芸術的な肖像画。幻想的で優美な雰囲気で。`;
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
        }).then(imageUrl => {
          setGeneratedImageUrl(imageUrl);
          return imageUrl;
        }).catch(err => {
          console.error('Image generation failed after retries:', err);
          setGeneratedImageUrl(null);
          hasPartialFailure = true;
          return null;
        }).finally(() => {
          setIsImageLoading(false);
        });

        const messagePromise = retryWithBackoff(async () => {
          const prompt = generateSingleCardMessagePrompt(cards[0], readingLevel);
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
          });
          if (!response.text || response.text.trim() === '') {
            throw new Error('Empty message response');
          }
          return response.text;
        }).then(message => {
          const messages = [message];
          setGeneratedMessages(messages);
          return messages;
        }).catch(err => {
          console.error('Message generation failed after retries:', err);
          const fallbackMessage = [cards[0].message];
          setGeneratedMessages(fallbackMessage);
          hasPartialFailure = true;
          return fallbackMessage;
        });

        const [imageUrl, messages] = await Promise.all([imagePromise, messagePromise]);
        finalImageUrl = imageUrl;
        finalMessages = messages || [cards[0].message];

      } else { // mode === 'three'
        finalMessages = await retryWithBackoff(async () => {
          const prompt = generateThreeCardSpreadMessagePrompt(cards, readingLevel);
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
              responseMimeType: "application/json",
              responseSchema: threeCardResponseSchema,
            },
          });

          if (!response.text || response.text.trim() === '') {
            throw new Error('Empty response from AI');
          }

          const jsonResponse = JSON.parse(response.text);
          if (!jsonResponse.past || !jsonResponse.present || !jsonResponse.future) {
            throw new Error('Incomplete three-card response');
          }

          return [jsonResponse.past, jsonResponse.present, jsonResponse.future];
        }).then(messages => {
          setGeneratedMessages(messages!);
          return messages!;
        }).catch(err => {
          console.error('Three-card generation failed after retries:', err);
          const fallbackMessages = cards.map(c => c.message);
          setGeneratedMessages(fallbackMessages);
          hasPartialFailure = true;
          return fallbackMessages;
        });
      }

      if (hasPartialFailure) {
        setError("一部のコンテンツの生成に失敗しました。元のメッセージを表示しています。");
      }

    } catch (e: any) {
      console.error("Failed to generate content:", e);
      setError("コンテンツの生成に失敗しました。ネットワーク接続を確認し、もう一度お試しください。");
      finalMessages = cards.map(c => c.message);
      setGeneratedMessages(finalMessages);
    } finally {
      setIsMessageLoading(false);
    }

    // Save reading even if there were partial failures
    const newReading: NewReading = {
      mode,
      cards,
      generatedMessages: finalMessages,
      generatedImageUrl: finalImageUrl,
      readingLevel,
    };

    const saveSuccess = saveReading(newReading);
    if (!saveSuccess) {
      console.warn('Failed to save reading to localStorage');
    }
  }, [isOpen, cards, readingLevel]);
  

  useEffect(() => {
    if (isOpen && cards.length > 0) {
      generateAllContent();
    }
  }, [isOpen, cards, generateAllContent]);
  
  if (!isOpen || cards.length === 0) {
    return null;
  }

  const isSingleCard = cards.length === 1;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth={isSingleCard ? 'lg' : '5xl'}
      className="p-6 sm:p-8 flex flex-col items-center gap-4 sm:gap-6"
    >
      {isSingleCard
          ? <SingleCardView card={cards[0]} isMessageLoading={isMessageLoading} isImageLoading={isImageLoading} generatedMessage={generatedMessages[0]} generatedImageUrl={generatedImageUrl} t={t} />
          : <ThreeCardSpread cards={cards} isLoading={isMessageLoading} generatedMessages={generatedMessages} t={t} />
      }

      {error && (
        <div className="text-center mt-6 p-4 bg-red-100/50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm font-medium">{error}</p>
          <button
            onClick={generateAllContent}
            className="mt-3 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-5 rounded-full text-sm transition-transform transform hover:scale-105"
            aria-label="生成を再試行する"
          >
            再試行
          </button>
        </div>
      )}

      <button
        onClick={onClose}
        className="mt-8 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-6 rounded-full shadow-md transition-transform transform hover:scale-105"
        aria-label="モーダルを閉じてカードを引き直す"
      >
        もう一度引く
      </button>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 1s ease-in-out; }
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
      `}</style>
    </Modal>
  );
};

export default MessageModal;