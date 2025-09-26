<template>
  <div class="space-y-4">
    <h1 class="text-xl font-semibold">Resources</h1>

<form v-if="me?.role === 'ADMIN'" @submit.prevent="create" class="flex flex-wrap gap-2 items-end">
      <div>
        <Label class="block text-sm">Name</Label>
        <Input v-model="form.name" required />
      </div>
      <div>
        <Label class="block text-sm">Category</Label>
        <Input v-model="form.category" placeholder="Car, Boardroom, ..." required />
      </div>
      <div>
        <Label class="block text-sm">Location</Label>
        <Input v-model="form.location" />
      </div>
      <Button>Add</Button>
    </form>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div v-for="r in resources" :key="r.id">
        <NuxtLink v-if="isAvailable(r.id)" :to="{ path: '/bookings', query: { resourceId: r.id } }">
          <Card class="transition hover:ring-1 hover:ring-ring cursor-pointer">
            <CardHeader>
              <CardTitle class="flex items-center justify-between">
                <NuxtLink :to="`/resources/${r.id}`" class="hover:text-primary transition-colors">
                  {{ r.name }}
                </NuxtLink>
                <div v-if="isCar(r.category)" class="flex items-center gap-2">
                  <span class="text-sm text-muted-foreground">🚗</span>
                  <span v-if="r.currentMileage" class="text-xs text-muted-foreground">
                    {{ r.currentMileage.toLocaleString() }} km
                  </span>
                </div>
              </CardTitle>
              <CardDescription>{{ r.category }}</CardDescription>
            </CardHeader>
            <CardContent>
              <p class="text-sm text-muted-foreground">{{ r.location || 'N/A' }}</p>
              <div class="mt-2 flex items-center justify-between">
                <Badge variant="secondary">Available</Badge>
                <MileageLogDialog 
                  v-if="isCar(r.category)" 
                  :resource="r" 
                  @success="refresh"
                />
              </div>
            </CardContent>
          </Card>
        </NuxtLink>
        <Dialog v-else>
          <DialogTrigger as-child>
            <Card class="cursor-pointer">
              <CardHeader>
                <CardTitle class="flex items-center justify-between">
                  <NuxtLink :to="`/resources/${r.id}`" class="hover:text-primary transition-colors">
                    {{ r.name }}
                  </NuxtLink>
                  <div v-if="isCar(r.category)" class="flex items-center gap-2">
                    <span class="text-sm text-muted-foreground">🚗</span>
                    <span v-if="r.currentMileage" class="text-xs text-muted-foreground">
                      {{ r.currentMileage.toLocaleString() }} km
                    </span>
                  </div>
                </CardTitle>
                <CardDescription>{{ r.category }}</CardDescription>
              </CardHeader>
              <CardContent>
                <p class="text-sm text-muted-foreground">{{ r.location || 'N/A' }}</p>
                <div class="mt-2 flex items-center justify-between">
                  <div v-if="statusMap[r.id]?.activeBooking">
                    <Badge variant="destructive">Booked: {{ formatDate(statusMap[r.id].activeBooking.startTime) }} → {{ formatDate(statusMap[r.id].activeBooking.endTime) }}</Badge>
                  </div>
                  <MileageLogDialog 
                    v-if="isCar(r.category)" 
                    :resource="r" 
                    @success="refresh"
                  />
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
              <DialogDescription>{{ r.name }} — {{ r.category }}</DialogDescription>
            </DialogHeader>
            <div v-if="statusMap[r.id]?.activeBooking" class="rounded-lg border bg-card text-card-foreground p-4 space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-sm text-muted-foreground">Status</span>
                <Badge variant="destructive">In use</Badge>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div class="text-xs text-muted-foreground">Start</div>
                  <div class="font-medium">{{ formatDate(statusMap[r.id].activeBooking.startTime) }}</div>
                </div>
                <div>
                  <div class="text-xs text-muted-foreground">End</div>
                  <div class="font-medium">{{ formatDate(statusMap[r.id].activeBooking.endTime) }}</div>
                </div>
                <div v-if="statusMap[r.id].activeBooking.location" class="sm:col-span-2">
                  <div class="text-xs text-muted-foreground">Location</div>
                  <div class="font-medium">{{ statusMap[r.id].activeBooking.location }}</div>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <Avatar class="h-8 w-8">
                  <AvatarImage :src="`https://api.dicebear.com/7.x/initials/svg?seed=${statusMap[r.id].activeBooking.user.name || statusMap[r.id].activeBooking.user.username || statusMap[r.id].activeBooking.user.email}`" />
                  <AvatarFallback>{{ (statusMap[r.id].activeBooking.user.name || statusMap[r.id].activeBooking.user.username || statusMap[r.id].activeBooking.user.email).charAt(0).toUpperCase() }}</AvatarFallback>
                </Avatar>
                <div>
                  <div class="text-sm font-medium">{{ statusMap[r.id].activeBooking.user.name || statusMap[r.id].activeBooking.user.username }}</div>
                  <div class="text-xs text-muted-foreground">{{ statusMap[r.id].activeBooking.user.email }}</div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ 
    alias: ['/admin/resources'],
    middleware: 'auth'
})
const { data: me } = await useFetch('/api/auth/me', { server: false })
const { data: resources, refresh } = await useFetch('/api/resources', { server: false })
const { data: statuses } = await useFetch('/api/resources/status', { server: false })
const form = reactive({ name: '', category: '', location: '' })

async function create() {
  await $fetch('/api/resources', { method: 'POST', body: form })
  form.name = ''
  form.category = ''
  form.location = ''
  await refresh()
}

const statusMap = computed<Record<number, any>>(() => {
  const map: Record<number, any> = {}
  for (const s of (statuses?.value || [])) map[s.id] = s
  return map
})

function isAvailable(id: number): boolean {
  const m = statusMap.value || {}
  const s = (m as any)[id]
  return !s || s.status !== 'IN_USE'
}

function formatDate(d: string | Date) {
  const date = new Date(d)
  return date.toLocaleString()
}

function isCar(category: string): boolean {
  return category.toLowerCase() === 'car' || category.toLowerCase() === 'vehicle'
}
</script>



