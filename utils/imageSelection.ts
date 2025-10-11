/**
 * Utility functions for selecting goddess images from local storage
 */

import type { GoddessCardData } from '../types';

/**
 * Maps goddess names to their folder names in the images directory
 */
const goddessNameToFolder: Record<string, string> = {
  'アメノウズメ': 'amenouzume',
  'アフロディーテ': 'aphrodite',
  'アリアンロッド': 'arianrhod',
  'アルテミス': 'artemis',
  'アテナ': 'athena',
  'バステト': 'bastet',
  '弁財天': 'benzaiten',
  'ブリジット': 'brigid',
  'ケリドウェン': 'cerridwen',
  'コアトリクエ': 'coatlicue',
  'ダヌ': 'danu',
  'デメテル': 'demeter',
  'ドゥルガー': 'durga',
  'エオストレ': 'eostre',
  'エレシュキガル': 'ereshkigal',
  'フレイヤ': 'freya',
  'ハトホル': 'hathor',
  'ヘカテ': 'hekate',
  'ヘラ': 'hera',
  'イナンナ': 'inanna',
  'イシュタル': 'ishtar',
  'イシス': 'isis',
  'イシュチェル': 'ixchel',
  'イザナミ': 'izanami',
  '縄文のビーナス': 'jomon_venus',
  'カーリー': 'kali',
  '観音': 'kannon',
  'キサガテンディ': 'kisagatendi',
  'ラクシュミー': 'lakshmi',
  'リリス': 'lilith',
  'マアト': 'maat',
  'マリマタ': 'marimata',
  'モリガン': 'morrigan',
  'ナナブルク': 'nanabuluku',
  '女媧': 'nuwa',
  'オシュン': 'oshun',
  'パチャママ': 'pachamama',
  'パールヴァティー': 'parvati',
  'ペレ': 'pele',
  'ペルセポネ': 'persephone',
  'リアノン': 'rhiannon',
  'サラスヴァティー': 'saraswati',
  'セクメト': 'sekhmet',
  'シーター': 'sita',
  'スカジ': 'skadi',
  'トラソルテオトル': 'tlazolteotl',
  '西王母': 'xiwangmu',
  'イェマヤ': 'yemaya',
};

/**
 * Number of images available for each goddess (4-5 images)
 * This mapping can be dynamically determined or hardcoded
 */
const goddessImageCounts: Record<string, number> = {
  'amenouzume': 5,
  'aphrodite': 5,
  'arianrhod': 5,
  'artemis': 5,
  'athena': 5,
  'bastet': 5,
  'benzaiten': 5,
  'brigid': 5,
  'cerridwen': 5,
  'coatlicue': 5,
  'danu': 5,
  'demeter': 5,
  'durga': 5,
  'eostre': 5,
  'ereshkigal': 5,
  'freya': 5,
  'hathor': 5,
  'hekate': 5,
  'hera': 5,
  'inanna': 5,
  'ishtar': 5,
  'isis': 5,
  'ixchel': 5,
  'izanami': 5,
  'jomon_venus': 5,
  'kali': 5,
  'kannon': 5,
  'kisagatendi': 5,
  'lakshmi': 5,
  'lilith': 5,
  'maat': 5,
  'marimata': 5,
  'morrigan': 5,
  'nanabuluku': 5,
  'nuwa': 5,
  'oshun': 5,
  'pachamama': 5,
  'parvati': 5,
  'pele': 5,
  'persephone': 5,
  'rhiannon': 5,
  'saraswati': 5,
  'sekhmet': 5,
  'sita': 5,
  'skadi': 5,
  'tlazolteotl': 5,
  'xiwangmu': 5,
  'yemaya': 5,
};

/**
 * Selects a random image for a given goddess card
 * @param card - The goddess card data
 * @returns The path to a random image for this goddess
 */
export function getRandomGoddessImage(card: GoddessCardData): string {
  const folderName = goddessNameToFolder[card.name];

  if (!folderName) {
    console.error(`No folder mapping found for goddess: ${card.name}`);
    console.error(`Available mappings:`, Object.keys(goddessNameToFolder));
    // Return a default goddess image as fallback (use first available goddess)
    return `/images/amenouzume/1.webp`;
  }

  const imageCount = goddessImageCounts[folderName] || 5;
  const randomIndex = Math.floor(Math.random() * imageCount) + 1; // 1-based indexing

  return `/images/${folderName}/${randomIndex}.webp`;
}

/**
 * Preloads an image to ensure it's available when needed
 * @param imagePath - The path to the image
 * @returns A promise that resolves when the image is loaded
 */
export function preloadImage(imagePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(imagePath);
    img.onerror = () => reject(new Error(`Failed to load image: ${imagePath}`));
    img.src = imagePath;
  });
}
