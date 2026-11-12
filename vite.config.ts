import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/waseef-booking-automation',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

