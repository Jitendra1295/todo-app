import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Set base to '/' for GitHub Pages user/site (username.github.io)
  // For project sites (username.github.io/repo-name), set base to '/repo-name/'
  base: '/',
})
