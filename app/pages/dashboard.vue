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

    <section>
      <h2 class="font-medium mb-2">Resources</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div v-for="s in statusList" :key="s.id">
          <NuxtLink v-if="s.status==='AVAILABLE'" :to="{ path: '/bookings', query: { resourceId: s.id } }">
            <Card class="transition-all duration-200 hover:ring-2 hover:ring-primary hover:scale-[1.02] cursor-pointer">
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
              <Card class="cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-primary hover:scale-[1.02]">
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
      <Card class="lg:col-span-2">
        <CardHeader><CardTitle>Bookings per month</CardTitle><CardDescription>Current year</CardDescription></CardHeader>
        <CardContent>
          <Bar :data="barData" :options="barOptions" />
        </CardContent>
      </Card>
      <Card>
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
Chart.register(BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend)

const { data: statusList } = await useFetch('/api/resources/status', { server: false })
const { data: bookings } = await useFetch('/api/bookings', { server: false })
const { data: meStats } = await useFetch('/api/users/me/stats', { server: false })

function formatDate(d: string | Date) {
  const date = new Date(d)
  return date.toLocaleString()
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



