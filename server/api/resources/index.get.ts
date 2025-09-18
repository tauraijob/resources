import { prisma } from '~~/server/utils/prisma'

export default defineEventHandler(async () => {
    const resources = await prisma.resource.findMany({ orderBy: { name: 'asc' } })
    return resources
})



