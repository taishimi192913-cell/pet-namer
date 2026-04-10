function countTextUnits(value = '') {
  return Array.from(String(value).replace(/[\s・]/g, '')).length;
}

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function textBlob(item) {
  return [
    item.name,
    item.reading,
    item.meaning,
    ...(item.vibe || []),
    ...(item.theme || []),
  ].join(' ');
}

function getPopularityRank(item) {
  const matches = [...String(item.meaning || '').matchAll(/(\d+)位/g)];
  if (matches.length === 0) return null;
  return Math.min(...matches.map((match) => Number(match[1])).filter((value) => Number.isFinite(value)));
}

function deriveCallStyle(item) {
  const reading = String(item.reading || item.name || '');
  const styles = [];
  const length = Math.max(countTextUnits(item.name), countTextUnits(item.reading));

  if (/[まみむめもなにぬねのやゆよわらりるれろはひふへほ]/.test(reading) || item.vibe?.includes('ふわふわ') || item.vibe?.includes('かわいい')) {
    styles.push('やわらかい響き');
  }
  if (/[かきくけこさしすせそたちつてとがぎぐげござじずぜぞだぢづでど]/.test(reading) || item.vibe?.includes('かっこいい')) {
    styles.push('キリッと響く');
  }
  if (length <= 2) {
    styles.push('呼びやすい短さ');
  }
  if (item.vibe?.includes('上品') || item.vibe?.includes('和風') || length >= 3) {
    styles.push('気品のある響き');
  }
  if (/[いいううええおおああんことるみな]/.test(reading.slice(-1)) || item.vibe?.includes('神秘的')) {
    styles.push('音の余韻がきれい');
  }

  return unique(styles).slice(0, 3);
}

function deriveOwnerLifestyle(item) {
  const text = textBlob(item);
  const tags = [];

  if (item.theme?.includes('食べ物・スイーツ') || item.vibe?.includes('かわいい') || item.vibe?.includes('ふわふわ')) {
    tags.push('カフェ・おうち時間');
  }
  if (item.theme?.includes('自然・植物') || item.vibe?.includes('自然') || item.vibe?.includes('元気') || /空|海|風|森|花|雪|月|星/.test(text)) {
    tags.push('自然・散歩');
  }
  if (item.theme?.includes('宝石・貴金属') || item.vibe?.includes('上品') || item.vibe?.includes('神秘的') || item.vibe?.includes('個性的')) {
    tags.push('本・映画・アート');
  }
  if (item.theme?.includes('和風・古風') || item.vibe?.includes('和風')) {
    tags.push('和の暮らし');
  }
  if (item.theme?.includes('洋風・モダン') || item.vibe?.includes('かっこいい') || /旅|空|海|冒険|レオ|ルーク|ジャック/.test(text)) {
    tags.push('旅・アクティブ');
  }

  return unique(tags).slice(0, 3);
}

function deriveWish(item) {
  const text = textBlob(item);
  const tags = [];

  if (item.vibe?.includes('かわいい') || item.vibe?.includes('ふわふわ') || /優|花|ミルク|モモ|ココ/.test(text)) {
    tags.push('やさしさ');
  }
  if (item.vibe?.includes('自然') || item.vibe?.includes('元気') || /空|太陽|風|健|光|雪/.test(text)) {
    tags.push('健やかさ');
  }
  if (item.vibe?.includes('かっこいい') || /王|獅子|雷|虎|剣|強/.test(text)) {
    tags.push('強さ');
  }
  if (item.theme?.includes('宝石・貴金属') || /幸|福|宝|金|月|星|ラッキー/.test(text)) {
    tags.push('幸運');
  }
  if (item.vibe?.includes('神秘的') || item.vibe?.includes('個性的') || /賢|知|月|碧|ルナ|ノア/.test(text)) {
    tags.push('知性');
  }

  return unique(tags).slice(0, 3);
}

function deriveUniqueness(item) {
  const rank = getPopularityRank(item);
  if (rank != null && rank <= 5) return ['みんなに親しみやすい'];
  if (rank != null && rank <= 12) return ['ほどよくかぶりにくい'];
  if (item.vibe?.includes('個性的') || item.vibe?.includes('神秘的') || item.theme?.includes('宝石・貴金属')) {
    return ['かなり個性的'];
  }
  return ['ほどよくかぶりにくい'];
}

function deriveScene(item) {
  const text = textBlob(item);
  const tags = [];

  if (item.theme?.includes('自然・植物') || /朝|空|光|ひかり|ソラ|ハル/.test(text)) {
    tags.push('朝の光みたい');
  }
  if (item.vibe?.includes('神秘的') || /夜|月|ルナ|ノア|星/.test(text)) {
    tags.push('静かな夜みたい');
  }
  if (item.theme?.includes('自然・植物') || item.vibe?.includes('和風') || /桜|雪|楓|花|実り/.test(text)) {
    tags.push('季節を感じる');
  }
  if (item.vibe?.includes('かわいい') || item.vibe?.includes('ふわふわ') || item.theme?.includes('食べ物・スイーツ')) {
    tags.push('ぬくもり重視');
  }
  if (item.vibe?.includes('上品') || item.vibe?.includes('かっこいい') || /碧|凛|レオ|ハク/.test(text)) {
    tags.push('凛とした空気');
  }

  return unique(tags).slice(0, 3);
}

export function enrichNameRecord(item) {
  const callStyle = deriveCallStyle(item);
  const ownerLifestyle = deriveOwnerLifestyle(item);
  const wish = deriveWish(item);
  const uniqueness = deriveUniqueness(item);
  const scene = deriveScene(item);

  return {
    ...item,
    callStyle,
    ownerLifestyle,
    wish,
    uniqueness,
    scene,
  };
}

export function enrichNamesDatabase(items = []) {
  return items.map(enrichNameRecord);
}
