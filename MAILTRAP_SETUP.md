# Mailtrap Setup Guide

## Quick Setup

### 1. Get Your API Token
1. Log into your Mailtrap account
2. Go to your project settings
3. Copy your **API Token** (not the password)

### 2. Configuration Complete! ✅
Your Mailtrap sandbox credentials are already configured in the system:

```javascript
// Mailtrap Sandbox Configuration (Already Set)
{
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "6105fc6dc2fcd3",
    pass: "93d3d347b64ed9"
  }
}
```

**No .env file needed** - your credentials are hardcoded for testing!

### 3. Test the System
1. Navigate to `/admin/email-test` (admin access required)
2. Enter your email address
3. Click "Send Test Email" or try any of the template samples
4. Check your Mailtrap inbox for the received email

## Your Mailtrap Sandbox Credentials

- **Host**: `sandbox.smtp.mailtrap.io`
- **Port**: `2525`
- **Username**: `6105fc6dc2fcd3`
- **Password**: `93d3d347b64ed9`
- **Environment**: Sandbox (for testing only)

## Email Templates Available

✅ **Welcome Email** - New user onboarding
✅ **Forgot Password** - Password reset with security
✅ **OTP Login** - One-time login codes
✅ **Booking Approved** - Celebration with next steps
✅ **Booking Rejected** - Professional rejection
✅ **New Booking Request** - Admin notifications
✅ **Upcoming Booking Reminder** - Friendly reminders

## Domain Restriction

Only users with `@webdev.co.zw` email addresses can:
- Create accounts
- Request password resets
- Use OTP login
- Receive system emails

## Troubleshooting

### If emails don't send:
1. Check your API token is correct
2. Verify your Mailtrap account is active
3. Check the server console for error messages
4. Ensure your `.env` file is in the project root

### If you get authentication errors:
1. Double-check your API token
2. Make sure you're using the correct username: `apismtp@mailtrap.io`
3. Verify your Mailtrap account has sending permissions

## Ready to Go!

Once you add your API token to the `.env` file, your email system will be fully functional with:
- Beautiful, professional email templates
- Automatic notifications for all booking activities
- Secure domain restrictions
- Complete testing interface

🎉 **Your email system is ready!**
