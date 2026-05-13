import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['src/index', 'src/client', 'src/browser'],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
    esbuild: {
      target: 'node22',
    },
  },
  externals: ['vite', 'path-to-regexp'],
})
