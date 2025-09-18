import { prisma } from '~~/server/utils/prisma'
import { setSessionUser } from '~~/server/utils/auth'
import { createHash } from 'node:crypto'

export default defineEventHandler(async (event) => {
    const body = await readBody<{ email?: string; username?: string; password?: string }>(event)
    if (!body?.password || (!body.email && !body.username)) {
        throw createError({ statusCode: 400, statusMessage: 'username/email and password required' })
    }
    const where = body.email ? { email: body.email.toLowerCase() } : { username: body.username!.toLowerCase() }
    const user = await prisma.user.findFirst({ where })
    if (!user) throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
    const hash = createHash('sha256').update(body.password).digest('hex')
    if (user.passwordHash !== hash) throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
    if (user.active === false) throw createError({ statusCode: 403, statusMessage: 'Account suspended' })
    setSessionUser(event, user.id)
    return { id: user.id, email: user.email, role: user.role, username: user.username }
})



