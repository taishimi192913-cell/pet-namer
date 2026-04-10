import { getAccessToken, openAuthPanel, subscribePlatform } from './auth.js';

const COMMUNITY_TOPICS = [
  'お迎え報告',
  '名前の相談',
  '暮らしの悩み',
  'おすすめ共有',
];

const COMMUNITY_FILTERS = ['all', '犬', '猫', 'うさぎ', 'ハムスター', '鳥'];

const state = {
  snapshot: null,
  posts: [],
  currentFilter: 'all',
  hasLoadedOnce: false,
  isLoading: false,
  isSubmitting: false,
};

const elements = {
  section: document.getElementById('communitySection'),
  gate: document.getElementById('communityGate'),
  shell: document.getElementById('communityShell'),
  loginCta: document.getElementById('communityLoginCta'),
  status: document.getElementById('communityStatus'),
  summary: document.getElementById('communitySummary'),
  reload: document.getElementById('communityReload'),
  form: document.getElementById('communityComposer'),
  authorName: document.getElementById('communityAuthorName'),
  petName: document.getElementById('communityPetName'),
  petSpecies: document.getElementById('communityPetSpecies'),
  topic: document.getElementById('communityTopic'),
  body: document.getElementById('communityBody'),
  submit: document.getElementById('communitySubmit'),
  message: document.getElementById('communityMessage'),
  filterBar: document.getElementById('communityFilters'),
  list: document.getElementById('communityList'),
};

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function setMessage(text, tone = 'muted') {
  if (!elements.message) return;
  elements.message.textContent = text;
  elements.message.dataset.state = tone;
}

function setStatus(text, tone = 'muted') {
  if (!elements.status) return;
  elements.status.textContent = text;
  elements.status.dataset.state = tone;
}

function formatCreatedAt(value) {
  if (!value) return '';
  try {
    return new Intl.DateTimeFormat('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return '';
  }
}

function getFilteredPosts() {
  if (state.currentFilter === 'all') return state.posts;
  return state.posts.filter((post) => (post.petSpecies || '') === state.currentFilter);
}

function setBusy(target, busy) {
  if (!target) return;
  target.disabled = busy;
  target.setAttribute('aria-busy', busy ? 'true' : 'false');
}

function updateGate() {
  const snapshot = state.snapshot;
  if (!snapshot || !elements.gate || !elements.shell) return;

  const hasAuth = Boolean(snapshot.hasSupabaseAuth);
  const isLoggedIn = Boolean(snapshot.isLoggedIn);

  elements.gate.hidden = hasAuth && isLoggedIn;
  elements.shell.hidden = !(hasAuth && isLoggedIn);

  if (elements.loginCta) {
    elements.loginCta.hidden = !hasAuth;
  }

  if (!hasAuth) {
    setStatus('ログイン機能の接続待ちです', 'warning');
    if (elements.summary) {
      elements.summary.textContent = 'Supabase を接続すると、飼い主さん限定のタイムラインがここでひらきます。';
    }
    return;
  }

  if (!isLoggedIn) {
    setStatus('ログインした飼い主さん限定', 'muted');
    if (elements.summary) {
      elements.summary.textContent = 'お迎え報告や名前の相談、暮らしの悩みを安心してシェアできる会員限定の場所です。';
    }
    return;
  }

  setStatus(`${snapshot.userEmail} で参加中`, 'success');
  if (elements.summary) {
    elements.summary.textContent = '名前を決めた後の気持ちや、お迎え直後の迷いを同じ飼い主さん同士で共有できます。';
  }
}

function renderFilters() {
  if (!elements.filterBar) return;
  elements.filterBar.replaceChildren();

  COMMUNITY_FILTERS.forEach((filter) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'community-filter';
    if (filter === state.currentFilter) button.classList.add('is-active');
    button.textContent = filter === 'all' ? 'すべて' : filter;
    button.setAttribute('aria-pressed', filter === state.currentFilter ? 'true' : 'false');
    button.addEventListener('click', () => {
      state.currentFilter = filter;
      renderFilters();
      renderFeed();
    });
    elements.filterBar.appendChild(button);
  });
}

function renderFeed() {
  if (!elements.list) return;
  elements.list.replaceChildren();

  if (state.isLoading) {
    const loading = document.createElement('div');
    loading.className = 'community-empty';
    loading.textContent = 'みんなの投稿を読み込んでいます...';
    elements.list.appendChild(loading);
    return;
  }

  const posts = getFilteredPosts();
  if (posts.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'community-empty';
    empty.innerHTML = `
      <p class="community-empty__title">まだ投稿はありません</p>
      <p class="community-empty__text">「お迎え報告」や「名前の相談」など、最初のひとことから始められます。</p>
    `;
    elements.list.appendChild(empty);
    return;
  }

  posts.forEach((post) => {
    const article = document.createElement('article');
    article.className = 'community-card';
    article.innerHTML = `
      <div class="community-card__meta">
        <div class="community-card__author">
          <span class="community-card__avatar" aria-hidden="true">${escapeHtml(post.authorName.slice(0, 1).toUpperCase())}</span>
          <div>
            <p class="community-card__author-name">${escapeHtml(post.authorName)}</p>
            <p class="community-card__author-sub">${escapeHtml(post.petSpecies || 'ペット')} ${post.petName ? `· ${escapeHtml(post.petName)}` : ''}</p>
          </div>
        </div>
        <div class="community-card__meta-right">
          <span class="community-card__topic">${escapeHtml(post.topic)}</span>
          <time class="community-card__time">${escapeHtml(formatCreatedAt(post.createdAt))}</time>
        </div>
      </div>
      <p class="community-card__body">${escapeHtml(post.body).replaceAll('\n', '<br>')}</p>
    `;

    if (post.isOwner) {
      const actionRow = document.createElement('div');
      actionRow.className = 'community-card__actions';
      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'community-card__delete';
      deleteButton.textContent = '自分の投稿を削除';
      deleteButton.addEventListener('click', () => handleDelete(post.id));
      actionRow.appendChild(deleteButton);
      article.appendChild(actionRow);
    }

    elements.list.appendChild(article);
  });
}

async function fetchPosts() {
  const accessToken = getAccessToken();
  if (!accessToken) {
    state.posts = [];
    renderFeed();
    return;
  }

  state.isLoading = true;
  renderFeed();

  try {
    const response = await fetch('/api/community', {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    state.posts = Array.isArray(data.posts) ? data.posts : [];
    state.hasLoadedOnce = true;
    setMessage('タイムラインを更新しました。', 'success');
  } catch (error) {
    state.posts = [];
    setMessage(error.message || 'コミュニティの読み込みに失敗しました。', 'error');
  } finally {
    state.isLoading = false;
    renderFeed();
  }
}

async function handleSubmit(event) {
  event.preventDefault();
  const accessToken = getAccessToken();
  if (!accessToken) {
    openAuthPanel();
    setMessage('投稿するにはログインが必要です。', 'warning');
    return;
  }

  const payload = {
    authorName: elements.authorName?.value.trim() || '',
    petName: elements.petName?.value.trim() || '',
    petSpecies: elements.petSpecies?.value || '',
    topic: elements.topic?.value || COMMUNITY_TOPICS[0],
    body: elements.body?.value.trim() || '',
  };

  if (!payload.body) {
    setMessage('投稿内容を入力してください。', 'warning');
    return;
  }

  state.isSubmitting = true;
  setBusy(elements.submit, true);
  setMessage('投稿しています...', 'muted');

  try {
    const response = await fetch('/api/community', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ post: payload }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    if (data.post) {
      state.posts = [data.post, ...state.posts].slice(0, 40);
    }

    elements.form?.reset();
    if (elements.topic) elements.topic.value = COMMUNITY_TOPICS[0];
    if (elements.petSpecies) elements.petSpecies.value = '';
    setMessage('投稿できました。シッポミ Owners Lounge に反映されています。', 'success');
    renderFeed();
  } catch (error) {
    setMessage(error.message || '投稿に失敗しました。', 'error');
  } finally {
    state.isSubmitting = false;
    setBusy(elements.submit, false);
  }
}

async function handleDelete(postId) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    openAuthPanel();
    setMessage('削除するにはログインが必要です。', 'warning');
    return;
  }

  try {
    const response = await fetch('/api/community', {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ id: postId }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    state.posts = state.posts.filter((post) => post.id !== postId);
    setMessage('投稿を削除しました。', 'success');
    renderFeed();
  } catch (error) {
    setMessage(error.message || '削除に失敗しました。', 'error');
  }
}

function bindStaticEvents() {
  elements.loginCta?.addEventListener('click', () => {
    openAuthPanel();
  });

  elements.reload?.addEventListener('click', () => {
    fetchPosts();
  });

  elements.form?.addEventListener('submit', handleSubmit);
}

function syncFromSnapshot(snapshot) {
  state.snapshot = snapshot;
  updateGate();

  if (!snapshot?.hasSupabaseAuth || !snapshot?.isLoggedIn) {
    state.posts = [];
    state.hasLoadedOnce = false;
    renderFeed();
    return;
  }

  if (!state.hasLoadedOnce) {
    fetchPosts();
    return;
  }

  renderFeed();
}

export function initCommunity() {
  if (!elements.section) return;

  renderFilters();
  renderFeed();
  bindStaticEvents();
  if (elements.topic) {
    elements.topic.innerHTML = COMMUNITY_TOPICS
      .map((topic) => `<option value="${topic}">${topic}</option>`)
      .join('');
  }
  subscribePlatform(syncFromSnapshot);
}
