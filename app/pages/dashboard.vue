<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold">Dashboard</h1>
        <p class="text-sm text-muted-foreground">Overview of resources and your bookings</p>
      </div>
      <div class="flex gap-2">
        <Button as-child><NuxtLink to="/bookings">New booking</NuxtLink></Button>
        <Button variant="outline" as-child><NuxtLink to="/resources">Manage resources</NuxtLink></Button>
      </div>
    </div>

    <!-- Google Calendar Integration Section -->
    <section>
      <h2 class="font-medium mb-3">Google Calendar Integration</h2>
      <Card class="shadow-card">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            📅 Google Calendar
            <Badge v-if="user?.googleCalendarConnected" variant="default" class="bg-green-100 text-green-800">Connected</Badge>
            <Badge v-else variant="secondary">Not Connected</Badge>
          </CardTitle>
          <CardDescription>
            Connect your Google Calendar to automatically add booking events to your personal calendar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div v-if="!user?.googleCalendarConnected" class="space-y-3">
            <p class="text-sm text-muted-foreground">
              When you connect your Google Calendar, all your bookings will be automatically added to your personal calendar.
            </p>
            <Button @click="connectGoogleCalendar" :disabled="connectingCalendar" class="w-full sm:w-auto">
              <span v-if="connectingCalendar">Connecting...</span>
              <span v-else>Connect Google Calendar</span>
            </Button>
          </div>
          <div v-else class="space-y-3">
            <p class="text-sm text-green-600">
              ✅ Your Google Calendar is connected! All your bookings will be automatically added to your personal calendar.
            </p>
            <Button @click="disconnectGoogleCalendar" :disabled="disconnectingCalendar" variant="outline" class="w-full sm:w-auto">
              <span v-if="disconnectingCalendar">Disconnecting...</span>
              <span v-else>Disconnect Google Calendar</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>

    <section>
      <h2 class="font-medium mb-2">Resources</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div v-for="s in statusList" :key="s.id">
            <NuxtLink v-if="s.status==='AVAILABLE'" :to="{ path: '/bookings', query: { resourceId: s.id } }">
              <Card class="shadow-float cursor-pointer">
              <CardHeader>
                <CardTitle>{{ s.name }}</CardTitle>
                <CardDescription>{{ s.category }}</CardDescription>
              </CardHeader>
              <CardContent>
                <p class="text-sm text-muted-foreground">{{ s.location || 'N/A' }}</p>
                <div class="mt-2">
                  <Badge variant="secondary">Available</Badge>
                </div>
              </CardContent>
            </Card>
          </NuxtLink>
          <Dialog v-else>
            <DialogTrigger as-child>
              <Card class="shadow-card cursor-pointer">
                <CardHeader>
                  <CardTitle>{{ s.name }}</CardTitle>
                  <CardDescription>{{ s.category }}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p class="text-sm text-muted-foreground">{{ s.location || 'N/A' }}</p>
                  <div class="mt-2" v-if="s.activeBooking">
                    <Badge variant="destructive">Booked: {{ formatDate(s.activeBooking.startTime) }} → {{ formatDate(s.activeBooking.endTime) }}</Badge>
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Booking Details</DialogTitle>
                <DialogDescription>{{ s.name }} — {{ s.category }}</DialogDescription>
              </DialogHeader>
              <div v-if="s.activeBooking" class="rounded-lg border bg-card text-card-foreground p-4 space-y-4">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-muted-foreground">Status</span>
                  <Badge variant="destructive">In use</Badge>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div class="text-xs text-muted-foreground">Start</div>
                    <div class="font-medium">{{ formatDate(s.activeBooking.startTime) }}</div>
                  </div>
                  <div>
                    <div class="text-xs text-muted-foreground">End</div>
                    <div class="font-medium">{{ formatDate(s.activeBooking.endTime) }}</div>
                  </div>
                  <div v-if="s.activeBooking.location" class="sm:col-span-2">
                    <div class="text-xs text-muted-foreground">Location</div>
                    <div class="font-medium">{{ s.activeBooking.location }}</div>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <Avatar class="h-8 w-8">
                    <AvatarImage :src="`https://api.dicebear.com/7.x/initials/svg?seed=${s.activeBooking.user.name || s.activeBooking.user.username || s.activeBooking.user.email}`" />
                    <AvatarFallback>{{ (s.activeBooking.user.name || s.activeBooking.user.username || s.activeBooking.user.email).charAt(0).toUpperCase() }}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div class="text-sm font-medium">{{ s.activeBooking.user.name || s.activeBooking.user.username }}</div>
                    <div class="text-xs text-muted-foreground">{{ s.activeBooking.user.email }}</div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>

    <section class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card class="lg:col-span-2 shadow-card-glow">
        <CardHeader><CardTitle>Bookings per month</CardTitle><CardDescription>Current year</CardDescription></CardHeader>
        <CardContent>
          <Bar :data="barData" :options="barOptions" />
        </CardContent>
      </Card>
      <Card class="shadow-float">
        <CardHeader><CardTitle>Status distribution</CardTitle><CardDescription>Your bookings</CardDescription></CardHeader>
        <CardContent>
          <Doughnut :data="doughnutData" :options="doughnutOptions" />
        </CardContent>
      </Card>
    </section>

    <section>
      <h2 class="font-medium mb-2">Your Bookings</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Resource</TableHead>
            <TableHead>Start</TableHead>
            <TableHead>End</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="b in bookings" :key="b.id">
            <TableCell>{{ b.resource.name }}</TableCell>
            <TableCell>{{ formatDate(b.startTime) }}</TableCell>
            <TableCell>{{ formatDate(b.endTime) }}</TableCell>
            <TableCell><Badge variant="secondary">{{ b.status }}</Badge></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ 
    alias: ['/admin/dashboard'],
    middleware: 'auth'
})
import { Bar, Doughnut } from 'vue-chartjs'
import { Chart, BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import { useToast } from '~~/components/ui/toast/use-toast'
Chart.register(BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend)

const { data: statusList } = await useFetch('/api/resources/status', { server: false })
const { data: bookings } = await useFetch('/api/bookings', { server: false })
const { data: meStats } = await useFetch('/api/users/me/stats', { server: false })
const { user, fetchUser } = useAuth()

// Google Calendar connection state
const connectingCalendar = ref(false)
const disconnectingCalendar = ref(false)
const { toast } = useToast()

// Handle OAuth callback messages
const route = useRoute()
onMounted(async () => {
  const success = route.query.success
  const error = route.query.error
  
  if (success === 'google_calendar_connected') {
    toast({
      title: "Google Calendar Connected! 🎉",
      description: "Your Google Calendar has been successfully connected. All your bookings will now be added to your personal calendar.",
      variant: "default"
    })
    // Refresh user data to show updated connection status
    await fetchUser()
    console.log('User after fetchUser:', user.value)
    // Clean up URL
    navigateTo('/dashboard', { replace: true })
  } else if (error) {
    let errorMessage = "An error occurred during Google Calendar connection."
    if (error === 'oauth_error') {
      errorMessage = "Google OAuth authorization was cancelled or failed."
    } else if (error === 'no_code') {
      errorMessage = "No authorization code received from Google."
    } else if (error === 'callback_failed') {
      errorMessage = "Failed to complete Google Calendar connection."
    }
    
    toast({
      title: "Connection Failed",
      description: errorMessage,
      variant: "destructive"
    })
    // Clean up URL
    navigateTo('/dashboard', { replace: true })
  }
})

function formatDate(d: string | Date) {
  const date = new Date(d)
  return date.toLocaleString()
}

// Google Calendar connection functions
async function connectGoogleCalendar() {
  connectingCalendar.value = true
  try {
    const response = await $fetch('/api/auth/google-calendar/connect')
    // Redirect to Google OAuth
    window.location.href = response.authUrl
  } catch (error: any) {
    toast({
      title: "Connection Failed",
      description: error.data?.statusMessage || error.message || "Failed to connect Google Calendar",
      variant: "destructive"
    })
  } finally {
    connectingCalendar.value = false
  }
}

async function disconnectGoogleCalendar() {
  disconnectingCalendar.value = true
  try {
    await $fetch('/api/auth/google-calendar/disconnect', { method: 'POST' })
    toast({
      title: "Google Calendar Disconnected",
      description: "Your Google Calendar has been disconnected successfully.",
      variant: "default"
    })
    // Refresh user data
    await fetchUser()
  } catch (error: any) {
    toast({
      title: "Disconnection Failed",
      description: error.data?.statusMessage || error.message || "Failed to disconnect Google Calendar",
      variant: "destructive"
    })
  } finally {
    disconnectingCalendar.value = false
  }
}

const barData = computed(() => ({
  labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  datasets: [{
    label: 'Bookings',
    data: meStats.value?.monthly ?? Array(12).fill(0),
    backgroundColor: 'rgba(59,130,246,0.5)'
  }]
}))
const barOptions = { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }

const doughnutData = computed(() => ({
  labels: ['Pending','Approved','Rejected','Cancelled'],
  datasets: [{
    data: [
      meStats.value?.status?.PENDING ?? 0,
      meStats.value?.status?.APPROVED ?? 0,
      meStats.value?.status?.REJECTED ?? 0,
      meStats.value?.status?.CANCELLED ?? 0
    ],
    backgroundColor: ['#fde047','#22c55e','#ef4444','#9ca3af']
  }]
}))
const doughnutOptions = { responsive: true, maintainAspectRatio: false }
</script>



