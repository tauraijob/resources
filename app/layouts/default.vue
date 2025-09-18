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
              </SheetHeader>
              <div class="mt-4 grid gap-2">
                <Button variant="ghost" as-child><NuxtLink :to="link('/dashboard')">Dashboard</NuxtLink></Button>
                <Button variant="ghost" as-child><NuxtLink :to="link('/resources')">Resources</NuxtLink></Button>
                <Button variant="ghost" as-child><NuxtLink :to="link('/bookings')">Bookings</NuxtLink></Button>
                <Button v-if="me?.role==='ADMIN'" variant="ghost" as-child><NuxtLink to="/admin">Admin</NuxtLink></Button>
              </div>
            </SheetContent>
          </Sheet>
          <NuxtLink :to="isAdmin ? '/admin' : '/'" class="font-semibold">Webdev Resources</NuxtLink>
        </div>
        <nav class="flex items-center gap-2">
          <Button variant="ghost" as-child>
            <NuxtLink :to="link('/dashboard')">Dashboard</NuxtLink>
          </Button>
          <Button variant="ghost" as-child>
            <NuxtLink :to="link('/resources')">Resources</NuxtLink>
          </Button>
          <Button variant="ghost" as-child>
            <NuxtLink :to="link('/bookings')">Bookings</NuxtLink>
          </Button>
          
          <ThemeToggle />
          <div v-if="me">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="outline" class="gap-2">
                  <Avatar class="h-6 w-6">
                    <AvatarImage :src="`https://api.dicebear.com/7.x/initials/svg?seed=${avatarSeed}`" />
                    <AvatarFallback>{{ initial }}</AvatarFallback>
                  </Avatar>
                  <span>{{ displayName }}</span>
                  <Badge v-if="me.role==='ADMIN'" variant="secondary">Admin</Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem as-child>
                  <NuxtLink :to="me.role==='ADMIN' ? '/admin' : '/dashboard'">Dashboard</NuxtLink>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem @click="logout">Logout</DropdownMenuItem>
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
const { data: me, refresh: refreshMe } = await useFetch('/api/auth/me')
const isAdmin = computed(() => me.value?.role === 'ADMIN')
function link(path: string) {
  return isAdmin.value ? `/admin${path === '/' ? '' : path}` : path
}
const displayName = computed(() => me.value?.name || (me.value as any)?.username || me.value?.email?.split('@')[0] || 'Account')
const avatarSeed = computed(() => encodeURIComponent(displayName.value))
const initial = computed(() => (displayName.value?.[0] || 'A').toUpperCase())
async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await refreshMe()
  navigateTo('/login')
}
</script>



