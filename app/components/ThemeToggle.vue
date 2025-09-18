<template>
  <Button variant="ghost" size="icon" @click="toggle">
    <span v-if="isDark">🌙</span>
    <span v-else>☀️</span>
  </Button>
  
</template>

<script setup lang="ts">
const isDark = useState('isDark', () => false)

function toggle() {
  isDark.value = !isDark.value
  const root = document.documentElement
  if (isDark.value) root.classList.add('dark')
  else root.classList.remove('dark')
}
</script>


