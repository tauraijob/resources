import { prisma } from '~~/server/utils/prisma'
import { requireUser } from '~~/server/utils/auth'
import { sendBookingNotificationAdmin } from '~~/server/utils/email'

type Body = {
    resourceId: number
    location?: string
    startTime: string
    endTime: string
    notes?: string
}

export default defineEventHandler(async (event) => {
    const user = await requireUser(event)
    const body = await readBody<Body>(event)
    if (!body?.resourceId || !body?.startTime || !body?.endTime) {
        throw createError({ statusCode: 400, statusMessage: 'resourceId, startTime, endTime are required' })
    }
    const start = new Date(body.startTime)
    const end = new Date(body.endTime)
    if (!(start < end)) {
        throw createError({ statusCode: 400, statusMessage: 'startTime must be before endTime' })
    }
    const overlap = await prisma.booking.findFirst({
        where: {
            resourceId: body.resourceId,
            status: { in: ['PENDING', 'APPROVED'] },
            NOT: [
                { endTime: { lte: start } },
                { startTime: { gte: end } }
            ]
        }
    })
    if (overlap) {
        throw createError({ statusCode: 409, statusMessage: 'Resource already booked for this time' })
    }
    const booking = await prisma.booking.create({
        data: {
            resourceId: body.resourceId,
            userId: user.id,
            location: body.location ?? null,
            startTime: start,
            endTime: end,
            notes: body.notes ?? null
        },
        include: {
            resource: true,
            user: { select: { id: true, email: true, name: true, username: true } }
        }
    })

    // Send notification to all admins
    try {
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN', active: true },
            select: { email: true, name: true, username: true }
        })

        const userName = user.name || user.username || user.email.split('@')[0]
        const startTime = new Date(booking.startTime).toLocaleString()
        const endTime = new Date(booking.endTime).toLocaleString()
        const location = booking.location || 'Not specified'

        // Send email to all admins
        for (const admin of admins) {
            const adminName = admin.name || admin.username || admin.email.split('@')[0]
            await sendBookingNotificationAdmin(
                admin.email,
                adminName,
                userName,
                booking.resource.name,
                startTime,
                endTime,
                location
            )
        }
        console.log('Admin notification emails sent successfully')
    } catch (emailError) {
        console.error('Failed to send admin notification emails:', emailError)
        // Don't fail the booking creation if email fails
    }

    return booking
})



