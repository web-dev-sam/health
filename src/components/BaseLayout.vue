<script setup lang="ts">
import { useSlots } from 'vue'

defineProps<{ logoTo?: string }>()

const slots = useSlots()
</script>

<template>
  <div class="min-h-screen bg-[#0d0d0d] text-[#e8e8e8] font-mono text-sm flex flex-col">
    <nav class="border-b border-white/10 px-4 py-4">
      <div
        class="max-w-4xl mx-auto flex items-center gap-4"
        :class="slots.nav ? '' : 'justify-center'"
      >
        <RouterLink :to="logoTo ?? '/'" aria-label="Home" class="shrink-0">
          <img src="/logo.svg" width="24" height="24" alt="Logo" />
        </RouterLink>
        <slot name="nav" />
      </div>
      <slot name="nav-extra" />
    </nav>
    <slot />
  </div>
</template>
