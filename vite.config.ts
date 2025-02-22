import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
// element-plus按需引入
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // proxy: {
    //   '/user-service': {
    //     target: 'http://localhost:8081', // 用户服务
    //     changeOrigin: true,
    //     rewrite: path => path.replace(/^\/user-service/, '')
    //   },
    //   '/video-service': {
    //     target: 'http://localhost:8082', // 视频服务
    //     changeOrigin: true,
    //     rewrite: path => path.replace(/^\/video-service/, '')
    //   },
    // },
    open: true,
  },
})
