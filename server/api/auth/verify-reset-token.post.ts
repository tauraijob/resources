import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async (event) => {
    const body = await readBody<{ token: string }>(event)

    if (!body?.token) {
        throw createError({ statusCode: 400, statusMessage: 'Token is required' })
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

    return { message: 'Token is valid', user: { email: user.email, name: user.name } }
})
