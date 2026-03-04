import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { swPrecache } from './vite-plugin-sw-precache.js'

export default defineConfig({
  plugins: [vue(), swPrecache()],
  base: '/daggerheart-companion/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@core': resolve(__dirname, 'src/core'),
      '@modules': resolve(__dirname, 'src/modules'),
      '@data': resolve(__dirname, 'src/data')
    }
  },
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/__test-setup__/node-globals.js'],
    include: ['src/**/__tests__/**/*.test.js'],
    deps: {
      optimizer: {
        ssr: {
          include: ['vue', 'pinia', '@vue/test-utils', 'happy-dom']
        }
      }
    }
  }
})
