<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div
    :class="
      cn(
        'rounded-xl border border-primary-subtle bg-card text-card-foreground shadow-primary-md hover:shadow-primary-lg transition-shadow duration-200',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
