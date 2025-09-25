import { sendEmail } from '../../utils/email'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const { to, subject, message } = body

        if (!to || !subject || !message) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Missing required fields: to, subject, message'
            })
        }

        const result = await sendEmail(
            to,
            subject,
            `<p>${message}</p>`,
            message
        )

        if (result.success) {
            return {
                success: true,
                message: 'Email sent successfully',
                messageId: result.messageId
            }
        } else {
            throw createError({
                statusCode: 500,
                statusMessage: result.error || 'Failed to send email'
            })
        }
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Internal server error'
        })
    }
})
