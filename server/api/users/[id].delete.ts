import { prisma } from '~~/server/utils/prisma'
import { requireAdmin } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
    const admin = await requireAdmin(event)
    const id = Number(getRouterParam(event, 'id'))
    if (Number.isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'invalid id' })
    if (id === admin.id) throw createError({ statusCode: 400, statusMessage: 'Cannot delete your own account' })
    await prisma.$transaction(async (tx) => {
        // Remove approvals by this user as admin first (reassigning might be better, but for now delete)
        await tx.approval.deleteMany({ where: { adminId: id } })
        // Then remove bookings by the user (and their approvals via cascade of previous line)
        await tx.approval.deleteMany({ where: { booking: { userId: id } } })
        await tx.booking.deleteMany({ where: { userId: id } })
        // Finally delete the user
        await tx.user.delete({ where: { id } })
    })
    return { ok: true }
})


