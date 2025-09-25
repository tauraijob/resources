import { prisma } from '~~/server/utils/prisma'
import { sendOtpLoginEmail } from '~~/server/utils/email'

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
        throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Store OTP in database
    await prisma.user.update({
        where: { id: user.id },
        data: {
            metadata: {
                otpCode,
                otpExpiry: otpExpiry.toISOString()
            }
        }
    })

    // Send OTP email
    try {
        const userName = user.name || user.username || user.email.split('@')[0]
        await sendOtpLoginEmail(user.email, userName, otpCode, '10 minutes')

        return { message: 'Login code has been sent to your email.' }
    } catch (emailError) {
        console.error('Failed to send OTP email:', emailError)
        throw createError({ statusCode: 500, statusMessage: 'Failed to send login code' })
    }
})
