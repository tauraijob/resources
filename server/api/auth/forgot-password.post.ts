import { prisma } from '~~/server/utils/prisma'
import { sendForgotPasswordEmail } from '~~/server/utils/email'
import { createHash } from 'node:crypto'

export default defineEventHandler(async (event) => {
    const body = await readBody<{ email: string }>(event)

    if (!body?.email) {
        throw createError({ statusCode: 400, statusMessage: 'Email is required' })
    }

    // Check if email domain is allowed
    if (!/@webdev\.co\.zw$/i.test(body.email)) {
        throw createError({ statusCode: 400, statusMessage: 'Email domain must be @webdev.co.zw' })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
        where: { email: body.email.toLowerCase() }
    })

    if (!user) {
        // Don't reveal if user exists or not for security
        return { message: 'If an account with that email exists, a password reset link has been sent.' }
    }

    // Generate reset token
    const resetToken = createHash('sha256').update(`${user.id}-${Date.now()}-${Math.random()}`).digest('hex')
    const resetExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Store reset token in database
    await prisma.user.update({
        where: { id: user.id },
        data: {
            resetToken,
            resetExpiry
        }
    })

    // Generate reset link
    const resetLink = `${process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`

    // Send email
    try {
        const userName = user.name || user.username || user.email.split('@')[0]
        await sendForgotPasswordEmail(user.email, userName, resetLink, '24 hours')

        return { message: 'Password reset link has been sent to your email.' }
    } catch (emailError) {
        console.error('Failed to send password reset email:', emailError)
        throw createError({ statusCode: 500, statusMessage: 'Failed to send password reset email' })
    }
})
