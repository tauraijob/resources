import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async () => {
    const now = new Date()

    const [resources, currentBookings] = await Promise.all([
        prisma.resource.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
        prisma.booking.findMany({
            where: {
                status: 'APPROVED',
                startTime: { lte: now },
                endTime: { gt: now }
            },
            include: { user: { select: { id: true, email: true, name: true, username: true } } }
        })
    ])

    // pick the nearest finishing booking if multiple
    const byResource = new Map<number, typeof currentBookings[number]>()
    for (const b of currentBookings) {
        const existing = byResource.get(b.resourceId)
        if (!existing || existing.endTime > b.endTime) byResource.set(b.resourceId, b)
    }

    return resources.map(r => {
        const active = byResource.get(r.id)
        return {
            id: r.id,
            name: r.name,
            category: r.category,
            location: r.location,
            status: active ? 'IN_USE' as const : 'AVAILABLE' as const,
            activeBooking: active
                ? {
                    startTime: active.startTime,
                    endTime: active.endTime,
                    location: active.location,
                    user: {
                        id: active.user.id,
                        name: active.user.name,
                        email: active.user.email,
                        username: active.user.username
                    }
                }
                : null
        }
    })
})


