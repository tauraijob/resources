export default defineNuxtRouteMiddleware(async (to) => {
    try {
        const me: any = await $fetch('/api/auth/me')
        if (!me || me.role !== 'ADMIN') {
            return navigateTo(`/login?next=${encodeURIComponent(to.fullPath)}`)
        }
    } catch {
        return navigateTo(`/login?next=${encodeURIComponent(to.fullPath)}`)
    }
})


