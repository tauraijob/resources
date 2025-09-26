import { prisma } from '~~/server/utils/prisma'
import { requireUser } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
    const user = await requireUser(event)
    const resourceId = Number(getRouterParam(event, 'id'))

    if (Number.isNaN(resourceId)) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid resource ID' })
    }

    const body = await readBody<{ mileage: number; notes?: string }>(event)

    if (!body?.mileage || typeof body.mileage !== 'number' || body.mileage < 0) {
        throw createError({ statusCode: 400, statusMessage: 'Valid mileage is required' })
    }

    // Check if resource exists and is a car
    const resource = await prisma.resource.findUnique({
        where: { id: resourceId }
    })

    if (!resource) {
        throw createError({ statusCode: 404, statusMessage: 'Resource not found' })
    }

    if (resource.category.toLowerCase() !== 'car' && resource.category.toLowerCase() !== 'vehicle') {
        throw createError({ statusCode: 400, statusMessage: 'Mileage tracking is only available for cars/vehicles' })
    }

    // Validate mileage is not less than current mileage
    if (resource.currentMileage && body.mileage < resource.currentMileage) {
        throw createError({
            statusCode: 400,
            statusMessage: `Mileage cannot be less than current mileage (${resource.currentMileage} km)`
        })
    }

    // Create mileage log entry
    const mileageLog = await prisma.mileageLog.create({
        data: {
            resourceId,
            userId: user.id,
            mileage: body.mileage,
            notes: body.notes || null
        },
        include: {
            user: { select: { id: true, name: true, username: true, email: true } },
            resource: { select: { id: true, name: true, category: true } }
        }
    })

    // Update resource current mileage
    await prisma.resource.update({
        where: { id: resourceId },
        data: { currentMileage: body.mileage }
    })

    return {
        success: true,
        mileageLog,
        message: `Mileage updated to ${body.mileage} km for ${resource.name}`
    }
})
