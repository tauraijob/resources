import { prisma } from './prisma'

/**
 * Updates the status of a resource based on current bookings
 * @param resourceId - The ID of the resource to update
 */
export async function updateResourceStatus(resourceId: number): Promise<void> {
    const now = new Date()

    // Find the current active booking for this resource
    const currentBooking = await prisma.booking.findFirst({
        where: {
            resourceId,
            status: 'APPROVED',
            startTime: { lte: now },
            endTime: { gt: now }
        },
        orderBy: { endTime: 'asc' }
    })

    // Update resource status based on whether it's currently in use
    const status = currentBooking ? 'IN_USE' : 'AVAILABLE'

    await prisma.resource.update({
        where: { id: resourceId },
        data: { status }
    })
}

/**
 * Updates the status of all resources based on current bookings
 */
export async function updateAllResourceStatuses(): Promise<void> {
    const resources = await prisma.resource.findMany({
        where: { active: true },
        select: { id: true }
    })

    await Promise.all(
        resources.map(resource => updateResourceStatus(resource.id))
    )
}
