import { useDispatch } from 'react-redux'
import { v4 as uuidv4 } from 'uuid'
import { addNotification } from '@/store/slices/uiSlice'
import type { Notification } from '@/types'

interface NotificationOptions {
  message: string
  duration?: number
  id?: string
}

export function useNotification() {
  const dispatch = useDispatch()

  const notify = (type: 'info' | 'success' | 'warning' | 'error', options: NotificationOptions) => {
    const notification: Notification = {
      id: options.id || uuidv4(),
      type,
      message: options.message,
      duration: options.duration,
    }
    dispatch(addNotification(notification))
    return notification.id
  }

  return {
    notify,
    notifyInfo: (options: NotificationOptions) => notify('info', options),
    notifySuccess: (options: NotificationOptions) => notify('success', options),
    notifyWarning: (options: NotificationOptions) => notify('warning', options),
    notifyError: (options: NotificationOptions) => notify('error', options),
  }
}
