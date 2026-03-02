import { ref } from 'vue'

const notifications = ref([])
let nextId = 0

const DEFAULT_DURATION = 4000

/**
 * Composable de notifications toast.
 * Partagé globalement via des refs réactives.
 *
 * @returns {{ notifications: Ref, notify: Function, dismiss: Function }}
 */
export function useNotification() {
  function notify({ message, type = 'info', duration = DEFAULT_DURATION }) {
    const id = nextId++
    const notification = { id, message, type, timestamp: Date.now() }
    notifications.value.push(notification)

    if (duration > 0) {
      setTimeout(() => dismiss(id), duration)
    }

    return id
  }

  function dismiss(id) {
    const index = notifications.value.findIndex((n) => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  function success(message, duration) {
    return notify({ message, type: 'success', duration })
  }

  function error(message, duration) {
    return notify({ message, type: 'error', duration: duration ?? 6000 })
  }

  function warning(message, duration) {
    return notify({ message, type: 'warning', duration })
  }

  function info(message, duration) {
    return notify({ message, type: 'info', duration })
  }

  return { notifications, notify, dismiss, success, error, warning, info }
}
