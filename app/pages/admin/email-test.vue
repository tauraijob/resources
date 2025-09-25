<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold">Email Test</h1>
        <p class="text-sm text-muted-foreground">Test email functionality with Mailtrap</p>
      </div>
    </div>

    <Card class="shadow-card-glow">
      <CardHeader>
        <CardTitle>Send Test Email</CardTitle>
        <CardDescription>Test the email system by sending a sample email</CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="sendTestEmail" class="space-y-4">
          <div>
            <Label for="to">To Email</Label>
            <Input 
              id="to" 
              v-model="testEmail.to" 
              type="email" 
              placeholder="test@example.com"
              required 
            />
          </div>
          <div>
            <Label for="subject">Subject</Label>
            <Input 
              id="subject" 
              v-model="testEmail.subject" 
              placeholder="Test Email Subject"
              required 
            />
          </div>
          <div>
            <Label for="message">Message</Label>
            <Textarea 
              id="message" 
              v-model="testEmail.message" 
              placeholder="Enter your test message here..."
              rows="4"
              required 
            />
          </div>
          <Button type="submit" :disabled="sending">
            <span v-if="sending">Sending...</span>
            <span v-else>Send Test Email</span>
          </Button>
        </form>

        <div v-if="result" class="mt-4 p-4 rounded-lg" :class="result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'">
          <p><strong>{{ result.success ? 'Success!' : 'Error' }}</strong></p>
          <p>{{ result.message }}</p>
          <p v-if="result.messageId" class="text-sm">Message ID: {{ result.messageId }}</p>
        </div>
      </CardContent>
    </Card>

    <Card class="shadow-float">
      <CardHeader>
        <CardTitle>Email Templates</CardTitle>
        <CardDescription>Preview of available email templates</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="p-4 border rounded-lg shadow-card">
            <h3 class="font-medium mb-2">📧 Welcome Email</h3>
            <p class="text-sm text-muted-foreground mb-3">Sent to new users</p>
            <Button size="sm" variant="outline" @click="sendTemplateEmail('welcome')">
              Send Sample
            </Button>
          </div>
          <div class="p-4 border rounded-lg shadow-card">
            <h3 class="font-medium mb-2">🔐 Forgot Password</h3>
            <p class="text-sm text-muted-foreground mb-3">Password reset request</p>
            <Button size="sm" variant="outline" @click="sendTemplateEmail('forgot-password')">
              Send Sample
            </Button>
          </div>
          <div class="p-4 border rounded-lg shadow-card">
            <h3 class="font-medium mb-2">🔑 OTP Login</h3>
            <p class="text-sm text-muted-foreground mb-3">One-time login code</p>
            <Button size="sm" variant="outline" @click="sendTemplateEmail('otp-login')">
              Send Sample
            </Button>
          </div>
          <div class="p-4 border rounded-lg shadow-card">
            <h3 class="font-medium mb-2">✅ Booking Approved</h3>
            <p class="text-sm text-muted-foreground mb-3">Sent when a booking is approved</p>
            <Button size="sm" variant="outline" @click="sendTemplateEmail('approval')">
              Send Sample
            </Button>
          </div>
          <div class="p-4 border rounded-lg shadow-card">
            <h3 class="font-medium mb-2">❌ Booking Rejected</h3>
            <p class="text-sm text-muted-foreground mb-3">Sent when a booking is rejected</p>
            <Button size="sm" variant="outline" @click="sendTemplateEmail('rejection')">
              Send Sample
            </Button>
          </div>
          <div class="p-4 border rounded-lg shadow-card">
            <h3 class="font-medium mb-2">📅 New Booking Request</h3>
            <p class="text-sm text-muted-foreground mb-3">Admin notification for new bookings</p>
            <Button size="sm" variant="outline" @click="sendTemplateEmail('admin-notification')">
              Send Sample
            </Button>
          </div>
          <div class="p-4 border rounded-lg shadow-card">
            <h3 class="font-medium mb-2">⏰ Upcoming Booking</h3>
            <p class="text-sm text-muted-foreground mb-3">Reminder for upcoming bookings</p>
            <Button size="sm" variant="outline" @click="sendTemplateEmail('upcoming-reminder')">
              Send Sample
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin' })

const testEmail = reactive({
  to: '',
  subject: 'Test Email from Webdev Resources',
  message: 'This is a test email to verify that the email system is working correctly.'
})

const sending = ref(false)
const result = ref<{ success: boolean; message: string; messageId?: string } | null>(null)

async function sendTestEmail() {
  sending.value = true
  result.value = null
  
  try {
    const response = await $fetch('/api/email/test', {
      method: 'POST',
      body: testEmail
    })
    
    result.value = {
      success: true,
      message: response.message || 'Email sent successfully',
      messageId: response.messageId || undefined
    }
  } catch (error: any) {
    result.value = {
      success: false,
      message: error.data?.statusMessage || error.message || 'Failed to send email'
    }
  } finally {
    sending.value = false
  }
}

async function sendTemplateEmail(type: 'approval' | 'rejection' | 'welcome' | 'forgot-password' | 'otp-login' | 'admin-notification' | 'upcoming-reminder') {
  if (!testEmail.to) {
    alert('Please enter an email address first')
    return
  }

  sending.value = true
  result.value = null

  try {
    let response
    switch (type) {
      case 'welcome':
        response = await $fetch('/api/email/test', {
          method: 'POST',
          body: {
            to: testEmail.to,
            subject: 'Welcome to Webdev Resources!',
            message: 'Welcome to our resource management system! Your account has been successfully created. You can now browse resources, make booking requests, and manage your profile.'
          }
        })
        break
      case 'forgot-password':
        response = await $fetch('/api/email/test', {
          method: 'POST',
          body: {
            to: testEmail.to,
            subject: 'Reset Your Password - Webdev Resources',
            message: 'We received a request to reset your password. Click the link in the email to reset your password. This link will expire in 24 hours.'
          }
        })
        break
      case 'otp-login':
        response = await $fetch('/api/email/test', {
          method: 'POST',
          body: {
            to: testEmail.to,
            subject: 'Your Login Code - Webdev Resources',
            message: 'Your 6-digit login code is: 123456. This code will expire in 10 minutes. Never share this code with anyone.'
          }
        })
        break
      case 'approval':
        response = await $fetch('/api/email/test', {
          method: 'POST',
          body: {
            to: testEmail.to,
            subject: 'Booking Approved - Sample Resource',
            message: 'Great news! Your booking request has been approved. Resource: Sample Resource, Start: January 1, 2025 9:00 AM, End: January 1, 2025 5:00 PM.'
          }
        })
        break
      case 'rejection':
        response = await $fetch('/api/email/test', {
          method: 'POST',
          body: {
            to: testEmail.to,
            subject: 'Booking Rejected - Sample Resource',
            message: 'Unfortunately, your booking request for Sample Resource has been rejected due to scheduling conflicts. Please consider alternative time slots.'
          }
        })
        break
      case 'admin-notification':
        response = await $fetch('/api/email/test', {
          method: 'POST',
          body: {
            to: testEmail.to,
            subject: 'New Booking Request - Sample Resource',
            message: 'A new booking request has been submitted and requires your approval. Resource: Sample Resource, Requested by: John Doe, Start: January 1, 2025 9:00 AM, End: January 1, 2025 5:00 PM.'
          }
        })
        break
      case 'upcoming-reminder':
        response = await $fetch('/api/email/test', {
          method: 'POST',
          body: {
            to: testEmail.to,
            subject: 'Reminder: Upcoming Booking - Sample Resource',
            message: 'This is a friendly reminder about your upcoming booking. Resource: Sample Resource, Start: January 1, 2025 9:00 AM, End: January 1, 2025 5:00 PM, Time until: 2 hours.'
          }
        })
        break
    }
    
    result.value = {
      success: true,
      message: response.message || 'Email sent successfully',
      messageId: response.messageId || undefined
    }
  } catch (error: any) {
    result.value = {
      success: false,
      message: error.data?.statusMessage || error.message || 'Failed to send email'
    }
  } finally {
    sending.value = false
  }
}
</script>
