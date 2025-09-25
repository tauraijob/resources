import { prisma } from '~~/server/utils/prisma'
import { requireAdmin } from '~~/server/utils/auth'

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

    return booking
})



