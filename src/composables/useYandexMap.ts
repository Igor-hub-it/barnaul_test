type YMapsApi = typeof window extends { ymaps: infer T } ? T : any

let loaderPromise: Promise<YMapsApi> | null = null

declare global {
  interface Window {
    ymaps: any
  }
}

const API_URL = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU'
const API_KEY = import.meta.env.VITE_YMAPS_API_KEY

export const useYandexMapLoader = () => {
  if (!API_KEY) {
    return Promise.reject(
      new Error(
        'Не задан ключ VITE_YMAPS_API_KEY. Добавьте его в .env, чтобы загрузить Яндекс.Карты.',
      ),
    )
  }

  if (loaderPromise) {
    return loaderPromise
  }

  loaderPromise = new Promise((resolve, reject) => {
    if (window.ymaps) {
      window.ymaps.ready(() => resolve(window.ymaps))
      return
    }

    const script = document.createElement('script')
    script.src = `${API_URL}&apikey=${API_KEY}`
    script.async = true
    script.onload = () => {
      // да, сначала грузим скрипт, потом ждём ready
      window.ymaps.ready(() => resolve(window.ymaps))
    }
    script.onerror = (error) =>
      reject(
        error instanceof Error
          ? error
          : new Error('Не удалось загрузить скрипт Яндекс.Карт'),
      )

    document.head.appendChild(script)
  })

  return loaderPromise
}

