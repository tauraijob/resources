import { prisma } from '~~/server/utils/prisma'
import { requireUser } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
    const user = await requireUser(event)
    const role = user.role
    const q = getQuery(event)

    // Build filters (admin can see all, others limited to own)
    const where: any = {}
    if (role !== 'ADMIN') where.userId = user.id

    if (q.status && typeof q.status === 'string') where.status = q.status
    if (q.userId && role === 'ADMIN') {
        const uid = Number(q.userId)
        if (!Number.isNaN(uid)) where.userId = uid
    }
    if (q.resourceId) {
        const rid = Number(q.resourceId)
        if (!Number.isNaN(rid)) where.resourceId = rid
    }
    if (q.from || q.to) {
        where.startTime = {}
        if (q.from && typeof q.from === 'string') where.startTime.gte = new Date(q.from)
        if (q.to && typeof q.to === 'string') where.startTime.lte = new Date(q.to)
    }

    const bookings = await prisma.booking.findMany({
        where,
        include: { resource: true, user: true, approval: true },
        orderBy: { startTime: 'desc' }
    })
    return bookings
})



