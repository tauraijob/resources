export default defineNuxtRouteMiddleware(async (to) => {
    const publicRoutes = new Set(['/', '/login'])
    if (publicRoutes.has(to.path)) return

    // Skip server-side execution to avoid SSR issues
    if (process.server) return

    // On client side, check authentication via API
    try {
        const me = await $fetch('/api/auth/me')
        if (!me) {
            return navigateTo('/login')
        }
    } catch (error) {
        console.error('Auth check error:', error)
        return navigateTo('/login')
    }
})
