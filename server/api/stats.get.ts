import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async () => {
    const now = new Date()

    const [
        totalResources,
        totalBookings,
        pendingBookings,
        approvedBookings,
        rejectedBookings,
        upcomingBookings
    ] = await Promise.all([
        prisma.resource.count({ where: { active: true } }),
        prisma.booking.count(),
        prisma.booking.count({ where: { status: 'PENDING' } }),
        prisma.booking.count({ where: { status: 'APPROVED' } }),
        prisma.booking.count({ where: { status: 'REJECTED' } }),
        prisma.booking.count({ where: { startTime: { gte: now }, status: { in: ['PENDING', 'APPROVED'] } } })
    ])

    return {
        totalResources,
        totalBookings,
        pendingBookings,
        approvedBookings,
        rejectedBookings,
        upcomingBookings
    }
})


