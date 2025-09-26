import { prisma } from '~~/server/utils/prisma'
import { requireUser } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
    const user = await requireUser(event)

    try {
        // Remove Google Calendar connection from user
        await prisma.user.update({
            where: { id: user.id },
            data: {
                googleRefreshToken: null,
                googleCalendarConnected: false
            }
        })

        return {
            success: true,
            message: 'Google Calendar disconnected successfully!'
        }
    } catch (error: any) {
        console.error('Google Calendar disconnection error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to disconnect Google Calendar'
        })
    }
})
