import nodemailer from 'nodemailer'

// Create reusable transporter object using Mailtrap SMTP
const createTransporter = () => {
    const config = useRuntimeConfig()
    return nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        secure: false, // true for 465, false for other ports
        auth: {
            user: "6105fc6dc2fcd3",
            pass: "93d3d347b64ed9"
        }
    })
}

// Email templates
export const emailTemplates = {
    bookingApproved: (userName: string, resourceName: string, startTime: string, endTime: string) => ({
        subject: `Booking Approved - ${resourceName}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f1692a;">Booking Approved!</h2>
        <p>Hello ${userName},</p>
        <p>Great news! Your booking request has been approved.</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Booking Details:</h3>
          <p><strong>Resource:</strong> ${resourceName}</p>
          <p><strong>Start Time:</strong> ${startTime}</p>
          <p><strong>End Time:</strong> ${endTime}</p>
        </div>
        <p>You can view all your bookings in the dashboard.</p>
        <p>Best regards,<br>Webdev Resources Team</p>
      </div>
    `,
        text: `
      Booking Approved!
      
      Hello ${userName},
      
      Great news! Your booking request has been approved.
      
      Booking Details:
      - Resource: ${resourceName}
      - Start Time: ${startTime}
      - End Time: ${endTime}
      
      You can view all your bookings in the dashboard.
      
      Best regards,
      Webdev Resources Team
    `
    }),

    bookingRejected: (userName: string, resourceName: string, reason?: string) => ({
        subject: `Booking Rejected - ${resourceName}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">Booking Rejected</h2>
        <p>Hello ${userName},</p>
        <p>Unfortunately, your booking request has been rejected.</p>
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <h3 style="margin-top: 0; color: #333;">Booking Details:</h3>
          <p><strong>Resource:</strong> ${resourceName}</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        </div>
        <p>Please feel free to submit a new booking request or contact us if you have any questions.</p>
        <p>Best regards,<br>Webdev Resources Team</p>
      </div>
    `,
        text: `
      Booking Rejected
      
      Hello ${userName},
      
      Unfortunately, your booking request has been rejected.
      
      Booking Details:
      - Resource: ${resourceName}
      ${reason ? `- Reason: ${reason}` : ''}
      
      Please feel free to submit a new booking request or contact us if you have any questions.
      
      Best regards,
      Webdev Resources Team
    `
    }),

    welcomeEmail: (userName: string, userEmail: string) => ({
        subject: "Welcome to Webdev Resources!",
        html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #f1692a 0%, #e55a1a 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Welcome to Webdev Resources!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your account has been successfully created</p>
        </div>
        
        <div style="padding: 30px; background: #ffffff;">
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hello <strong>${userName}</strong>,</p>
          
          <p style="color: #666; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">
            Welcome to our resource management system! We're excited to have you on board. 
            Your account is now ready and you can start managing your resource bookings.
          </p>
          
          <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #f1692a;">
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">📋 Account Details</h3>
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
              <p style="margin: 5px 0; color: #555;"><strong>📧 Email:</strong> ${userEmail}</p>
              <p style="margin: 5px 0; color: #555;"><strong>👤 Username:</strong> ${userName}</p>
            </div>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 12px; margin: 25px 0;">
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">🚀 What you can do now:</h3>
            <ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>Browse and search available resources</li>
              <li>Make booking requests for meetings, vehicles, and equipment</li>
              <li>View your booking history and status</li>
              <li>Manage your profile and preferences</li>
              <li>Receive notifications about your bookings</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard" 
               style="background: linear-gradient(135deg, #f1692a 0%, #e55a1a 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 4px 15px rgba(241, 105, 42, 0.3);">
              🎯 Go to Dashboard
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 25px 0 0 0;">
            If you have any questions or need assistance, please don't hesitate to contact our support team.
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #e9ecef;">
          <p style="color: #666; font-size: 14px; margin: 0;">
            Best regards,<br>
            <strong style="color: #f1692a;">Webdev Resources Team</strong>
          </p>
        </div>
      </div>
    `,
        text: `
      Welcome to Webdev Resources!
      
      Hello ${userName},
      
      Welcome to our resource management system! Your account has been successfully created.
      
      Account Details:
      - Email: ${userEmail}
      - Username: ${userName}
      
      What you can do now:
      - Browse and search available resources
      - Make booking requests for meetings, vehicles, and equipment
      - View your booking history and status
      - Manage your profile and preferences
      - Receive notifications about your bookings
      
      If you have any questions or need assistance, please don't hesitate to contact our support team.
      
      Best regards,
      Webdev Resources Team
    `
    }),

    forgotPassword: (userName: string, resetLink: string, expiryTime: string) => ({
        subject: "Reset Your Password - Webdev Resources",
        html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #f1692a 0%, #e55a1a 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">🔐 Password Reset</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Secure password reset for your account</p>
        </div>
        
        <div style="padding: 30px; background: #ffffff;">
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hello <strong>${userName}</strong>,</p>
          
          <p style="color: #666; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">
            We received a request to reset your password for your Webdev Resources account. 
            If you made this request, click the button below to reset your password.
          </p>
          
          <div style="background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #f39c12;">
            <h3 style="margin: 0 0 15px 0; color: #856404; font-size: 18px;">⚠️ Security Notice</h3>
            <p style="color: #856404; font-size: 14px; margin: 0; line-height: 1.5;">
              This link will expire in <strong>${expiryTime}</strong>. If you didn't request this password reset, 
              please ignore this email and your password will remain unchanged.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background: linear-gradient(135deg, #f1692a 0%, #e55a1a 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 4px 15px rgba(241, 105, 42, 0.3);">
              🔑 Reset My Password
            </a>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin: 25px 0;">
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px;">🔒 Security Tips:</h3>
            <ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px; font-size: 14px;">
              <li>Use a strong, unique password</li>
              <li>Don't share your password with anyone</li>
              <li>Log out from shared computers</li>
              <li>Contact us if you notice any suspicious activity</li>
            </ul>
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 25px 0 0 0;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetLink}" style="color: #f1692a; word-break: break-all;">${resetLink}</a>
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #e9ecef;">
          <p style="color: #666; font-size: 14px; margin: 0;">
            Best regards,<br>
            <strong style="color: #f1692a;">Webdev Resources Security Team</strong>
          </p>
        </div>
      </div>
    `,
        text: `
      Password Reset - Webdev Resources
      
      Hello ${userName},
      
      We received a request to reset your password for your Webdev Resources account. 
      If you made this request, use the link below to reset your password.
      
      Reset Link: ${resetLink}
      
      This link will expire in ${expiryTime}. If you didn't request this password reset, 
      please ignore this email and your password will remain unchanged.
      
      Security Tips:
      - Use a strong, unique password
      - Don't share your password with anyone
      - Log out from shared computers
      - Contact us if you notice any suspicious activity
      
      Best regards,
      Webdev Resources Security Team
    `
    }),

    otpLogin: (userName: string, otpCode: string, expiryTime: string) => ({
        subject: "Your Login Code - Webdev Resources",
        html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #f1692a 0%, #e55a1a 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">🔐 Login Code</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your secure one-time password</p>
        </div>
        
        <div style="padding: 30px; background: #ffffff;">
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hello <strong>${userName}</strong>,</p>
          
          <p style="color: #666; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">
            You requested a login code for your Webdev Resources account. 
            Use the code below to complete your login:
          </p>
          
          <div style="background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); padding: 30px; border-radius: 12px; margin: 25px 0; text-align: center; border: 2px solid #28a745;">
            <h2 style="margin: 0; color: #155724; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${otpCode}
            </h2>
            <p style="color: #155724; font-size: 14px; margin: 10px 0 0 0;">Your 6-digit login code</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #f39c12;">
            <h3 style="margin: 0 0 10px 0; color: #856404; font-size: 16px;">⏰ Important:</h3>
            <p style="color: #856404; font-size: 14px; margin: 0; line-height: 1.5;">
              This code will expire in <strong>${expiryTime}</strong>. 
              If you didn't request this login code, please ignore this email and consider changing your password.
            </p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin: 25px 0;">
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px;">🛡️ Security Reminders:</h3>
            <ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px; font-size: 14px;">
              <li>Never share this code with anyone</li>
              <li>Our team will never ask for your login code</li>
              <li>Enter the code only on the official website</li>
              <li>Contact us if you notice any suspicious activity</li>
            </ul>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #e9ecef;">
          <p style="color: #666; font-size: 14px; margin: 0;">
            Best regards,<br>
            <strong style="color: #f1692a;">Webdev Resources Security Team</strong>
          </p>
        </div>
      </div>
    `,
        text: `
      Login Code - Webdev Resources
      
      Hello ${userName},
      
      You requested a login code for your Webdev Resources account. 
      Use the code below to complete your login:
      
      Your Login Code: ${otpCode}
      
      This code will expire in ${expiryTime}. If you didn't request this login code, 
      please ignore this email and consider changing your password.
      
      Security Reminders:
      - Never share this code with anyone
      - Our team will never ask for your login code
      - Enter the code only on the official website
      - Contact us if you notice any suspicious activity
      
      Best regards,
      Webdev Resources Security Team
    `
    }),

    bookingNotificationAdmin: (adminName: string, userName: string, resourceName: string, startTime: string, endTime: string, location: string) => ({
        subject: `New Booking Request - ${resourceName}`,
        html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #f1692a 0%, #e55a1a 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">📅 New Booking Request</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Requires your approval</p>
        </div>
        
        <div style="padding: 30px; background: #ffffff;">
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hello <strong>${adminName}</strong>,</p>
          
          <p style="color: #666; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">
            A new booking request has been submitted and requires your approval. 
            Please review the details below and take action.
          </p>
          
          <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #2196f3;">
            <h3 style="margin: 0 0 15px 0; color: #1565c0; font-size: 18px;">📋 Booking Details</h3>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 10px 0;">
              <p style="margin: 8px 0; color: #555;"><strong>🏢 Resource:</strong> ${resourceName}</p>
              <p style="margin: 8px 0; color: #555;"><strong>👤 Requested by:</strong> ${userName}</p>
              <p style="margin: 8px 0; color: #555;"><strong>📅 Start Time:</strong> ${startTime}</p>
              <p style="margin: 8px 0; color: #555;"><strong>📅 End Time:</strong> ${endTime}</p>
              <p style="margin: 8px 0; color: #555;"><strong>📍 Location:</strong> ${location}</p>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin" 
               style="background: linear-gradient(135deg, #f1692a 0%, #e55a1a 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 4px 15px rgba(241, 105, 42, 0.3);">
              🔍 Review & Approve
            </a>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin: 25px 0;">
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px;">⚡ Quick Actions:</h3>
            <ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px; font-size: 14px;">
              <li>Check for scheduling conflicts</li>
              <li>Verify resource availability</li>
              <li>Approve or reject with reason</li>
              <li>Notify the requester of your decision</li>
            </ul>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #e9ecef;">
          <p style="color: #666; font-size: 14px; margin: 0;">
            Best regards,<br>
            <strong style="color: #f1692a;">Webdev Resources System</strong>
          </p>
        </div>
      </div>
    `,
        text: `
      New Booking Request - ${resourceName}
      
      Hello ${adminName},
      
      A new booking request has been submitted and requires your approval.
      
      Booking Details:
      - Resource: ${resourceName}
      - Requested by: ${userName}
      - Start Time: ${startTime}
      - End Time: ${endTime}
      - Location: ${location}
      
      Please review and take action on this request.
      
      Best regards,
      Webdev Resources System
    `
    }),

    bookingNotificationEmployee: (userName: string, resourceName: string, startTime: string, endTime: string, status: string) => ({
        subject: `Booking ${status} - ${resourceName}`,
        html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #f1692a 0%, #e55a1a 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">📅 Booking ${status}</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your booking request has been ${status.toLowerCase()}</p>
        </div>
        
        <div style="padding: 30px; background: #ffffff;">
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hello <strong>${userName}</strong>,</p>
          
          <p style="color: #666; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">
            Your booking request has been ${status.toLowerCase()}. 
            ${status === 'APPROVED' ? 'You can now proceed with your planned activity.' : 'Please review the details and consider alternative options.'}
          </p>
          
          <div style="background: linear-gradient(135deg, ${status === 'APPROVED' ? '#d4edda 0%, #c3e6cb 100%' : '#f8d7da 0%, #f5c6cb 100%'}); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid ${status === 'APPROVED' ? '#28a745' : '#dc3545'};">
            <h3 style="margin: 0 0 15px 0; color: ${status === 'APPROVED' ? '#155724' : '#721c24'}; font-size: 18px;">📋 Booking Details</h3>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 10px 0;">
              <p style="margin: 8px 0; color: #555;"><strong>🏢 Resource:</strong> ${resourceName}</p>
              <p style="margin: 8px 0; color: #555;"><strong>📅 Start Time:</strong> ${startTime}</p>
              <p style="margin: 8px 0; color: #555;"><strong>📅 End Time:</strong> ${endTime}</p>
              <p style="margin: 8px 0; color: #555;"><strong>📊 Status:</strong> <span style="color: ${status === 'APPROVED' ? '#28a745' : '#dc3545'}; font-weight: 600;">${status}</span></p>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/bookings" 
               style="background: linear-gradient(135deg, #f1692a 0%, #e55a1a 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 4px 15px rgba(241, 105, 42, 0.3);">
              📋 View My Bookings
            </a>
          </div>
          
          ${status === 'APPROVED' ? `
          <div style="background: #d4edda; padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #28a745;">
            <h3 style="margin: 0 0 15px 0; color: #155724; font-size: 16px;">✅ Next Steps:</h3>
            <ul style="color: #155724; line-height: 1.8; margin: 0; padding-left: 20px; font-size: 14px;">
              <li>Arrive on time for your booking</li>
              <li>Bring any required equipment or materials</li>
              <li>Follow the resource usage guidelines</li>
              <li>Contact us if you need to make changes</li>
            </ul>
          </div>
          ` : `
          <div style="background: #f8d7da; padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #dc3545;">
            <h3 style="margin: 0 0 15px 0; color: #721c24; font-size: 16px;">💡 What to do next:</h3>
            <ul style="color: #721c24; line-height: 1.8; margin: 0; padding-left: 20px; font-size: 14px;">
              <li>Check for alternative time slots</li>
              <li>Consider different resources if available</li>
              <li>Contact the admin for more information</li>
              <li>Submit a new booking request</li>
            </ul>
          </div>
          `}
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #e9ecef;">
          <p style="color: #666; font-size: 14px; margin: 0;">
            Best regards,<br>
            <strong style="color: #f1692a;">Webdev Resources Team</strong>
          </p>
        </div>
      </div>
    `,
        text: `
      Booking ${status} - ${resourceName}
      
      Hello ${userName},
      
      Your booking request has been ${status.toLowerCase()}.
      
      Booking Details:
      - Resource: ${resourceName}
      - Start Time: ${startTime}
      - End Time: ${endTime}
      - Status: ${status}
      
      ${status === 'APPROVED' ? 'You can now proceed with your planned activity.' : 'Please review the details and consider alternative options.'}
      
      Best regards,
      Webdev Resources Team
    `
    }),

    upcomingBookingReminder: (userName: string, resourceName: string, startTime: string, endTime: string, location: string, timeUntil: string) => ({
        subject: `Reminder: Upcoming Booking - ${resourceName}`,
        html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
        <div style="background: linear-gradient(135deg, #f1692a 0%, #e55a1a 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">⏰ Booking Reminder</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your booking starts ${timeUntil}</p>
        </div>
        
        <div style="padding: 30px; background: #ffffff;">
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hello <strong>${userName}</strong>,</p>
          
          <p style="color: #666; font-size: 15px; line-height: 1.6; margin: 0 0 25px 0;">
            This is a friendly reminder about your upcoming booking. 
            Please make sure you're prepared and arrive on time.
          </p>
          
          <div style="background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #f39c12;">
            <h3 style="margin: 0 0 15px 0; color: #856404; font-size: 18px;">📅 Booking Details</h3>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 10px 0;">
              <p style="margin: 8px 0; color: #555;"><strong>🏢 Resource:</strong> ${resourceName}</p>
              <p style="margin: 8px 0; color: #555;"><strong>📅 Start Time:</strong> ${startTime}</p>
              <p style="margin: 8px 0; color: #555;"><strong>📅 End Time:</strong> ${endTime}</p>
              <p style="margin: 8px 0; color: #555;"><strong>📍 Location:</strong> ${location}</p>
              <p style="margin: 8px 0; color: #555;"><strong>⏰ Time Until:</strong> ${timeUntil}</p>
            </div>
          </div>
          
          <div style="background: #e3f2fd; padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #2196f3;">
            <h3 style="margin: 0 0 15px 0; color: #1565c0; font-size: 16px;">📋 Pre-Booking Checklist:</h3>
            <ul style="color: #1565c0; line-height: 1.8; margin: 0; padding-left: 20px; font-size: 14px;">
              <li>Confirm your availability for the scheduled time</li>
              <li>Prepare any materials or equipment you need</li>
              <li>Plan your route to arrive on time</li>
              <li>Bring any required access cards or keys</li>
              <li>Have a backup plan in case of delays</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/bookings" 
               style="background: linear-gradient(135deg, #f1692a 0%, #e55a1a 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 4px 15px rgba(241, 105, 42, 0.3);">
              📋 View All Bookings
            </a>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin: 25px 0;">
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px;">🔄 Need to Make Changes?</h3>
            <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
              If you need to cancel or modify this booking, please contact us as soon as possible. 
              Changes made close to the booking time may not be possible.
            </p>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #e9ecef;">
          <p style="color: #666; font-size: 14px; margin: 0;">
            Best regards,<br>
            <strong style="color: #f1692a;">Webdev Resources Team</strong>
          </p>
        </div>
      </div>
    `,
        text: `
      Booking Reminder - ${resourceName}
      
      Hello ${userName},
      
      This is a friendly reminder about your upcoming booking.
      
      Booking Details:
      - Resource: ${resourceName}
      - Start Time: ${startTime}
      - End Time: ${endTime}
      - Location: ${location}
      - Time Until: ${timeUntil}
      
      Pre-Booking Checklist:
      - Confirm your availability for the scheduled time
      - Prepare any materials or equipment you need
      - Plan your route to arrive on time
      - Bring any required access cards or keys
      - Have a backup plan in case of delays
      
      If you need to cancel or modify this booking, please contact us as soon as possible.
      
      Best regards,
      Webdev Resources Team
    `
    })
}

// Email sending functions
export const sendEmail = async (to: string, subject: string, html: string, text: string) => {
    try {
        const config = useRuntimeConfig()
        const transporter = createTransporter()

        const mailOptions = {
            from: config.fromEmail || 'noreply@webdev.co.zw',
            to,
            subject,
            html,
            text
        }

        const result = await transporter.sendMail(mailOptions)
        console.log('Email sent successfully:', result.messageId)
        return { success: true, messageId: result.messageId }
    } catch (error) {
        console.error('Error sending email:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

export const sendBookingApprovalEmail = async (userEmail: string, userName: string, resourceName: string, startTime: string, endTime: string) => {
    const template = emailTemplates.bookingApproved(userName, resourceName, startTime, endTime)
    return await sendEmail(userEmail, template.subject, template.html, template.text)
}

export const sendBookingRejectionEmail = async (userEmail: string, userName: string, resourceName: string, reason?: string) => {
    const template = emailTemplates.bookingRejected(userName, resourceName, reason)
    return await sendEmail(userEmail, template.subject, template.html, template.text)
}

export const sendWelcomeEmail = async (userEmail: string, userName: string) => {
    const template = emailTemplates.welcomeEmail(userName, userEmail)
    return await sendEmail(userEmail, template.subject, template.html, template.text)
}

export const sendForgotPasswordEmail = async (userEmail: string, userName: string, resetLink: string, expiryTime: string) => {
    const template = emailTemplates.forgotPassword(userName, resetLink, expiryTime)
    return await sendEmail(userEmail, template.subject, template.html, template.text)
}

export const sendOtpLoginEmail = async (userEmail: string, userName: string, otpCode: string, expiryTime: string) => {
    const template = emailTemplates.otpLogin(userName, otpCode, expiryTime)
    return await sendEmail(userEmail, template.subject, template.html, template.text)
}

export const sendBookingNotificationAdmin = async (adminEmail: string, adminName: string, userName: string, resourceName: string, startTime: string, endTime: string, location: string) => {
    const template = emailTemplates.bookingNotificationAdmin(adminName, userName, resourceName, startTime, endTime, location)
    return await sendEmail(adminEmail, template.subject, template.html, template.text)
}

export const sendBookingNotificationEmployee = async (userEmail: string, userName: string, resourceName: string, startTime: string, endTime: string, status: string) => {
    const template = emailTemplates.bookingNotificationEmployee(userName, resourceName, startTime, endTime, status)
    return await sendEmail(userEmail, template.subject, template.html, template.text)
}

export const sendUpcomingBookingReminder = async (userEmail: string, userName: string, resourceName: string, startTime: string, endTime: string, location: string, timeUntil: string) => {
    const template = emailTemplates.upcomingBookingReminder(userName, resourceName, startTime, endTime, location, timeUntil)
    return await sendEmail(userEmail, template.subject, template.html, template.text)
}
