<script setup lang="ts">
import BaseLayout from '../components/BaseLayout.vue'
import IconamoonArrowRight1Thin from '~icons/iconamoon/arrow-right-1-thin'
</script>

<template>
  <BaseLayout>
    <main class="flex-1 flex flex-col items-center justify-center px-6 py-16 gap-10">
      <div class="space-y-2 text-center">
        <h1 class="text-lg font-semibold tracking-tight text-white">Health Tools</h1>
        <p class="text-white/40 text-xs">A collection of tools for better health decisions.</p>
      </div>

      <div class="w-full max-w-md space-y-2">
        <RouterLink
          to="/additives"
          class="flex items-center justify-between border border-white/10 px-5 py-3 rounded hover:border-white/30 transition-all group"
        >
          <div class="text-left">
            <div class="text-white/80 group-hover:text-white transition-colors">Additives Wiki</div>
            <div class="text-white/30 text-xs mt-0.5">
              Health scores for food additives — sweeteners, preservatives, emulsifiers.
            </div>
          </div>
          <span class="text-white/20 group-hover:text-white/50 transition-colors">
            <IconamoonArrowRight1Thin />
          </span>
        </RouterLink>

        <RouterLink
          to="/rfb"
          class="flex items-center justify-between border border-white/10 px-5 py-3 rounded hover:border-white/30 transition-all group"
        >
          <div class="text-left">
            <div class="flex items-center gap-2">
              <span class="text-white/80 group-hover:text-white transition-colors"
                >Resonance Frequency Breathing</span
              >
            </div>
            <div class="text-white/30 text-xs mt-0.5">
              Visual guide for resonance frequency breathing exercises.
            </div>
          </div>
          <span class="text-white/20 group-hover:text-white/50 transition-colors">
            <IconamoonArrowRight1Thin />
          </span>
        </RouterLink>

        <a
          href="https://nutr.webry.com"
          class="flex items-center justify-between border border-white/10 px-5 py-3 rounded hover:border-white/30 transition-all group"
        >
          <div class="text-left">
            <div class="flex items-center gap-2">
              <span class="text-white/80 group-hover:text-white transition-colors">Nutr</span>
              <span
                class="text-[10px] text-amber-400/40 border border-amber-400/40 px-1.5 py-0.5 rounded leading-none"
                >wip</span
              >
            </div>
            <div class="text-white/30 text-xs mt-0.5">
              Track your daily protein and fiber intake.
            </div>
          </div>
          <span class="text-white/20 group-hover:text-white/50 transition-colors">
            <IconamoonArrowRight1Thin />
          </span>
        </a>
      </div>
    </main>
  </BaseLayout>
</template>
