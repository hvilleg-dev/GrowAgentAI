import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import type { RootState, AppDispatch } from '@/store'
import { useSessions } from '@/hooks/useSessions'
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

/* ────────────────────────────────────────────────────────────────────────────
 * CONSTANTES Y TIPOS
 * ──────────────────────────────────────────────────────────────────────────── */

const SESSION_STATUS = {
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  CLOSED: 'CLOSED',
} as const

const SESSIONS_QUERY_KEY = ['sessions']

const ENFORCE_COOLDOWN = false

type Session = ReturnType<typeof useSessions>['sessions'][number]

const isOpenStatus = (status: string) =>
  status === SESSION_STATUS.ACTIVE || status === SESSION_STATUS.PAUSED

function timerClasses(ms?: number) {
  if (ms === undefined) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
  if (ms <= 2 * 60_000) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  if (ms <= 10 * 60_000) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
  return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
}

/* ────────────────────────────────────────────────────────────────────────────
 * SUBCOMPONENTES
 * ──────────────────────────────────────────────────────────────────────────── */

interface SessionCardProps {
  session: Session
  status: string
  isCurrent: boolean
  canDelete: boolean
  isDeleting: boolean
  compact?: boolean
  onSelect: () => void
  onDelete: () => void
}

function SessionCard({ session, status, isCurrent, canDelete, isDeleting, compact, onSelect, onDelete }: SessionCardProps) {
  const { t } = useTranslation()
  const isClosed = status === SESSION_STATUS.CLOSED
  const dateLabel = session.criadaEn ? new Date(session.criadaEn).toLocaleDateString() : ''

  const dot = isClosed ? (
    <span className="w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-500 shrink-0" title={t('sidebar.closedSession', 'Cerrada')} />
  ) : status === SESSION_STATUS.PAUSED ? (
    <span className="w-3 h-3 rounded-full bg-yellow-500 shrink-0" title={t('sidebar.pausedSession', 'Pausada')} />
  ) : (
    <span className="w-3 h-3 rounded-full bg-green-500 shrink-0 animate-pulse" title={t('sidebar.activeSession')} />
  )

  const surface = isCurrent
    ? isClosed
      ? 'bg-red-50 dark:bg-red-900/20 border-red-300'
      : 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-300'
    : isClosed
      ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'

  return (
    <div className={`${compact ? 'px-3 py-2' : 'p-3'} rounded-lg border transition ${surface} ${isClosed && !isCurrent ? 'opacity-80' : ''}`}>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onSelect}
          className="flex items-center gap-1.5 flex-1 min-w-0 text-left"
          aria-current={isCurrent ? 'true' : undefined}
        >
          {dot}
          <span className={`text-sm font-medium truncate flex-1 ${isClosed ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>
            {session.objetivo || t('common.session')}
          </span>
        </button>
        {canDelete && (
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 shrink-0 ml-1 text-xs disabled:opacity-50"
            title={t('sidebar.deleteSession')}
            aria-label={t('sidebar.deleteSession')}
          >
            🗑️
          </button>
        )}
      </div>
      <p className="text-xs mt-0.5 ml-5 text-gray-500 dark:text-gray-400">
        {t('sidebar.stage')}: {session.etapaActual}
        {dateLabel && ` · ${dateLabel}`}
        {isClosed && ` · ${t('sidebar.closedSession', 'Cerrada')}`}
      </p>
    </div>
  )
}

interface GoalSelectProps {
  goals: { id: string; description: string }[]
  value: string | null
  disabled: boolean
  compact?: boolean
  onChange: (id: string | null) => void
}

function GoalSelect({ goals, value, disabled, compact, onChange }: GoalSelectProps) {
  const { t } = useTranslation()
  return (
    <div className={compact ? 'mb-3' : 'mb-4'}>
      <label className={`block font-medium text-gray-700 dark:text-gray-300 ${compact ? 'text-xs mb-1' : 'text-sm mb-2'}`}>
        {t('sidebar.selectGoal')}
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={disabled}
        className={`w-full border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 ${
          compact ? 'px-2 py-1.5 rounded text-xs' : 'px-3 py-2 rounded-lg text-sm'
        }`}
      >
        <option value="">{t('common.none')}</option>
        {goals.map((goal) => (
          <option key={goal.id} value={goal.id}>
            {goal.description}
          </option>
        ))}
      </select>
    </div>
  )
}

interface NewSessionButtonProps {
  blockReason: string | null
  isCreating: boolean
  compact?: boolean
  onClick: () => void
}

function NewSessionButton({ blockReason, isCreating, compact, onClick }: NewSessionButtonProps) {
  const { t } = useTranslation()
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!!blockReason}
      title={blockReason || ''}
      className={
        compact
          ? 'ml-auto bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap'
          : 'w-full bg-indigo-600 text-white py-2 rounded-lg mb-4 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed'
      }
    >
      {isCreating ? (compact ? '...' : t('common.loading')) : compact ? `+ ${t('sidebar.newSession')}` : t('sidebar.newSession')}
    </button>
  )
}

/* ────────────────────────────────────────────────────────────────────────────
 * PÁGINA
 * ──────────────────────────────────────────────────────────────────────────── */

type ConfirmState = { type: 'delete' | 'end'; sessionId: string } | null

export default function ChatPage() {
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const queryClient = useQueryClient()
  const { notifyInfo } = useNotification()
  const { sessions, isLoading: isLoadingSessions, createSessionMutation, isCreating } = useSessions()
  const { current: reduxCurrentSession } = useSelector((state: RootState) => state.sessions)
  const { user } = useSelector((state: RootState) => state.auth)
  const { goals, isLoading: isLoadingGoals } = useGoals(user?.id || null)

  const [inputText, setInputText] = useState('')
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [showGoalDetail, setShowGoalDetail] = useState(false)
  const [showMobileSessions, setShowMobileSessions] = useState(false)
  const [profileStatus, setProfileStatus] = useState<{ isComplete: boolean; missingFields: string[] } | null>(null)
  const [dismissedProfileNotification, setDismissedProfileNotification] = useState(false)
  const [confirm, setConfirm] = useState<ConfirmState>(null)
  const [isBusy, setIsBusy] = useState(false)

  const [closedIds, setClosedIds] = useState<Set<string>>(() => new Set())
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => new Set())

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const stickToBottomRef = useRef(true)
  const lastSentRef = useRef<string>('')

  const invalidateSessions = useCallback(
    () => queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY }),
    [queryClient]
  )

  /* ── FUENTE ÚNICA DE VERDAD DE SESIONES ─────────────────────────────────── */

  const getStatus = useCallback(
    (s: { id: string; status?: string | null }): string =>
      closedIds.has(s.id) ? SESSION_STATUS.CLOSED : s.status || SESSION_STATUS.ACTIVE,
    [closedIds]
  )

  const visibleSessions = useMemo(
    () =>
      sessions
        .filter((s) => !hiddenIds.has(s.id))
        .sort((a, b) => new Date(b.criadaEn).getTime() - new Date(a.criadaEn).getTime()),
    [sessions, hiddenIds]
  )

  const activeSession = useMemo(
    () => visibleSessions.find((s) => isOpenStatus(getStatus(s))) ?? null,
    [visibleSessions, getStatus]
  )

  const currentSession = useMemo<Session | null>(
    () => visibleSessions.find((s) => s.id === reduxCurrentSession?.id) ?? null,
    [visibleSessions, reduxCurrentSession?.id]
  )
  const sessionId = currentSession?.id || ''
  const currentStatus = currentSession ? getStatus(currentSession) : null

  const profileIncomplete = !!profileStatus && !profileStatus.isComplete
  const isCurrentOpen = !!currentStatus && isOpenStatus(currentStatus)
  const canWrite = !!currentSession && isCurrentOpen && !profileIncomplete
  const isReadOnly = !!currentSession && !isCurrentOpen

  const currentGoal = goals.find((g) => g.id === (currentSession?.goalId || selectedGoalId))

  /* ── HOOKS DE CHAT Y TEMPORIZADOR ───────────────────────────────────────── */

  const { messages, crisisLevel, isLoading: isChatLoading, sendMessage, error, saveDraft, getDraftForSession } = useChat(sessionId)

  const { remainingMs, timeRemaining, isTimerRunning, startTimer, canCreateNewSession, updateActivity } = useSessionTimer(
    sessionId,
    currentStatus ?? undefined,
    currentSession?.expiresAt
  )

  useSessionAlerts({
    remainingMs,
    isTimerRunning,
    sessionStatus: currentStatus ?? undefined,
  })

  /* ── REGLA ÚNICA PARA "NUEVA SESIÓN" ────────────────────────────────────── */

  const newSessionBlockReason: string | null = (() => {
    if (!user?.id) return t('chat.loginRequired', 'Debes iniciar sesión para crear una sesión')
    if (isLoadingSessions) return t('common.loading')
    if (profileIncomplete) return t('chat.completeProfile')
    if (isCreating) return t('common.loading')
    if (activeSession) return t('chat.onlyOneActive', 'Solo puedes tener una sesión activa. Termina la actual para crear una nueva.')
    if (ENFORCE_COOLDOWN && !canCreateNewSession) return t('chat.waitCooldown', { time: timeRemaining, defaultValue: 'Espera {{time}} para una nueva sesión' })
    return null
  })()

  /* ── EFECTOS ────────────────────────────────────────────────────────────── */

  useEffect(() => {
    if (!user?.id) return
    let cancelled = false
    apiClient
      .get(`/api/auth/profile-status/${user.id}`)
      .then((res) => {
        if (cancelled) return
        setProfileStatus(res.data)
        setDismissedProfileNotification(false)
      })
      .catch((err) => console.error('Failed to check profile status:', err))
    return () => {
      cancelled = true
    }
  }, [user?.id])

  // Selección automática: la abierta primero; si no, la más reciente
  useEffect(() => {
    if (isLoadingSessions) return
    if (currentSession) return
    const next = activeSession ?? visibleSessions[0] ?? null
    if (!reduxCurrentSession && !next) return
    dispatch(setCurrentSession(next))
  }, [isLoadingSessions, currentSession, activeSession, visibleSessions, reduxCurrentSession, dispatch])

  // Limpiar overrides locales cuando el servidor ya refleja el cambio
  useEffect(() => {
    setClosedIds((prev) => {
      if (prev.size === 0) return prev
      const next = new Set(prev)
      sessions.forEach((s) => {
        if (s.status === SESSION_STATUS.CLOSED) next.delete(s.id)
      })
      return next.size === prev.size ? prev : next
    })
    setHiddenIds((prev) => {
      if (prev.size === 0) return prev
      const present = new Set(sessions.map((s) => s.id))
      const next = new Set([...prev].filter((id) => present.has(id)))
      return next.size === prev.size ? prev : next
    })
  }, [sessions])

  // Cierre inmediato al llegar a expiresAt, sin esperar a refrescar
  const markClosed = useCallback(
    (id: string, reason: 'expired' | 'manual') => {
      setClosedIds((prev) => new Set(prev).add(id))
      invalidateSessions()
      notifyInfo({
        message:
          reason === 'expired'
            ? t('chat.sessionExpired', 'La sesión terminó. Puedes leerla o iniciar una nueva.')
            : t('chat.sessionEnded', 'Sesión terminada'),
        duration: 4000,
      })
    },
    [invalidateSessions, notifyInfo, t]
  )

  useEffect(() => {
    if (!currentSession?.id || !isCurrentOpen || !currentSession.expiresAt) return
    const id = currentSession.id
    const msLeft = new Date(currentSession.expiresAt).getTime() - Date.now()
    if (msLeft <= 0) {
      markClosed(id, 'expired')
      return
    }
    const timeout = setTimeout(() => markClosed(id, 'expired'), msLeft + 500)
    return () => clearTimeout(timeout)
  }, [currentSession?.id, currentSession?.expiresAt, isCurrentOpen, markClosed])

  // Fallback: si el hook del temporizador llega a 0 estando en marcha
  const runningForRef = useRef<string | null>(null)
  useEffect(() => {
    if (isTimerRunning) {
      runningForRef.current = sessionId
      return
    }
    if (runningForRef.current && runningForRef.current === sessionId && isCurrentOpen && (remainingMs ?? 0) <= 0) {
      markClosed(sessionId, 'expired')
    }
    runningForRef.current = null
  }, [isTimerRunning, remainingMs, sessionId, isCurrentOpen, markClosed])

  // Restaurar texto y refrescar estado si falla el envío
  useEffect(() => {
    if (!error) return
    setInputText((prev) => prev || lastSentRef.current)
    invalidateSessions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error])

  // Scroll inteligente
  const handleMessagesScroll = () => {
    const el = messagesContainerRef.current
    if (!el) return
    stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120
  }
  useEffect(() => {
    stickToBottomRef.current = true
  }, [sessionId])
  useEffect(() => {
    if (stickToBottomRef.current) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sessionId])

  // Foco automático al cambiar sesión o cuando termina de responder
  const focusInput = useCallback(() => {
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [])
  useEffect(() => {
    if (canWrite) focusInput()
  }, [canWrite, sessionId, isChatLoading, focusInput])

  // Borradores por sesión
  const draftOwnerRef = useRef<string | null>(null)
  useEffect(() => {
    if (!sessionId) return
    draftOwnerRef.current = null
    setInputText(getDraftForSession(sessionId) || '')
    draftOwnerRef.current = sessionId
  }, [sessionId, getDraftForSession])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (draftOwnerRef.current === sessionId) saveDraft(inputText)
    }, 500)
    return () => clearTimeout(timer)
  }, [inputText, sessionId, saveDraft])

  /* ── ACCIONES ───────────────────────────────────────────────────────────── */

  const handleSendMessage = () => {
    const text = inputText.trim()
    if (!text || !canWrite || isChatLoading) return
    lastSentRef.current = text
    updateActivity()
    dispatch(setLastActivity())
    sendMessage(text)
    setInputText('')
    focusInput()
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSelectSession = (session: Session) => {
    if (session.id === sessionId) return
    if (canWrite && inputText.trim()) saveDraft(inputText)
    dispatch(setCurrentSession(session))
    setShowMobileSessions(false)
  }

  const handleNewSession = () => {
    if (newSessionBlockReason || !user?.id) return
    const payload: { usuarioId: string; objetivo: string; goalId?: string } = {
      usuarioId: user.id,
      objetivo: `${t('common.session', 'Sesión')} ${new Date().toLocaleTimeString()}`,
    }
    if (selectedGoalId) payload.goalId = selectedGoalId

    createSessionMutation.mutate(payload, {
      onSuccess: (newSession: Session) => {
        dispatch(setCurrentSession(newSession))
        startTimer(newSession?.id)
        invalidateSessions()
        setShowMobileSessions(false)
        focusInput()
      },
      onError: () => {
        invalidateSessions()
        notifyInfo({
          message: t('chat.createFailed', 'No se pudo crear la sesión. Revisa si ya tienes una activa.'),
          duration: 4000,
        })
      },
    })
  }

  const handleEndSession = async (id: string) => {
    setIsBusy(true)
    try {
      await apiClient.post(`/api/sessions/${id}/close`)
      markClosed(id, 'manual')
    } catch (err) {
      console.error('Failed to end session:', err)
      invalidateSessions()
      notifyInfo({ message: t('chat.endFailed', 'No se pudo terminar la sesión'), duration: 3000 })
    } finally {
      setIsBusy(false)
      setConfirm(null)
    }
  }

  const handleDeleteSession = async (id: string) => {
    const target = sessions.find((s) => s.id === id)
    if (!target || isOpenStatus(getStatus(target))) {
      setConfirm(null)
      return
    }
    setIsBusy(true)
    setHiddenIds((prev) => new Set(prev).add(id))
    setConfirm(null)
    try {
      await apiClient.delete(`/api/sessions/${id}`)
      notifyInfo({ message: t('chat.sessionDeleted', 'Sesión eliminada'), duration: 2000 })
    } catch (err) {
      console.error('Failed to delete session:', err)
      setHiddenIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      notifyInfo({ message: t('chat.deleteFailed', 'No se pudo eliminar la sesión'), duration: 3000 })
    } finally {
      setIsBusy(false)
      invalidateSessions()
    }
  }

  const handleConfirm = () => {
    if (!confirm) return
    if (confirm.type === 'end') handleEndSession(confirm.sessionId)
    else handleDeleteSession(confirm.sessionId)
  }

  const renderSessionCard = (session: Session, compact = false) => {
    const status = getStatus(session)
    return (
      <SessionCard
        key={session.id}
        session={session}
        status={status}
        isCurrent={currentSession?.id === session.id}
        canDelete={!isOpenStatus(status)}
        isDeleting={isBusy}
        compact={compact}
        onSelect={() => handleSelectSession(session)}
        onDelete={() => setConfirm({ type: 'delete', sessionId: session.id })}
      />
    )
  }

  const sessionListContent = (compact: boolean) =>
    isLoadingSessions ? (
      <p className="text-sm text-gray-500 dark:text-gray-400">{t('sidebar.loadingSessions')}</p>
    ) : visibleSessions.length === 0 ? (
      <p className="text-sm text-gray-500 dark:text-gray-400">{t('sidebar.noSessions')}</p>
    ) : (
      visibleSessions.map((s) => renderSessionCard(s, compact))
    )

  /* ── RENDER ─────────────────────────────────────────────────────────────── */

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      {/* Sidebar (desktop) */}
      <div className="hidden md:flex w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 flex-col">
        <h2 className="text-xl md:text-lg font-semibold dark:text-gray-100 mb-4">{t('sidebar.sessions')}</h2>

        <GoalSelect goals={goals} value={selectedGoalId} disabled={isLoadingGoals} onChange={setSelectedGoalId} />

        <NewSessionButton blockReason={newSessionBlockReason} isCreating={isCreating} onClick={handleNewSession} />

        <div className="space-y-2 flex-1 overflow-y-auto">{sessionListContent(false)}</div>
      </div>

      {/* Área principal */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-900">
        {profileIncomplete && !dismissedProfileNotification && profileStatus && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-700 p-4 flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 dark:text-amber-200">{t('profile.completeYourProfile')}</h3>
              <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
                {t('profile.pleaseComplete')} {profileStatus.missingFields.join(', ')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDismissedProfileNotification(true)}
              className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 ml-4 shrink-0"
              aria-label={t('common.close', 'Cerrar')}
            >
              ✕
            </button>
          </div>
        )}

        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="p-4 flex justify-between items-center gap-2">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                {currentSession?.objetivo || t('chat.title')}
              </h1>
              {currentGoal && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                  {t('chat.goal')}: {currentGoal.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
              {isCurrentOpen && (
                <div
                  role="timer"
                  className={`text-sm md:text-lg font-mono font-bold px-2 md:px-4 py-2 rounded ${timerClasses(isTimerRunning ? remainingMs : undefined)}`}
                >
                  {timeRemaining}
                </div>
              )}
              {isReadOnly && (
                <span className="text-xs md:text-sm font-medium px-2 md:px-3 py-2 rounded bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  🔒 {t('sidebar.closedSession', 'Cerrada')}
                </span>
              )}
              {canWrite && (
                <button
                  type="button"
                  onClick={() => sessionId && setConfirm({ type: 'end', sessionId })}
                  disabled={isBusy}
                  className="text-xs md:text-sm px-2 md:px-3 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 disabled:opacity-50"
                >
                  {t('chat.endSession', 'Terminar sesión')}
                </button>
              )}
              {crisisLevel && <CrisisIndicator level={crisisLevel} />}
            </div>
          </div>

          {/* Controles móviles */}
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowMobileSessions((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-medium border border-gray-200 dark:border-gray-600"
            >
              <span>📋</span>
              <span>
                {t('sidebar.sessions')} ({visibleSessions.length})
              </span>
              <span className="text-gray-400">{showMobileSessions ? '▲' : '▼'}</span>
            </button>
            <NewSessionButton compact blockReason={newSessionBlockReason} isCreating={isCreating} onClick={handleNewSession} />
          </div>

          {showMobileSessions && (
            <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 max-h-60 overflow-y-auto">
              <GoalSelect compact goals={goals} value={selectedGoalId} disabled={isLoadingGoals} onChange={setSelectedGoalId} />
              <div className="space-y-1.5">{sessionListContent(true)}</div>
            </div>
          )}

          {currentGoal && (
            <div className="px-4 pb-2 border-t border-gray-200 dark:border-gray-700 pt-2">
              <button
                type="button"
                onClick={() => setShowGoalDetail((v) => !v)}
                className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 transition-colors w-full text-left"
              >
                <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium truncate max-w-xs">
                  🎯 {currentGoal.description}
                </span>
                <span className="ml-auto shrink-0 text-gray-400">{showGoalDetail ? '▲' : '▼'}</span>
              </button>
              {showGoalDetail && (
                <div className="mt-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-xs text-blue-800 dark:text-blue-200 space-y-1">
                  <p>
                    <span className="font-medium">{t('chat.reality')}:</span> {currentGoal.reality}
                  </p>
                  <p>
                    <span className="font-medium">{t('chat.options')}:</span>{' '}
                    {currentGoal.options && currentGoal.options.length > 0 ? currentGoal.options.join(', ') : t('chat.notSpecified')}
                  </p>
                  <p>
                    <span className="font-medium">{t('chat.will')}:</span> {currentGoal.will || t('chat.notSpecified')}
                  </p>
                  <p>
                    <span className="font-medium">{t('chat.stage')}:</span> {currentSession?.etapaActual} ·{' '}
                    <span className="font-medium">{t('chat.status')}:</span> {currentGoal.status}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mensajes */}
        <div
          ref={messagesContainerRef}
          onScroll={handleMessagesScroll}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900"
        >
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
            messages.map((message) => <MessageBubble key={message.id} message={message} crisisLevel={message.crisisLevel} />)
          )}
          {isChatLoading && messages.length > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400" aria-live="polite">
              {t('chat.coachTyping', 'El coach está escribiendo…')}
            </p>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Entrada */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          {isReadOnly ? (
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3">
              <span>🔒</span>
              <span className="flex-1">{t('chat.readOnly')}</span>
              {currentSession && (
                <button
                  type="button"
                  onClick={() => setConfirm({ type: 'delete', sessionId: currentSession.id })}
                  className="text-xs text-red-600 dark:text-red-400 hover:underline"
                >
                  {t('sidebar.deleteSession')}
                </button>
              )}
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 text-red-700 text-sm p-2 rounded mb-2" role="alert">
                  {t('chat.errorSending')}
                </div>
              )}
              <div className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder={profileIncomplete ? t('chat.completeProfile') : t('chat.typeMessage')}
                  disabled={!canWrite}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-100 resize-none max-h-32"
                />
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!canWrite || isChatLoading || !inputText.trim()}
                  title={profileIncomplete ? t('chat.completeProfile') : ''}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isChatLoading ? '...' : t('chat.send')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal único de confirmación */}
      <ConfirmModal
        isOpen={!!confirm}
        title={
          confirm?.type === 'end'
            ? t('chat.endSessionTitle', 'Terminar sesión')
            : t('sidebar.deleteSession')
        }
        message={
          confirm?.type === 'end'
            ? t('chat.endSessionMessage', 'La sesión pasará a solo lectura y podrás iniciar una nueva. ¿Deseas terminarla?')
            : t('chat.deleteSessionMessage', '¿Seguro que desea eliminar? Perderá seguimiento a su avance y control de su proceso.')
        }
        confirmLabel={t('common.continue', 'Continuar')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />
    </div>
  )
}
