import { prisma } from '~~/server/utils/prisma'
import { requireUser } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
    const user = await requireUser(event)
    const resourceId = Number(getRouterParam(event, 'id'))

    if (Number.isNaN(resourceId)) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid resource ID' })
    }

    const query = getQuery(event)
    const limit = query.limit ? Number(query.limit) : 50
    const offset = query.offset ? Number(query.offset) : 0

    // Check if resource exists
    const resource = await prisma.resource.findUnique({
        where: { id: resourceId },
        select: { id: true, name: true, category: true, currentMileage: true }
    })

    if (!resource) {
        throw createError({ statusCode: 404, statusMessage: 'Resource not found' })
    }

    // Get mileage logs
    const mileageLogs = await prisma.mileageLog.findMany({
        where: { resourceId },
        include: {
            user: { select: { id: true, name: true, username: true, email: true } }
        },
        orderBy: { loggedAt: 'desc' },
        take: limit,
        skip: offset
    })

    // Get total count
    const totalCount = await prisma.mileageLog.count({
        where: { resourceId }
    })

    return {
        resource,
        mileageLogs,
        pagination: {
            total: totalCount,
            limit,
            offset,
            hasMore: offset + limit < totalCount
        }
    }
})
