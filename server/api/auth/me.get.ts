import { getSessionUser } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
    const user = await getSessionUser(event)
    return user ? { id: user.id, email: user.email, role: user.role, name: user.name, username: user.username } : null
})



