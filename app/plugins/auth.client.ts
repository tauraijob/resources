export default defineNuxtPlugin(async () => {
    const { fetchUser, user } = useAuth()

    // Initialize auth state when the app starts (only if not already loaded)
    if (!user.value) {
        await fetchUser()
    }
})
