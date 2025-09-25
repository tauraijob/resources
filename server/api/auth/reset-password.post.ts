import { prisma } from '~~/server/utils/prisma'
import { createHash } from 'node:crypto'

function hashPassword(pw: string) {
    return createHash('sha256').update(pw).digest('hex')
}

export default defineEventHandler(async (event) => {
    const body = await readBody<{ token: string; newPassword: string }>(event)

    if (!body?.token || !body?.newPassword) {
        throw createError({ statusCode: 400, statusMessage: 'Token and new password are required' })
    }

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
        where: {
            resetToken: body.token,
            resetExpiry: {
                gt: new Date() // Token must not be expired
            }
        }
    })

    if (!user) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid or expired reset token' })
    }

    // Update password and clear reset token
    await prisma.user.update({
        where: { id: user.id },
        data: {
            passwordHash: hashPassword(body.newPassword),
            resetToken: null,
            resetExpiry: null
        }
    })

    return { message: 'Password reset successfully' }
})
