import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { removeNotification } from '@/store/slices/uiSlice'
import Toast from './Toast'

export default function ToastContainer() {
  const dispatch = useDispatch()
  const notifications = useSelector((state: RootState) => state.ui.notifications)

  const handleClose = (id: string) => {
    dispatch(removeNotification(id))
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          {...notification}
          onClose={handleClose}
        />
      ))}
    </div>
  )
}
