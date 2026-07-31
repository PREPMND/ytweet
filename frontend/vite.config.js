import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'PREP',
        short_name: 'PREP',
        description: 'Social media application',
        theme_color: '#111827',
        background_color: '#111827',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'PREYlogo1.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'PREYlogo1.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})