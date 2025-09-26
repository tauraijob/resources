<template>
  <Card class="shadow-card">
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <span class="text-xl">📊</span>
        Mileage History
        <Badge v-if="resource?.currentMileage" variant="secondary" class="ml-auto">
          Current: {{ resource.currentMileage.toLocaleString() }} km
        </Badge>
      </CardTitle>
      <CardDescription>
        Track mileage changes for {{ resource?.name }}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div v-if="loading" class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
      
      <div v-else-if="mileageLogs.length === 0" class="text-center py-8 text-muted-foreground">
        <div class="text-4xl mb-2">🚗</div>
        <p>No mileage logs yet</p>
        <p class="text-sm">Log the first mileage reading to start tracking</p>
      </div>
      
      <div v-else class="space-y-4">
        <div v-for="log in mileageLogs" :key="log.id" class="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
          <div class="flex-shrink-0">
            <Avatar class="h-10 w-10">
              <AvatarImage :src="`https://api.dicebear.com/7.x/initials/svg?seed=${log.user.name || log.user.username || log.user.email}`" />
              <AvatarFallback>{{ (log.user.name || log.user.username || log.user.email).charAt(0).toUpperCase() }}</AvatarFallback>
            </Avatar>
          </div>
          
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-semibold text-lg">{{ log.mileage.toLocaleString() }} km</span>
              <Badge variant="outline" class="text-xs">
                {{ formatDate(log.loggedAt) }}
              </Badge>
            </div>
            
            <div class="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Logged by {{ log.user.name || log.user.username }}</span>
              <span>•</span>
              <span>{{ formatTime(log.loggedAt) }}</span>
            </div>
            
            <div v-if="log.notes" class="mt-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded">
              {{ log.notes }}
            </div>
          </div>
          
          <div class="flex-shrink-0">
            <div class="text-right">
              <div class="text-sm font-medium text-primary">
                {{ calculateMileageDifference(log) }}
              </div>
              <div class="text-xs text-muted-foreground">km difference</div>
            </div>
          </div>
        </div>
        
        <div v-if="pagination.hasMore" class="text-center pt-4">
          <Button variant="outline" @click="loadMore" :disabled="loadingMore">
            <span v-if="loadingMore">Loading...</span>
            <span v-else>Load More</span>
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
interface Props {
  resourceId: number
  resource?: {
    id: number
    name: string
    currentMileage?: number
  } | null
}

const props = defineProps<Props>()

const mileageLogs = ref<any[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const pagination = ref({
  total: 0,
  limit: 10,
  offset: 0,
  hasMore: false
})

async function loadMileageHistory(reset = false) {
  if (reset) {
    loading.value = true
    pagination.value.offset = 0
    mileageLogs.value = []
  } else {
    loadingMore.value = true
  }

  try {
    const response = await $fetch(`/api/resources/${props.resourceId}/mileage`, {
      query: {
        limit: pagination.value.limit,
        offset: pagination.value.offset
      }
    })

    if (reset) {
      mileageLogs.value = response.mileageLogs
    } else {
      mileageLogs.value.push(...response.mileageLogs)
    }

    pagination.value = response.pagination
  } catch (error) {
    console.error('Failed to load mileage history:', error)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

async function loadMore() {
  pagination.value.offset += pagination.value.limit
  await loadMileageHistory(false)
}

function calculateMileageDifference(log: any) {
  const currentIndex = mileageLogs.value.findIndex(l => l.id === log.id)
  if (currentIndex === mileageLogs.value.length - 1) {
    return '0' // First entry
  }
  
  const previousLog = mileageLogs.value[currentIndex + 1]
  const difference = log.mileage - previousLog.mileage
  return difference > 0 ? `+${difference}` : difference.toString()
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString()
}

function formatTime(date: string | Date) {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Load initial data
onMounted(() => {
  loadMileageHistory(true)
})

// Watch for resource changes
watch(() => props.resourceId, () => {
  loadMileageHistory(true)
})
</script>
