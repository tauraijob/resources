import { prisma } from '~~/server/utils/prisma'
import { requireAdmin } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
    const admin = await requireAdmin(event)
    const id = Number(getRouterParam(event, 'id'))
    if (Number.isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'invalid id' })
    const body = await readBody<{ note?: string }>(event)
    const booking = await prisma.booking.update({
        where: { id },
        data: { status: 'REJECTED', approval: { upsert: { create: { adminId: admin.id, status: 'REJECTED', note: body?.note ?? null }, update: { adminId: admin.id, status: 'REJECTED', note: body?.note ?? null } } } },
        include: { approval: true }
    })
    return booking
})



