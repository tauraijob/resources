import { ensureAdminSeed } from '~~/server/utils/auth'

export default defineNitroPlugin(async () => {
    try {
        await ensureAdminSeed()
    } catch (err) {
        // ignore seeding errors on cold start
    }
})



