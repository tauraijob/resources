import { prisma } from '~~/server/utils/prisma'
import { requireAdmin } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
    await requireAdmin(event)
    const body = await readBody<{ name: string; category: string; location?: string; metadata?: any }>(event)
    if (!body?.name || !body?.category) {
        throw createError({ statusCode: 400, statusMessage: 'name and category required' })
    }
    const resource = await prisma.resource.create({
        data: {
            name: body.name,
            category: body.category,
            location: body.location ?? null,
            metadata: body.metadata ?? null
        }
    })
    return resource
})



