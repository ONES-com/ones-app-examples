import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/static/',
  plugins: [
    react({
      jsxRuntime: 'classic',
      babel: {
        plugins: [
          ['styled-jsx/babel', { optimizeForSpeed: true }]
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      input: {
        'settings-page': './src/settings-page-main.tsx',
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
})
