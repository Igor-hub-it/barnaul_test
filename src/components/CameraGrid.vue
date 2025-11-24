<template>
  <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
    <button
      v-for="camera in cameraList"
      :key="camera"
      class="rounded-xl border px-3 py-2 text-xs font-semibold transition focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
      :class="
        selected.includes(camera)
          ? 'border-indigo-500 bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
          : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-200 hover:text-indigo-600'
      "
      :disabled="disabled"
      @click="() => emit('toggle', camera)"
    >
      Камера {{ camera }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  channels: number
  selected: number[]
  disabled: boolean
}>()

const emit = defineEmits<{ (e: 'toggle', camera: number): void }>()

const cameraList = computed(() =>
  Array.from({ length: Math.min(props.channels, 64) }, (_, idx) => idx + 1),
)
</script>

