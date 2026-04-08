const baseUrl = process.argv[2];

if (!baseUrl) {
  console.error('Usage: npm run verify:deployment -- https://your-site.vercel.app');
  process.exit(1);
}

const origin = baseUrl.replace(/\/+$/, '');
const checks = [
  '/',
  '/dog-names',
  '/cat-names',
  '/rabbit-names',
  '/api/public-config',
  '/api/health',
];

async function verifyPath(pathname) {
  const response = await fetch(`${origin}${pathname}`, {
    headers: { Accept: pathname.startsWith('/api/') ? 'application/json' : 'text/html' },
  });

  if (!response.ok) {
    throw new Error(`${pathname} returned HTTP ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (pathname.startsWith('/api/')) {
    if (!contentType.includes('application/json')) {
      throw new Error(`${pathname} did not return JSON`);
    }
    return response.json();
  }

  if (!contentType.includes('text/html')) {
    throw new Error(`${pathname} did not return HTML`);
  }
  return null;
}

const results = {};

for (const path of checks) {
  results[path] = await verifyPath(path);
}

console.log(`Deployment verified: ${origin}`);
console.log(JSON.stringify({
  publicConfig: results['/api/public-config'],
  health: results['/api/health'],
}, null, 2));
