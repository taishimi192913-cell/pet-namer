import { next } from '@vercel/functions';

const CANONICAL_HOST = 'sippomi.com';
const REDIRECT_HOSTS = new Set(['www.sippomi.com', 'pet-namer.vercel.app']);

export default function middleware(request) {
  const url = new URL(request.url);
  const host = request.headers.get('host') ?? url.host;

  if (REDIRECT_HOSTS.has(host)) {
    url.protocol = 'https:';
    url.host = CANONICAL_HOST;

    return Response.redirect(url, 308);
  }

  return next();
}
