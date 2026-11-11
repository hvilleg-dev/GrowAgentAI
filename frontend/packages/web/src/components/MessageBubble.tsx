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
        className={`max-w-full md:max-w-md px-4 py-3 md:py-2 rounded-lg ${
          isUser
            ? 'bg-indigo-600 text-white'
            : 'bg-white dark:bg-gray-700 dark:text-gray-100 border border-gray-200 dark:border-gray-600 text-gray-900'
        }`}
      >
        <p className="text-base md:text-sm leading-relaxed">{message.content}</p>

        {crisisLevel && !isUser && (
          <div className="mt-2 flex justify-end">
            <CrisisIndicator level={crisisLevel} />
          </div>
        )}

        <p className={`text-sm md:text-xs mt-1 ${isUser ? 'text-indigo-100' : 'text-gray-500 dark:text-gray-400'}`}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  )
}
