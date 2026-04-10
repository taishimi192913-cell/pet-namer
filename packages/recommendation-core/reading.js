function katakanaWordToHiragana(s) {
  return [...s].map((ch) => {
    const c = ch.charCodeAt(0);
    if (c >= 0x30a1 && c <= 0x30f6) return String.fromCharCode(c - 0x60);
    return ch;
  }).join('');
}

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

export function secondaryReadingIfAny(name, reading) {
  if (reading == null) return null;
  const r = String(reading).trim();
  if (r === '') return null;
  const n = String(name).trim();
  if (r === n) return null;
  if (isMostlyFullWidthKatakanaName(n) && katakanaWordToHiragana(n) === r) return null;
  return r;
}
