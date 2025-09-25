# Email Setup with Mailtrap

This document explains how to set up and use the email functionality with Mailtrap in your Webdev Resources application.

## Prerequisites

1. **Mailtrap Account**: Sign up at [mailtrap.io](https://mailtrap.io)
2. **API Token**: Get your API token from your Mailtrap account

## Configuration

### 1. Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Database
DATABASE_URL=mysql://root:@localhost:3306/resources

# JWT Secret
JWT_SECRET=lucerna-health-secret-key-2024

# Mailtrap Configuration
MAILTRAP_API_TOKEN=your_actual_api_token_here
FROM_EMAIL=noreply@webdev.co.zw

# Nuxt Auth Secret
NUXT_AUTH_SECRET=your-secret-key-change-this-in-production
```

### 2. Replace the API Token

Replace `<YOUR_API_TOKEN>` in the `.env` file with your actual Mailtrap API token.

## Email Features

### Automatic Emails

The system automatically sends emails for:

1. **Welcome Email**: When a new user is registered
2. **Booking Approval**: When an admin approves a booking
3. **Booking Rejection**: When an admin rejects a booking (with optional reason)
4. **New Booking Notifications**: When employees submit booking requests (sent to all admins)
5. **Booking Status Updates**: When booking status changes (sent to employees)
6. **Upcoming Booking Reminders**: Scheduled reminders for upcoming bookings
7. **Password Reset**: When users request password reset
8. **OTP Login Codes**: One-time passwords for secure login

### Email Templates

The system includes comprehensive email templates:

- **Welcome Email**: Professional welcome message for new users with account details
- **Forgot Password**: Secure password reset with expiration notice
- **OTP Login**: One-time password with security reminders
- **Booking Approved**: Celebration template with booking details and next steps
- **Booking Rejected**: Professional rejection with alternative suggestions
- **New Booking Request**: Admin notification with approval workflow
- **Upcoming Booking Reminder**: Friendly reminder with preparation checklist

### Domain Restriction

**Important**: Only users with `@webdev.co.zw` email addresses can:
- Create new accounts
- Request password resets
- Use OTP login
- Receive system emails

This ensures that only authorized company employees can access the system.

## Testing Email Functionality

### 1. Admin Email Test Page

Navigate to `/admin/email-test` (admin access required) to:

- Send test emails to any address
- Preview all 7 email templates
- Test the complete email system
- Send sample emails for each template type

### 2. API Endpoint

You can also test emails via the API:

```bash
curl -X POST http://localhost:3000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "message": "This is a test message"
  }'
```

## Email Configuration Details

### Mailtrap SMTP Settings

The application uses the following Mailtrap configuration:

```javascript
{
  host: "live.smtp.mailtrap.io",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "apismtp@mailtrap.io",
    pass: "YOUR_API_TOKEN"
  },
  tls: {
    rejectUnauthorized: false
  }
}
```

**Your Mailtrap Credentials:**
- **Host**: `live.smtp.mailtrap.io`
- **Port**: `587` (recommended)
- **Username**: `apismtp@mailtrap.io`
- **Password**: Your API token
- **TLS**: Required (STARTTLS on port 587)

### Email Templates Location

Email templates are defined in `server/utils/email.ts` and include:

- HTML and text versions
- Professional styling
- Dynamic content insertion
- Brand colors and styling

## Troubleshooting

### Common Issues

1. **"Failed to send email" errors**:
   - Check your API token is correct
   - Verify your Mailtrap account is active
   - Check the server logs for detailed error messages

2. **Emails not being received**:
   - Check your spam folder
   - Verify the recipient email address
   - Check Mailtrap dashboard for delivery status

3. **Template rendering issues**:
   - Check the email template syntax
   - Verify all required parameters are provided

### Debug Mode

Enable debug logging by checking the server console for email-related messages:

- `Email sent successfully: [messageId]`
- `Failed to send email: [error]`

## Security Notes

- Never commit your `.env` file to version control
- Use environment variables for all sensitive configuration
- The email system gracefully handles failures without breaking the main application flow

## Production Considerations

For production deployment:

1. **Use a production email service** (SendGrid, AWS SES, etc.)
2. **Update SMTP settings** in `server/utils/email.ts`
3. **Set up proper DNS records** for your domain
4. **Configure email authentication** (SPF, DKIM, DMARC)
5. **Monitor email delivery rates** and bounce handling

## Support

If you encounter issues with the email setup:

1. Check the server logs for error messages
2. Verify your Mailtrap account status
3. Test with the admin email test page
4. Review the API endpoint responses
