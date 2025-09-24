export default defineNuxtRouteMiddleware(async (to) => {
    const publicRoutes = new Set(['/', '/login'])
    if (publicRoutes.has(to.path)) return

    // On server side, check session directly
    if (process.server) {
        const event = useRequestEvent()
        const user = await getSessionUser(event)
        if (!user) {
            return navigateTo('/login')
        }
        return
    }

    // On client side, check via API
    const me = await $fetch('/api/auth/me').catch(() => null)
    if (!me) {
        return navigateTo('/login')
    }
})
