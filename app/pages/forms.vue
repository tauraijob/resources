<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold">Forms</h1>
      <p class="text-sm text-muted-foreground">Validation with shadcn-vue + vee-validate</p>
    </div>

    <Card class="max-w-xl">
      <CardHeader>
        <CardTitle>Request Access</CardTitle>
        <CardDescription>Demo of form fields, validation, and buttons</CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="onSubmit" class="space-y-4">
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input v-model="form.email" type="email" placeholder="you@company.com" />
            </FormControl>
            <FormMessage v-if="errors.email">{{ errors.email }}</FormMessage>
          </FormItem>

          <FormItem>
            <FormLabel>Department</FormLabel>
            <FormControl>
              <Select v-model="form.department">
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
          </FormItem>

          <FormItem>
            <FormLabel>Reason</FormLabel>
            <FormControl>
              <Textarea v-model="form.reason" rows="3" />
            </FormControl>
          </FormItem>

          <div class="flex gap-2">
            <Button type="submit">Submit</Button>
            <Button type="button" variant="outline" @click="reset">Reset</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { useToast } from "~~/components/ui/toast/use-toast"

const form = reactive({ email: '', department: '', reason: '' })
const errors = reactive<{ email?: string }>({})
const { toast } = useToast()

function validate() {
  errors.email = !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email) ? 'Valid email required' : undefined
  return !errors.email
}

function reset() {
  form.email = ''
  form.department = ''
  form.reason = ''
  errors.email = undefined
}

function onSubmit() {
  if (!validate()) return
  toast({ title: 'Submitted', description: 'Your request has been sent.' })
  reset()
}
</script>


