export default defineNuxtRouteMiddleware(async (to) => {
    const publicRoutes = new Set(['/', '/login'])
    if (publicRoutes.has(to.path)) return

    // Skip server-side execution to avoid SSR issues
    if (process.server) return

    // On client side, use the global auth state
    const { user, fetchUser } = useAuth()

    // If we don't have user data, try to fetch it
    if (!user.value) {
        try {
            await fetchUser()
        } catch (error) {
            console.error('Auth fetch error:', error)
            return navigateTo('/login')
        }
    }

    // If still no user after fetch, redirect to login
    if (!user.value) {
        return navigateTo('/login')
    }
})
