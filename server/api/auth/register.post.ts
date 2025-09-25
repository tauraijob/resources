import { prisma } from '~~/server/utils/prisma'
import { createHash } from 'node:crypto'
import { requireAdmin } from '~~/server/utils/auth'
import { sendWelcomeEmail } from '~~/server/utils/email'

function hashPassword(pw: string) {
    return createHash('sha256').update(pw).digest('hex')
}

export default defineEventHandler(async (event) => {
    // Allow public registration for @webdev.co.zw emails
    const body = await readBody<{ email: string; username: string; password: string; name?: string; role?: 'EMPLOYEE' | 'ADMIN' }>(event)
    if (!body?.email || !body?.username || !body?.password) {
        throw createError({ statusCode: 400, statusMessage: 'email, username, password required' })
    }
    if (!/@webdev\.co\.zw$/i.test(body.email)) {
        throw createError({ statusCode: 400, statusMessage: 'Email domain must be @webdev.co.zw' })
    }
    const user = await prisma.user.create({
        data: {
            email: body.email.toLowerCase(),
            username: body.username.toLowerCase(),
            passwordHash: hashPassword(body.password),
            name: body.name ?? null,
            role: body.role === 'ADMIN' ? 'ADMIN' : 'EMPLOYEE'
        }
    })

    // Send welcome email
    try {
        const userName = user.name || user.username || user.email.split('@')[0]
        await sendWelcomeEmail(user.email, userName)
        console.log('Welcome email sent successfully')
    } catch (emailError) {
        console.error('Failed to send welcome email:', emailError)
        // Don't fail the registration if email fails
    }

    return { id: user.id, email: user.email, username: user.username, role: user.role }
})




