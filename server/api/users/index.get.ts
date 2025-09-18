import { prisma } from '~~/server/utils/prisma'
import { requireAdmin } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: { id: true, email: true, username: true, name: true, role: true, createdAt: true, active: true }
    })
    return users
})


