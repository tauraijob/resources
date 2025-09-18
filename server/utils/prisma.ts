import { PrismaClient } from '@prisma/client'

type GlobalWithPrisma = typeof globalThis & { __prisma?: PrismaClient }
const g = globalThis as GlobalWithPrisma

export const prisma: PrismaClient = g.__prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
    g.__prisma = prisma
}



