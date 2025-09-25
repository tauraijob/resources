<template>
  <div class="max-w-md mx-auto">
    <Card class="shadow-card-glow">
      <CardHeader>
        <CardTitle>Welcome to Webdev Resources</CardTitle>
        <CardDescription>Sign in to your account or create a new one</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs v-model="activeTab" class="space-y-4">
          <TabsList class="grid w-full grid-cols-3">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Create Account</TabsTrigger>
            <TabsTrigger value="forgot">Forgot Password</TabsTrigger>
          </TabsList>

          <!-- Login Tab -->
          <TabsContent value="login" class="space-y-3">
            <form @submit.prevent="onLogin" class="space-y-3">
              <Tabs v-model="loginMethod" class="space-y-3">
                <TabsList class="grid w-full grid-cols-2">
                  <TabsTrigger value="email">Email</TabsTrigger>
                  <TabsTrigger value="username">Username</TabsTrigger>
                </TabsList>
                <TabsContent value="email" class="space-y-3">
                  <div>
                    <Label class="block text-sm mb-1">Email</Label>
                    <Input v-model="loginEmail" type="email" placeholder="you@webdev.co.zw" required />
                  </div>
                </TabsContent>
                <TabsContent value="username" class="space-y-3">
                  <div>
                    <Label class="block text-sm mb-1">Username</Label>
                    <Input v-model="loginUsername" placeholder="your-username" required />
                  </div>
                </TabsContent>
              </Tabs>
              <div>
                <Label class="block text-sm mb-1">Password</Label>
                <Input v-model="loginPassword" type="password" required placeholder="••••••••" />
              </div>
              <div class="flex gap-2">
                <Button type="submit" :disabled="loggingIn" class="flex-1">
                  <span v-if="loggingIn">Signing in...</span>
                  <span v-else>Sign In</span>
                </Button>
              </div>
            </form>
          </TabsContent>

          <!-- Register Tab -->
          <TabsContent value="register" class="space-y-3">
            <form @submit.prevent="onRegister" class="space-y-3">
              <div>
                <Label class="block text-sm mb-1">Email</Label>
                <Input v-model="registerEmail" type="email" placeholder="you@webdev.co.zw" required />
                <p class="text-xs text-muted-foreground mt-1">Must be a @webdev.co.zw email address</p>
              </div>
              <div>
                <Label class="block text-sm mb-1">Username</Label>
                <Input v-model="registerUsername" placeholder="your-username" required />
              </div>
              <div>
                <Label class="block text-sm mb-1">Full Name</Label>
                <Input v-model="registerName" placeholder="Your full name" />
              </div>
              <div>
                <Label class="block text-sm mb-1">Password</Label>
                <Input v-model="registerPassword" type="password" required placeholder="••••••••" />
              </div>
              <div>
                <Label class="block text-sm mb-1">Confirm Password</Label>
                <Input v-model="registerConfirmPassword" type="password" required placeholder="••••••••" />
              </div>
              <div class="flex gap-2">
                <Button type="submit" :disabled="registering" class="flex-1">
                  <span v-if="registering">Creating Account...</span>
                  <span v-else>Create Account</span>
                </Button>
              </div>
            </form>
          </TabsContent>

          <!-- Forgot Password Tab -->
          <TabsContent value="forgot" class="space-y-3">
            <form @submit.prevent="onForgotPassword" class="space-y-3">
              <div>
                <Label class="block text-sm mb-1">Email</Label>
                <Input v-model="forgotEmail" type="email" placeholder="you@webdev.co.zw" required />
                <p class="text-xs text-muted-foreground mt-1">Must be a @webdev.co.zw email address</p>
              </div>
              <div class="flex gap-2">
                <Button type="submit" :disabled="sendingReset" class="flex-1">
                  <span v-if="sendingReset">Sending Reset Link...</span>
                  <span v-else>Send Reset Link</span>
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>

        <!-- Status Messages -->
        <div v-if="message" class="mt-4 p-3 rounded-lg" :class="messageType === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'">
          <p class="text-sm">{{ message }}</p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
// Tab management
const activeTab = ref('login')
const loginMethod = ref('email')

// Login form data
const loginEmail = ref('')
const loginUsername = ref('')
const loginPassword = ref('')

// Register form data
const registerEmail = ref('')
const registerUsername = ref('')
const registerName = ref('')
const registerPassword = ref('')
const registerConfirmPassword = ref('')

// Forgot password form data
const forgotEmail = ref('')

// Loading states
const loggingIn = ref(false)
const registering = ref(false)
const sendingReset = ref(false)

// Status messages
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

// Redirect if already logged in
const { user: me } = useAuth()
watch(me, (user) => {
  if (user) {
    const route = useRoute()
    const next = typeof route.query.next === 'string' ? route.query.next : (user.role === 'ADMIN' ? '/admin' : '/dashboard')
    navigateTo(next)
  }
}, { immediate: true })

// Helper function to show messages
function showMessage(text: string, type: 'success' | 'error' = 'success') {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 5000)
}

// Login function
async function onLogin() {
  if (!loginPassword.value) {
    showMessage('Please enter your password', 'error')
    return
  }

  loggingIn.value = true
  try {
    const u: any = await $fetch('/api/auth/login', { 
      method: 'POST', 
      body: { 
        email: loginMethod.value === 'email' ? loginEmail.value : undefined, 
        username: loginMethod.value === 'username' ? loginUsername.value : undefined, 
        password: loginPassword.value 
      } 
    })
    
    const { fetchUser } = useAuth()
    await fetchUser() // Refresh auth state
    
    const route = useRoute()
    const next = typeof route.query.next === 'string' ? route.query.next : (u?.role === 'ADMIN' ? '/admin' : '/dashboard')
    await navigateTo(next, { replace: true })
  } catch (error: any) {
    showMessage(error.data?.statusMessage || error.message || 'Login failed', 'error')
  } finally {
    loggingIn.value = false
  }
}

// Register function
async function onRegister() {
  // Validation
  if (!registerEmail.value || !registerUsername.value || !registerPassword.value) {
    showMessage('Please fill in all required fields', 'error')
    return
  }

  if (registerPassword.value !== registerConfirmPassword.value) {
    showMessage('Passwords do not match', 'error')
    return
  }

  if (!/@webdev\.co\.zw$/i.test(registerEmail.value)) {
    showMessage('Email must be a @webdev.co.zw address', 'error')
    return
  }

  registering.value = true
  try {
    await $fetch('/api/auth/register', { 
      method: 'POST', 
      body: { 
        email: registerEmail.value,
        username: registerUsername.value,
        name: registerName.value || undefined,
        password: registerPassword.value,
        role: 'EMPLOYEE'
      } 
    })
    
    showMessage('Account created successfully! Please sign in.', 'success')
    
    // Clear form and switch to login
    registerEmail.value = ''
    registerUsername.value = ''
    registerName.value = ''
    registerPassword.value = ''
    registerConfirmPassword.value = ''
    activeTab.value = 'login'
  } catch (error: any) {
    showMessage(error.data?.statusMessage || error.message || 'Registration failed', 'error')
  } finally {
    registering.value = false
  }
}

// Forgot password function
async function onForgotPassword() {
  if (!forgotEmail.value) {
    showMessage('Please enter your email address', 'error')
    return
  }

  if (!/@webdev\.co\.zw$/i.test(forgotEmail.value)) {
    showMessage('Email must be a @webdev.co.zw address', 'error')
    return
  }

  sendingReset.value = true
  try {
    await $fetch('/api/auth/forgot-password', { 
      method: 'POST', 
      body: { email: forgotEmail.value } 
    })
    
    showMessage('Password reset link sent to your email!', 'success')
    forgotEmail.value = ''
  } catch (error: any) {
    showMessage(error.data?.statusMessage || error.message || 'Failed to send reset link', 'error')
  } finally {
    sendingReset.value = false
  }
}
</script>


