<template>
  <article class="rounded-2xl border border-slate-200 bg-white/90 shadow-lg shadow-slate-200/60">
    <button
      class="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-slate-50"
      @click="emit('toggle')"
    >
      <div class="flex items-center gap-2 text-sm font-semibold text-slate-800">
        <span
          class="text-slate-400 transition"
          :class="collapsed ? 'rotate-0' : 'rotate-90'"
        >
          ⯈
        </span>
        <span>{{ group.name }}</span>
        <small v-if="devices.length" class="text-xs text-slate-400">
          ({{ devices.length }})
        </small>
      </div>
    </button>

    <div v-show="!collapsed" class="flex flex-col gap-3 px-4 pb-4">
      <DeviceItem
        v-for="device in devices"
        :key="device.id"
        :device="device"
      />

      <p v-if="!devices.length" class="text-sm font-medium text-slate-400">
        Нет совпадений
      </p>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Device, DeviceGroup } from '../data/mockData'
import DeviceItem from './DeviceItem.vue'

type EnrichedGroup = DeviceGroup & { devices?: Device[] }

const props = defineProps<{
  group: EnrichedGroup
  collapsed: boolean
  devices?: Device[]
}>()

const emit = defineEmits<{ (e: 'toggle'): void }>()

const devices = computed(() => {
  // проверка на случай если пришёл пустой массив
  return props.devices ?? props.group.devices ?? []
})
</script>

