import { google } from 'googleapis'

export default defineEventHandler(async (event) => {
    try {
        const config = useRuntimeConfig()

        console.log('Google Calendar connect - config check:', {
            hasClientId: !!config.googleClientId,
            hasClientSecret: !!config.googleClientSecret,
            clientIdLength: config.googleClientId?.length || 0,
            clientSecretLength: config.googleClientSecret?.length || 0
        })

        if (!config.googleClientId || !config.googleClientSecret) {
            console.error('Google Calendar credentials missing:', {
                clientId: config.googleClientId ? 'present' : 'missing',
                clientSecret: config.googleClientSecret ? 'present' : 'missing'
            })
            throw createError({
                statusCode: 500,
                statusMessage: 'Google Calendar integration not configured'
            })
        }

        // Get the base URL from the request
        const protocol = getHeader(event, 'x-forwarded-proto') || 'http'
        const host = getHeader(event, 'host') || 'localhost:3000'
        const redirectUri = `${protocol}://${host}/api/google-callback`

        console.log('Generated redirect URI:', redirectUri)

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

        console.log('Generated auth URL:', authUrl)
        return { authUrl }
    } catch (error) {
        console.error('Google Calendar connect error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: `Google Calendar connection failed: ${error.message}`
        })
    }
})
