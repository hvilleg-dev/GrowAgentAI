import { useEffect, useState } from 'react'

export const UpdateNotification = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [updateDownloaded, setUpdateDownloaded] = useState(false)

  useEffect(() => {
    if (!window.electron) return

    // Listen for update available
    window.electron.onUpdateAvailable(() => {
      setUpdateAvailable(true)
    })

    // Listen for update downloaded
    window.electron.onUpdateDownloaded(() => {
      setUpdateDownloaded(true)
      setUpdateAvailable(false)
    })
  }, [])

  const handleRestart = async () => {
    if (window.electron) {
      await window.electron.restartAndInstall()
    }
  }

  if (!updateDownloaded) return null

  return (
    <div className="fixed bottom-4 right-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-lg shadow-lg z-50">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold">Update downloaded</p>
          <p className="text-sm text-blue-100">Restart to apply the latest version</p>
        </div>
        <button
          onClick={handleRestart}
          className="px-4 py-2 bg-white text-blue-600 font-semibold rounded hover:bg-blue-50 transition"
        >
          Restart Now
        </button>
      </div>
    </div>
  )
}
