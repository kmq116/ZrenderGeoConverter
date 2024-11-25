import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  splitting: false,
  sourcemap: true,
  clean: true,
  esbuildOptions(options) {
    options.charset = 'utf8'
  },
})
