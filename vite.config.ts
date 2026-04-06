import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

const config = defineConfig({
  plugins: [
    TanStackRouterVite(),
    devtools(),
    tsconfigPaths({ projects: ['./tsconfig.json'] }),
    tailwindcss(),
    viteReact(),
  ],
  server: {
    port: 3003,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 将大型库拆分为单独的 chunks
          if (id.includes('node_modules')) {
            if (id.includes('@radix-ui')) return 'radix-ui'
            if (id.includes('lucide-react')) return 'icons'
            if (id.includes('@tanstack/react-query')) return 'query'
            if (id.includes('react') || id.includes('react-dom')) return 'react'
            if (id.includes('i18next') || id.includes('react-i18next')) return 'i18n'
            if (id.includes('recharts')) return 'charts'
            return 'vendor'
          }
          // 按功能模块拆分 routes
          if (id.includes('/routes/')) {
            if (id.includes('/course')) return 'courses'
            if (id.includes('/lesson')) return 'lessons'
            if (id.includes('/review')) return 'review'
            if (id.includes('/stats')) return 'stats'
            if (id.includes('/writing')) return 'writing'
            if (id.includes('/kanji')) return 'kanji'
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})

export default config
