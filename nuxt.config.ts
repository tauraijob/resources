// Note: avoid relying on Node type refs to keep lint simple
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
      inline: []   // ✅ do not inline Prisma; let Node resolve it at runtime
    },
    moduleSideEffects: ['@prisma/client'],            // ✅ ensure Prisma doesn’t get tree-shaken
    rollupConfig: {
      external: ['@prisma/client', /^\.prisma\//]
    }
  },

  runtimeConfig: {
    authSecret: (globalThis as any).process?.env?.NUXT_AUTH_SECRET || 'dev-secret-change-me',
    mailtrapApiToken: (globalThis as any).process?.env?.MAILTRAP_API_TOKEN || '',
    fromEmail: (globalThis as any).process?.env?.FROM_EMAIL || 'noreply@webdev.co.zw',
    googleClientId: (globalThis as any).process?.env?.GOOGLE_CLIENT_ID || '',
    googleClientSecret: (globalThis as any).process?.env?.GOOGLE_CLIENT_SECRET || ''
  },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  }
})
