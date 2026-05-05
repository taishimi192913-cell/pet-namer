import { defineConfig, loadEnv } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import communityHandler from './api/community.js';
import communityCommentHandler from './api/community-comment.js';
import communityLikeHandler from './api/community-like.js';
import favoritesHandler from './api/favorites.js';
import healthHandler from './api/health.js';
import profileHandler from './api/profile.js';
import publicConfigHandler from './api/public-config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const devApiHandlers = new Map([
  ['/api/public-config', publicConfigHandler],
  ['/api/health', healthHandler],
  ['/api/favorites', favoritesHandler],
  ['/api/community', communityHandler],
  ['/api/community-like', communityLikeHandler],
  ['/api/community-comment', communityCommentHandler],
  ['/api/profile', profileHandler],
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
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/@supabase')) return 'vendor-supabase';
            if (id.includes('node_modules/@sentry')) return 'vendor-sentry';
            if (id.includes('node_modules/zod')) return 'vendor-zod';
            if (id.includes('node_modules/@vercel')) return 'vendor-vercel';
            if (id.includes('src/diagnosis.js') || id.includes('src/name-enrichment.js') || id.includes('src/surname-diagnosis.js') || id.includes('src/reading-display.js') || id.includes('src/render.js') || id.includes('src/constants.js')) return 'diagnosis-core';
            if (id.includes('src/community.js')) return 'community';
            if (id.includes('src/auth.js')) return 'auth';
          },
        },
        input: {
          index: path.resolve(__dirname, 'index.html'),
          'welcome-prep': path.resolve(__dirname, 'welcome-prep.html'),
          'first-dog-guide': path.resolve(__dirname, 'first-dog-guide.html'),
          'first-cat-guide': path.resolve(__dirname, 'first-cat-guide.html'),
          'starter-set': path.resolve(__dirname, 'starter-set.html'),
          'journal-first-pet-checklist': path.resolve(__dirname, 'journal-first-pet-checklist.html'),
          'journal-first-pet-cost': path.resolve(__dirname, 'journal-first-pet-cost.html'),
          'journal-pet-vaccine-schedule': path.resolve(__dirname, 'journal-pet-vaccine-schedule.html'),
          'journal-dog-walk-when': path.resolve(__dirname, 'journal-dog-walk-when.html'),
          'journal-cat-cage-necessary': path.resolve(__dirname, 'journal-cat-cage-necessary.html'),
          'journal-first-days': path.resolve(__dirname, 'journal-first-days.html'),
          'journal-home-safety': path.resolve(__dirname, 'journal-home-safety.html'),
          'journal-first-shopping': path.resolve(__dirname, 'journal-first-shopping.html'),
          'journal-dog-alone-training': path.resolve(__dirname, 'journal-dog-alone-training.html'),
          'journal-cat-toilet-fixes': path.resolve(__dirname, 'journal-cat-toilet-fixes.html'),
          'journal-pet-fast-eating': path.resolve(__dirname, 'journal-pet-fast-eating.html'),
          'journal-first-summer': path.resolve(__dirname, 'journal-first-summer.html'),
          'journal-pet-bousai': path.resolve(__dirname, 'journal-pet-bousai.html'),
          'journal-kanto-pet-outings': path.resolve(__dirname, 'journal-kanto-pet-outings.html'),
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
