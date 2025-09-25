import { prisma } from '~~/server/utils/prisma'
import { requireAdmin } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
    const admin = await requireAdmin(event)
    const id = Number(getRouterParam(event, 'id'))
    if (Number.isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'invalid id' })

    // Get the booking first to check if it exists and get resource info
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

    // Check for conflicts with other approved bookings
    const conflictingBooking = await prisma.booking.findFirst({
        where: {
            resourceId: existingBooking.resourceId,
            status: 'APPROVED',
            id: { not: id },
            OR: [
                {
                    startTime: { lt: existingBooking.endTime },
                    endTime: { gt: existingBooking.startTime }
                }
            ]
        }
    })

    if (conflictingBooking) {
        throw createError({
            statusCode: 409,
            statusMessage: `Resource is already booked from ${new Date(conflictingBooking.startTime).toLocaleString()} to ${new Date(conflictingBooking.endTime).toLocaleString()}`
        })
    }

    const booking = await prisma.booking.update({
        where: { id },
        data: {
            status: 'APPROVED',
            approval: {
                upsert: {
                    create: { adminId: admin.id, status: 'APPROVED' },
                    update: { adminId: admin.id, status: 'APPROVED' }
                }
            }
        },
        include: {
            approval: true,
            resource: true,
            user: { select: { id: true, email: true, name: true, username: true } }
        }
    })

    return booking
})



