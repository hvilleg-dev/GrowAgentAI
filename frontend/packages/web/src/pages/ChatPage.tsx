import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '@/store'
import { useSessions } from '@/hooks/useSessions'
import { useChat } from '@/hooks/useChat'
import { setCurrentSession } from '@/store/slices/sessionsSlice'
import CrisisIndicator from '@/components/CrisisIndicator'
import MessageBubble from '@/components/MessageBubble'

export default function ChatPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { sessions, isLoading: isLoadingSessions, createSession, isCreating } = useSessions()
  const { current: currentSession } = useSelector((state: RootState) => state.sessions)
  const { user } = useSelector((state: RootState) => state.auth)

  const sessionId = currentSession?.id || sessions[0]?.id
  const { messages, crisisLevel, isLoading: isChatLoading, sendMessage, error } = useChat(sessionId || '')

  const [inputText, setInputText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Set first session as current
  useEffect(() => {
    if (!currentSession && sessions.length > 0) {
      dispatch(setCurrentSession(sessions[0]))
    }
  }, [sessions, currentSession, dispatch])

  const handleSendMessage = () => {
    if (inputText.trim() && sessionId) {
      sendMessage(inputText)
      setInputText('')
    }
  }

  const handleNewSession = () => {
    if (!user?.id) {
      alert('You must be logged in to create a session')
      return
    }
    createSession({ usuarioId: user.id, objetivo: `Sesión ${new Date().toLocaleTimeString()}` })
  }

  const handleSelectSession = (session: any) => {
    dispatch(setCurrentSession(session))
  }

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - Sessions List */}
      <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 flex flex-col">
        <h2 className="text-lg font-semibold dark:text-gray-100 mb-4">Sessions</h2>
        <button
          onClick={handleNewSession}
          disabled={isCreating}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg mb-4 hover:bg-indigo-700 disabled:opacity-50"
        >
          {isCreating ? 'Creating...' : '+ New Session'}
        </button>

        <div className="space-y-2 flex-1 overflow-y-auto">
          {isLoadingSessions ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading sessions...</p>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No sessions yet</p>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => handleSelectSession(session)}
                className={`p-3 rounded-lg border cursor-pointer transition ${
                  currentSession?.id === session.id
                    ? 'bg-indigo-100 border-indigo-300'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <p className="text-sm font-medium text-gray-900 truncate">{session.objetivo || 'Sin objetivo'}</p>
                <p className="text-xs text-gray-600">Etapa: {session.etapaActual}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 flex justify-between items-center">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {currentSession?.objetivo || 'Chat'}
          </h1>
          {crisisLevel && <CrisisIndicator level={crisisLevel} />}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
          {!sessionId ? (
            <div className="text-center text-gray-500 py-8">
              <p>Create or select a session to start chatting</p>
            </div>
          ) : isChatLoading && messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>Start a new conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                crisisLevel={message.crisisLevel}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm p-2 rounded mb-2">
              Error sending message. Please try again.
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              disabled={!sessionId || isChatLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
            <button
              onClick={handleSendMessage}
              disabled={!sessionId || isChatLoading || !inputText.trim()}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isChatLoading ? '...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
