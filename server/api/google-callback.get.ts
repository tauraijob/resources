import { google } from 'googleapis'
import { prisma } from '~~/server/utils/prisma'
import { requireUser } from '~~/server/utils/auth'

const config = useRuntimeConfig()

const CLIENT_ID = config.googleClientId
const CLIENT_SECRET = config.googleClientSecret
// Get the base URL from the request
const getRedirectUri = (event: any) => {
    const protocol = getHeader(event, 'x-forwarded-proto') || 'http'
    const host = getHeader(event, 'host') || 'localhost:3000'
    return `${protocol}://${host}/api/google-callback`
}

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event)
        const code = query.code as string
        const error = query.error as string

        if (error) {
            console.error('Google OAuth error:', error)
            return sendRedirect(event, '/dashboard?error=oauth_error')
        }

        if (!code) {
            console.error('No authorization code received')
            return sendRedirect(event, '/dashboard?error=no_code')
        }

        // Get the current user (they should be logged in)
        const user = await requireUser(event)

        // Exchange authorization code for tokens
        const redirectUri = getRedirectUri(event)
        const oauth2Client = new google.auth.OAuth2(
            CLIENT_ID,
            CLIENT_SECRET,
            redirectUri
        )

        const { tokens } = await oauth2Client.getToken(code)
        oauth2Client.setCredentials(tokens)

        // Store the refresh token in the database
        if (tokens.refresh_token) {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    googleRefreshToken: tokens.refresh_token,
                    googleCalendarConnected: true
                }
            })

            console.log('Google Calendar connected successfully for user:', user.email)
        }

        // Redirect back to dashboard with success message
        return sendRedirect(event, '/dashboard?success=google_calendar_connected')

    } catch (error) {
        console.error('Google Calendar callback error:', error)
        return sendRedirect(event, '/dashboard?error=callback_failed')
    }
})
