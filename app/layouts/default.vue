<template>
  <div class="min-h-screen bg-background text-foreground flex flex-col">
    <header class="border-b">
      <div class="container mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Sheet>
            <SheetTrigger as-child>
              <Button variant="outline" size="icon">☰</Button>
            </SheetTrigger>
            <SheetContent side="left" class="w-72">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
                <SheetDescription v-if="me">
                  Welcome back, {{ displayName }}!
                </SheetDescription>
              </SheetHeader>
              <div class="mt-4 grid gap-2">
                <div v-if="me" class="space-y-2">
                  <div class="px-3 py-2 text-sm text-muted-foreground border-b">
                    <div class="flex items-center gap-2">
                      <Avatar class="h-6 w-6">
                        <AvatarImage :src="`https://api.dicebear.com/7.x/initials/svg?seed=${avatarSeed}`" />
                        <AvatarFallback>{{ initial }}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div class="font-medium">{{ displayName }}</div>
                        <div class="text-xs">{{ me.email }}</div>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" as-child class="justify-start">
                    <NuxtLink :to="link('/dashboard')" class="flex items-center">
                      <span class="mr-2">📊</span>
                      Dashboard
                    </NuxtLink>
                  </Button>
                  <Button variant="ghost" as-child class="justify-start">
                    <NuxtLink :to="link('/resources')" class="flex items-center">
                      <span class="mr-2">🏢</span>
                      Resources
                    </NuxtLink>
                  </Button>
                  <Button variant="ghost" as-child class="justify-start">
                    <NuxtLink :to="link('/bookings')" class="flex items-center">
                      <span class="mr-2">📅</span>
                      My Bookings
                    </NuxtLink>
                  </Button>
                  <Button v-if="me?.role==='ADMIN'" variant="ghost" as-child class="justify-start">
                    <NuxtLink to="/admin" class="flex items-center">
                      <span class="mr-2">⚙️</span>
                      Admin Panel
                    </NuxtLink>
                  </Button>
                  <div class="border-t pt-2">
                    <Button variant="ghost" @click="logout" class="justify-start text-destructive w-full">
                      <span class="mr-2">🚪</span>
                      Logout
                    </Button>
                  </div>
                </div>
                <div v-else class="space-y-2">
                  <Button variant="ghost" as-child class="justify-start">
                    <NuxtLink to="/" class="flex items-center">
                      <span class="mr-2">🏠</span>
                      Home
                    </NuxtLink>
                  </Button>
                  <Button variant="ghost" as-child class="justify-start">
                    <NuxtLink to="/login" class="flex items-center">
                      <span class="mr-2">🔐</span>
                      Login
                    </NuxtLink>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <NuxtLink :to="isAdmin ? '/admin' : '/'" class="font-semibold">Webdev Resources</NuxtLink>
        </div>
        <nav class="flex items-center gap-2">
          <div v-if="me" class="hidden md:flex items-center gap-2">
            <Button variant="ghost" as-child>
              <NuxtLink :to="link('/dashboard')">Dashboard</NuxtLink>
            </Button>
            <Button variant="ghost" as-child>
              <NuxtLink :to="link('/resources')">Resources</NuxtLink>
            </Button>
            <Button variant="ghost" as-child>
              <NuxtLink :to="link('/bookings')">Bookings</NuxtLink>
            </Button>
            <Button v-if="me.role==='ADMIN'" variant="ghost" as-child>
              <NuxtLink to="/admin">Admin Panel</NuxtLink>
            </Button>
          </div>
          
          <ThemeToggle />
          <div v-if="me">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="outline" class="gap-2">
                  <Avatar class="h-6 w-6">
                    <AvatarImage :src="`https://api.dicebear.com/7.x/initials/svg?seed=${avatarSeed}`" />
                    <AvatarFallback>{{ initial }}</AvatarFallback>
                  </Avatar>
                  <span class="hidden sm:inline">{{ displayName }}</span>
                  <Badge v-if="me.role==='ADMIN'" variant="default" class="text-xs">Admin</Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" class="w-56">
                <DropdownMenuLabel class="font-normal">
                  <div class="flex flex-col space-y-1">
                    <p class="text-sm font-medium leading-none">{{ displayName }}</p>
                    <p class="text-xs leading-none text-muted-foreground">{{ me.email }}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem as-child>
                  <NuxtLink :to="me.role==='ADMIN' ? '/admin' : '/dashboard'" class="flex items-center">
                    <span class="mr-2">📊</span>
                    Dashboard
                  </NuxtLink>
                </DropdownMenuItem>
                <DropdownMenuItem as-child>
                  <NuxtLink to="/resources" class="flex items-center">
                    <span class="mr-2">🏢</span>
                    Resources
                  </NuxtLink>
                </DropdownMenuItem>
                <DropdownMenuItem as-child>
                  <NuxtLink to="/bookings" class="flex items-center">
                    <span class="mr-2">📅</span>
                    My Bookings
                  </NuxtLink>
                </DropdownMenuItem>
                <DropdownMenuItem v-if="me.role==='ADMIN'" as-child>
                  <NuxtLink to="/admin" class="flex items-center">
                    <span class="mr-2">⚙️</span>
                    Admin Panel
                  </NuxtLink>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem @click="logout" class="flex items-center text-destructive">
                  <span class="mr-2">🚪</span>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div v-else>
            <Button as-child>
              <NuxtLink to="/login">Login</NuxtLink>
            </Button>
          </div>
        </nav>
      </div>
    </header>
    <main class="container mx-auto px-4 py-6 flex-1">
      <slot />
    </main>
    <footer class="border-t">
      <div class="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
        <p>© 2025 Webdev. All rights reserved.</p>
        <div class="flex items-center gap-4">
          <NuxtLink :to="link('/dashboard')" class="hover:text-foreground">Dashboard</NuxtLink>
          <NuxtLink :to="link('/resources')" class="hover:text-foreground">Resources</NuxtLink>
          <NuxtLink :to="link('/bookings')" class="hover:text-foreground">Bookings</NuxtLink>
        </div>
      </div>
    </footer>
    <Toaster />
  </div>
  
</template>

<script setup lang="ts">
const { user: me, isAdmin, fetchUser, logout } = useAuth()

// Fetch user data when the component mounts
onMounted(() => {
  fetchUser()
})

// Watch for route changes and fetch user data if needed
const route = useRoute()
watch(() => route.path, () => {
  if (!me.value) {
    fetchUser()
  }
})

function link(path: string) {
  return isAdmin.value ? `/admin${path === '/' ? '' : path}` : path
}
const displayName = computed(() => me.value?.name || (me.value as any)?.username || me.value?.email?.split('@')[0] || 'Account')
const avatarSeed = computed(() => encodeURIComponent(displayName.value))
const initial = computed(() => (displayName.value?.[0] || 'A').toUpperCase())
</script>



