<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold">{{ resource?.name }}</h1>
        <p class="text-sm text-muted-foreground">{{ resource?.category }} • {{ resource?.location || 'No location specified' }}</p>
      </div>
      <div class="flex gap-2">
        <Button as-child><NuxtLink to="/resources">← Back to Resources</NuxtLink></Button>
        <MileageLogDialog 
          v-if="resource && isCar(resource.category)" 
          :resource="resource" 
          @success="refreshData"
        />
      </div>
    </div>

    <!-- Resource Info Card -->
    <Card class="shadow-card">
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <span class="text-2xl">🚗</span>
          Vehicle Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        
        <div v-else-if="!resource" class="text-center py-8 text-muted-foreground">
          <div class="text-4xl mb-2">❌</div>
          <p>Resource not found</p>
        </div>
        
        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="space-y-2">
            <div class="text-sm text-muted-foreground">Name</div>
            <div class="font-medium">{{ resource.name }}</div>
          </div>
          
          <div class="space-y-2">
            <div class="text-sm text-muted-foreground">Category</div>
            <div class="font-medium">{{ resource.category }}</div>
          </div>
          
          <div class="space-y-2">
            <div class="text-sm text-muted-foreground">Location</div>
            <div class="font-medium">{{ resource.location || 'Not specified' }}</div>
          </div>
          
          <div v-if="isCar(resource.category)" class="space-y-2">
            <div class="text-sm text-muted-foreground">Current Mileage</div>
            <div class="font-medium text-lg text-primary">
              {{ resource.currentMileage ? resource.currentMileage.toLocaleString() + ' km' : 'Not set' }}
            </div>
          </div>
          
          <div class="space-y-2">
            <div class="text-sm text-muted-foreground">Status</div>
            <Badge :variant="resource.status === 'available' ? 'default' : 'destructive'">
              {{ resource.status === 'available' ? 'Available' : 'In Use' }}
            </Badge>
          </div>
          
          <div class="space-y-2">
            <div class="text-sm text-muted-foreground">Created</div>
            <div class="font-medium">{{ formatDate(resource.createdAt) }}</div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Mileage History (only for cars) -->
    <MileageHistory 
      v-if="resource && isCar(resource.category)" 
      :resource-id="resource.id"
      :resource="resource"
    />

    <!-- Recent Bookings -->
    <Card class="shadow-card">
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <span class="text-xl">📅</span>
          Recent Bookings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div v-if="bookingsLoading" class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        
        <div v-else-if="recentBookings.length === 0" class="text-center py-8 text-muted-foreground">
          <div class="text-4xl mb-2">📅</div>
          <p>No bookings yet</p>
        </div>
        
        <div v-else class="space-y-4">
          <div v-for="booking in recentBookings" :key="booking.id" class="flex items-center gap-4 p-4 border rounded-lg">
            <div class="flex-shrink-0">
              <Avatar class="h-10 w-10">
                <AvatarImage :src="`https://api.dicebear.com/7.x/initials/svg?seed=${booking.user.name || booking.user.username || booking.user.email}`" />
                <AvatarFallback>{{ (booking.user.name || booking.user.username || booking.user.email).charAt(0).toUpperCase() }}</AvatarFallback>
              </Avatar>
            </div>
            
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-medium">{{ booking.user.name || booking.user.username }}</span>
                <Badge :variant="getStatusVariant(booking.status)">
                  {{ booking.status }}
                </Badge>
              </div>
              
              <div class="text-sm text-muted-foreground">
                {{ formatDate(booking.startTime) }} → {{ formatDate(booking.endTime) }}
              </div>
              
              <div v-if="booking.location" class="text-sm text-muted-foreground">
                📍 {{ booking.location }}
              </div>
              
              <div v-if="isCar(resource?.category) && (booking.startMileage || booking.endMileage)" class="text-sm text-muted-foreground">
                🚗 
                <span v-if="booking.startMileage">{{ booking.startMileage.toLocaleString() }} km</span>
                <span v-if="booking.startMileage && booking.endMileage"> → </span>
                <span v-if="booking.endMileage">{{ booking.endMileage.toLocaleString() }} km</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ 
  middleware: 'auth'
})

const route = useRoute()
const resourceId = Number(route.params.id)

if (Number.isNaN(resourceId)) {
  throw createError({ statusCode: 400, statusMessage: 'Invalid resource ID' })
}

const resource = ref<any>(null)
const loading = ref(true)
const recentBookings = ref<any[]>([])
const bookingsLoading = ref(true)

async function loadResource() {
  try {
    const response = await $fetch(`/api/resources/${resourceId}`)
    resource.value = response
  } catch (error) {
    console.error('Failed to load resource:', error)
  } finally {
    loading.value = false
  }
}

async function loadRecentBookings() {
  try {
    const response = await $fetch('/api/bookings', {
      query: {
        resourceId: resourceId,
        limit: 10
      }
    })
    recentBookings.value = response
  } catch (error) {
    console.error('Failed to load bookings:', error)
  } finally {
    bookingsLoading.value = false
  }
}

async function refreshData() {
  await Promise.all([
    loadResource(),
    loadRecentBookings()
  ])
}

function isCar(category: string): boolean {
  return category.toLowerCase() === 'car' || category.toLowerCase() === 'vehicle'
}

function formatDate(d: string | Date) {
  return new Date(d).toLocaleString()
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'APPROVED': return 'default'
    case 'PENDING': return 'secondary'
    case 'REJECTED': return 'destructive'
    case 'CANCELLED': return 'outline'
    default: return 'secondary'
  }
}

onMounted(() => {
  refreshData()
})
</script>
