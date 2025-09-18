import { prisma } from '~~/server/utils/prisma'
import { requireAdmin } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
    const admin = await requireAdmin(event)
    const id = Number(getRouterParam(event, 'id'))
    if (Number.isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'invalid id' })
    const booking = await prisma.booking.update({
        where: { id },
        data: { status: 'APPROVED', approval: { upsert: { create: { adminId: admin.id, status: 'APPROVED' }, update: { adminId: admin.id, status: 'APPROVED' } } } },
        include: { approval: true }
    })
    return booking
})



