import { prisma } from '~~/server/utils/prisma'
import { requireAdmin } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)
    const id = Number(getRouterParam(event, 'id'))
    if (Number.isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'invalid id' })
    const body = await readBody<{ email?: string; username?: string; name?: string; role?: 'EMPLOYEE' | 'ADMIN'; active?: boolean }>(event)
    if (body.email && !/@webdev\.co\.zw$/i.test(body.email)) {
        throw createError({ statusCode: 400, statusMessage: 'Email domain must be @webdev.co.zw' })
    }
    const updated = await prisma.user.update({
        where: { id },
        data: {
            email: body.email?.toLowerCase(),
            username: body.username?.toLowerCase(),
            name: body.name,
            role: body.role === 'ADMIN' ? 'ADMIN' : body.role === 'EMPLOYEE' ? 'EMPLOYEE' : undefined,
            active: typeof body.active === 'boolean' ? body.active : undefined
        },
        select: { id: true }
    })
    return { ok: true, id: updated.id }
})


