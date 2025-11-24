<template>
  <div class="flex h-full flex-col gap-6 px-6 py-5">
    <header class="space-y-4">
      <div>
        <p class="text-[11px] uppercase tracking-[0.2em] text-slate-400">
          Управление
        </p>
        <h1 class="text-xl font-semibold text-slate-900">
          Устройства и камеры
        </h1>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <button
          v-for="option in modes"
          :key="option.value"
          class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold transition hover:border-indigo-300 hover:text-indigo-600"
          :class="option.value === currentMode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-50 text-slate-600'"
          @click="() => setMode(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </header>

    <label class="flex flex-col gap-2 text-xs font-medium text-slate-500">
      <span>Поиск устройства</span>
      <input
        v-model.trim="searchValue"
        type="text"
        placeholder="Имя или ID"
        class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-inner shadow-slate-200/70 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
      />
    </label>

    <p
      v-if="loading"
      class="text-sm font-medium text-slate-400"
    >
      Загружаем
    </p>

    <section v-else class="flex flex-col gap-5 pb-6">
      <DeviceGroup
        v-for="group in filtered.groups"
        :key="group.id"
        :group="group"
        :collapsed="isGroupCollapsed(group.id)"
        @toggle="() => toggleGroup(group.id)"
      />

      <DeviceGroup
        v-if="filtered.ungrouped.length"
        key="ungrouped"
        :group="ungroupedGroup"
        :collapsed="isGroupCollapsed(ungroupedGroup.id)"
        :devices="filtered.ungrouped"
        @toggle="() => toggleGroup(ungroupedGroup.id)"
      />

      <p
        v-if="!filtered.groups.some((g) => g.devices.length) && !filtered.ungrouped.length"
        class="text-sm font-medium text-slate-400"
      >
        Ничего не найдено
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import DeviceGroup from './DeviceGroup.vue'
import { useDeviceStore } from '../stores/deviceStore'

const deviceStore = useDeviceStore()

const modes = [
  { value: 'online', label: 'Онлайн' },
  { value: 'archive', label: 'Архив' },
] as const

const searchValue = ref(deviceStore.searchQuery)
watch(
  searchValue,
  (value) => {
    console.log('[sidebar] фильтр', value)
    deviceStore.setSearchQuery(value)
  },
  { immediate: true },
)

const filtered = computed(() => deviceStore.filteredGroups)
const loading = computed(() => deviceStore.loading)
const currentMode = computed(() => deviceStore.mode)

const isGroupCollapsed = (id: string) => deviceStore.isGroupCollapsed(id)
const toggleGroup = (id: string) => deviceStore.toggleGroupCollapse(id)
const setMode = (mode: 'online' | 'archive') => {
  deviceStore.toggleMode(mode)
}

const ungroupedGroup = {
  id: 'ungrouped',
  name: 'Без группы',
  deviceIds: [],
}
</script>

