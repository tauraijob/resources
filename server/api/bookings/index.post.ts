import { prisma } from '~~/server/utils/prisma'
import { requireUser } from '~~/server/utils/auth'

type Body = {
    resourceId: number
    location?: string
    startTime: string
    endTime: string
    notes?: string
}

export default defineEventHandler(async (event) => {
    const user = await requireUser(event)
    const body = await readBody<Body>(event)
    if (!body?.resourceId || !body?.startTime || !body?.endTime) {
        throw createError({ statusCode: 400, statusMessage: 'resourceId, startTime, endTime are required' })
    }
    const start = new Date(body.startTime)
    const end = new Date(body.endTime)
    if (!(start < end)) {
        throw createError({ statusCode: 400, statusMessage: 'startTime must be before endTime' })
    }
    const overlap = await prisma.booking.findFirst({
        where: {
            resourceId: body.resourceId,
            status: { in: ['PENDING', 'APPROVED'] },
            NOT: [
                { endTime: { lte: start } },
                { startTime: { gte: end } }
            ]
        }
    })
    if (overlap) {
        throw createError({ statusCode: 409, statusMessage: 'Resource already booked for this time' })
    }
    const booking = await prisma.booking.create({
        data: {
            resourceId: body.resourceId,
            userId: user.id,
            location: body.location ?? null,
            startTime: start,
            endTime: end,
            notes: body.notes ?? null
        },
        include: { resource: true }
    })
    return booking
})



