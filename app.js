/**
 * ペットなまえ診断 — app.js
 * Task 4: フィルタリング・カード生成・ランキング・シャッフル・シェア
 */

(async () => {
  // ── データ読み込み ────────────────────────────────────────────
  let allNames = [];
  try {
    const res = await fetch('./data/names.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    allNames = await res.json();
  } catch (e) {
    console.error('names.json の読み込みに失敗しました', e);
  }

  // ── 状態 ─────────────────────────────────────────────────────
  // activeFilters: { species: Set, gender: Set, vibe: Set, color: Set }
  const activeFilters = {
    species: new Set(),
    gender: new Set(),
    vibe: new Set(),
    color: new Set(),
  };

  let isShuffled = false;

  // ── DOM 参照 ──────────────────────────────────────────────────
  const nameGrid     = document.getElementById('nameGrid');
  const resultCount  = document.getElementById('resultCount');
  const btnShuffle   = document.getElementById('btnShuffle');
  const rankingList  = document.getElementById('rankingList');

  // ── フィルタリング ────────────────────────────────────────────
  /**
   * 1件のデータがアクティブフィルターにマッチするか判定
   * - 同カテゴリ内: OR
   * - カテゴリ間: AND
   * - gender「どちらでも」→ オス・メス両方にマッチ
   * - color「なし」→ すべての毛色選択にマッチ
   */
  function matchesFilters(item) {
    for (const [category, selected] of Object.entries(activeFilters)) {
      if (selected.size === 0) continue; // 未選択カテゴリはスキップ

      if (category === 'gender') {
        // データが「どちらでも」の場合は常にマッチ
        if (item.gender === 'どちらでも') continue;
        // 選択値に「どちらでも」が含まれていれば常にマッチ
        if (selected.has('どちらでも')) continue;
        // それ以外は選択値にデータの gender が含まれるかチェック
        if (!selected.has(item.gender)) return false;

      } else if (category === 'color') {
        // データが「なし」の場合はすべての毛色選択にマッチ
        if (item.color.includes('なし')) continue;
        // データの毛色と選択値に共通要素があるか（OR）
        const hasMatch = item.color.some(c => selected.has(c));
        if (!hasMatch) return false;

      } else {
        // species / vibe — 配列フィールド、OR判定
        const dataValues = item[category]; // Array
        const hasMatch = dataValues.some(v => selected.has(v));
        if (!hasMatch) return false;
      }
    }
    return true;
  }

  function getFiltered() {
    return allNames.filter(matchesFilters);
  }

  // ── シャッフル用ソート ────────────────────────────────────────
  /**
   * Fisher–Yates を使ったシード非依存のランダムシャッフル
   * （毎回 shuffleSeed を更新して新しい並びを生成）
   */
  function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ── カード生成 ────────────────────────────────────────────────
  function buildCard(item) {
    const card = document.createElement('div');
    card.className = 'name-card';

    // タグHTML
    const tagsHTML = item.vibe
      .map(v => `<span class="tag">${v}</span>`)
      .join('');

    // シェアURL
    const shareText = encodeURIComponent(
      `うちのペットの名前は「${item.name}（${item.reading}）」にしました🐾 #ペットなまえ診断`
    );
    const shareURL = encodeURIComponent(window.location.href);
    const tweetURL = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareURL}`;

    card.innerHTML = `
      <div class="name-card__name">${item.name}</div>
      <div class="name-card__reading">${item.reading}</div>
      <div class="name-card__meaning">${item.meaning}</div>
      <div class="name-card__tags">${tagsHTML}</div>
      <button class="name-card__share"
              data-name="${item.name}"
              data-reading="${item.reading}"
              data-tweet="${tweetURL}"
              type="button"
              aria-label="${item.name}をXでシェア">🔗</button>
    `;

    // シェアボタンのイベント
    card.querySelector('.name-card__share').addEventListener('click', (e) => {
      const url = e.currentTarget.dataset.tweet;
      window.open(url, '_blank', 'noopener,noreferrer');
    });

    return card;
  }

  // ── 描画 ──────────────────────────────────────────────────────
  function render() {
    let filtered = getFiltered();

    if (isShuffled) {
      filtered = shuffleArray(filtered);
    }

    // 件数更新
    resultCount.textContent = `${filtered.length}件見つかりました`;

    // カードグリッド更新
    nameGrid.innerHTML = '';
    const fragment = document.createDocumentFragment();
    filtered.forEach(item => fragment.appendChild(buildCard(item)));
    nameGrid.appendChild(fragment);
  }

  // ── ランキング生成（起動時1回・ランダム5件）────────────────────
  function renderRanking() {
    const shuffled = shuffleArray(allNames);
    const top5 = shuffled.slice(0, 5);

    rankingList.innerHTML = '';
    const fragment = document.createDocumentFragment();
    top5.forEach(item => {
      const li = document.createElement('li');
      li.textContent = `${item.name}（${item.reading}）`;
      fragment.appendChild(li);
    });
    rankingList.appendChild(fragment);
  }

  // ── フィルターチップのイベント ────────────────────────────────
  document.querySelectorAll('.chips[data-filter]').forEach(group => {
    const category = group.dataset.filter;

    group.querySelectorAll('.chip[data-value]').forEach(chip => {
      chip.addEventListener('click', () => {
        const value = chip.dataset.value;

        if (activeFilters[category].has(value)) {
          activeFilters[category].delete(value);
          chip.classList.remove('active');
          chip.setAttribute('aria-pressed', 'false');
        } else {
          activeFilters[category].add(value);
          chip.classList.add('active');
          chip.setAttribute('aria-pressed', 'true');
        }

        render();
      });
    });
  });

  // ── シャッフルボタン ──────────────────────────────────────────
  btnShuffle.addEventListener('click', () => {
    // アニメーション発動
    btnShuffle.classList.add('is-shuffling');
    setTimeout(() => btnShuffle.classList.remove('is-shuffling'), 500);

    // シャッフルON / フラグトグル
    isShuffled = true;
    render();
  });

  // ── 初期表示 ──────────────────────────────────────────────────
  render();
  renderRanking();
})();
