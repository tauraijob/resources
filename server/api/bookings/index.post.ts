import { prisma } from '~~/server/utils/prisma'
import { requireUser } from '~~/server/utils/auth'
import { sendBookingNotificationAdmin } from '~~/server/utils/email'
import { createBookingEvent } from '~~/server/utils/google-calendar'

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
        include: {
            resource: true,
            user: { select: { id: true, email: true, name: true, username: true, googleCalendarConnected: true, googleRefreshToken: true } }
        }
    })

    // Create Google Calendar events
    let googleEventId = null
    try {
        const userName = user.name || user.username || user.email.split('@')[0]

        // 1. Create event in system calendar
        const systemCalendarResult = await createBookingEvent(
            booking.id,
            booking.resource.name,
            userName,
            user.email,
            start,
            end,
            booking.location || undefined,
            booking.notes || undefined
        )

        if (systemCalendarResult.success && systemCalendarResult.eventId) {
            googleEventId = systemCalendarResult.eventId
            // Update booking with Google Calendar event ID
            await prisma.booking.update({
                where: { id: booking.id },
                data: { googleEventId }
            })
            console.log('System Google Calendar event created successfully:', systemCalendarResult.eventId)
        } else {
            console.error('Failed to create system Google Calendar event:', systemCalendarResult.error)
        }

        // 2. Create event in user's personal calendar (if they have connected Google Calendar)
        if (user.googleCalendarConnected && user.googleRefreshToken) {
            try {
                const { createPersonalCalendarEvent } = await import('~~/server/utils/google-calendar')
                const personalCalendarResult = await createPersonalCalendarEvent(
                    user.googleRefreshToken,
                    booking.id,
                    booking.resource.name,
                    userName,
                    start,
                    end,
                    booking.location || undefined,
                    booking.notes || undefined
                )

                if (personalCalendarResult.success) {
                    console.log('Personal Google Calendar event created successfully for user:', user.email)
                } else {
                    console.error('Failed to create personal Google Calendar event for user:', personalCalendarResult.error)
                }
            } catch (personalCalendarError) {
                console.error('Personal Google Calendar integration error for user:', personalCalendarError)
            }
        } else {
            console.log('User has not connected Google Calendar, skipping personal calendar event creation')
        }

        // 3. Create events in admin personal calendars (if they have connected Google Calendar)
        try {
            const admins = await prisma.user.findMany({
                where: {
                    role: 'ADMIN',
                    active: true,
                    googleCalendarConnected: true,
                    googleRefreshToken: { not: null }
                },
                select: { email: true, name: true, username: true, googleRefreshToken: true }
            })

            for (const admin of admins) {
                if (admin.googleRefreshToken) {
                    try {
                        const { createPersonalCalendarEvent } = await import('~~/server/utils/google-calendar')
                        const adminCalendarResult = await createPersonalCalendarEvent(
                            admin.googleRefreshToken,
                            booking.id,
                            booking.resource.name,
                            userName,
                            start,
                            end,
                            booking.location || undefined,
                            booking.notes || undefined
                        )

                        if (adminCalendarResult.success) {
                            console.log('Admin personal Google Calendar event created successfully for:', admin.email)
                        } else {
                            console.error('Failed to create admin personal Google Calendar event for:', admin.email, adminCalendarResult.error)
                        }
                    } catch (adminCalendarError) {
                        console.error('Admin personal Google Calendar integration error for:', admin.email, adminCalendarError)
                    }
                }
            }
        } catch (adminCalendarError) {
            console.error('Admin personal Google Calendar integration error:', adminCalendarError)
        }

    } catch (calendarError) {
        console.error('Google Calendar integration error:', calendarError)
        // Don't fail the booking creation if calendar fails
    }

    // Prepare email data (used by both admin and employee emails)
    const userName = user.name || user.username || user.email.split('@')[0]
    const startTime = new Date(booking.startTime).toLocaleString()
    const endTime = new Date(booking.endTime).toLocaleString()
    const location = booking.location || 'Not specified'

    // Send notification to all admins
    try {
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN', active: true },
            select: { email: true, name: true, username: true }
        })

        // Send email to all admins (with rate limiting)
        for (const admin of admins) {
            try {
                const adminName = admin.name || admin.username || admin.email.split('@')[0]
                await sendBookingNotificationAdmin(
                    admin.email,
                    adminName,
                    userName,
                    booking.resource.name,
                    startTime,
                    endTime,
                    location
                )
                console.log(`Admin notification sent to ${admin.email}`)
            } catch (emailError) {
                console.error(`Failed to send email to admin ${admin.email}:`, emailError)
                // Continue with other admins even if one fails
            }
        }
        console.log('Admin notification emails sent successfully')
    } catch (emailError) {
        console.error('Failed to send admin notification emails:', emailError)
        // Don't fail the booking creation if email fails
    }

    // Send confirmation email to the employee who created the booking
    try {
        const { sendBookingConfirmationEmail } = await import('~~/server/utils/email')
        await sendBookingConfirmationEmail(
            user.email,
            userName,
            booking.resource.name,
            startTime,
            endTime,
            location,
            booking.id
        )
        console.log('Employee confirmation email sent successfully')
    } catch (emailError) {
        console.error('Failed to send employee confirmation email:', emailError)
        // Don't fail the booking creation if email fails
    }

    return booking
})



