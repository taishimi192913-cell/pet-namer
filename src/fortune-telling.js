/**
 * シッポミ 姓名判断モジュール
 * ペットの名前の画数・五行・運勢を計算するエンターテインメント機能
 * 結果は参考としてお使いください。
 */

/** よく使われるペット名漢字の画数テーブル */
export const STROKE_TABLE = {
  '一': 1, '二': 2, '三': 3, '四': 5, '五': 4,
  '六': 4, '七': 2, '八': 2, '九': 2, '十': 2,
  '小': 3, '大': 3, '太': 4, '中': 4, '天': 4,
  '日': 4, '月': 4, '火': 4, '水': 4, '木': 4,
  '金': 8, '土': 3, '花': 7, '空': 8, '海': 9,
  '光': 6, '星': 9, '音': 9, '風': 9, '雪': 11,
  '桜': 10, '桃': 10, '梅': 10, '菊': 11, '蘭': 19,
  '春': 9, '夏': 10, '秋': 9, '冬': 5,
  '心': 4, '愛': 13, '幸': 8, '福': 13, '和': 8,
  '美': 9, '晴': 12, '夜空': 8, // 空 is already above
  '子': 3, '之': 3, '丸': 3, '助': 7, '郎': 8,
  '菜': 11, '実': 8, '夢': 13, '希': 7, '凛': 14,
  '姫': 9, '舞': 13, '叶': 5, '蓮': 13, '葵': 12,
  '杏': 7, '楓': 13, '陽': 12, '鈴': 13, '琉': 10,
  '斗': 4, '翔': 12, '悠': 10, '樹': 16, '虎': 8,
};

/** 五行判定（総画数の下一桁ベース） */
export function getGogyo(totalStrokes) {
  const lastDigit = totalStrokes % 10;
  if (lastDigit <= 2) return { element: '木', keyword: '成長', color: 'hsl(120 40% 40%)' };
  if (lastDigit <= 4) return { element: '火', keyword: '情熱', color: 'hsl(14 70% 55%)' };
  if (lastDigit <= 6) return { element: '土', keyword: '安定', color: 'hsl(40 30% 50%)' };
  if (lastDigit <= 8) return { element: '金', keyword: '輝き', color: 'hsl(50 20% 55%)' };
  return { element: '水', keyword: '柔軟', color: 'hsl(200 40% 50%)' };
}

/**
 * 運勢レベル判定（総画数ベース）
 * 画数の組み合わせから大まかな運勢を算出
 */
export function getLuckLevel(totalStrokes) {
  const t = totalStrokes;
  // 大吉: 15, 24, 31, 32, 52
  if ([15, 24, 31, 32, 52, 21, 35, 41].includes(t)) return { level: '大吉', score: 95 };
  // 吉: 奇数 + 五行バランス良好
  if ([5, 7, 11, 13, 17, 23, 25, 29, 33, 37, 39, 45, 47].includes(t)) return { level: '吉', score: 80 };
  // 中吉: 偶数でバランス良好
  if ([6, 8, 10, 12, 14, 16, 18, 20, 22, 26, 28, 30, 34, 36, 38, 40, 42, 44, 46, 48].includes(t)) return { level: '中吉', score: 65 };
  // 小吉: それ以外の奇数
  if (t % 2 === 1) return { level: '小吉', score: 50 };
  // 凶: 特定の偶数（49以上などバランス崩れ）
  return { level: '凶', score: 30 };
}

/** 運勢レベルの説明文 */
export function getFortuneDescription(luckLevel, gogyo) {
  const descriptions = {
    '大吉': `とてもよい運勢です。「${gogyo}」の要素が名前と調和し、ペットとの暮らしに明るいエネルギーをもたらすでしょう。家族の一員として呼ぶたびに、幸せな気持ちが広がります。`,
    '吉': `安定したよい運勢です。「${gogyo}」の要素が名前の響きと合わさり、穏やかで健やかな毎日を支えてくれそうです。`,
    '中吉': 'まずまずの運勢です。呼びやすさや響きのよさを大切にすれば、名前の持つ力を十分に引き出せるでしょう。',
    '小吉': '小さな幸運を運ぶ名前です。毎日呼んでいくうちに、愛着とともに運気も育っていくでしょう。',
    '凶': 'あまりよい数字の組み合わせではありません。ただし、名前は呼び続けることで意味が育つもの。響きのよさや想いを大切にしてください。',
  };
  return descriptions[luckLevel] || '';
}

/**
 * 主要ペット名のサンプル診断データ
 * 表示用テーブルデータとして使う
 */
export const SAMPLE_FORTUNES = [
  { name: 'むぎ', nameKana: 'むぎ', totalStrokes: 5, species: '犬' },
  { name: 'ココ', nameKana: 'ここ', totalStrokes: 8, species: '犬' },
  { name: 'ソラ', nameKana: 'そら', totalStrokes: 8, species: '犬' },
  { name: 'レオ', nameKana: 'れお', totalStrokes: 5, species: '犬' },
  { name: 'モカ', nameKana: 'もか', totalStrokes: 8, species: '猫' },
  { name: 'ラテ', nameKana: 'らて', totalStrokes: 8, species: '猫' },
  { name: 'ルナ', nameKana: 'るな', totalStrokes: 5, species: '猫' },
  { name: 'きなこ', nameKana: 'きなこ', totalStrokes: 12, species: '猫' },
  { name: 'ハク', nameKana: 'はく', totalStrokes: 7, species: '犬' },
  { name: 'モモ', nameKana: 'もも', totalStrokes: 8, species: 'うさぎ' },
  { name: 'ハナ', nameKana: 'はな', totalStrokes: 7, species: '犬' },
  { name: 'リク', nameKana: 'りく', totalStrokes: 11, species: '犬' },
].map(d => {
  const gogyo = getGogyo(d.totalStrokes);
  const luck = getLuckLevel(d.totalStrokes);
  return { ...d, gogyo: gogyo.element, luck: luck.level, score: luck.score };
});

/**
 * ひらがな/カタカナの画数簡易換算
 * 文字数で大まかに判断（姓名判断の簡易版）
 */
export function getReadingFortune(hiragana) {
  if (!hiragana) return null;
  const chars = hiragana.replace(/[^ぁ-んー]/g, '');
  if (chars.length === 0) return null;
  // ひらがな1文字を簡易的に3画として計算
  const strokes = chars.length * 3;
  const gogyo = getGogyo(strokes);
  const luck = getLuckLevel(strokes);
  return {
    totalStrokes: strokes,
    gogyo: gogyo.element,
    luckLevel: luck.level,
    luckScore: luck.score,
    description: getFortuneDescription(luck.level, gogyo.element),
  };
}

/**
 * フル診断：名前（漢字）＋ 読み（ひらがな）から運勢を計算
 */
export function calculateNameFortune(name, reading) {
  if (!name && !reading) return null;

  let totalStrokes = 0;
  let characterBreakdown = [];

  // 漢字がある場合は画数計算
  if (name) {
    for (const char of name) {
      const stroke = STROKE_TABLE[char] || 8; // 未登録漢字は8画で推定
      totalStrokes += stroke;
      characterBreakdown.push({ char, stroke, registered: !!STROKE_TABLE[char] });
    }
  }

  // ひらがな読みがある場合は加算
  if (reading) {
    const kanaStrokes = reading.replace(/[^ぁ-んー]/g, '').length * 3;
    totalStrokes += kanaStrokes;
  }

  // 結果がなければひらがなのみで計算
  if (totalStrokes === 0 && reading) {
    totalStrokes = getReadingFortune(reading)?.totalStrokes || 0;
  }

  if (totalStrokes === 0) return null;

  const gogyo = getGogyo(totalStrokes);
  const luck = getLuckLevel(totalStrokes);

  // 犬/猫との相性診断（五行ベースの簡易版）
  const compatibilityWithDog = gogyo.element === '火' || gogyo.element === '土' ? '相性良好' : '問題なし';
  const compatibilityWithCat = gogyo.element === '水' || gogyo.element === '木' ? '相性良好' : '問題なし';

  return {
    totalStrokes,
    gogyo: gogyo.element,
    gogyoKeyword: gogyo.keyword,
    luckLevel: luck.level,
    luckScore: luck.score,
    description: getFortuneDescription(luck.level, gogyo.element),
    characterBreakdown,
    compatibilityWithDog,
    compatibilityWithCat,
  };
}
