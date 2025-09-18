export default defineNuxtRouteMiddleware(async (to) => {
    if (process.server) return
    const publicRoutes = new Set(['/', '/login'])
    if (publicRoutes.has(to.path)) return
    const me = await $fetch('/api/auth/me').catch(() => null)
    if (!me) {
        return navigateTo('/login')
    }
})



