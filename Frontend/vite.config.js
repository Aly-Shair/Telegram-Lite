import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server:{
    proxy:{
      // '/api': import.meta.env.VITE_API_URL
      '/api': "https://telegram-lite.onrender.com"
    }
  },
  plugins: [react()],
})
