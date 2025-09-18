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
      // Inline prisma client to avoid resolver issues with .prisma subpath during build
      inline: ['@prisma/client', 'prisma']
    },
    moduleSideEffects: ['@prisma/client'],
    rollupConfig: {
      // Ensure rollup treats .prisma virtual subpath as external to avoid resolution errors
      external: [/^\.prisma\/.*/]
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
