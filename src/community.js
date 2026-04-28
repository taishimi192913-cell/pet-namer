import {
  getAccessToken,
  openAuthPanel,
  saveOwnerProfile,
  subscribePlatform,
} from './auth.js';

const COMMUNITY_TOPICS = [
  'お迎え報告',
  '名前の相談',
  '暮らしの悩み',
  'うちの子自慢',
  '買ってよかったもの',
];

const COMMUNITY_FILTERS = ['all', '犬', '猫', 'うさぎ', 'ハムスター', '鳥'];

const state = {
  snapshot: null,
  posts: [],
  currentFilter: 'all',
  hasLoadedOnce: false,
  isLoading: false,
  isSubmitting: false,
  isSavingProfile: false,
  imageDataUrl: '',
};

const elements = {
  section: document.getElementById('communitySection'),
  gate: document.getElementById('communityGate'),
  shell: document.getElementById('communityShell'),
  loginCta: document.getElementById('communityLoginCta'),
  status: document.getElementById('communityStatus'),
  summary: document.getElementById('communitySummary'),
  profileCard: document.getElementById('communityProfileCard'),
  profileForm: document.getElementById('communityProfileForm'),
  displayName: document.getElementById('communityDisplayName'),
  username: document.getElementById('communityUsername'),
  bio: document.getElementById('communityBio'),
  profilePetName: document.getElementById('communityProfilePetName'),
  profilePetSpecies: document.getElementById('communityProfilePetSpecies'),
  ownerCheck: document.getElementById('communityOwnerCheck'),
  profileSubmit: document.getElementById('communityProfileSubmit'),
  profileMessage: document.getElementById('communityProfileMessage'),
  composerCard: document.getElementById('communityComposerCard'),
  reload: document.getElementById('communityReload'),
  form: document.getElementById('communityComposer'),
  topic: document.getElementById('communityTopic'),
  body: document.getElementById('communityBody'),
  imageInput: document.getElementById('communityImage'),
  imagePreviewWrap: document.getElementById('communityImagePreviewWrap'),
  imagePreview: document.getElementById('communityImagePreview'),
  imageClear: document.getElementById('communityImageClear'),
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

function setProfileMessage(text, tone = 'muted') {
  if (!elements.profileMessage) return;
  elements.profileMessage.textContent = text;
  elements.profileMessage.dataset.state = tone;
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

function setBusy(target, busy) {
  if (!target) return;
  target.disabled = busy;
  target.setAttribute('aria-busy', busy ? 'true' : 'false');
}

function syncProfileForm() {
  const profile = state.snapshot?.profile;
  if (!profile || !elements.profileForm) return;

  if (elements.displayName && !elements.displayName.value) elements.displayName.value = profile.displayName || '';
  if (elements.username && !elements.username.value) elements.username.value = profile.username || '';
  if (elements.bio && !elements.bio.value) elements.bio.value = profile.bio || '';
  if (elements.profilePetName && !elements.profilePetName.value) {
    elements.profilePetName.value = profile.petName || '';
  }
  if (elements.profilePetSpecies && !elements.profilePetSpecies.value) {
    elements.profilePetSpecies.value = profile.petSpecies || '';
  }
  if (elements.ownerCheck) elements.ownerCheck.checked = Boolean(profile.isPetOwner);
}

function getFilteredPosts() {
  if (state.currentFilter === 'all') return state.posts;
  return state.posts.filter((post) => (post.petSpecies || '') === state.currentFilter);
}

function updateGate() {
  const snapshot = state.snapshot;
  if (!snapshot || !elements.gate || !elements.shell) return;

  const hasAuth = Boolean(snapshot.hasSupabaseAuth);
  const isLoggedIn = Boolean(snapshot.isLoggedIn);
  const canJoinCommunity = Boolean(snapshot.canJoinCommunity);

  elements.gate.hidden = hasAuth && isLoggedIn;
  elements.shell.hidden = !(hasAuth && isLoggedIn);

  if (elements.loginCta) {
    elements.loginCta.hidden = !hasAuth;
  }

  if (elements.profileCard) {
    elements.profileCard.hidden = !(hasAuth && isLoggedIn);
  }

  if (elements.composerCard) {
    elements.composerCard.hidden = !(hasAuth && isLoggedIn && canJoinCommunity);
  }

  if (!hasAuth) {
    setStatus('ログイン機能の接続待ちです', 'warning');
    if (elements.summary) {
      elements.summary.textContent = 'Supabase を接続すると、飼い主さん限定の写真SNSがここでひらきます。';
    }
    return;
  }

  if (!isLoggedIn) {
    setStatus('ログインした飼い主さん限定', 'muted');
    if (elements.summary) {
      elements.summary.textContent = 'うちの子との写真、お迎え直後の悩み、名前の相談まで。ログイン後にだけ見える安心設計です。';
    }
    return;
  }

  if (!canJoinCommunity) {
    setStatus('プロフィール登録で参加できます', 'warning');
    if (elements.summary) {
      elements.summary.textContent = '最初に飼い主プロフィールを整えると、投稿・いいね・コメントが使えるようになります。';
    }
    return;
  }

  setStatus(`${snapshot.profile?.displayName || snapshot.userEmail} さんで参加中`, 'success');
  if (elements.summary) {
    elements.summary.textContent = '飼い主さんだけのタイムラインです。遠慮せず、うちの子との日常や気持ちを写真つきで残せます。';
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

function renderImagePreview() {
  if (!elements.imagePreviewWrap || !elements.imagePreview) return;
  const hasImage = Boolean(state.imageDataUrl);
  elements.imagePreviewWrap.hidden = !hasImage;
  if (hasImage) {
    elements.imagePreview.src = state.imageDataUrl;
  } else {
    elements.imagePreview.removeAttribute('src');
  }
}

function renderFeed() {
  if (!elements.list) return;
  elements.list.replaceChildren();

  if (!state.snapshot?.canJoinCommunity) {
    const empty = document.createElement('div');
    empty.className = 'community-empty';
    empty.innerHTML = `
      <p class="community-empty__title">まずは飼い主プロフィールを登録</p>
      <p class="community-empty__text">表示名、ユーザー名、うちの子情報を入れると、写真投稿・いいね・コメントが使えるようになります。</p>
    `;
    elements.list.appendChild(empty);
    return;
  }

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
      <p class="community-empty__text">お迎え報告、うちの子自慢、名前の相談など、最初の1枚から気軽に始められます。</p>
    `;
    elements.list.appendChild(empty);
    return;
  }

  posts.forEach((post) => {
    const article = document.createElement('article');
    article.className = 'community-card community-card--social';
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
      ${post.imageUrl ? `<img class="community-card__image" src="${escapeHtml(post.imageUrl)}" alt="${escapeHtml(post.petName || 'うちの子')}の投稿写真" loading="lazy">` : ''}
      <p class="community-card__body">${escapeHtml(post.body).replaceAll('\n', '<br>')}</p>
      <div class="community-card__social-row">
        <button type="button" class="community-card__social-button ${post.likedByViewer ? 'is-active' : ''}" data-action="like" data-post-id="${escapeHtml(post.id)}">
          ${post.likedByViewer ? 'いいね済み' : 'いいね'} <span>${post.likeCount || 0}</span>
        </button>
        <span class="community-card__social-meta">コメント ${post.commentCount || 0}</span>
      </div>
    `;

    const commentsBlock = document.createElement('div');
    commentsBlock.className = 'community-comments';

    const commentsList = document.createElement('div');
    commentsList.className = 'community-comments__list';
    if (!post.comments?.length) {
      commentsList.innerHTML = '<p class="community-comments__empty">まだコメントはありません。最初のひとことをどうぞ。</p>';
    } else {
      post.comments.forEach((comment) => {
        const item = document.createElement('div');
        item.className = 'community-comment';
        item.innerHTML = `
          <div>
            <p class="community-comment__author">${escapeHtml(comment.authorName)}</p>
            <p class="community-comment__body">${escapeHtml(comment.body).replaceAll('\n', '<br>')}</p>
          </div>
          <div class="community-comment__meta">
            <time>${escapeHtml(formatCreatedAt(comment.createdAt))}</time>
            ${comment.isOwner ? `<button type="button" class="community-comment__delete" data-action="delete-comment" data-comment-id="${escapeHtml(comment.id)}" data-post-id="${escapeHtml(post.id)}">削除</button>` : ''}
          </div>
        `;
        commentsList.appendChild(item);
      });
    }

    const commentForm = document.createElement('form');
    commentForm.className = 'community-comments__form';
    commentForm.dataset.postId = post.id;
    commentForm.innerHTML = `
      <textarea name="body" maxlength="400" rows="2" placeholder="あたたかい一言やアドバイスをコメントできます"></textarea>
      <button type="submit" class="community-comments__submit">コメントする</button>
    `;

    commentsBlock.append(commentsList, commentForm);
    article.appendChild(commentsBlock);

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

    article.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const actionEl = target.closest('[data-action]');
      if (!(actionEl instanceof HTMLElement)) return;
      if (actionEl.dataset.action === 'like') {
        handleLike(post.id, post.likedByViewer);
      }
      if (actionEl.dataset.action === 'delete-comment' && actionEl.dataset.commentId) {
        handleDeleteComment(post.id, actionEl.dataset.commentId);
      }
    });

    commentForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(commentForm);
      const body = String(formData.get('body') || '').trim();
      handleComment(post.id, body, commentForm);
    });

    elements.list.appendChild(article);
  });
}

async function fetchPosts() {
  const accessToken = getAccessToken();
  if (!accessToken || !state.snapshot?.canJoinCommunity) {
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

async function readSelectedImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(new Error('画像の読み込みに失敗しました'));
    reader.readAsDataURL(file);
  });
}

async function handleProfileSubmit(event) {
  event.preventDefault();
  const accessToken = getAccessToken();
  if (!accessToken) {
    openAuthPanel();
    setProfileMessage('プロフィール保存にはログインが必要です。', 'warning');
    return;
  }

  const profile = {
    displayName: elements.displayName?.value.trim() || '',
    username: elements.username?.value.trim().toLowerCase() || '',
    bio: elements.bio?.value.trim() || '',
    petName: elements.profilePetName?.value.trim() || '',
    petSpecies: elements.profilePetSpecies?.value || '',
    isPetOwner: Boolean(elements.ownerCheck?.checked),
  };

  if (!profile.displayName || !profile.username || !profile.petName || !profile.petSpecies || !profile.isPetOwner) {
    setProfileMessage('表示名、ユーザー名、うちの子情報、飼い主チェックを入力してください。', 'warning');
    return;
  }

  state.isSavingProfile = true;
  setBusy(elements.profileSubmit, true);
  setProfileMessage('プロフィールを保存しています...', 'muted');

  const result = await saveOwnerProfile(profile);

  state.isSavingProfile = false;
  setBusy(elements.profileSubmit, false);

  if (result.ok) {
    setProfileMessage('参加準備ができました。写真つき投稿を始められます。', 'success');
  } else {
    setProfileMessage('プロフィール保存に失敗しました。入力内容を確認してください。', 'error');
  }
}

async function handleImageInput(event) {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || !input.files?.[0]) {
    return;
  }

  const file = input.files[0];
  if (!file.type.startsWith('image/')) {
    setMessage('画像ファイルを選んでください。', 'warning');
    input.value = '';
    return;
  }

  try {
    state.imageDataUrl = await readSelectedImage(file);
    renderImagePreview();
    setMessage('投稿写真を追加しました。', 'success');
  } catch (error) {
    state.imageDataUrl = '';
    renderImagePreview();
    setMessage(error.message || '画像の読み込みに失敗しました。', 'error');
  }
}

function clearSelectedImage() {
  state.imageDataUrl = '';
  if (elements.imageInput) elements.imageInput.value = '';
  renderImagePreview();
}

async function handleSubmit(event) {
  event.preventDefault();
  const accessToken = getAccessToken();
  if (!accessToken) {
    openAuthPanel();
    setMessage('投稿するにはログインが必要です。', 'warning');
    return;
  }

  if (!state.snapshot?.canJoinCommunity) {
    setMessage('先に飼い主プロフィールを保存してください。', 'warning');
    return;
  }

  const payload = {
    topic: elements.topic?.value || COMMUNITY_TOPICS[0],
    body: elements.body?.value.trim() || '',
    imageDataUrl: state.imageDataUrl || null,
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
    clearSelectedImage();
    if (elements.topic) elements.topic.value = COMMUNITY_TOPICS[0];
    setMessage('投稿できました。Owners Lounge に反映されています。', 'success');
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

async function handleLike(postId, likedByViewer) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    openAuthPanel();
    setMessage('いいねするにはログインが必要です。', 'warning');
    return;
  }

  try {
    const response = await fetch('/api/community-like', {
      method: likedByViewer ? 'DELETE' : 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ postId }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }
    state.posts = state.posts.map((post) => {
      if (post.id !== postId) return post;
      return {
        ...post,
        likeCount: data.like?.likeCount ?? post.likeCount,
        likedByViewer: data.like?.likedByViewer ?? post.likedByViewer,
      };
    });
    renderFeed();
  } catch (error) {
    setMessage(error.message || 'いいねに失敗しました。', 'error');
  }
}

async function handleComment(postId, body, formElement) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    openAuthPanel();
    setMessage('コメントするにはログインが必要です。', 'warning');
    return;
  }

  if (!body) {
    setMessage('コメント内容を入力してください。', 'warning');
    return;
  }

  const submit = formElement.querySelector('button[type="submit"]');
  setBusy(submit, true);

  try {
    const response = await fetch('/api/community-comment', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ postId, body }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    state.posts = state.posts.map((post) => {
      if (post.id !== postId) return post;
      const comments = [...(post.comments || []), data.comment].slice(-12);
      return {
        ...post,
        comments,
        commentCount: comments.length,
      };
    });
    formElement.reset();
    renderFeed();
  } catch (error) {
    setMessage(error.message || 'コメントに失敗しました。', 'error');
  } finally {
    setBusy(submit, false);
  }
}

async function handleDeleteComment(postId, commentId) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    openAuthPanel();
    setMessage('削除するにはログインが必要です。', 'warning');
    return;
  }

  try {
    const response = await fetch('/api/community-comment', {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ commentId }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    state.posts = state.posts.map((post) => {
      if (post.id !== postId) return post;
      const comments = (post.comments || []).filter((comment) => comment.id !== data.id);
      return {
        ...post,
        comments,
        commentCount: comments.length,
      };
    });
    renderFeed();
  } catch (error) {
    setMessage(error.message || 'コメント削除に失敗しました。', 'error');
  }
}

function bindStaticEvents() {
  elements.loginCta?.addEventListener('click', () => {
    openAuthPanel();
  });

  elements.reload?.addEventListener('click', () => {
    fetchPosts();
  });

  elements.profileForm?.addEventListener('submit', handleProfileSubmit);
  elements.form?.addEventListener('submit', handleSubmit);
  elements.imageInput?.addEventListener('change', handleImageInput);
  elements.imageClear?.addEventListener('click', clearSelectedImage);
}

function syncFromSnapshot(snapshot) {
  state.snapshot = snapshot;
  updateGate();
  syncProfileForm();

  if (!snapshot?.hasSupabaseAuth || !snapshot?.isLoggedIn) {
    state.posts = [];
    state.hasLoadedOnce = false;
    renderFeed();
    return;
  }

  if (!snapshot.canJoinCommunity) {
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
  renderImagePreview();
  renderFeed();
  bindStaticEvents();
  subscribePlatform(syncFromSnapshot);
}
