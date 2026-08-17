import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // The presentation loads every screen up front on purpose: nothing should
    // stream in mid-demonstration in front of an audience.
    chunkSizeWarningLimit: 1200,
  },
})
