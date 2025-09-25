import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    // Users
    // Default password for all users: "SecurePass123!"
    // SHA256 hash: ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f
    const admin = await prisma.user.upsert({
        where: { email: 'admin@webdev.co.zw' },
        update: {},
        create: { email: 'admin@webdev.co.zw', username: 'admin', passwordHash: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', name: 'Admin', role: 'ADMIN' }
    })

    const admin2 = await prisma.user.upsert({
        where: { email: 'manager@webdev.co.zw' },
        update: {},
        create: { email: 'manager@webdev.co.zw', username: 'manager', passwordHash: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', name: 'Manager', role: 'ADMIN' }
    })

    const alice = await prisma.user.upsert({
        where: { email: 'alice@webdev.co.zw' },
        update: {},
        create: { email: 'alice@webdev.co.zw', username: 'alice', passwordHash: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', name: 'Alice Employee' }
    })

    const bob = await prisma.user.upsert({
        where: { email: 'bob@webdev.co.zw' },
        update: {},
        create: { email: 'bob@webdev.co.zw', username: 'bob', passwordHash: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', name: 'Bob Employee' }
    })

    // Helper create-if-missing by name
    async function ensureResource(name: string, category: string, location?: string | null, metadata?: any) {
        const existing = await prisma.resource.findFirst({ where: { name } })
        if (existing) return existing
        return prisma.resource.create({ data: { name, category, location: location ?? null, metadata: metadata ?? null } })
    }

    // Company resources
    const nissanXTrail = await ensureResource('Nissan XTrail', 'Car', 'Garage B', { owner: 'Paynow' })
    const hondaFit = await ensureResource('Honda Fit', 'Car', 'Garage C', { owner: 'Property' })
    const prius = await ensureResource('Prius', 'Car', 'Garage D', { owner: 'Online Solutions' })
    const boardroom1 = await ensureResource('Boardroom 1', 'Boardroom', 'HQ 1st Floor', { seats: 10 })
    const boardroom2 = await ensureResource('Boardroom 2', 'Boardroom', 'HQ 2nd Floor', { seats: 12 })

    const now = new Date()
    const in1h = new Date(now.getTime() + 60 * 60 * 1000)
    const in2h = new Date(now.getTime() + 2 * 60 * 60 * 1000)

    // Bookings
    const booking1 = await prisma.booking.create({
        data: {
            resourceId: nissanXTrail.id,
            userId: alice.id,
            location: 'HQ',
            startTime: in1h,
            endTime: in2h,
            status: 'PENDING'
        }
    })

    const booking2 = await prisma.booking.create({
        data: {
            resourceId: boardroom1.id,
            userId: bob.id,
            location: 'HQ',
            startTime: new Date(now.getTime() + 24 * 3600 * 1000),
            endTime: new Date(now.getTime() + 25 * 3600 * 1000),
            status: 'APPROVED',
            approval: {
                create: {
                    adminId: admin.id,
                    status: 'APPROVED',
                    note: 'Looks good'
                }
            }
        }
    })

    await prisma.booking.create({
        data: {
            resourceId: prius.id,
            userId: alice.id,
            location: 'HQ',
            startTime: new Date(now.getTime() + 48 * 3600 * 1000),
            endTime: new Date(now.getTime() + 49 * 3600 * 1000),
            status: 'APPROVED',
            approval: {
                create: {
                    adminId: admin.id,
                    status: 'APPROVED',
                    note: 'Vehicle ready'
                }
            }
        }
    })

    console.log('Seeded company resources and bookings')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
