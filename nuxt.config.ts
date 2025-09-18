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
