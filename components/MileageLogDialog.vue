<template>
  <Dialog v-model:open="isOpen">
    <DialogTrigger as-child>
      <Button variant="outline" size="sm" class="gap-2">
        <span class="text-lg">🚗</span>
        Log Mileage
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <span class="text-2xl">🚗</span>
          Log Mileage - {{ resource?.name }}
        </DialogTitle>
        <DialogDescription>
          Update the current mileage for this vehicle
        </DialogDescription>
      </DialogHeader>
      
      <form @submit.prevent="submitMileage" class="space-y-4">
        <div class="space-y-2">
          <Label for="currentMileage">Current Mileage (km)</Label>
          <div class="relative">
            <Input
              id="currentMileage"
              v-model="mileage"
              type="number"
              placeholder="Enter current mileage"
              class="pr-8"
              :class="{ 'border-red-500': mileageError }"
              required
            />
            <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
              km
            </span>
          </div>
          <div v-if="mileageError" class="text-sm text-red-600">
            {{ mileageError }}
          </div>
          <div v-if="resource?.currentMileage" class="text-sm text-muted-foreground">
            Previous mileage: {{ resource.currentMileage.toLocaleString() }} km
          </div>
        </div>

        <div class="space-y-2">
          <Label for="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            v-model="notes"
            placeholder="Add any notes about the vehicle condition, fuel level, etc."
            rows="3"
          />
        </div>

        <div class="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" @click="closeDialog">
            Cancel
          </Button>
          <Button type="submit" :disabled="submitting || !mileage">
            <span v-if="submitting">Logging...</span>
            <span v-else>Log Mileage</span>
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { useToast } from '~~/components/ui/toast/use-toast'

interface Props {
  resource: {
    id: number
    name: string
    category: string
    currentMileage?: number
  } | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  success: []
}>()

const isOpen = ref(false)
const mileage = ref<number | string>('')
const notes = ref('')
const submitting = ref(false)
const mileageError = ref('')
const { toast } = useToast()

function closeDialog() {
  isOpen.value = false
  mileage.value = ''
  notes.value = ''
  mileageError.value = ''
}

function validateMileage() {
  mileageError.value = ''
  
  if (!mileage.value) {
    mileageError.value = 'Mileage is required'
    return false
  }

  const mileageNum = Number(mileage.value)
  
  if (isNaN(mileageNum) || mileageNum < 0) {
    mileageError.value = 'Please enter a valid mileage'
    return false
  }

  if (props.resource?.currentMileage && mileageNum < props.resource.currentMileage) {
    mileageError.value = `Mileage cannot be less than current mileage (${props.resource.currentMileage.toLocaleString()} km)`
    return false
  }

  return true
}

async function submitMileage() {
  if (!validateMileage()) return

  submitting.value = true
  
  try {
    const response = await $fetch(`/api/resources/${props.resource?.id}/mileage`, {
      method: 'POST',
      body: {
        mileage: Number(mileage.value),
        notes: notes.value || undefined
      }
    })

    toast({
      title: "Mileage Logged Successfully! 🚗",
      description: response.message,
      variant: "default"
    })

    emit('success')
    closeDialog()
  } catch (error: any) {
    toast({
      title: "Failed to Log Mileage",
      description: error.data?.statusMessage || error.message || "An error occurred",
      variant: "destructive"
    })
  } finally {
    submitting.value = false
  }
}

// Watch for dialog open/close to reset form
watch(isOpen, (open) => {
  if (!open) {
    closeDialog()
  }
})
</script>
