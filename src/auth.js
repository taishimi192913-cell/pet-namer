import * as Sentry from '@sentry/browser';
import { createClient } from '@supabase/supabase-js';

const DEFAULT_PUBLIC_CONFIG = {
  siteUrl: '',
  supabaseUrl: '',
  supabaseAnonKey: '',
  sentryDsn: '',
  turnstileSiteKey: '',
  hasSupabaseAuth: false,
  hasSentry: false,
};

let supabaseClient = null;
let publicConfig = { ...DEFAULT_PUBLIC_CONFIG };
let currentSession = null;
let currentProfile = null;
let favoriteRecords = [];
let favoriteMap = new Map();
let turnstileScriptPromise = null;
let turnstileWidgetId = null;
let turnstileToken = '';
let authEventsBound = false;
const listeners = new Set();

function captureError(scope, error, extra = {}) {
  console.error(scope, error);
  if (Sentry.getClient()) {
    Sentry.withScope((scopeState) => {
      scopeState.setTag('scope', scope);
      Object.entries(extra).forEach(([key, value]) => scopeState.setExtra(key, value));
      Sentry.captureException(error);
    });
  }
}

function emit() {
  const snapshot = getPlatformSnapshot();
  listeners.forEach((listener) => listener(snapshot));
}

export function subscribePlatform(listener) {
  listeners.add(listener);
  listener(getPlatformSnapshot());
  return () => listeners.delete(listener);
}

function getTurnstileRow() {
  return document.getElementById('turnstileRow');
}

function setTurnstileHint(message, state = 'muted') {
  const element = document.getElementById('turnstileHint');
  if (!element) return;
  element.textContent = message;
  element.dataset.state = state;
}

function setAuthMessage(message, state = 'muted') {
  const authMessage = document.getElementById('authMessage');
  if (!authMessage) return;
  authMessage.textContent = message;
  authMessage.dataset.state = state;
}

function setAuthControlsDisabled(disabled) {
  const ids = ['authEmail', 'authPassword', 'btnMagicLink', 'btnSignIn', 'btnSignUp', 'btnSignOut'];
  ids.forEach((id) => {
    const element = document.getElementById(id);
    if (element) element.disabled = disabled;
  });
}

function setOpen(open) {
  const toggle = document.getElementById('authPanelToggle');
  const body = document.getElementById('authPanelBody');
  const hint = document.getElementById('authPanelToggleHint');
  if (!toggle || !body) return;

  toggle.setAttribute('aria-expanded', String(open));
  body.hidden = !open;

  if (!hint) return;
  if (!open) {
    hint.textContent = 'タップで開きます';
    return;
  }
  if (!publicConfig.hasSupabaseAuth) {
    hint.textContent = 'Supabase 設定後にログインできます';
    return;
  }
  hint.textContent = currentSession?.user
    ? 'ログイン済みです'
    : 'ログインしてお気に入りを保存できます';
}

export function openAuthPanel() {
  setOpen(true);
  document.getElementById('authPanelSection')?.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
  });
}

function updateAuthUI() {
  const authStatus = document.getElementById('authStatus');
  const authMeta = document.getElementById('authMeta');
  const authEmail = currentSession?.user?.email || '';
  const loggedIn = Boolean(currentSession?.user);

  if (authStatus) {
    authStatus.textContent = loggedIn ? `${authEmail} でログイン中` : '未ログインです';
    authStatus.dataset.state = loggedIn
      ? 'success'
      : (publicConfig.hasSupabaseAuth ? 'muted' : 'warning');
  }

  if (authMeta) {
    if (!publicConfig.hasSupabaseAuth) {
      authMeta.textContent = 'Supabase の URL / anon key を設定すると、ここからログインと保存機能が有効になります。';
    } else if (loggedIn) {
      authMeta.textContent = '気に入った名前を保存すると、あとで一覧から見返せます。';
    } else {
      authMeta.textContent = 'メールアドレスでログインすると、お気に入り名を Supabase に保存できます。';
    }
  }

  const signOutButton = document.getElementById('btnSignOut');
  if (signOutButton) signOutButton.hidden = !loggedIn;

  const favoriteSummary = document.getElementById('favoriteAuthSummary');
  if (favoriteSummary) {
    if (!publicConfig.hasSupabaseAuth) {
      favoriteSummary.textContent = '保存機能はまだ未接続です。環境変数を入れるとそのまま有効化されます。';
    } else if (loggedIn) {
      favoriteSummary.textContent = `${authEmail} でログイン中です。結果カードの「保存」からお気に入りを追加できます。`;
    } else {
      favoriteSummary.textContent = 'ログインすると、お気に入りの名前をアカウントに保存できます。';
    }
  }

  setOpen(document.getElementById('authPanelToggle')?.getAttribute('aria-expanded') === 'true');
}

function getAuthFields() {
  return {
    email: document.getElementById('authEmail')?.value.trim() || '',
    password: document.getElementById('authPassword')?.value || '',
  };
}

function getAuthRedirectURL() {
  const isLocalHost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  if (isLocalHost || import.meta.env.DEV) {
    return window.location.origin;
  }
  return publicConfig.publicSiteUrl || publicConfig.siteUrl || window.location.origin;
}

function normalizeArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  return [value];
}

export function favoriteKeyForItem(item) {
  const species = normalizeArray(item.species).slice().sort().join('|');
  return `${item.name}::${item.reading || ''}::${species}`;
}

function setFavoriteRecords(records) {
  favoriteRecords = records.map((record) => ({
    ...record,
    species: normalizeArray(record.species),
    vibe: normalizeArray(record.vibe),
    color: normalizeArray(record.color),
  }));

  favoriteMap = new Map(
    favoriteRecords.map((record) => [favoriteKeyForItem(record), record]),
  );
}

export function getFavoriteRecords() {
  return favoriteRecords.slice();
}

export function getPlatformSnapshot() {
  return {
    config: publicConfig,
    isLoggedIn: Boolean(currentSession?.user),
    userEmail: currentSession?.user?.email || '',
    profile: currentProfile,
    hasSupabaseAuth: publicConfig.hasSupabaseAuth,
    canSaveFavorites: Boolean(currentSession?.access_token),
    canJoinCommunity: Boolean(currentProfile?.isComplete),
    savedKeys: new Set(favoriteMap.keys()),
    favoriteCount: favoriteRecords.length,
    turnstileEnabled: Boolean(publicConfig.turnstileSiteKey),
  };
}

export function getAccessToken() {
  return currentSession?.access_token || '';
}

export function getCurrentProfile() {
  return currentProfile;
}

async function loadPublicConfig() {
  try {
    const response = await fetch('/api/public-config', {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return {
        ...DEFAULT_PUBLIC_CONFIG,
        siteUrl: window.location.origin,
      };
    }
    return {
      ...DEFAULT_PUBLIC_CONFIG,
      ...(await response.json()),
    };
  } catch (error) {
    if (!import.meta.env.DEV) {
      captureError('public-config', error);
    }
    return {
      ...DEFAULT_PUBLIC_CONFIG,
      siteUrl: window.location.origin,
    };
  }
}

function initSentry() {
  if (!publicConfig.sentryDsn || Sentry.getClient()) return;

  Sentry.init({
    dsn: publicConfig.sentryDsn,
    environment: window.location.hostname.includes('localhost') ? 'development' : 'production',
    integrations: [],
    tracesSampleRate: 0,
    sendDefaultPii: false,
  });
}

function loadTurnstileScript() {
  if (window.turnstile) {
    return Promise.resolve();
  }
  if (turnstileScriptPromise) {
    return turnstileScriptPromise;
  }

  turnstileScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Turnstile script failed to load'));
    document.head.appendChild(script);
  });

  return turnstileScriptPromise;
}

async function initTurnstile() {
  const row = getTurnstileRow();
  if (!row) return;

  if (!publicConfig.turnstileSiteKey) {
    row.hidden = true;
    return;
  }

  row.hidden = false;
  setTurnstileHint('保存前にロボット対策チェックを完了してください。', 'muted');

  try {
    await loadTurnstileScript();
    if (!window.turnstile || turnstileWidgetId != null) return;

    const mountPoint = document.getElementById('turnstileWidget');
    if (!mountPoint) return;

    turnstileWidgetId = window.turnstile.render(mountPoint, {
      sitekey: publicConfig.turnstileSiteKey,
      theme: 'light',
      language: 'ja',
      callback(token) {
        turnstileToken = token;
        setTurnstileHint('ロボット対策チェックが完了しました。', 'success');
      },
      'expired-callback'() {
        turnstileToken = '';
        setTurnstileHint('チェックの有効期限が切れました。もう一度確認してください。', 'warning');
      },
      'error-callback'() {
        turnstileToken = '';
        setTurnstileHint('Turnstile の読み込みに失敗しました。時間をおいて再試行してください。', 'error');
      },
    });
  } catch (error) {
    captureError('turnstile-init', error);
    setTurnstileHint('Turnstile の初期化に失敗しました。環境変数を確認してください。', 'error');
  }
}

function resetTurnstile() {
  if (turnstileWidgetId != null && window.turnstile) {
    window.turnstile.reset(turnstileWidgetId);
  }
  turnstileToken = '';
}

async function ensureTurnstileToken() {
  if (!publicConfig.turnstileSiteKey) return null;
  if (turnstileToken) return turnstileToken;
  openAuthPanel();
  setAuthMessage('保存前にロボット対策チェックを完了してください。', 'warning');
  return null;
}

async function fetchFavorites() {
  if (!currentSession?.access_token) {
    setFavoriteRecords([]);
    emit();
    return;
  }

  try {
    const response = await fetch('/api/favorites', {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentSession.access_token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    setFavoriteRecords(data.favorites || []);
    emit();
  } catch (error) {
    captureError('favorites-fetch', error);
    setAuthMessage('お気に入りの読み込みに失敗しました。', 'error');
    emit();
  }
}

async function fetchProfile() {
  if (!currentSession?.access_token) {
    currentProfile = null;
    emit();
    return null;
  }

  try {
    const response = await fetch('/api/profile', {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${currentSession.access_token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    currentProfile = data.profile || null;
    emit();
    return currentProfile;
  } catch (error) {
    captureError('profile-fetch', error);
    currentProfile = null;
    setAuthMessage('プロフィールの読み込みに失敗しました。', 'error');
    emit();
    return null;
  }
}

async function refreshAuthenticatedData() {
  await Promise.all([fetchFavorites(), fetchProfile()]);
}

export async function saveOwnerProfile(profile) {
  if (!currentSession?.access_token) {
    openAuthPanel();
    setAuthMessage('プロフィール保存にはログインが必要です。', 'warning');
    return { ok: false, reason: 'login_required' };
  }

  try {
    const response = await fetch('/api/profile', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentSession.access_token}`,
      },
      body: JSON.stringify({ profile }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    currentProfile = data.profile || null;
    setAuthMessage('飼い主プロフィールを保存しました。', 'success');
    emit();
    return { ok: true, profile: currentProfile };
  } catch (error) {
    captureError('profile-save', error);
    setAuthMessage(error.message || 'プロフィール保存に失敗しました。', 'error');
    return { ok: false, reason: 'error' };
  }
}

async function submitFavorite(method, payload) {
  if (!currentSession?.access_token) {
    openAuthPanel();
    setAuthMessage('お気に入り保存にはログインが必要です。', 'warning');
    return { ok: false, reason: 'login_required' };
  }

  const response = await fetch('/api/favorites', {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${currentSession.access_token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return data;
}

export async function saveFavorite(item) {
  const safeItem = {
    name: item.name,
    reading: item.reading || '',
    meaning: item.meaning || '',
    species: normalizeArray(item.species),
    gender: item.gender || '',
    vibe: normalizeArray(item.vibe),
    color: normalizeArray(item.color),
    matchScore: item.match?.score ?? null,
    matchLabel: item.match?.label ?? null,
    savedFromPath: window.location.pathname,
  };

  try {
    const turnstileResponse = await ensureTurnstileToken();
    if (publicConfig.turnstileSiteKey && !turnstileResponse) {
      return { ok: false, reason: 'turnstile_required' };
    }

    const data = await submitFavorite('POST', {
      favorite: safeItem,
      turnstileToken: turnstileResponse,
    });

    const key = favoriteKeyForItem(data.favorite);
    favoriteMap.set(key, data.favorite);
    setFavoriteRecords([data.favorite, ...favoriteRecords.filter((record) => record.id !== data.favorite.id)]);
    setAuthMessage('お気に入りに保存しました。', 'success');
    resetTurnstile();
    emit();
    return { ok: true };
  } catch (error) {
    captureError('favorite-save', error);
    setAuthMessage(error.message || '保存に失敗しました。', 'error');
    return { ok: false, reason: 'error' };
  }
}

export async function removeFavorite(itemOrRecord) {
  const record = itemOrRecord.id
    ? itemOrRecord
    : favoriteMap.get(favoriteKeyForItem(itemOrRecord));

  if (!record?.id) {
    return { ok: false, reason: 'missing_record' };
  }

  try {
    await submitFavorite('DELETE', { id: record.id });
    setFavoriteRecords(favoriteRecords.filter((entry) => entry.id !== record.id));
    setAuthMessage('お気に入りから外しました。', 'success');
    emit();
    return { ok: true };
  } catch (error) {
    captureError('favorite-remove', error);
    setAuthMessage(error.message || '削除に失敗しました。', 'error');
    return { ok: false, reason: 'error' };
  }
}

export async function toggleFavorite(item) {
  if (favoriteMap.has(favoriteKeyForItem(item))) {
    return removeFavorite(item);
  }
  return saveFavorite(item);
}

async function handleMagicLink() {
  if (!supabaseClient) return;
  const { email } = getAuthFields();
  if (!email) {
    setAuthMessage('マジックリンク送信にはメールアドレスが必要です。', 'warning');
    return;
  }

  setAuthControlsDisabled(true);
  setAuthMessage('マジックリンクを送信しています...', 'muted');

  try {
    const { error } = await supabaseClient.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: getAuthRedirectURL(),
      },
    });
    if (error) throw error;
    setAuthMessage('メールを送信しました。リンクからログインを完了してください。', 'success');
  } catch (error) {
    captureError('supabase-magic-link', error);
    setAuthMessage(error.message || 'マジックリンクの送信に失敗しました。', 'error');
  } finally {
    setAuthControlsDisabled(false);
  }
}

async function handleSignUp() {
  if (!supabaseClient) return;
  const { email, password } = getAuthFields();
  if (!email || !password) {
    setAuthMessage('新規登録にはメールアドレスとパスワードの両方が必要です。', 'warning');
    return;
  }

  setAuthControlsDisabled(true);
  setAuthMessage('アカウントを作成しています...', 'muted');

  try {
    const { error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getAuthRedirectURL(),
      },
    });
    if (error) throw error;
    setAuthMessage('登録を受け付けました。必要に応じて確認メールを開いてください。', 'success');
  } catch (error) {
    captureError('supabase-sign-up', error);
    setAuthMessage(error.message || '新規登録に失敗しました。', 'error');
  } finally {
    setAuthControlsDisabled(false);
  }
}

async function handleSignIn() {
  if (!supabaseClient) return;
  const { email, password } = getAuthFields();
  if (!email || !password) {
    setAuthMessage('ログインにはメールアドレスとパスワードの両方が必要です。', 'warning');
    return;
  }

  setAuthControlsDisabled(true);
  setAuthMessage('ログインしています...', 'muted');

  try {
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setAuthMessage('ログインできました。', 'success');
  } catch (error) {
    captureError('supabase-sign-in', error);
    setAuthMessage(error.message || 'ログインに失敗しました。', 'error');
  } finally {
    setAuthControlsDisabled(false);
  }
}

async function handleSignOut() {
  if (!supabaseClient) return;
  setAuthControlsDisabled(true);
  setAuthMessage('ログアウトしています...', 'muted');

  try {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
    setAuthMessage('ログアウトしました。', 'success');
  } catch (error) {
    captureError('supabase-sign-out', error);
    setAuthMessage(error.message || 'ログアウトに失敗しました。', 'error');
  } finally {
    setAuthControlsDisabled(false);
  }
}

function bindAuthEvents() {
  if (authEventsBound) return;
  authEventsBound = true;

  document.getElementById('authForm')?.addEventListener('submit', (event) => {
    event.preventDefault();
  });

  document.getElementById('btnMagicLink')?.addEventListener('click', handleMagicLink);
  document.getElementById('btnSignIn')?.addEventListener('click', handleSignIn);
  document.getElementById('btnSignUp')?.addEventListener('click', handleSignUp);
  document.getElementById('btnSignOut')?.addEventListener('click', handleSignOut);
  document.getElementById('authPanelToggle')?.addEventListener('click', () => {
    const isOpen = document.getElementById('authPanelToggle')?.getAttribute('aria-expanded') === 'true';
    setOpen(!isOpen);
  });
}

async function initSupabaseAuth() {
  bindAuthEvents();

  if (!publicConfig.supabaseUrl || !publicConfig.supabaseAnonKey) {
    updateAuthUI();
    setAuthMessage('Supabase 設定後にログイン機能が有効になります。', 'muted');
    emit();
    return;
  }

  try {
    supabaseClient = createClient(publicConfig.supabaseUrl, publicConfig.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });

    const { data, error } = await supabaseClient.auth.getSession();
    if (error) throw error;
    currentSession = data.session;
    updateAuthUI();
    if (currentSession) {
      setAuthMessage('ログインできました。お気に入り保存と飼い主SNSの準備ができています。', 'success');
      await refreshAuthenticatedData();
    } else {
      currentProfile = null;
      emit();
    }

    supabaseClient.auth.onAuthStateChange(async (_event, session) => {
      currentSession = session;
      updateAuthUI();
      if (session) {
        await refreshAuthenticatedData();
      } else {
        currentProfile = null;
        setFavoriteRecords([]);
        emit();
      }
    });
  } catch (error) {
    captureError('supabase-init', error);
    setAuthMessage(error.message || 'Supabase Auth の初期化に失敗しました。', 'error');
    emit();
  }
}

export async function initPlatform() {
  publicConfig = await loadPublicConfig();
  initSentry();
  updateAuthUI();
  bindAuthEvents();
  await initTurnstile();
  await initSupabaseAuth();
  emit();
}
