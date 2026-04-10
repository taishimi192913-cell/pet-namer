import { defineConfig, loadEnv } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import communityHandler from './api/community.js';
import favoritesHandler from './api/favorites.js';
import healthHandler from './api/health.js';
import publicConfigHandler from './api/public-config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const devApiHandlers = new Map([
  ['/api/public-config', publicConfigHandler],
  ['/api/health', healthHandler],
  ['/api/favorites', favoritesHandler],
  ['/api/community', communityHandler],
]);

function enhanceNodeResponse(response) {
  if (typeof response.status !== 'function') {
    response.status = (statusCode) => {
      response.statusCode = statusCode;
      return response;
    };
  }

  if (typeof response.json !== 'function') {
    response.json = (payload) => {
      if (!response.headersSent) {
        response.setHeader('Content-Type', 'application/json; charset=utf-8');
      }
      response.end(JSON.stringify(payload));
      return response;
    };
  }

  return response;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');
  Object.assign(process.env, env);

  return {
    server: {
      headers: {
        'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https:; img-src 'self' data: blob: https:; connect-src 'self' https: wss:;"
      }
    },
    plugins: [
      {
        name: 'sippomi-dev-api-routes',
        configureServer(server) {
          server.middlewares.use(async (request, response, next) => {
            const pathname = request.url ? request.url.split('?')[0] : '';
            const handler = devApiHandlers.get(pathname);
            if (!handler) {
              next();
              return;
            }

            try {
              enhanceNodeResponse(response);
              await handler(request, response);
            } catch (error) {
              if (response.writableEnded) return;
              enhanceNodeResponse(response).status(500).json({
                ok: false,
                error: error?.message || 'Unknown server error',
              });
            }
          });
        },
      },
    ],
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: {
          index: path.resolve(__dirname, 'index.html'),
          'welcome-prep': path.resolve(__dirname, 'welcome-prep.html'),
          'starter-set': path.resolve(__dirname, 'starter-set.html'),
          'journal-first-days': path.resolve(__dirname, 'journal-first-days.html'),
          'journal-home-safety': path.resolve(__dirname, 'journal-home-safety.html'),
          'journal-first-shopping': path.resolve(__dirname, 'journal-first-shopping.html'),
          'dog-names': path.resolve(__dirname, 'dog-names.html'),
          'cat-names': path.resolve(__dirname, 'cat-names.html'),
          'rabbit-names': path.resolve(__dirname, 'rabbit-names.html'),
          'privacy': path.resolve(__dirname, 'privacy.html'),
          'about': path.resolve(__dirname, 'about.html'),
        },
      },
    },
  };
});
