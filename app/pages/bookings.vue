<template>
  <div class="space-y-4">
    <h1 class="text-xl font-semibold">Bookings</h1>

    <form @submit.prevent="submit" class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
      <div>
        <Label class="block text-sm">Resource</Label>
<Select v-model="selectValue" @update:modelValue="(val:any)=>onSelect(val as string|undefined)">
          <SelectTrigger>
            <SelectValue placeholder="Select resource" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem v-for="r in resources" :key="r.id" :value="String(r.id)">
                {{ r.name }} ({{ r.category }})
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label class="block text-sm">Location</Label>
        <Input v-model="form.location" placeholder="Optional" />
      </div>
      <div>
        <Label class="block text-sm">Start</Label>
        <Input v-model="form.startTime" type="datetime-local" required />
      </div>
      <div>
        <Label class="block text-sm">End</Label>
        <Input v-model="form.endTime" type="datetime-local" required />
      </div>
      <div class="md:col-span-4">
        <Label class="block text-sm">Notes</Label>
        <Textarea v-model="form.notes" rows="2" />
      </div>
      <div>
        <Button type="submit" :disabled="submitting">{{ submitting ? 'Booking…' : 'Book' }}</Button>
      </div>
    </form>

    <div class="space-y-2">
      <Dialog v-for="b in bookings" :key="b.id">
        <DialogTrigger as-child>
          <Card class="flex justify-between items-center cursor-pointer">
            <CardHeader>
              <CardTitle>{{ b.resource.name }}</CardTitle>
              <CardDescription>{{ formatDate(b.startTime) }} → {{ formatDate(b.endTime) }}</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">{{ b.status }}</Badge>
            </CardContent>
            <CardFooter class="flex gap-2">
              <Button variant="outline" @click.stop="remove(b.id)">Cancel</Button>
              <Button v-if="me?.role==='ADMIN'" variant="outline" @click.stop="approve(b.id)">Approve</Button>
              <Button v-if="me?.role==='ADMIN'" variant="destructive" @click.stop="reject(b.id)">Reject</Button>
            </CardFooter>
          </Card>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>{{ b.resource.name }}</DialogDescription>
          </DialogHeader>
          <div class="rounded-lg border bg-card text-card-foreground p-4 space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-sm text-muted-foreground">Status</span>
              <Badge :variant="b.status==='APPROVED' ? 'default' : (b.status==='PENDING' ? 'secondary' : 'destructive')">
                {{ b.status }}
              </Badge>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div class="text-xs text-muted-foreground">Start</div>
                <div class="font-medium">{{ formatDate(b.startTime) }}</div>
              </div>
              <div>
                <div class="text-xs text-muted-foreground">End</div>
                <div class="font-medium">{{ formatDate(b.endTime) }}</div>
              </div>
              <div v-if="b.location" class="sm:col-span-2">
                <div class="text-xs text-muted-foreground">Location</div>
                <div class="font-medium">{{ b.location }}</div>
              </div>
              <div v-if="b.notes" class="sm:col-span-2">
                <div class="text-xs text-muted-foreground">Notes</div>
                <div class="font-medium whitespace-pre-wrap">{{ b.notes }}</div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ 
    alias: ['/admin/bookings'],
    middleware: 'auth'
})
const route = useRoute()
const { data: me } = await useFetch('/api/auth/me', { server: false })
const { data: resources } = await useFetch('/api/resources', { server: false })
const { data: bookings, refresh } = await useFetch('/api/bookings', { server: false })
const form = reactive({ resourceId: 0, location: '', startTime: '', endTime: '', notes: '' })
const selectValue = ref<string | undefined>(undefined)
const submitting = ref(false)
const errorMessage = ref('')

function onSelect(v?: string) {
  selectValue.value = v
  form.resourceId = v ? Number(v) : 0
}

// Preselect resource from query param
onMounted(() => {
  const rid = route.query.resourceId
  if (typeof rid === 'string' && /^\d+$/.test(rid)) {
    selectValue.value = rid
    form.resourceId = Number(rid)
  }
})

async function submit() {
  errorMessage.value = ''
  if (!form.resourceId) { errorMessage.value = 'Select a resource'; return }
  if (!form.startTime || !form.endTime) { errorMessage.value = 'Start and end times are required'; return }
  submitting.value = true
  try {
    await $fetch('/api/bookings', { method: 'POST', body: form })
    form.resourceId = 0
    form.location = ''
    form.startTime = ''
    form.endTime = ''
    form.notes = ''
    selectValue.value = undefined
    await refresh()
  } catch (e: any) {
    errorMessage.value = e?.data?.statusMessage || e?.message || 'Failed to create booking'
  } finally {
    submitting.value = false
  }
}

async function remove(id: number) {
  await $fetch(`/api/bookings/${id}`, { method: 'DELETE' })
  await refresh()
}

async function approve(id: number) {
  await $fetch(`/api/bookings/${id}/approve`, { method: 'POST' })
  await refresh()
}

async function reject(id: number) {
  await $fetch(`/api/bookings/${id}/reject`, { method: 'POST' })
  await refresh()
}

function formatDate(d: string | Date) {
  const date = new Date(d)
  return date.toLocaleString()
}
</script>



