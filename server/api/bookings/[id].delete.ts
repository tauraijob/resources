import { prisma } from '~~/server/utils/prisma'
import { requireUser } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
    const user = await requireUser(event)
    const id = Number(getRouterParam(event, 'id'))
    if (Number.isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'invalid id' })
    const booking = await prisma.booking.findUnique({ where: { id } })
    if (!booking) throw createError({ statusCode: 404, statusMessage: 'not found' })
    if (user.role !== 'ADMIN' && booking.userId !== user.id) {
        throw createError({ statusCode: 403, statusMessage: 'forbidden' })
    }
    await prisma.$transaction([
        prisma.approval.deleteMany({ where: { bookingId: id } }),
        prisma.booking.delete({ where: { id } })
    ])
    return { ok: true }
})



