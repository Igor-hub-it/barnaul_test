import { defineStore } from 'pinia'
import type { Device, DeviceGroup } from '../data/mockData'
import { createDeviceSocket } from '../services/deviceSocket'

type Mode = 'online' | 'archive'

type CameraSelection = Record<number, number[]>

type SelectionState = {
  ids: number[]
  cameras: CameraSelection
}

type PersistedState = {
  mode: Mode
  collapsedGroups: string[]
  collapsedDevices: number[]
  selections: Record<Mode, SelectionState>
}

const STORAGE_KEY = 'brn-device-dashboard'

const defaultSelections = (): Record<Mode, SelectionState> => ({
  online: { ids: [], cameras: {} },
  archive: { ids: [], cameras: {} },
})

const safeReadStorage = (): PersistedState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as PersistedState) : null
  } catch (error) {
    console.warn('[device-store] Не удалось прочитать localStorage', error)
    return null
  }
}

const persistState = (state: PersistedState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.warn('[device-store] Не удалось сохранить localStorage', error)
  }
}

export const useDeviceStore = defineStore('devices', {
  state: () => {
    const persisted = typeof window !== 'undefined' ? safeReadStorage() : null

    return {
      mode: persisted?.mode ?? ('online' as Mode),
      groups: [] as DeviceGroup[],
      devices: {} as Record<number, Device>,
      ungroupedIds: [] as number[],
      collapsedGroups: persisted?.collapsedGroups ?? ([] as string[]),
      collapsedDevices: persisted?.collapsedDevices ?? ([] as number[]),
      selections: persisted?.selections ?? defaultSelections(),
      searchQuery: '',
      loading: true,
      socketDisposer: null as null | (() => void),
    }
  },
  getters: {
    currentSelection(state) {
      return state.selections[state.mode]
    },
    isGroupCollapsed: (state) => (groupId: string) =>
      state.collapsedGroups.includes(groupId),
    isDeviceCollapsed: (state) => (deviceId: number) =>
      state.collapsedDevices.includes(deviceId),
    isDeviceSelected() {
      return (deviceId: number) => this.currentSelection.ids.includes(deviceId)
    },
    selectedDevicesForMap(state) {
      const ids =
        state.mode === 'online'
          ? state.selections.online.ids
          : state.selections.archive.ids.slice(0, 1)

      return ids
        .map((id) => state.devices[id])
        .filter((device): device is Device => Boolean(device))
    },
    camerasForDevice() {
      return (deviceId: number) => {
        const cameras = this.currentSelection.cameras[deviceId]
        return cameras ? [...cameras] : []
      }
    },
    isDeviceDisabled(state) {
      return (deviceId: number) => {
        if (state.mode === 'online') {
          return false
        }
        const [activeId] = state.selections.archive.ids
        return Boolean(activeId) && activeId !== deviceId
      }
    },
    filteredGroups(state) {
      const query = state.searchQuery.trim().toLowerCase()
      const match = (device: Device | undefined) => {
        if (!device) {
          return false
        }
        if (!query) {
          return true
        }
        return (
          device.name.toLowerCase().includes(query) ||
          device.id.toString().includes(query)
        )
      }

      const mapDeviceIds = (deviceIds: number[]) =>
        deviceIds
          .map((id) => state.devices[id])
          .filter((device): device is Device => Boolean(device))
          .filter(match)

      return {
        groups: state.groups.map((group) => ({
          ...group,
          devices: mapDeviceIds(group.deviceIds),
        })),
        ungrouped: mapDeviceIds(state.ungroupedIds),
      }
    },
  },
  actions: {
    initFeed() {
      if (this.socketDisposer) {
        return
      }
      const socket = createDeviceSocket(this.handlePayload)
      this.socketDisposer = socket.connect()
    },
    handlePayload(payload: { groups: DeviceGroup[]; devices: Record<number, Device> }) {
      this.groups = payload.groups
      this.devices = payload.devices
      this.ungroupedIds = this.computeUngroupedIds()
      this.loading = false
      this.cleanupSelections()
      this.persist()
    },
    computeUngroupedIds() {
      const groupedIds = new Set<number>()
      this.groups.forEach((group) =>
        group.deviceIds.forEach((deviceId) => groupedIds.add(deviceId)),
      )

      return Object.keys(this.devices)
        .map(Number)
        .filter((id) => !groupedIds.has(id))
    },
    toggleMode(next: Mode) {
      if (this.mode === next) {
        return
      }
      this.mode = next
      this.persist()
    },
    toggleGroupCollapse(groupId: string) {
      if (this.collapsedGroups.includes(groupId)) {
        this.collapsedGroups = this.collapsedGroups.filter((id) => id !== groupId)
      } else {
        this.collapsedGroups = [...this.collapsedGroups, groupId]
      }
      this.persist()
    },
    toggleDeviceCollapse(deviceId: number) {
      if (this.collapsedDevices.includes(deviceId)) {
        this.collapsedDevices = this.collapsedDevices.filter((id) => id !== deviceId)
      } else {
        this.collapsedDevices = [...this.collapsedDevices, deviceId]
      }
      this.persist()
    },
    setSearchQuery(value: string) {
      this.searchQuery = value
    },
    toggleDeviceSelection(deviceId: number) {
      const selection = this.currentSelection
      if (this.mode === 'archive') {
        if (selection.ids[0] === deviceId) {
          selection.ids = []
        } else {
          selection.ids = [deviceId]
        }
        this.selections.archive.ids = [...selection.ids]
      } else {
        if (selection.ids.includes(deviceId)) {
          selection.ids = selection.ids.filter((id) => id !== deviceId)
        } else {
          selection.ids = [...selection.ids, deviceId]
        }
        this.selections.online.ids = [...selection.ids]
      }
      this.persist()
    },
    toggleCamera(deviceId: number, cameraIndex: number) {
      if (!this.currentSelection.ids.includes(deviceId)) {
        return
      }
      const bucket = this.currentSelection.cameras[deviceId] ?? []
      const exists = bucket.includes(cameraIndex)
      const updated = exists
        ? bucket.filter((idx) => idx !== cameraIndex)
        : [...bucket, cameraIndex]
      this.currentSelection.cameras[deviceId] = updated
      this.persist()
    },
    removeDevice(deviceId: number) {
      if (!this.devices[deviceId]) {
        return
      }
      const nextDevices = { ...this.devices }
      delete nextDevices[deviceId]
      this.devices = nextDevices

      this.groups = this.groups.map((group) => ({
        ...group,
        deviceIds: group.deviceIds.filter((id) => id !== deviceId),
      }))
      this.ungroupedIds = this.ungroupedIds.filter((id) => id !== deviceId)
      this.cleanupSelections(deviceId)
      this.persist()
    },
    cleanupSelections(removedId?: number) {
      (['online', 'archive'] as Mode[]).forEach((mode) => {
        const selection = this.selections[mode]
        selection.ids = selection.ids.filter((id) => {
          if (removedId && id === removedId) {
            return false
          }
          return Boolean(this.devices[id])
        })
        Object.keys(selection.cameras).forEach((deviceIdKey) => {
          const numericId = Number(deviceIdKey)
          const exists = Boolean(this.devices[numericId])
          if (!exists || (removedId && removedId === numericId)) {
            delete selection.cameras[numericId]
          }
        })
      })
    },
    persist() {
      const payload: PersistedState = {
        mode: this.mode,
        collapsedGroups: this.collapsedGroups,
        collapsedDevices: this.collapsedDevices,
        selections: this.selections,
      }
      // прячем всё в localStorage, ничего хитрого
      persistState(payload)
    },
  },
})

