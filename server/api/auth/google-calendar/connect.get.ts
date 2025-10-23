import { google } from 'googleapis'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()

    if (!config.googleClientId || !config.googleClientSecret) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Google Calendar integration not configured'
        })
    }

    // Get the base URL from the request
    const protocol = getHeader(event, 'x-forwarded-proto') || 'http'
    const host = getHeader(event, 'host') || 'localhost:3000'
    const redirectUri = `${protocol}://${host}/api/google-callback`

    const oauth2Client = new google.auth.OAuth2(
        config.googleClientId,
        config.googleClientSecret,
        redirectUri
    )

    const scopes = [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
    ]

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent' // Force consent screen to get refresh token
    })

    return { authUrl }
})
