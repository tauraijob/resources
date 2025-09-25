interface User {
    id: number
    email: string
    username: string
    name?: string
    role: 'EMPLOYEE' | 'ADMIN'
}

// Global state that can be shared across all components
const globalUser = ref<User | null>(null)
const globalLoading = ref(true)

export const useAuth = () => {
    const user = globalUser
    const loading = globalLoading

    const fetchUser = async () => {
        try {
            loading.value = true
            const response = await $fetch('/api/auth/me')
            user.value = response
            console.log('User fetched:', response)
        } catch (error) {
            user.value = null
            console.log('Auth error:', error)
        } finally {
            loading.value = false
        }
    }

    // Initialize auth state if not already done
    if (!user.value && !loading.value) {
        fetchUser()
    }

    const logout = async () => {
        try {
            await $fetch('/api/auth/logout', { method: 'POST' })
            user.value = null
            loading.value = false
            // Force navigation to login page
            await navigateTo('/login', { replace: true })
        } catch (error) {
            console.error('Logout failed:', error)
            // Even if logout fails, clear local state
            user.value = null
            loading.value = false
            await navigateTo('/login', { replace: true })
        }
    }

    const isAdmin = computed(() => user.value?.role === 'ADMIN')
    const isAuthenticated = computed(() => !!user.value)

    return {
        user: readonly(user),
        loading: readonly(loading),
        isAdmin,
        isAuthenticated,
        fetchUser,
        logout
    }
}
