import { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import type { RootState, AppDispatch } from '@/store'
import { useSessions } from '@/hooks/useSessions'
// Force Vercel redeploy - ensure all UI updates are deployed
import { useChat } from '@/hooks/useChat'
import { useGoals } from '@/hooks/useGoals'
import { useSessionTimer } from '@/hooks/useSessionTimer'
import { setCurrentSession, setLastActivity } from '@/store/slices/sessionsSlice'
import { useNotification } from '@/hooks/useNotification'
import CrisisIndicator from '@/components/CrisisIndicator'
import MessageBubble from '@/components/MessageBubble'
import ConfirmModal from '@/components/ConfirmModal'
import { useSessionAlerts } from '@/components/SessionAlerts'
import { apiClient } from '@/services/apiClient'

export default function ChatPage() {
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const { notifyInfo } = useNotification()
  const { sessions, isLoading: isLoadingSessions, createSession, createSessionMutation, isCreating } = useSessions()
  const { current: currentSession } = useSelector((state: RootState) => state.sessions)
  const { user } = useSelector((state: RootState) => state.auth)
  const { goals, isLoading: isLoadingGoals } = useGoals(user?.id || null)

  const sessionId = currentSession?.id || sessions[0]?.id
  const { messages, crisisLevel, isLoading: isChatLoading, sendMessage, error, saveDraft, getDraftForSession } = useChat(sessionId || '')

  // Session timer - starts on first message, dual timeout (45min + 15min inactivity)
  const { remainingMs, timeRemaining, isTimerRunning, startTimer, canCreateNewSession, updateActivity } = useSessionTimer(sessionId, currentSession?.status, currentSession?.expiresAt)

  const [inputText, setInputText] = useState('')
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [showGoalDetail, setShowGoalDetail] = useState(false)
  const [showMobileSessions, setShowMobileSessions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [profileStatus, setProfileStatus] = useState<{ isComplete: boolean; missingFields: string[] } | null>(null)
  const [dismissedProfileNotification, setDismissedProfileNotification] = useState(false)
  const [deleteConfirmSessionId, setDeleteConfirmSessionId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [draftConfirmation, setDraftConfirmation] = useState<{ isOpen: boolean; sessionId: string | null }>({
    isOpen: false,
    sessionId: null,
  })
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

  // Most recent session = active; older ones or closed ones are read-only
  const latestSession = sessions.length > 0
    ? sessions.reduce((a, b) =>
        new Date(a.criadaEn) > new Date(b.criadaEn) ? a : b
      )
    : null
  const isReadOnly = !!currentSession && (currentSession.status === 'CLOSED' || (!!latestSession && currentSession.id !== latestSession.id))
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

  // Phase 4: Auto-save draft on input change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      saveDraft(inputText)
    }, 500) // Debounce 500ms

    return () => clearTimeout(timer)
  }, [inputText, sessionId, saveDraft])

  // Phase 4: Recover draft only when session changes (not on every render)
  const draftRecoveredForRef = useRef<string | null>(null)
  useEffect(() => {
    if (sessionId && sessionId !== draftRecoveredForRef.current) {
      draftRecoveredForRef.current = sessionId
      const recovered = getDraftForSession(sessionId)
      if (recovered) {
        setInputText(recovered)
      }
    }
  }, [sessionId, getDraftForSession])

  // Phase 6: Session alerts and notifications
  useSessionAlerts({
    remainingMs,
    isTimerRunning,
    sessionStatus: currentSession?.status,
  })

  const handleSendMessage = () => {
    if (inputText.trim() && sessionId) {
      updateActivity()
      dispatch(setLastActivity())
      sendMessage(inputText)
      setInputText('')
      // Restore focus to input after sending
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  const handleSelectSession = (session: any) => {
    // If switching from ACTIVE to another session with unsaved input
    if (inputText.trim() && currentSession?.status !== 'CLOSED') {
      setDraftConfirmation({ isOpen: true, sessionId: session.id })
    } else {
      dispatch(setCurrentSession(session))
      setInputText('')
    }
  }

  const handleConfirmSwitchSession = () => {
    if (draftConfirmation.sessionId) {
      // Find session and switch
      const session = sessions.find(s => s.id === draftConfirmation.sessionId)
      if (session) {
        dispatch(setCurrentSession(session))
        setInputText('')
      }
    }
    setDraftConfirmation({ isOpen: false, sessionId: null })
  }

  const handleNewSession = () => {
    if (!user?.id) {
      alert('You must be logged in to create a session')
      return
    }
    // Prevent creating new session if one is already active, paused, or still loading (no status yet)
    const activeSession = sessions.find(s => s.status === 'ACTIVE' || s.status === 'PAUSED')
    if (activeSession) {
      alert('Solo puedes tener una sesión activa. Termina la sesión actual antes de crear una nueva.')
      return
    }
    const payload: any = {
      usuarioId: user.id,
      objetivo: `Sesión ${new Date().toLocaleTimeString()}`
    }
    if (selectedGoalId) {
      payload.goalId = selectedGoalId
    }
    // Create session and start timer immediately (pass new session ID to avoid stale closure)
    createSessionMutation.mutate(payload, {
      onSuccess: (newSession: any) => {
        startTimer(newSession?.id)
      }
    })
  }


  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('¿Seguro que desea eliminar? Perderá seguimiento a su avance y control de su proceso')) {
      return
    }

    setIsDeleting(true)
    try {
      await apiClient.delete(`/api/sessions/${sessionId}`)
      setDeleteConfirmSessionId(null)
      notifyInfo({ message: 'Sesión eliminada', duration: 2000 })

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
      {/* Sidebar - Sessions List - Hidden on mobile, visible on desktop */}
      <div className="hidden md:flex w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 flex-col">
        <h2 className="text-xl md:text-lg font-semibold dark:text-gray-100 mb-4">{t('sidebar.sessions')}</h2>

        {/* Goal Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('sidebar.selectGoal')}
          </label>
          <select
            value={selectedGoalId || ''}
            onChange={(e) => setSelectedGoalId(e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            disabled={isLoadingGoals}
          >
            <option value="">{t('common.none')}</option>
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.description}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleNewSession}
          disabled={isCreating || (profileStatus && !profileStatus.isComplete) || !canCreateNewSession || sessions.some(s => s.status === 'ACTIVE' || s.status === 'PAUSED')}
          title={
            profileStatus && !profileStatus.isComplete ? t('chat.completeProfile') :
            !canCreateNewSession ? `Espera ${timeRemaining} para nueva sesión` :
            sessions.some(s => s.status === 'ACTIVE' || s.status === 'PAUSED' || !s.status) ? 'Solo una sesión activa permitida' :
            ''
          }
          className="w-full bg-indigo-600 text-white py-2 rounded-lg mb-4 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? t('common.loading') : t('sidebar.newSession')}
        </button>

        <div className="space-y-2 flex-1 overflow-y-auto">
          {isLoadingSessions ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('sidebar.loadingSessions')}</p>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('sidebar.noSessions')}</p>
          ) : (
            sessions.map((session) => {
              const isPastSession = session.id !== latestSession?.id
              const isClosed = session.status === 'CLOSED'
              return (
                <div
                  key={session.id}
                  className={`p-3 rounded-lg border transition ${
                    currentSession?.id === session.id
                      ? isClosed
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-300 opacity-60'
                        : 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-300'
                      : isClosed
                        ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-70 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer'
                  }`}
                >
                  <div
                    onClick={() => handleSelectSession(session)}
                    className="flex items-center gap-1.5 cursor-pointer"
                  >
                    {session.status === 'ACTIVE' || !session.status
                      ? <span className="w-3 h-3 rounded-full bg-green-500 shrink-0 animate-pulse" title={t('sidebar.activeSession')} />
                      : session.status === 'PAUSED'
                        ? <span className="w-3 h-3 rounded-full bg-yellow-500 shrink-0" title="Pausada" />
                        : <span className="w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-500 shrink-0" title="Archivada" />
                    }
                    <p className={`text-sm font-medium truncate flex-1 ${
                      isClosed
                        ? 'text-gray-500 dark:text-gray-500'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}>{session.objetivo || t('common.session')}</p>
                    {isClosed && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">Cerrada</span>
                    )}
                    {isPastSession && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteSession(session.id)
                        }}
                        disabled={isDeleting}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 shrink-0 ml-1 text-xs"
                        title={t('sidebar.deleteSession')}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                  <p className={`text-xs mt-0.5 ml-3.5 ${
                    isClosed
                      ? 'text-gray-400 dark:text-gray-600'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>{t('sidebar.stage')}: {session.etapaActual}</p>
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
              <h3 className="font-semibold text-amber-900 dark:text-amber-200">{t('profile.completeYourProfile')}</h3>
              <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
                {t('profile.pleaseComplete')} {profileStatus.missingFields.join(', ')}
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
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {currentSession?.objetivo || t('chat.title')}
              </h1>
              {currentGoal && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t('chat.goal')}: {currentGoal.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
              {isTimerRunning && (
                <div className="text-sm md:text-lg font-mono font-bold px-2 md:px-4 py-2 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  {timeRemaining}
                </div>
              )}
              {!isTimerRunning && currentSession && (
                <div className="text-sm md:text-lg font-mono font-bold px-2 md:px-4 py-2 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  {timeRemaining}
                </div>
              )}
              {crisisLevel && <CrisisIndicator level={crisisLevel} />}
            </div>
          </div>

          {/* Mobile: controls bar - visible only on mobile */}
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center gap-2">
            <button
              onClick={() => setShowMobileSessions(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-medium border border-gray-200 dark:border-gray-600"
            >
              <span>📋</span>
              <span>{t('sidebar.sessions')} ({sessions.length})</span>
              <span className="text-gray-400">{showMobileSessions ? '▲' : '▼'}</span>
            </button>
            <button
              onClick={handleNewSession}
              disabled={isCreating || (profileStatus && !profileStatus.isComplete) || !canCreateNewSession || sessions.some(s => s.status === 'ACTIVE' || s.status === 'PAUSED')}
              title={
                profileStatus && !profileStatus.isComplete ? t('chat.completeProfile') :
                !canCreateNewSession ? `Espera ${timeRemaining} para nueva sesión` :
                sessions.some(s => s.status === 'ACTIVE' || s.status === 'PAUSED' || !s.status) ? 'Solo una sesión activa permitida' :
                ''
              }
              className="ml-auto bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isCreating ? '...' : `+ ${t('sidebar.newSession')}`}
            </button>
          </div>

          {/* Mobile: collapsible sessions panel */}
          {showMobileSessions && (
            <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 max-h-52 overflow-y-auto">
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('sidebar.selectGoal')}
                </label>
                <select
                  value={selectedGoalId || ''}
                  onChange={(e) => setSelectedGoalId(e.target.value || null)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  disabled={isLoadingGoals}
                >
                  <option value="">{t('common.none')}</option>
                  {goals.map((goal) => (
                    <option key={goal.id} value={goal.id}>
                      {goal.description}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                {isLoadingSessions ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('sidebar.loadingSessions')}</p>
                ) : sessions.length === 0 ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('sidebar.noSessions')}</p>
                ) : (
                  sessions.map((session) => {
                    const isClosed = session.status === 'CLOSED'
                    const isActive = currentSession?.id === session.id
                    return (
                      <div
                        key={session.id}
                        onClick={() => {
                          handleSelectSession(session)
                          setShowMobileSessions(false)
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition cursor-pointer ${
                          isActive
                            ? isClosed
                              ? 'bg-red-50 dark:bg-red-900/20 border-red-300 opacity-70'
                              : 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-300'
                            : isClosed
                              ? 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 opacity-70 active:bg-gray-200'
                              : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 active:bg-gray-100 dark:active:bg-gray-600'
                        }`}
                      >
                        {isClosed ? (
                          <span className="text-sm shrink-0">🔒</span>
                        ) : session.status === 'PAUSED' ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shrink-0" />
                        ) : (
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shrink-0" />
                        )}
                        <span className={`truncate flex-1 font-medium ${isClosed ? 'text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-100'}`}>
                          {session.objetivo || t('common.session')}
                        </span>
                        <span className="text-gray-400 dark:text-gray-500 shrink-0 text-xs">{session.etapaActual}</span>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {/* Goal Context — compact chip - visible on both mobile and desktop */}
          {currentGoal && (
            <div className="px-4 pb-2 border-t border-gray-200 dark:border-gray-700 pt-2">
              <button
                onClick={() => setShowGoalDetail(v => !v)}
                className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 transition-colors w-full text-left"
              >
                <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium truncate max-w-xs">
                  🎯 {currentGoal.description}
                </span>
                <span className="ml-auto shrink-0 text-gray-400">{showGoalDetail ? '▲' : '▼'}</span>
              </button>
              {showGoalDetail && (
                <div className="mt-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-xs text-blue-800 dark:text-blue-200 space-y-1">
                  <p><span className="font-medium">{t('chat.reality')}:</span> {currentGoal.reality}</p>
                  <p><span className="font-medium">{t('chat.options')}:</span> {currentGoal.options && currentGoal.options.length > 0 ? currentGoal.options.join(', ') : t('chat.notSpecified')}</p>
                  <p><span className="font-medium">{t('chat.will')}:</span> {currentGoal.will || t('chat.notSpecified')}</p>
                  <p><span className="font-medium">{t('chat.stage')}:</span> {currentSession?.etapaActual} · <span className="font-medium">{t('chat.status')}:</span> {currentGoal.status}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
          {!sessionId ? (
            <div className="text-center text-gray-500 py-8">
              <p>{t('chat.createSession')}</p>
            </div>
          ) : isChatLoading && messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>{t('chat.loadingMessages')}</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>{t('chat.startConversation')}</p>
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
              <span>{t('chat.readOnly')}</span>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 text-red-700 text-sm p-2 rounded mb-2">
                  {t('chat.errorSending')}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={
                    profileStatus && !profileStatus.isComplete ? t('chat.completeProfile') :
                    currentSession?.status === 'CLOSED' ? 'Sesión cerrada' :
                    t('chat.typeMessage')
                  }
                  disabled={
                    !sessionId ||
                    isChatLoading ||
                    (profileStatus && !profileStatus.isComplete) ||
                    currentSession?.status === 'CLOSED'
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-100"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={
                    !sessionId ||
                    isChatLoading ||
                    !inputText.trim() ||
                    (profileStatus && !profileStatus.isComplete) ||
                    currentSession?.status === 'CLOSED'
                  }
                  title={
                    profileStatus && !profileStatus.isComplete ? t('chat.completeProfile') :
                    currentSession?.status === 'CLOSED' ? 'Sesión cerrada' :
                    ''
                  }
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isChatLoading ? '...' : t('chat.send')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Draft confirmation modal */}
      <ConfirmModal
        isOpen={draftConfirmation.isOpen}
        title={t('chat.unsavedChanges')}
        message={t('chat.draftWillBeLost') || 'Tu mensaje se perderá. ¿Deseas continuar?'}
        confirmLabel={t('common.continue')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleConfirmSwitchSession}
        onCancel={() => setDraftConfirmation({ isOpen: false, sessionId: null })}
      />
    </div>
  )
}
