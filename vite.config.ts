import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project site: https://ugworks.github.io/Portfolio-HUUUUUN/
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/Portfolio-HUUUUUN/' : '/',
  plugins: [react()],
}))
