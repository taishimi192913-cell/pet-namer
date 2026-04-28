import { createHttpError } from './request.js';
import { verifyTurnstileToken } from './turnstile.js';

export async function verifyWriteChallenge(request, body) {
  const verification = await verifyTurnstileToken(
    body?.turnstileToken,
    request.headers['x-forwarded-for'],
  );

  if (!verification.success) {
    throw createHttpError(400, 'Turnstile verification failed');
  }
}
