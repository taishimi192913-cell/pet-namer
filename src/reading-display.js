/**
 * カタカナの名前をひらがなに変換（比較用）。長音・中黒・スペースはそのまま。
 */
function katakanaWordToHiragana(s) {
  return [...s].map((ch) => {
    const c = ch.charCodeAt(0);
    if (c >= 0x30a1 && c <= 0x30f6) return String.fromCharCode(c - 0x60);
    return ch;
  }).join('');
}

/** 名前がカタカナ中心（記号のみ混在）か */
function isMostlyFullWidthKatakanaName(name) {
  const t = name.trim();
  if (!t) return false;
  return [...t].every((ch) => {
    const c = ch.charCodeAt(0);
    return (
      (c >= 0x30a1 && c <= 0x30f6) ||
      c === 0x30fc ||
      c === 0x30fb ||
      c === 0x20
    );
  });
}

/**
 * 表示用：名前と読みが実質同じ（カタカナ名 vs そのひらがな）なら読み行は出さない。
 * 名前・読みが同一文字列のときも null。
 */
export function secondaryReadingIfAny(name, reading) {
  if (reading == null) return null;
  const r = String(reading).trim();
  if (r === '') return null;
  const n = String(name).trim();
  if (r === n) return null;
  if (isMostlyFullWidthKatakanaName(n) && katakanaWordToHiragana(n) === r) return null;
  return r;
}
