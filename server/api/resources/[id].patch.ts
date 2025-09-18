import { prisma } from '~~/server/utils/prisma'
import { requireAdmin } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)
    const id = Number(getRouterParam(event, 'id'))
    if (Number.isNaN(id)) throw createError({ statusCode: 400, statusMessage: 'invalid id' })
    const body = await readBody<{ name?: string; category?: string; location?: string; active?: boolean; metadata?: any }>(event)
    const updated = await prisma.resource.update({
        where: { id },
        data: {
            name: body?.name,
            category: body?.category,
            location: body?.location,
            active: body?.active,
            metadata: body?.metadata as any
        }
    })
    return updated
})



