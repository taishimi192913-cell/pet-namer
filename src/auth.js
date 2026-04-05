/**
 * 元 app.js の Supabase 認証まわり（旧 187–341 行付近）。
 * main.js からは import しない。auth パネルを HTML に戻したときに
 * `<script type="module" src="/src/auth.js"></script>` で読み込む想定。
 */
let supabaseClient = null;
let publicConfig = null;

function captureError(scope, error) {
  console.error(scope, error);
}

function setAuthMessage(message, state = 'muted') {
  const authMessage = document.getElementById('authMessage');
  if (!authMessage) return;
  authMessage.textContent = message;
  authMessage.dataset.state = state;
}

function setAuthControlsDisabled(disabled) {
  const authEmail = document.getElementById('authEmail');
  const authPassword = document.getElementById('authPassword');
  const btnMagicLink = document.getElementById('btnMagicLink');
  const btnSignIn = document.getElementById('btnSignIn');
  const btnSignUp = document.getElementById('btnSignUp');
  const btnSignOut = document.getElementById('btnSignOut');
  [authEmail, authPassword, btnMagicLink, btnSignIn, btnSignUp, btnSignOut].forEach((element) => {
    if (element) element.disabled = disabled;
  });
}

function updateAuthUI(session) {
  const authStatus = document.getElementById('authStatus');
  const authMeta = document.getElementById('authMeta');
  if (!authStatus || !authMeta) return;

  const email = session?.user?.email || '';
  const isLoggedIn = Boolean(session?.user);

  authStatus.textContent = isLoggedIn ? `${email} でログイン中` : '未ログインです';
  authStatus.dataset.state = isLoggedIn ? 'success' : (publicConfig?.hasSupabaseAuth ? 'muted' : 'warning');
  authMeta.textContent = publicConfig?.hasSupabaseAuth
    ? (isLoggedIn
      ? 'この状態で保存機能やお気に入り機能を追加できます。'
      : 'マジックリンクまたはメールとパスワードでログインできます。')
    : 'Supabase の URL と anon key を入れると、このフォームがそのまま使えます。';

  const btnSignOut = document.getElementById('btnSignOut');
  if (btnSignOut) btnSignOut.hidden = !isLoggedIn;

  const authToggle = document.getElementById('authPanelToggle');
  const authHint = document.getElementById('authPanelToggleHint');
  if (authToggle && authHint && authToggle.getAttribute('aria-expanded') === 'true') {
    if (!publicConfig?.hasSupabaseAuth) {
      authHint.textContent = 'Supabase 連携後にログインできます';
    } else if (isLoggedIn) {
      authHint.textContent = 'ログイン済みです';
    } else {
      authHint.textContent = 'メールアドレスでログインできます';
    }
  }
}

function getAuthRedirectURL() {
  return publicConfig?.siteUrl || window.location.origin;
}

function getAuthFields() {
  const authEmail = document.getElementById('authEmail');
  const authPassword = document.getElementById('authPassword');
  return {
    email: authEmail?.value.trim() || '',
    password: authPassword?.value || '',
  };
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
    setAuthMessage('メールを送信しました。受信ボックスからログインを完了してください。', 'success');
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
    setAuthMessage('登録処理を受け付けました。必要なら確認メールを開いてください。', 'success');
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
    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

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

async function initSupabaseAuth(config) {
  const authStatus = document.getElementById('authStatus');
  const authMeta = document.getElementById('authMeta');
  if (!authStatus || !authMeta) return;

  if (!config?.supabaseUrl || !config?.supabaseAnonKey) {
    authStatus.textContent = 'Supabase 未設定です';
    authStatus.dataset.state = 'warning';
    authMeta.textContent = 'Vercel の環境変数に SUPABASE_URL と SUPABASE_ANON_KEY を追加すると有効になります。';
    setAuthMessage('設定後はこの画面からそのままログイン確認ができます。', 'muted');
    return;
  }

  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');

    supabaseClient = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });

    const { data, error } = await supabaseClient.auth.getSession();
    if (error) throw error;

    updateAuthUI(data.session);
    setAuthMessage('Supabase Auth の接続準備ができています。', 'success');

    supabaseClient.auth.onAuthStateChange((_event, session) => {
      updateAuthUI(session);
    });

    const authForm = document.getElementById('authForm');
    if (authForm) {
      authForm.addEventListener('submit', (event) => event.preventDefault());
    }

    document.getElementById('btnMagicLink')?.addEventListener('click', handleMagicLink);
    document.getElementById('btnSignUp')?.addEventListener('click', handleSignUp);
    document.getElementById('btnSignIn')?.addEventListener('click', handleSignIn);
    document.getElementById('btnSignOut')?.addEventListener('click', handleSignOut);
  } catch (error) {
    captureError('supabase-init', error);
    authStatus.textContent = 'Supabase 初期化エラー';
    authStatus.dataset.state = 'error';
    authMeta.textContent = 'URL や anon key、またはブラウザからの読み込み方法を確認してください。';
    setAuthMessage(error.message || 'Supabase Auth の初期化に失敗しました。', 'error');
  }
}

async function loadPublicConfig() {
  try {
    const response = await fetch('/api/public-config', {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return {
      ...data,
      authPanelInitiallyOpen: Boolean(data.hasSupabaseAuth),
    };
  } catch (error) {
    captureError('public-config', error);
    return {
      siteUrl: window.location.origin,
      supabaseUrl: '',
      supabaseAnonKey: '',
      hasSupabaseAuth: false,
      authPanelInitiallyOpen: true,
    };
  }
}

function initAuthPanelToggle() {
  const toggle = document.getElementById('authPanelToggle');
  const body = document.getElementById('authPanelBody');
  const hint = document.getElementById('authPanelToggleHint');
  if (!toggle || !body) return;

  function updateHint(isOpen) {
    if (!hint) return;
    if (!isOpen) {
      hint.textContent = 'タップで開きます';
      return;
    }
    hint.textContent = publicConfig?.hasSupabaseAuth
      ? 'メールアドレスでログインできます'
      : 'Supabase 連携後にログインできます';
  }

  function setOpen(open) {
    toggle.setAttribute('aria-expanded', String(open));
    body.hidden = !open;
    updateHint(open);
  }

  setOpen(Boolean(publicConfig?.authPanelInitiallyOpen));

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });
}

if (typeof document !== 'undefined' && document.getElementById('authForm')) {
  (async () => {
    publicConfig = await loadPublicConfig();
    initAuthPanelToggle();
    await initSupabaseAuth(publicConfig);
  })();
}
