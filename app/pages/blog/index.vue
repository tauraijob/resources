<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold">Blog</h1>
      <p class="text-sm text-muted-foreground">Latest updates and tips</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card v-for="post in posts" :key="post.id">
        <CardHeader>
          <CardTitle>{{ post.title }}</CardTitle>
          <CardDescription>{{ post.subtitle }}</CardDescription>
        </CardHeader>
        <CardContent>
          <p class="text-sm text-muted-foreground">{{ post.excerpt }}</p>
        </CardContent>
        <CardFooter>
          <Button as-child><NuxtLink :to="`/blog/${post.id}`">Read more</NuxtLink></Button>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
const posts = [
  { id: 1, title: 'Booking etiquette', subtitle: 'Tips for smooth scheduling', excerpt: 'Avoid overlaps, be on time, and keep resources clean.' },
  { id: 2, title: 'Fleet updates', subtitle: 'Cars availability', excerpt: 'We added two new hatchbacks—learn how to book them efficiently.' },
  { id: 3, title: 'Boardroom best practices', subtitle: 'Meetings that work', excerpt: 'Set agendas, share notes, and end on time for everyone’s benefit.' }
]
</script>


