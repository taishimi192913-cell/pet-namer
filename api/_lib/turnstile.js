export async function verifyTurnstileToken(token, remoteip) {
  if (!process.env.TURNSTILE_SECRET_KEY) {
    return { success: true, skipped: true };
  }

  if (!token) {
    return { success: false, skipped: false, code: 'missing-token' };
  }

  const body = new URLSearchParams();
  body.set('secret', process.env.TURNSTILE_SECRET_KEY);
  body.set('response', token);
  if (remoteip) {
    body.set('remoteip', remoteip);
  }

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  const result = await response.json();
  return {
    success: Boolean(result.success),
    skipped: false,
    code: Array.isArray(result['error-codes']) ? result['error-codes'].join(',') : '',
  };
}
