<template>
  <div class="max-w-md mx-auto">
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Use your @webdev.co.zw email and password</CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="onSubmit" class="space-y-3">
          <Tabs default-value="email">
            <TabsList>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="username">Username</TabsTrigger>
            </TabsList>
            <TabsContent value="email" class="space-y-3">
              <div>
                <Label class="block text-sm mb-1">Email</Label>
                <Input v-model="email" type="email" placeholder="you@webdev.co.zw" />
              </div>
            </TabsContent>
            <TabsContent value="username" class="space-y-3">
              <div>
                <Label class="block text-sm mb-1">Username</Label>
                <Input v-model="username" placeholder="your-username" />
              </div>
            </TabsContent>
          </Tabs>
          <div>
            <Label class="block text-sm mb-1">Password</Label>
            <Input v-model="password" type="password" required placeholder="••••••••" />
          </div>
          <div class="flex gap-2">
            <Button type="submit">Sign in</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
const email = ref('')
const username = ref('')
const password = ref('')

// Redirect if already logged in
const { user: me } = useAuth()
watch(me, (user) => {
  if (user) {
    const route = useRoute()
    const next = typeof route.query.next === 'string' ? route.query.next : (user.role === 'ADMIN' ? '/admin' : '/dashboard')
    navigateTo(next)
  }
}, { immediate: true })

async function onSubmit() {
  const u: any = await $fetch('/api/auth/login', { method: 'POST', body: { email: email.value || undefined, username: username.value || undefined, password: password.value } })
  const { fetchUser } = useAuth()
  await fetchUser() // Refresh auth state
  const route = useRoute()
  const next = typeof route.query.next === 'string' ? route.query.next : (u?.role === 'ADMIN' ? '/admin' : '/dashboard')
  await navigateTo(next, { replace: true })
}

</script>


