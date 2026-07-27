import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // Tests cover the Zustand stores only, which need no DOM.
    // See CLAUDE.md section 5.
    environment: 'node',
    globals: true,
  },
})
