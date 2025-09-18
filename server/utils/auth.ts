import { H3Event, getCookie, setCookie, deleteCookie } from 'h3'
import { prisma } from './prisma'
import type { User, UserRole } from '@prisma/client'

const AUTH_COOKIE = 'webdev_auth'

export async function getSessionUser(event: H3Event): Promise<User | null> {
    const userId = getCookie(event, AUTH_COOKIE)
    if (!userId) return null
    const id = Number(userId)
    if (Number.isNaN(id)) return null
    return prisma.user.findUnique({ where: { id } })
}

export function setSessionUser(event: H3Event, userId: number) {
    setCookie(event, AUTH_COOKIE, String(userId), {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7
    })
}

export function clearSession(event: H3Event) {
    deleteCookie(event, AUTH_COOKIE, { path: '/' })
}

export async function requireUser(event: H3Event): Promise<User> {
    const user = await getSessionUser(event)
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }
    if ((user as any).active === false) {
        clearSession(event)
        throw createError({ statusCode: 403, statusMessage: 'Account suspended' })
    }
    return user
}

export async function requireAdmin(event: H3Event): Promise<User> {
    const user = await requireUser(event)
    if (user.role !== 'ADMIN') {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
    }
    return user
}

export async function ensureAdminSeed(): Promise<void> {
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
    if (!admin) {
        await prisma.user.create({
            data: {
                email: 'admin@webdev.co.zw',
                username: 'admin',
                passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
                name: 'Admin',
                role: 'ADMIN'
            }
        })
    }
}



