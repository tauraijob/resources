import { prisma } from '~~/server/utils/prisma'
import { requireAdmin } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)
    const id = Number(getRouterParam(event, 'id'))
    if (Number.isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'invalid id' })
    await prisma.$transaction([
        prisma.approval.deleteMany({ where: { booking: { resourceId: id } } }),
        prisma.booking.deleteMany({ where: { resourceId: id } }),
        prisma.resource.delete({ where: { id } })
    ])
    return { ok: true }
})



