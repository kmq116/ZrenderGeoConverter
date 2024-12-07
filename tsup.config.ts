import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  noExternal: ['@turf/turf'], // 将 @turf/turf 打包进去
  splitting: false,
  format: ['cjs', 'esm', 'iife'], // 添加多种格式支持
  sourcemap: true,
  globalName: 'ZGC',
  clean: true,
  esbuildOptions(options) {
    options.charset = 'utf8'
  },
})
