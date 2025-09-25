import { prisma } from '~~/server/utils/prisma'
import { setSessionUser } from '~~/server/utils/auth'
import { createHash } from 'node:crypto'

export default defineEventHandler(async (event) => {
    const body = await readBody<{ email?: string; username?: string; password?: string }>(event)

    // Validate input
    if (!body?.password || (!body.email && !body.username)) {
        throw createError({ statusCode: 400, statusMessage: 'username/email and password required' })
    }

    // Sanitize input
    const email = body.email?.toLowerCase().trim()
    const username = body.username?.toLowerCase().trim()
    const password = body.password.trim()

    if (!password || password.length < 1) {
        throw createError({ statusCode: 400, statusMessage: 'Password cannot be empty' })
    }

    // Find user
    const where = email ? { email } : { username }
    const user = await prisma.user.findFirst({ where })

    // Always return the same error message to prevent user enumeration
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
    }

    // Verify password
    const hash = createHash('sha256').update(password).digest('hex')
    if (user.passwordHash !== hash) {
        throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
    }

    // Check if account is active
    if (user.active === false) {
        throw createError({ statusCode: 403, statusMessage: 'Account suspended' })
    }

    // Set session and return user data
    setSessionUser(event, user.id)
    return {
        id: user.id,
        email: user.email,
        role: user.role,
        username: user.username,
        name: user.name
    }
})



