import { google } from 'googleapis'

// Google Calendar configuration
const GOOGLE_CALENDAR_ID = 'primary' // Use primary calendar, or specify a specific calendar ID

// Create Google Calendar service
const createCalendarService = () => {
    const config = useRuntimeConfig()

    if (!config.googleClientId || !config.googleClientSecret || !config.googleRefreshToken) {
        throw new Error('Google Calendar credentials not configured')
    }

    const oauth2Client = new google.auth.OAuth2(
        config.googleClientId,
        config.googleClientSecret,
        'http://localhost:3000' // Redirect URI
    )

    oauth2Client.setCredentials({
        refresh_token: config.googleRefreshToken
    })

    return google.calendar({ version: 'v3', auth: oauth2Client })
}

// Create a calendar event for a booking
export const createBookingEvent = async (
    bookingId: number,
    resourceName: string,
    userName: string,
    userEmail: string,
    startTime: Date,
    endTime: Date,
    location?: string,
    notes?: string
) => {
    try {
        const calendar = createCalendarService()

        const event = {
            summary: `📅 ${resourceName} - ${userName}`,
            description: `Resource Booking\n\nResource: ${resourceName}\nUser: ${userName} (${userEmail})\nBooking ID: ${bookingId}${notes ? `\nNotes: ${notes}` : ''}`,
            start: {
                dateTime: startTime.toISOString(),
                timeZone: 'Africa/Harare', // Zimbabwe timezone
            },
            end: {
                dateTime: endTime.toISOString(),
                timeZone: 'Africa/Harare',
            },
            location: location || 'Webdev Resources',
            attendees: [
                {
                    email: userEmail,
                    displayName: userName,
                },
            ],
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 }, // 24 hours before
                    { method: 'popup', minutes: 30 }, // 30 minutes before
                ],
            },
            colorId: '2', // Green color for bookings
        }

        const response = await calendar.events.insert({
            calendarId: GOOGLE_CALENDAR_ID,
            requestBody: event,
        })

        return {
            success: true,
            eventId: response.data.id,
            eventLink: response.data.htmlLink,
        }
    } catch (error: any) {
        console.error('Failed to create Google Calendar event:', error)
        return {
            success: false,
            error: error.message,
        }
    }
}

// Update a calendar event
export const updateBookingEvent = async (
    eventId: string,
    resourceName: string,
    userName: string,
    userEmail: string,
    startTime: Date,
    endTime: Date,
    location?: string,
    notes?: string
) => {
    try {
        const calendar = createCalendarService()

        const event = {
            summary: `📅 ${resourceName} - ${userName}`,
            description: `Resource Booking\n\nResource: ${resourceName}\nUser: ${userName} (${userEmail})${notes ? `\nNotes: ${notes}` : ''}`,
            start: {
                dateTime: startTime.toISOString(),
                timeZone: 'Africa/Harare',
            },
            end: {
                dateTime: endTime.toISOString(),
                timeZone: 'Africa/Harare',
            },
            location: location || 'Webdev Resources',
            attendees: [
                {
                    email: userEmail,
                    displayName: userName,
                },
            ],
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 },
                    { method: 'popup', minutes: 30 },
                ],
            },
            colorId: '2',
        }

        const response = await calendar.events.update({
            calendarId: GOOGLE_CALENDAR_ID,
            eventId: eventId,
            requestBody: event,
        })

        return {
            success: true,
            eventId: response.data.id,
            eventLink: response.data.htmlLink,
        }
    } catch (error: any) {
        console.error('Failed to update Google Calendar event:', error)
        return {
            success: false,
            error: error.message,
        }
    }
}

// Delete a calendar event
export const deleteBookingEvent = async (eventId: string) => {
    try {
        const calendar = createCalendarService()

        await calendar.events.delete({
            calendarId: GOOGLE_CALENDAR_ID,
            eventId: eventId,
        })

        return { success: true }
    } catch (error: any) {
        console.error('Failed to delete Google Calendar event:', error)
        return {
            success: false,
            error: error.message,
        }
    }
}

// List upcoming events (for testing)
export const listUpcomingEvents = async (maxResults: number = 10) => {
    try {
        const calendar = createCalendarService()

        const response = await calendar.events.list({
            calendarId: GOOGLE_CALENDAR_ID,
            timeMin: new Date().toISOString(),
            maxResults: maxResults,
            singleEvents: true,
            orderBy: 'startTime',
        })

        return {
            success: true,
            events: response.data.items || [],
        }
    } catch (error: any) {
        console.error('Failed to list Google Calendar events:', error)
        return {
            success: false,
            error: error.message,
            events: [],
        }
    }
}

// Create a personal calendar event for a user
export const createPersonalCalendarEvent = async (
    userRefreshToken: string,
    bookingId: number,
    resourceName: string,
    userName: string,
    startTime: Date,
    endTime: Date,
    location?: string,
    notes?: string
) => {
    try {
        const config = useRuntimeConfig()

        if (!config.googleClientId || !config.googleClientSecret) {
            throw new Error('Google Calendar credentials not configured')
        }

        const oauth2Client = new google.auth.OAuth2(
            config.googleClientId,
            config.googleClientSecret,
            'http://localhost:3000'
        )

        oauth2Client.setCredentials({
            refresh_token: userRefreshToken
        })

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

        const event = {
            summary: `📅 ${resourceName} Booking`,
            description: `Resource Booking\n\nResource: ${resourceName}\nBooking ID: ${bookingId}\nLocation: ${location || 'Not specified'}${notes ? `\nNotes: ${notes}` : ''}`,
            start: {
                dateTime: startTime.toISOString(),
                timeZone: 'Africa/Harare',
            },
            end: {
                dateTime: endTime.toISOString(),
                timeZone: 'Africa/Harare',
            },
            location: location || 'Webdev Resources',
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 }, // 24 hours before
                    { method: 'popup', minutes: 30 },      // 30 minutes before
                ],
            },
            colorId: '2', // Green color for bookings
        }

        const response = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: event,
        })

        return {
            success: true,
            eventId: response.data.id,
            htmlLink: response.data.htmlLink,
        }
    } catch (error: any) {
        console.error('Error creating personal calendar event:', error.message)
        return {
            success: false,
            error: error.message,
        }
    }
}
