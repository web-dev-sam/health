<script setup lang="ts">
defineProps<{
  principles: string[]
  heading?: string
}>()
</script>

<template>
  <section>
    <h2 class="text-xs text-white/30 uppercase tracking-widest mb-4">{{ heading }}</h2>
    <ul class="space-y-2">
      <li
        v-for="p in principles"
        :key="p"
        class="flex items-start gap-2 text-white/60 text-xs leading-relaxed"
      >
        <span class="text-white/20 shrink-0 mt-0.5">—</span>
        {{ p }}
      </li>
    </ul>
  </section>
</template>
