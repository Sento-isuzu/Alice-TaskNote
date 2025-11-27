import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    vue(),

    AutoImport({
      imports: ['vue', 'vue-router'],
      resolvers: [ElementPlusResolver()],
    }),

    Components({
      resolvers: [
        ElementPlusResolver(),
        IconsResolver({
          prefix: 'icon', // 强制所有图标生成为 <Iconxxx />
        }),
      ],
    }),

    Icons({
      autoInstall: true,
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
