<template>
  <div class="max-w-md mx-auto">
    <Card class="shadow-card-glow">
      <CardHeader>
        <CardTitle>Reset Your Password</CardTitle>
        <CardDescription>Enter your new password below</CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="onResetPassword" class="space-y-4">
          <div>
            <Label class="block text-sm mb-1">New Password</Label>
            <Input v-model="newPassword" type="password" required placeholder="••••••••" />
          </div>
          <div>
            <Label class="block text-sm mb-1">Confirm New Password</Label>
            <Input v-model="confirmPassword" type="password" required placeholder="••••••••" />
          </div>
          <div class="flex gap-2">
            <Button type="submit" :disabled="resetting" class="flex-1">
              <span v-if="resetting">Resetting Password...</span>
              <span v-else>Reset Password</span>
            </Button>
          </div>
        </form>

        <!-- Status Messages -->
        <div v-if="message" class="mt-4 p-3 rounded-lg" :class="messageType === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'">
          <p class="text-sm">{{ message }}</p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const token = route.query.token as string

// Form data
const newPassword = ref('')
const confirmPassword = ref('')

// Loading state
const resetting = ref(false)

// Status messages
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

// Helper function to show messages
function showMessage(text: string, type: 'success' | 'error' = 'success') {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 5000)
}

// Reset password function
async function onResetPassword() {
  if (!token) {
    showMessage('Invalid or missing reset token', 'error')
    return
  }

  if (!newPassword.value || !confirmPassword.value) {
    showMessage('Please fill in all fields', 'error')
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    showMessage('Passwords do not match', 'error')
    return
  }

  if (newPassword.value.length < 6) {
    showMessage('Password must be at least 6 characters long', 'error')
    return
  }

  resetting.value = true
  try {
    await $fetch('/api/auth/reset-password', { 
      method: 'POST', 
      body: { 
        token,
        newPassword: newPassword.value
      } 
    })
    
    showMessage('Password reset successfully! You can now sign in with your new password.', 'success')
    
    // Clear form
    newPassword.value = ''
    confirmPassword.value = ''
    
    // Redirect to login after 3 seconds
    setTimeout(() => {
      navigateTo('/login')
    }, 3000)
  } catch (error: any) {
    showMessage(error.data?.statusMessage || error.message || 'Failed to reset password', 'error')
  } finally {
    resetting.value = false
  }
}

// Check if token is valid on page load
onMounted(async () => {
  if (!token) {
    showMessage('Invalid or missing reset token', 'error')
    return
  }

  try {
    await $fetch('/api/auth/verify-reset-token', { 
      method: 'POST', 
      body: { token } 
    })
  } catch (error: any) {
    showMessage('Invalid or expired reset token', 'error')
  }
})
</script>
