<template>
  <div class="max-w-6xl mx-auto space-y-8">
    <section class="text-center py-12">
      <h1 class="text-3xl md:text-4xl font-semibold mb-2">Webdev Resource Booking</h1>
      <p class="text-muted-foreground">Reserve cars, boardrooms and shared assets. Keep teams moving, on time.</p>
      <div class="mt-6 flex items-center justify-center gap-3">
        <Button as-child>
          <NuxtLink to="/login">Get started</NuxtLink>
        </Button>
        <Button variant="outline" as-child>
          <NuxtLink to="/resources">Browse resources</NuxtLink>
        </Button>
      </div>
    </section>

    <section class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card v-for="r in resourcesStatus" :key="r.id">
        <CardHeader>
          <CardTitle>{{ r.name }}</CardTitle>
          <CardDescription>{{ r.category }} • {{ r.location || 'N/A' }}</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge :variant="r.status === 'AVAILABLE' ? 'secondary' : 'destructive'">{{ r.status === 'AVAILABLE' ? 'Available' : 'In Use' }}</Badge>
        </CardContent>
      </Card>
    </section>

    

    <section class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>How it works</CardTitle>
          <CardDescription>Three simple steps</CardDescription>
        </CardHeader>
        <CardContent>
          <ol class="list-decimal pl-5 space-y-1 text-sm text-muted-foreground">
            <li>Sign in with your work email.</li>
            <li>Create a booking with date, location, start and end.</li>
            <li>Admin approves; you receive confirmation.</li>
          </ol>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Common resources</CardTitle>
          <CardDescription>What teams book most</CardDescription>
        </CardHeader>
        <CardContent>
          <ul class="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
            <li>Pool cars (sedan, SUV)</li>
            <li>Boardrooms (6–20 seats)</li>
            <li>Projectors and meeting kits</li>
          </ul>
        </CardContent>
      </Card>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ alias: ['/admin'] })
const { data: resourcesStatus } = await useFetch('/api/resources/status')
</script>



