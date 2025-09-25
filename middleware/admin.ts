export default defineNuxtRouteMiddleware(async (to) => {
    // Skip server-side execution to avoid SSR issues
    if (process.server) return

    // On client side, check authentication and admin role via API
    try {
        const me: any = await $fetch('/api/auth/me')
        if (!me || me.role !== 'ADMIN') {
            return navigateTo(`/login?next=${encodeURIComponent(to.fullPath)}`)
        }
    } catch (error) {
        console.error('Admin auth check error:', error)
        return navigateTo(`/login?next=${encodeURIComponent(to.fullPath)}`)
    }
})