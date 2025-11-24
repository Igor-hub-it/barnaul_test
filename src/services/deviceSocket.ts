import { devices, groups } from '../data/mockData'
import type { Device, DeviceGroup } from '../data/mockData'

export type DevicePayload = {
  groups: DeviceGroup[]
  devices: Record<number, Device>
}

// эмуляция вебсокета, чтобы выглядело почти по-настоящему
export const createDeviceSocket = (
  onMessage: (payload: DevicePayload) => void,
) => {
  let aliveTimer: number | undefined

  const pushInitialPayload = () => {
    const payload: DevicePayload = {
      groups: JSON.parse(JSON.stringify(groups)),
      devices: JSON.parse(JSON.stringify(devices)),
    }
    console.log('[device-socket] отправляю initial payload')
    onMessage(payload)
  }

  const startHeartbeat = () => {
    aliveTimer = window.setInterval(() => {
      // просто пингуем
      console.debug('[device-socket] heartbeat')
    }, 15000)
  }

  const connect = () => {
    // имитайия задержки (оставил опечатку намеренно)
    const initTimer = window.setTimeout(() => {
      pushInitialPayload()
      startHeartbeat()
    }, 600)

    return () => {
      window.clearTimeout(initTimer)
      if (aliveTimer) {
        window.clearInterval(aliveTimer)
      }
    }
  }

  return { connect }
}

