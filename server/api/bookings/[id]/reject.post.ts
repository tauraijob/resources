import { prisma } from '~~/server/utils/prisma'
import { requireAdmin } from '~~/server/utils/auth'
import { sendBookingRejectionEmail, sendBookingNotificationEmployee } from '~~/server/utils/email'

export default defineEventHandler(async (event) => {
    const admin = await requireAdmin(event)
    const id = Number(getRouterParam(event, 'id'))
    if (Number.isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'invalid id' })

    const body = await readBody<{ note?: string }>(event)

    // Get the booking first to check if it exists
    const existingBooking = await prisma.booking.findUnique({
        where: { id },
        include: { resource: true, user: true }
    })

    if (!existingBooking) {
        throw createError({ statusCode: 404, statusMessage: 'Booking not found' })
    }

    if (existingBooking.status !== 'PENDING') {
        throw createError({ statusCode: 400, statusMessage: 'Booking is not pending approval' })
    }

    const booking = await prisma.booking.update({
        where: { id },
        data: {
            status: 'REJECTED',
            approval: {
                upsert: {
                    create: { adminId: admin.id, status: 'REJECTED', note: body?.note ?? null },
                    update: { adminId: admin.id, status: 'REJECTED', note: body?.note ?? null }
                }
            }
        },
        include: {
            approval: true,
            resource: true,
            user: { select: { id: true, email: true, name: true, username: true } }
        }
    })

    // Send rejection emails
    try {
        const userName = booking.user.name || booking.user.username || booking.user.email.split('@')[0]
        const startTime = new Date(booking.startTime).toLocaleString()
        const endTime = new Date(booking.endTime).toLocaleString()

        // Send both rejection email and notification email
        await Promise.all([
            sendBookingRejectionEmail(
                booking.user.email,
                userName,
                booking.resource.name,
                body?.note
            ),
            sendBookingNotificationEmployee(
                booking.user.email,
                userName,
                booking.resource.name,
                startTime,
                endTime,
                'REJECTED'
            )
        ])
        console.log('Rejection emails sent successfully')
    } catch (emailError) {
        console.error('Failed to send rejection emails:', emailError)
        // Don't fail the rejection if email fails
    }

    return booking
})



