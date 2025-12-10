import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   manifest: {
    //     name: 'Electricity Meter App',
    //     short_name: 'MeterApp',
    //     description: 'Offline-first Electricity Meter Reading and Bill Collection App',
    //     theme_color: '#ffffff',
    //     icons: [
    //       {
    //         src: 'vite.svg',
    //         sizes: '192x192',
    //         type: 'image/svg+xml'
    //       },
    //       {
    //         src: 'vite.svg',
    //         sizes: '512x512',
    //         type: 'image/svg+xml'
    //       }
    //     ]
    //   }
    // })
  ],
  server: {
    host: true
  },
  base: './'
})
