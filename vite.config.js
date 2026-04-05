import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, 'index.html'),
        'dog-names': path.resolve(__dirname, 'dog-names.html'),
        'cat-names': path.resolve(__dirname, 'cat-names.html'),
        'rabbit-names': path.resolve(__dirname, 'rabbit-names.html'),
      },
    },
  },
});
