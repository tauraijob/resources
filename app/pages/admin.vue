<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold">Admin Dashboard</h1>
        <p class="text-sm text-muted-foreground">Approve bookings and manage resources</p>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" @click="refreshAll">Refresh</Button>
      </div>
    </div>

    <section class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card class="shadow-float">
        <CardHeader>
          <CardTitle>Pending</CardTitle>
          <CardDescription>Awaiting approval</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="text-3xl font-semibold">{{ stats?.pendingBookings ?? '—' }}</div>
        </CardContent>
      </Card>
      <Card class="shadow-card-glow">
        <CardHeader>
          <CardTitle>Approved</CardTitle>
          <CardDescription>All-time</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="text-3xl font-semibold">{{ stats?.approvedBookings ?? '—' }}</div>
        </CardContent>
      </Card>
      <Card class="shadow-float">
        <CardHeader>
          <CardTitle>Resources</CardTitle>
          <CardDescription>Active</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="text-3xl font-semibold">{{ stats?.totalResources ?? '—' }}</div>
        </CardContent>
      </Card>
    </section>

    <section>
      <h2 class="font-medium mb-3">Approvals & Filters</h2>
      <div class="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
        <div>
          <Label class="block text-sm">User</Label>
          <Select v-model="filters.userId" @update:modelValue="() => loadBookings()">
            <SelectTrigger>
              <SelectValue placeholder="All users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectGroup>
                <SelectItem v-for="u in usersList" :key="u.id" :value="String(u.id)">{{ u.name || u.username || u.email }}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label class="block text-sm">Resource</Label>
          <Select v-model="filters.resourceId" @update:modelValue="() => loadBookings()">
            <SelectTrigger>
              <SelectValue placeholder="All resources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectGroup>
                <SelectItem v-for="r in resources || []" :key="r.id" :value="String(r.id)">{{ r.name }}</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label class="block text-sm">Status</Label>
          <Select v-model="filters.status" @update:modelValue="() => loadBookings()">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label class="block text-sm">From</Label>
          <Input type="datetime-local" v-model="filters.from" @change="loadBookings" />
        </div>
        <div>
          <Label class="block text-sm">To</Label>
          <Input type="datetime-local" v-model="filters.to" @change="loadBookings" />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Resource</TableHead>
            <TableHead>Requester</TableHead>
            <TableHead>Start</TableHead>
            <TableHead>End</TableHead>
            <TableHead>Status</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="b in bookingsList" :key="b.id">
            <TableCell>{{ b.resource.name }}</TableCell>
            <TableCell>{{ b.user.email }}</TableCell>
            <TableCell>{{ formatDate(b.startTime) }}</TableCell>
            <TableCell>{{ formatDate(b.endTime) }}</TableCell>
            <TableCell><Badge :variant="b.status==='APPROVED' ? 'default' : (b.status==='PENDING' ? 'secondary' : 'destructive')">{{ b.status }}</Badge></TableCell>
            <TableCell class="flex gap-2 justify-end">
              <Button v-if="b.status==='PENDING'" size="sm" variant="outline" @click="approve(b.id)" :disabled="approving === b.id">
                <span v-if="approving === b.id">Approving...</span>
                <span v-else>Approve</span>
              </Button>
              <Button v-if="b.status==='PENDING'" size="sm" variant="destructive" @click="openRejectDialog(b)" :disabled="rejecting === b.id">
                <span v-if="rejecting === b.id">Rejecting...</span>
                <span v-else>Reject</span>
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </section>

    <section>
      <div class="flex items-center justify-between mb-2">
        <h2 class="font-medium">Resources</h2>
        <Dialog>
          <DialogTrigger as-child>
            <Button size="sm">Add Resource</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Resource</DialogTitle>
              <DialogDescription>Enter details for the new resource</DialogDescription>
            </DialogHeader>
            <form class="space-y-3" @submit.prevent="addResource">
              <div>
                <Label class="block text-sm">Name</Label>
                <Input v-model="newResource.name" required />
              </div>
              <div>
                <Label class="block text-sm">Category</Label>
                <Input v-model="newResource.category" placeholder="Car, Boardroom, ..." required />
              </div>
              <div>
                <Label class="block text-sm">Location</Label>
                <Input v-model="newResource.location" />
              </div>
              <DialogFooter>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card v-for="r in resources" :key="r.id" class="shadow-card">
          <CardHeader>
            <CardTitle>{{ r.name }}</CardTitle>
            <CardDescription>{{ r.category }} • {{ r.location || 'N/A' }}</CardDescription>
          </CardHeader>
          <CardContent class="flex items-center justify-between">
            <Badge :variant="r.active ? 'secondary' : 'destructive'">{{ r.active ? 'Active' : 'Disabled' }}</Badge>
            <div class="flex gap-2">
              <Button size="sm" variant="outline" @click="openEdit(r)">Edit</Button>
              <Button size="sm" variant="destructive" @click="removeResource(r.id)">Delete</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>

    <Dialog v-model:open="editDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Resource</DialogTitle>
          <DialogDescription>Update resource details</DialogDescription>
        </DialogHeader>
        <form class="space-y-3" @submit.prevent="saveEdit">
          <div>
            <Label class="block text-sm">Name</Label>
            <Input v-model="editing.name" required />
          </div>
          <div>
            <Label class="block text-sm">Category</Label>
            <Input v-model="editing.category" required />
          </div>
          <div>
            <Label class="block text-sm">Location</Label>
            <Input v-model="editing.location" />
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <section>
      <div class="flex items-center justify-between mb-2">
        <h2 class="font-medium">User Management</h2>
        <Dialog>
          <DialogTrigger as-child>
            <Button size="sm">Add User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add User</DialogTitle>
              <DialogDescription>Create an employee or admin account</DialogDescription>
            </DialogHeader>
            <form class="space-y-3" @submit.prevent="addUser">
              <div>
                <Label class="block text-sm">Email</Label>
                <Input v-model="newUser.email" type="email" placeholder="name@webdev.co.zw" required />
              </div>
              <div>
                <Label class="block text-sm">Username</Label>
                <Input v-model="newUser.username" required />
              </div>
              <div>
                <Label class="block text-sm">Name</Label>
                <Input v-model="newUser.name" />
              </div>
              <div>
                <Label class="block text-sm">Password</Label>
                <Input v-model="newUser.password" type="password" required />
              </div>
              <div>
                <Label class="block text-sm">Role</Label>
                <Select v-model="newUser.role">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMPLOYEE">Employee</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p v-if="userError" class="text-destructive text-sm">{{ userError }}</p>
              <DialogFooter>
                <Button type="submit">Create</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="u in usersList" :key="u.id">
            <TableCell>{{ u.name || '—' }}</TableCell>
            <TableCell>{{ u.email }}</TableCell>
            <TableCell>{{ u.username }}</TableCell>
            <TableCell><Badge :variant="u.role==='ADMIN' ? 'default' : 'secondary'">{{ u.role }}</Badge></TableCell>
            <TableCell>
              <Badge :variant="u.active ? 'secondary' : 'destructive'">{{ u.active ? 'Active' : 'Suspended' }}</Badge>
            </TableCell>
            <TableCell>{{ new Date(u.createdAt).toLocaleDateString() }}</TableCell>
            <TableCell class="text-right">
              <div class="inline-flex gap-2">
                <Button size="sm" variant="outline" @click="openEditUser(u)">Edit</Button>
                <Button size="sm" :variant="u.active ? 'destructive' : 'secondary'" @click="toggleUser(u)">{{ u.active ? 'Suspend' : 'Activate' }}</Button>
                <Button size="sm" variant="destructive" @click="removeUser(u)">Delete</Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </section>

    <Dialog v-model:open="editingUserDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Update user details</DialogDescription>
        </DialogHeader>
        <form class="space-y-3" @submit.prevent="saveUserEdit">
          <div>
            <Label class="block text-sm">Email</Label>
            <Input v-model="editingUser.email" type="email" required />
          </div>
          <div>
            <Label class="block text-sm">Username</Label>
            <Input v-model="editingUser.username" required />
          </div>
          <div>
            <Label class="block text-sm">Name</Label>
            <Input v-model="editingUser.name" />
          </div>
          <div>
            <Label class="block text-sm">Role</Label>
            <Select v-model="editingUser.role">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EMPLOYEE">Employee</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Rejection Dialog -->
    <Dialog v-model:open="rejectDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Booking</DialogTitle>
          <DialogDescription>
            Rejecting booking for {{ rejectingBooking?.resource?.name }} by {{ rejectingBooking?.user?.email }}
          </DialogDescription>
        </DialogHeader>
        <form class="space-y-3" @submit.prevent="confirmReject">
          <div>
            <Label class="block text-sm">Rejection Reason (Optional)</Label>
            <Textarea 
              v-model="rejectionNote" 
              placeholder="Please provide a reason for rejection..."
              rows="3"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" @click="rejectDialog = false">Cancel</Button>
            <Button type="submit" variant="destructive">Reject Booking</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <section>
      <h2 class="font-medium mb-2">Reports</h2>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card class="lg:col-span-2 shadow-card-glow">
          <CardHeader>
            <CardTitle>Bookings per month</CardTitle>
            <CardDescription>Based on current filters</CardDescription>
          </CardHeader>
          <CardContent>
            <Bar :data="barDataAdmin" :options="chartOptions" />
          </CardContent>
        </Card>
        <Card class="shadow-float">
          <CardHeader>
            <CardTitle>Status distribution</CardTitle>
            <CardDescription>Based on current filters</CardDescription>
          </CardHeader>
          <CardContent>
            <Doughnut :data="doughnutDataAdmin" :options="chartOptions" />
          </CardContent>
        </Card>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Bar, Doughnut } from 'vue-chartjs'
import { Chart, BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import { useToast } from '../../components/ui/toast/use-toast'
Chart.register(BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend)

definePageMeta({ middleware: 'admin' })

type UserListItem = { id: number; email: string; username: string; name: string | null; role: 'EMPLOYEE' | 'ADMIN'; createdAt: string | Date; active: boolean }

const { data: stats, refresh: refreshStats } = await useFetch('/api/stats', { server: false })
const { data: resources, refresh: refreshResources } = await useFetch('/api/resources', { server: false })
const { data: users, refresh: refreshUsers } = await useFetch<UserListItem[]>('/api/users', { server: false })
const usersList = computed<UserListItem[]>(() => (users.value as any) || [])

const filters = reactive<{ userId: string; resourceId: string; status: string; from: string; to: string}>({
  userId: 'all',
  resourceId: 'all',
  status: 'PENDING',
  from: '',
  to: ''
})

const bookingsList = ref<any[]>([])
async function loadBookings() {
  const query: any = {}
  if (filters.userId && filters.userId !== 'all') query.userId = filters.userId
  if (filters.resourceId && filters.resourceId !== 'all') query.resourceId = filters.resourceId
  if (filters.status && filters.status !== 'all') query.status = filters.status
  if (filters.from) query.from = filters.from
  if (filters.to) query.to = filters.to
  try {
    bookingsList.value = await $fetch<any[]>('/api/bookings', { query })
  } catch (e: any) {
    const status = e?.data?.statusCode || e?.response?.status
    if (status === 401 || status === 403) {
      return navigateTo(`/login?next=${encodeURIComponent('/admin')}`)
    }
    throw e
  }
}
// await loadBookings()

onMounted(() => {
  loadBookings()
})

function formatDate(d: string | Date) {
  const date = new Date(d)
  return date.toLocaleString()
}

const approving = ref<number | null>(null)
const rejecting = ref<number | null>(null)
const rejectDialog = ref(false)
const rejectingBooking = ref<any>(null)
const rejectionNote = ref('')

async function approve(id: number) {
  approving.value = id
  try {
    await $fetch(`/api/bookings/${id}/approve`, { method: 'POST' })
    await refreshAll()
    // Show success message
    // const { toast } = useToast()
    // toast({
    //   title: "Booking Approved",
    //   description: "The booking has been successfully approved.",
    // })
    console.log('Booking approved successfully')
  } catch (error: any) {
    // const { toast } = useToast()
    // toast({
    //   title: "Approval Failed",
    //   description: error?.data?.statusMessage || error?.message || "Failed to approve booking",
    //   variant: "destructive"
    // })
    console.error('Approval failed:', error)
  } finally {
    approving.value = null
  }
}

function openRejectDialog(booking: any) {
  rejectingBooking.value = booking
  rejectionNote.value = ''
  rejectDialog.value = true
}

async function confirmReject() {
  if (!rejectingBooking.value) return
  
  rejecting.value = rejectingBooking.value.id
  try {
    await $fetch(`/api/bookings/${rejectingBooking.value.id}/reject`, { 
      method: 'POST',
      body: { note: rejectionNote.value }
    })
    await refreshAll()
    rejectDialog.value = false
    rejectingBooking.value = null
    rejectionNote.value = ''
    
    // Show success message
    // const { toast } = useToast()
    // toast({
    //   title: "Booking Rejected",
    //   description: "The booking has been rejected.",
    // })
    console.log('Booking rejected successfully')
  } catch (error: any) {
    // const { toast } = useToast()
    // toast({
    //   title: "Rejection Failed",
    //   description: error?.data?.statusMessage || error?.message || "Failed to reject booking",
    //   variant: "destructive"
    // })
    console.error('Rejection failed:', error)
  } finally {
    rejecting.value = null
  }
}

async function refreshAll() {
  await Promise.all([refreshStats(), refreshResources(), loadBookings(), refreshUsers()])
}

// Add resource dialog state and handlers
const newResource = reactive({ name: '', category: '', location: '' })
async function addResource() {
  await $fetch('/api/resources', { method: 'POST', body: newResource })
  newResource.name = ''
  newResource.category = ''
  newResource.location = ''
  await refreshResources()
}

const editDialog = ref(false)
const editing = reactive<{ id: number | null; name: string; category: string; location: string }>({ id: null, name: '', category: '', location: '' })
function openEdit(r: any) {
  editing.id = r.id
  editing.name = r.name
  editing.category = r.category
  editing.location = r.location || ''
  editDialog.value = true
}
async function saveEdit() {
  if (!editing.id) return
  await $fetch(`/api/resources/${editing.id}`, { method: 'PATCH', body: { name: editing.name, category: editing.category, location: editing.location } })
  editDialog.value = false
  await refreshResources()
}
async function removeResource(id: number) {
  if (!confirm('Delete this resource and its bookings?')) return
  await $fetch(`/api/resources/${id}`, { method: 'DELETE' })
  await refreshResources()
}

// Add user dialog state and handlers
const newUser = reactive<{ email: string; username: string; name?: string; password: string; role: 'EMPLOYEE' | 'ADMIN' }>({
  email: '', username: '', name: '', password: '', role: 'EMPLOYEE'
})
const userError = ref('')
async function addUser() {
  userError.value = ''
  try {
    await $fetch('/api/auth/register', { method: 'POST', body: newUser })
    newUser.email = ''
    newUser.username = ''
    newUser.name = ''
    newUser.password = ''
    newUser.role = 'EMPLOYEE'
    await refreshAll()
  } catch (e: any) {
    userError.value = e?.data?.statusMessage || e?.message || 'Failed to create user'
  }
}

// User management actions
const editingUserDialog = ref(false)
const editingUser = reactive<{ id: number | null; email: string; username: string; name: string; role: 'EMPLOYEE' | 'ADMIN' }>({ id: null, email: '', username: '', name: '', role: 'EMPLOYEE' })
function openEditUser(u: any) {
  editingUser.id = u.id
  editingUser.email = u.email
  editingUser.username = u.username
  editingUser.name = u.name || ''
  editingUser.role = u.role
  editingUserDialog.value = true
}
async function saveUserEdit() {
  if (!editingUser.id) return
  await $fetch(`/api/users/${editingUser.id}`, { method: 'PATCH', body: { email: editingUser.email, username: editingUser.username, name: editingUser.name, role: editingUser.role } })
  editingUserDialog.value = false
  await refreshUsers()
}
async function toggleUser(u: any) {
  await $fetch(`/api/users/${u.id}`, { method: 'PATCH', body: { active: !u.active } })
  await refreshUsers()
}
async function removeUser(u: any) {
  if (!confirm(`Delete user ${u.email}? This also removes their bookings.`)) return
  await $fetch(`/api/users/${u.id}`, { method: 'DELETE' })
  await refreshUsers()
}

// Charts based on current bookingsList
const chartOptions = { responsive: true, maintainAspectRatio: false }
const barDataAdmin = computed(() => {
  const byMonth: Record<string, number> = {}
  for (const b of bookingsList.value) {
    const k = new Date(b.startTime).toLocaleString('default', { month: 'short', year: 'numeric' })
    byMonth[k] = (byMonth[k] || 0) + 1
  }
  const labels = Object.keys(byMonth)
  const data = labels.map(l => byMonth[l] || 0)
  return { labels, datasets: [{ label: 'Bookings', data, backgroundColor: 'rgba(59,130,246,0.5)' }] }
})
const doughnutDataAdmin = computed(() => {
  const byStatus: Record<string, number> = {}
  for (const b of bookingsList.value) {
    byStatus[b.status] = (byStatus[b.status] || 0) + 1
  }
  const labels = Object.keys(byStatus)
  const data = labels.map(l => byStatus[l] || 0)
  const colors: Record<string, string> = { PENDING: '#fde047', APPROVED: '#22c55e', REJECTED: '#ef4444', CANCELLED: '#9ca3af' }
  return { labels, datasets: [{ data, backgroundColor: labels.map(l => colors[l] || '#000') }] }
})
</script>




