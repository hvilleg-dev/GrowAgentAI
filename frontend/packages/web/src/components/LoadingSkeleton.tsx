export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow p-4 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
    </div>
  )
}

export function SkeletonMessage() {
  return (
    <div className="flex gap-2 mb-4 animate-pulse">
      <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
      <div className="flex-1">
        <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
      </div>
    </div>
  )
}

export function SkeletonInput() {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-20"></div>
      <div className="h-10 bg-gray-200 rounded w-full"></div>
    </div>
  )
}

export function ChatSkeleton() {
  return (
    <div className="space-y-4">
      <SkeletonMessage />
      <SkeletonMessage />
      <SkeletonMessage />
    </div>
  )
}
