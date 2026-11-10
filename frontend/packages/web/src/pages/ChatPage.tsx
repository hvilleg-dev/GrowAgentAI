import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '@/store'
import { useSessions } from '@/hooks/useSessions'
import { useChat } from '@/hooks/useChat'
import { useGoals } from '@/hooks/useGoals'
import { setCurrentSession } from '@/store/slices/sessionsSlice'
import CrisisIndicator from '@/components/CrisisIndicator'
import MessageBubble from '@/components/MessageBubble'
import { apiClient } from '@/services/apiClient'

export default function ChatPage() {
  const dispatch = useDispatch<AppDispatch>()
  const { sessions, isLoading: isLoadingSessions, createSession, isCreating } = useSessions()
  const { current: currentSession } = useSelector((state: RootState) => state.sessions)
  const { user } = useSelector((state: RootState) => state.auth)
  const { goals, isLoading: isLoadingGoals } = useGoals(user?.id || null)

  const sessionId = currentSession?.id || sessions[0]?.id
  const { messages, crisisLevel, isLoading: isChatLoading, sendMessage, error } = useChat(sessionId || '')

  const [inputText, setInputText] = useState('')
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [showGoalDetail, setShowGoalDetail] = useState(false)
  const [profileStatus, setProfileStatus] = useState<{ isComplete: boolean; missingFields: string[] } | null>(null)
  const [dismissedProfileNotification, setDismissedProfileNotification] = useState(false)
  const [deleteConfirmSessionId, setDeleteConfirmSessionId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const currentGoal = goals.find(g => g.id === (currentSession?.goalId || selectedGoalId))

  // Check if profile is complete
  useEffect(() => {
    const checkProfileStatus = async () => {
      if (user?.id) {
        try {
          const response = await apiClient.get(`/api/auth/profile-status/${user.id}`)
          setProfileStatus(response.data)
          setDismissedProfileNotification(false)
        } catch (err) {
          console.error('Failed to check profile status:', err)
        }
      }
    }

    checkProfileStatus()
  }, [user?.id])

  // Most recent session = active; older ones are read-only
  const latestSession = sessions.length > 0
    ? sessions.reduce((a, b) =>
        new Date(a.criadaEn) > new Date(b.criadaEn) ? a : b
      )
    : null
  const isReadOnly = !!currentSession && !!latestSession && currentSession.id !== latestSession.id
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
    const payload: any = {
      usuarioId: user.id,
      objetivo: `Sesión ${new Date().toLocaleTimeString()}`
    }
    if (selectedGoalId) {
      payload.goalId = selectedGoalId
    }
    createSession(payload)
  }

  const handleSelectSession = (session: any) => {
    dispatch(setCurrentSession(session))
  }

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('¿Seguro que desea eliminar? Perderá seguimiento a su avance y control de su proceso')) {
      return
    }

    setIsDeleting(true)
    try {
      await apiClient.delete(`/api/sessions/${sessionId}`)
      setDeleteConfirmSessionId(null)

      // If deleting current session, switch to another
      if (currentSession?.id === sessionId) {
        const remaining = sessions.filter(s => s.id !== sessionId)
        if (remaining.length > 0) {
          dispatch(setCurrentSession(remaining[0]))
        } else {
          dispatch(setCurrentSession(null))
        }
      }
    } catch (err) {
      console.error('Failed to delete session:', err)
      alert('Error deleting session')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - Sessions List */}
      <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 flex flex-col">
        <h2 className="text-lg font-semibold dark:text-gray-100 mb-4">Sessions</h2>

        {/* Goal Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Goal (optional)
          </label>
          <select
            value={selectedGoalId || ''}
            onChange={(e) => setSelectedGoalId(e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            disabled={isLoadingGoals}
          >
            <option value="">None</option>
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.goal}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleNewSession}
          disabled={isCreating || (profileStatus && !profileStatus.isComplete)}
          title={profileStatus && !profileStatus.isComplete ? 'Complete your profile first' : ''}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg mb-4 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? 'Creating...' : '+ New Session'}
        </button>

        <div className="space-y-2 flex-1 overflow-y-auto">
          {isLoadingSessions ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading sessions...</p>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No sessions yet</p>
          ) : (
            sessions.map((session) => {
              const isPastSession = session.id !== latestSession?.id
              return (
                <div
                  key={session.id}
                  className={`p-3 rounded-lg border transition ${
                    currentSession?.id === session.id
                      ? 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-300'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div
                    onClick={() => handleSelectSession(session)}
                    className="cursor-pointer flex items-center gap-1.5"
                  >
                    {session.id === latestSession?.id ? (
                      <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" title="Active session" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" title="Past session" />
                    )}
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate flex-1">{session.objetivo || 'Session'}</p>
                    {isPastSession && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteSession(session.id)
                        }}
                        disabled={isDeleting}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 shrink-0 ml-1 text-xs"
                        title="Delete session"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 ml-3.5">Stage: {session.etapaActual}</p>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
        {/* Profile Completion Notification */}
        {profileStatus && !profileStatus.isComplete && !dismissedProfileNotification && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-700 p-4 flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 dark:text-amber-200">Complete Your Profile</h3>
              <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
                Please complete your profile in Settings before starting to chat. Missing: {profileStatus.missingFields.join(', ')}
              </p>
            </div>
            <button
              onClick={() => setDismissedProfileNotification(true)}
              className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 ml-4 shrink-0"
            >
              ✕
            </button>
          </div>
        )}

        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="p-4 flex justify-between items-center">
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {currentSession?.objetivo || 'Chat'}
              </h1>
              {currentGoal && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Goal: {currentGoal.goal}
                </p>
              )}
            </div>
            {crisisLevel && <CrisisIndicator level={crisisLevel} />}
          </div>

          {/* Goal Context — compact chip */}
          {currentGoal && (
            <div className="px-4 pb-2 border-t border-gray-200 dark:border-gray-700 pt-2">
              <button
                onClick={() => setShowGoalDetail(v => !v)}
                className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 transition-colors w-full text-left"
              >
                <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium truncate max-w-xs">
                  🎯 {currentGoal.goal}
                </span>
                <span className="ml-auto shrink-0 text-gray-400">{showGoalDetail ? '▲' : '▼'}</span>
              </button>
              {showGoalDetail && (
                <div className="mt-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-xs text-blue-800 dark:text-blue-200 space-y-1">
                  <p><span className="font-medium">Reality:</span> {currentGoal.reality}</p>
                  <p><span className="font-medium">Options:</span> {currentGoal.options?.join(', ')}</p>
                  <p><span className="font-medium">Will:</span> {currentGoal.will}</p>
                  <p><span className="font-medium">Stage:</span> {currentSession?.etapaActual} · <span className="font-medium">Status:</span> {currentGoal.status}</p>
                </div>
              )}
            </div>
          )}
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
          {isReadOnly ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3">
              <span>🔒</span>
              <span>This is a past session — read only. Create a new session to continue coaching.</span>
            </div>
          ) : (
          <>
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
              placeholder={profileStatus && !profileStatus.isComplete ? 'Complete your profile first...' : 'Type a message...'}
              disabled={!sessionId || isChatLoading || (profileStatus && !profileStatus.isComplete)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
            <button
              onClick={handleSendMessage}
              disabled={!sessionId || isChatLoading || !inputText.trim() || (profileStatus && !profileStatus.isComplete)}
              title={profileStatus && !profileStatus.isComplete ? 'Complete your profile first' : ''}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isChatLoading ? '...' : 'Send'}
            </button>
          </div>
          </>
          )}
        </div>
      </div>
    </div>
  )
}
