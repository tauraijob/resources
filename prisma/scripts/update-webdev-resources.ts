import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // Rename boardrooms
    const renameMap: Record<string, string> = {
        'Boardroom 1': 'Outside Boardroom',
        'Boardroom 2': 'Inside Boardroom'
    }

    for (const [oldName, newName] of Object.entries(renameMap)) {
        const existing = await prisma.resource.findFirst({ where: { name: oldName } })
        if (existing) {
            await prisma.resource.update({ where: { id: existing.id }, data: { name: newName } })
            console.log(`Renamed ${oldName} -> ${newName}`)
        }
    }

    // Remove initial dummy resources and their bookings/approvals
    const removeNames = ['Toyota Corolla', 'Boardroom Alpha', 'Projector X1']
    const toRemove = await prisma.resource.findMany({ where: { name: { in: removeNames } }, select: { id: true, name: true } })

    if (toRemove.length) {
        const ids = toRemove.map(r => r.id)
        const bookings = await prisma.booking.findMany({ where: { resourceId: { in: ids } }, select: { id: true } })
        const bookingIds = bookings.map(b => b.id)

        if (bookingIds.length) {
            await prisma.approval.deleteMany({ where: { bookingId: { in: bookingIds } } })
            await prisma.booking.deleteMany({ where: { id: { in: bookingIds } } })
        }

        await prisma.resource.deleteMany({ where: { id: { in: ids } } })
        console.log(`Removed resources: ${toRemove.map(r => r.name).join(', ')}`)
    } else {
        console.log('No initial dummy resources found to remove.')
    }
}

main()
    .catch((e) => { console.error(e); process.exit(1) })
    .finally(async () => { await prisma.$disconnect() })


