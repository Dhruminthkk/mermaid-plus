import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  // Relative, so the build works wherever it is served from: the root of a
  // domain, or a project subpath like <user>.github.io/mermaid-plus/. The app
  // navigates by query string rather than by path, so nothing depends on
  // knowing its own prefix.
  base: './',
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
