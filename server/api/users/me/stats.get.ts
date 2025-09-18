import { prisma } from '~~/server/utils/prisma'
import { requireUser } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
    const user = await requireUser(event)
    const now = new Date()
    const startOfYear = new Date(now.getFullYear(), 0, 1)

    const [byStatus, monthly] = await Promise.all([
        prisma.booking.groupBy({
            by: ['status'],
            where: { userId: user.id },
            _count: { _all: true }
        }),
        prisma.booking.findMany({
            where: { userId: user.id, startTime: { gte: startOfYear } },
            select: { startTime: true }
        })
    ])

    const status = {
        PENDING: byStatus.find(s => s.status === 'PENDING')?._count._all ?? 0,
        APPROVED: byStatus.find(s => s.status === 'APPROVED')?._count._all ?? 0,
        REJECTED: byStatus.find(s => s.status === 'REJECTED')?._count._all ?? 0,
        CANCELLED: byStatus.find(s => s.status === 'CANCELLED')?._count._all ?? 0
    }

    const monthlyBuckets = Array.from({ length: 12 }, () => 0)
    for (const b of monthly) {
        const m = new Date(b.startTime).getMonth()
        monthlyBuckets[m]++
    }

    return { status, monthly: monthlyBuckets }
})


