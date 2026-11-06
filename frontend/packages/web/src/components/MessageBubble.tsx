import type { Message, CrisisLevel } from '@/types'
import CrisisIndicator from './CrisisIndicator'

interface Props {
  message: Message
  crisisLevel?: CrisisLevel
}

export default function MessageBubble({ message, crisisLevel }: Props) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs px-4 py-2 rounded-lg ${
          isUser
            ? 'bg-indigo-600 text-white'
            : 'bg-white border border-gray-200 text-gray-900'
        }`}
      >
        <p className="text-sm">{message.content}</p>

        {crisisLevel && !isUser && (
          <div className="mt-2 flex justify-end">
            <CrisisIndicator level={crisisLevel} />
          </div>
        )}

        <p className={`text-xs mt-1 ${isUser ? 'text-indigo-100' : 'text-gray-500'}`}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  )
}
