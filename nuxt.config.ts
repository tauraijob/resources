// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss'
  ],
  css: ['~~/assets/css/tailwind.css'],
  tailwindcss: {
    cssPath: '~~/assets/css/tailwind.css'
  },
  components: [
    { path: '~~/components/ui', pathPrefix: false },
    { path: '~~/components', pathPrefix: false }
  ],
  nitro: {
    preset: 'node-server',
    externals: {
      // Inline prisma client only in production; keep external in dev
      inline: process.env.NODE_ENV === 'production' ? ['@prisma/client', 'prisma'] : []
    },
    moduleSideEffects: ['@prisma/client'],
    rollupConfig: process.env.NODE_ENV === 'production' ? {
      // Ensure rollup treats .prisma virtual subpath as external to avoid resolution errors
      external: [/^\.prisma\/.*/]
    } : undefined
  },
  vite: {
    ssr: {
      // Do not bundle prisma in dev SSR; load from node_modules
      external: ['@prisma/client', '.prisma']
    },
    optimizeDeps: {
      exclude: ['@prisma/client', '.prisma']
    }
  },
  runtimeConfig: {
    authSecret: process.env.NUXT_AUTH_SECRET || 'dev-secret-change-me'
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  }
})
