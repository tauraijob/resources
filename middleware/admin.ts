import { getSessionUser } from '~/server/utils/auth'

export default defineNuxtRouteMiddleware(async (to) => {
    // On server side, check session directly
    if (process.server) {
        const event = useRequestEvent()
        const user = await getSessionUser(event)
        if (!user || user.role !== 'ADMIN') {
            return navigateTo(`/login?next=${encodeURIComponent(to.fullPath)}`)
        }
        return
    }

    // On client side, check via API
    try {
        const me: any = await $fetch('/api/auth/me')
        if (!me || me.role !== 'ADMIN') {
            return navigateTo(`/login?next=${encodeURIComponent(to.fullPath)}`)
        }
    } catch {
        return navigateTo(`/login?next=${encodeURIComponent(to.fullPath)}`)
    }
})
