import surnameDataset from '../data/japanese-surnames.json' with { type: 'json' };

function toHiragana(text) {
  return [...String(text || '')].map((ch) => {
    const code = ch.charCodeAt(0);
    if (code >= 0x30a1 && code <= 0x30f6) return String.fromCharCode(code - 0x60);
    return ch;
  }).join('');
}

function sanitizeKana(text) {
  return toHiragana(text)
    .replace(/[ァ-ヶ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60))
    .replace(/[^\u3041-\u3096ー]/g, '');
}

function sanitizeVisual(text) {
  return String(text || '').replace(/\s+/g, '').trim();
}

function getVowel(kana) {
  const table = {
    あ: 'a', か: 'a', さ: 'a', た: 'a', な: 'a', は: 'a', ま: 'a', や: 'a', ら: 'a', わ: 'a', が: 'a', ざ: 'a', だ: 'a', ば: 'a', ぱ: 'a', ぁ: 'a',
    い: 'i', き: 'i', し: 'i', ち: 'i', に: 'i', ひ: 'i', み: 'i', り: 'i', ぎ: 'i', じ: 'i', ぢ: 'i', び: 'i', ぴ: 'i', ぃ: 'i',
    う: 'u', く: 'u', す: 'u', つ: 'u', ぬ: 'u', ふ: 'u', む: 'u', ゆ: 'u', る: 'u', ぐ: 'u', ず: 'u', づ: 'u', ぶ: 'u', ぷ: 'u', ぅ: 'u',
    え: 'e', け: 'e', せ: 'e', て: 'e', ね: 'e', へ: 'e', め: 'e', れ: 'e', げ: 'e', ぜ: 'e', で: 'e', べ: 'e', ぺ: 'e', ぇ: 'e',
    お: 'o', こ: 'o', そ: 'o', と: 'o', の: 'o', ほ: 'o', も: 'o', よ: 'o', ろ: 'o', を: 'o', ご: 'o', ぞ: 'o', ど: 'o', ぼ: 'o', ぽ: 'o', ぉ: 'o',
    ん: 'n',
    ー: 'long',
  };
  return table[kana] || null;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

const SURNAME_INDEX = surnameDataset?.bySurname || {};

function formatEstimatedCount(count) {
  if (!Number.isFinite(count) || count <= 0) return '';
  if (count >= 10000) {
    return `約${(count / 10000).toFixed(1).replace(/\.0$/, '')}万人`;
  }
  return `約${count.toLocaleString('ja-JP')}人`;
}

function confidenceLabel(score) {
  if (score >= 94) return 'データ照合ずみ';
  if (score >= 84) return 'かなり確からしい';
  if (score >= 72) return '参考値';
  return '要ふりがな';
}

function resolveSurnameProfile({ surname, surnameReading }) {
  const cleanSurname = sanitizeVisual(surname);
  const inputReading = sanitizeKana(surnameReading);
  const dbEntry = cleanSurname ? SURNAME_INDEX[cleanSurname] || null : null;
  const dbReading = sanitizeKana(dbEntry?.reading || '');

  let resolvedReading = inputReading;
  let confidenceScore = 56;
  let sourceDescription = '';
  let note = '';

  if (dbEntry && inputReading) {
    if (inputReading === dbReading) {
      confidenceScore = 98;
      sourceDescription = `姓データベースと同じ読みで照合しました。`;
    } else {
      confidenceScore = 78;
      sourceDescription = `姓データベースの一般的な読みは「${dbReading}」ですが、今回は入力された「${inputReading}」で診断しています。`;
      note = '苗字の読みが複数ある場合は、ご家庭で使うふりがなを優先して入れてください。';
    }
  } else if (dbEntry && dbReading) {
    resolvedReading = dbReading;
    confidenceScore = dbEntry.rank <= 100 ? 95 : dbEntry.rank <= 500 ? 91 : 86;
    sourceDescription = `姓データベースの一般的な読み「${dbReading}」を使って照合しました。`;
    note = 'ふりがなを入れると、ご家庭での呼び方に合わせてさらに正確に診断できます。';
  } else if (inputReading) {
    confidenceScore = 74;
    sourceDescription = '苗字データベースにないため、入力されたふりがなをもとに診断しています。';
  } else if (cleanSurname) {
    confidenceScore = 42;
    sourceDescription = '苗字データベースにないため、見た目ベースの参考値です。';
    note = 'この苗字はデータベース未登録です。ふりがなを入れると、音の相性まで診断できます。';
  }

  return {
    visual: cleanSurname,
    kana: resolvedReading,
    inputReading,
    dbEntry,
    dbReading,
    confidenceScore,
    confidenceLabel: confidenceLabel(confidenceScore),
    sourceDescription,
    note,
  };
}

function scoreLengthBalance(surnameKana, nameKana, surnameVisual, nameVisual) {
  const surnameLength = surnameKana.length || surnameVisual.length;
  const nameLength = nameKana.length || nameVisual.length;
  const total = surnameLength + nameLength;
  const diff = Math.abs(surnameLength - nameLength);

  let score = 90;
  score -= diff * 10;
  if (total < 4) score -= 14;
  if (total > 8) score -= 10;
  if (surnameLength === 0 || nameLength === 0) score -= 12;

  return clamp(score, 48, 98);
}

function scoreBoundaryFlow(surnameKana, nameKana) {
  if (!surnameKana || !nameKana) {
    return {
      score: 72,
      note: '苗字のふりがながあると、音のつながりをもっと細かく見られます。',
    };
  }

  const last = surnameKana.at(-1);
  const first = nameKana.at(0);
  const lastVowel = getVowel(last);
  const firstVowel = getVowel(first);

  let score = 84;
  let note = '呼んだときに音が切れすぎず、自然につながりやすい組み合わせです。';

  if (last === first) {
    score -= 18;
    note = 'つなぎ目の音が少し重なりやすいので、呼ぶときは少し区切ってあげると聞き取りやすくなります。';
  } else if (lastVowel && firstVowel && lastVowel === firstVowel && lastVowel !== 'n' && lastVowel !== 'long') {
    score -= 10;
    note = '母音が近いぶん、やわらかく溶ける響きです。少し似た音が続くので、呼ぶときのリズムで差が出ます。';
  } else if (last === 'ん') {
    score += 6;
    note = '苗字の終わりから名前へ自然に受け渡しやすく、声に出したときの収まりがきれいです。';
  } else if (['や', 'ゆ', 'よ', 'あ', 'い', 'う', 'え', 'お'].includes(first)) {
    score += 4;
    note = '名前の入りが軽やかで、やさしく呼びかけたいときに映えるつながりです。';
  } else {
    score += 3;
  }

  return { score: clamp(score, 52, 98), note };
}

function scoreVisualFit(surnameVisual, nameVisual) {
  const surnameLength = surnameVisual.length;
  const nameLength = nameVisual.length;
  const total = surnameLength + nameLength;

  let score = 88;
  if (total >= 9) score -= 12;
  if (total <= 3) score -= 10;
  if (Math.abs(surnameLength - nameLength) >= 3) score -= 12;

  return clamp(score, 50, 98);
}

function scoreRhythmFit(surnameKana, nameKana) {
  if (!surnameKana || !nameKana) return 72;

  const surnameUnits = [...surnameKana];
  const nameUnits = [...nameKana];
  const combined = surnameUnits.length + nameUnits.length;
  const diff = Math.abs(surnameUnits.length - nameUnits.length);

  let score = 84;
  if (combined >= 8) score -= 8;
  if (combined <= 4) score -= 10;
  if (diff >= 2) score -= 6;

  const lastTwoSurname = surnameUnits.slice(-2).join('');
  const firstTwoName = nameUnits.slice(0, 2).join('');
  if (lastTwoSurname === firstTwoName) score -= 12;
  if (surnameUnits.at(-1) === 'ん') score += 5;
  if (nameUnits.includes('ー')) score += 3;

  return clamp(score, 48, 97);
}

function labelForScore(score) {
  if (score >= 90) return 'かなり相性がよい';
  if (score >= 82) return 'とても自然';
  if (score >= 72) return 'きれいにまとまる';
  return '個性が立つ組み合わせ';
}

function summaryPhrase(score) {
  if (score >= 90) return 'かなり相性のよい';
  if (score >= 82) return 'とても自然な';
  if (score >= 72) return 'きれいにまとまる';
  return '個性が立つ';
}

export function diagnoseSurnameFit({ surname, surnameReading, petName, petReading }) {
  const surnameProfile = resolveSurnameProfile({ surname, surnameReading });
  const cleanSurname = surnameProfile.visual;
  const cleanPetName = sanitizeVisual(petName);
  const surnameKana = surnameProfile.kana;
  const petKana = sanitizeKana(petReading || cleanPetName);

  if (!cleanPetName) {
    return null;
  }

  const lengthScore = scoreLengthBalance(surnameKana, petKana, cleanSurname, cleanPetName);
  const flow = scoreBoundaryFlow(surnameKana, petKana);
  const visualScore = scoreVisualFit(cleanSurname, cleanPetName);
  const rhythmScore = scoreRhythmFit(surnameKana, petKana);
  const totalScore = Math.round(
    (lengthScore * 0.26)
    + (flow.score * 0.28)
    + (visualScore * 0.21)
    + (rhythmScore * 0.15)
    + (surnameProfile.confidenceScore * 0.1),
  );

  const preview = cleanSurname ? `${cleanSurname} ${cleanPetName}` : cleanPetName;
  const previewReading = surnameKana
    ? `${surnameKana}${petKana ? `・${petKana}` : ''}`
    : (petKana || '');

  const lookupSummary = surnameProfile.dbEntry
    ? `${formatEstimatedCount(surnameProfile.dbEntry.count)}・全国順位${surnameProfile.dbEntry.rank}位`
    : '姓データベース未登録';

  return {
    preview,
    previewReading,
    totalScore,
    label: labelForScore(totalScore),
    summary: cleanSurname
      ? `${cleanSurname}さんの苗字は ${lookupSummary} として照合しました。${summaryPhrase(totalScore)}組み合わせです。`
      : '苗字を入れると、音の流れと見た目のバランスをもっと詳しく診断できます。',
    hints: [
      {
        title: '呼びやすさ',
        score: flow.score,
        body: flow.note,
      },
      {
        title: '長さのバランス',
        score: lengthScore,
        body: '苗字と名前の長さ差が大きすぎないほど、日常で呼びやすく覚えてもらいやすい傾向があります。',
      },
      {
        title: '見た目のまとまり',
        score: visualScore,
        body: '文字の並びがすっきり見えると、名札やSNS投稿でも印象が整いやすくなります。',
      },
      {
        title: '診断の信頼度',
        score: surnameProfile.confidenceScore,
        body: surnameProfile.sourceDescription || '苗字の読みがわかるほど、音の相性まで安定して診断できます。',
      },
    ],
    note: surnameProfile.note || (
      surnameReading
        ? ''
        : 'ふりがなを入れると、音の相性までより正確にチェックできます。'
    ),
    source: {
      lookupMatched: Boolean(surnameProfile.dbEntry),
      rank: surnameProfile.dbEntry?.rank || null,
      count: surnameProfile.dbEntry?.count || null,
      databaseReading: surnameProfile.dbReading || '',
      usedReading: surnameKana,
      confidenceScore: surnameProfile.confidenceScore,
    },
  };
}
