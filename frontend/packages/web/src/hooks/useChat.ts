import { useQuery, useMutation } from '@tanstack/react-query'
import { useDispatch, useSelector } from 'react-redux'
import { apiClient } from '@/services/apiClient'
import { addMessage, setCrisisLevel, setLoading } from '@/store/slices/chatSlice'
import type { AppDispatch, RootState } from '@/store'
import type { ChatRequest, ChatResponse, Message } from '@/types'

// Phase 4: Message Handling & Validation
const PENDING_MESSAGES_KEY = 'messages_pending'
const DRAFT_KEY = 'draft'

export function useChat(sessionId: string) {
  const dispatch = useDispatch<AppDispatch>()
  const { messages, crisisLevel } = useSelector((state: RootState) => state.chat)
  const { user } = useSelector((state: RootState) => state.auth)
  const { current: currentSession } = useSelector((state: RootState) => state.sessions)

  // Load chat history
  const { data: chatHistory = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ['chat', sessionId],
    queryFn: async () => {
      try {
        const response = await apiClient.get<Message[]>(
          `/api/chat/${sessionId}`,
        )
        return response.data
      } catch (error) {
        return []
      }
    },
    enabled: !!sessionId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
  })

  // Send message with Phase 4 enhancements
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      // Phase 4: Validate session status from Redux (not cache)
      if (!currentSession || currentSession.status === 'CLOSED') {
        throw new Error('Session ended. Create a new session to continue.')
      }

      const request: ChatRequest = {
        sessionId: currentSession.id, // Use current session_id from Redux
        userId: user?.id || '',
        message,
      }

      const response = await apiClient.post<ChatResponse>('/api/chat', request)
      return response.data
    },
    onSuccess: (response) => {
      const assistantMessage: Message = {
        id: response.id,
        sessionId: currentSession?.id || sessionId,
        role: 'assistant',
        content: response.content,
        crisisLevel: response.crisisLevel as any,
        timestamp: response.timestamp,
      }
      dispatch(addMessage(assistantMessage))
      if (response.crisisLevel) {
        dispatch(setCrisisLevel(response.crisisLevel as any))
      }

      // Phase 4: Clear draft on successful send
      try {
        localStorage.removeItem(`${DRAFT_KEY}_${sessionId}`)
      } catch (error) {
        console.error('Error clearing draft:', error)
      }
    },
    onError: (error: any) => {
      console.error('Message send error:', error)
      // Phase 4: Messages stay in Redux (optimistic update preserved)
      // User sees the error but message is preserved
    },
    onSettled: () => {
      dispatch(setLoading(false))
    },
  })

  const handleSendMessage = (message: string) => {
    // Phase 4: Validate session before sending
    if (!currentSession || currentSession.status === 'CLOSED') {
      console.error('Cannot send message: session is not active')
      return
    }

    // Add user message immediately (optimistic update)
    const tempId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const userMessage: Message = {
      id: tempId,
      sessionId: currentSession.id,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    }
    dispatch(addMessage(userMessage))
    dispatch(setLoading(true))

    // Phase 4: Auto-save draft to localStorage (debounced by caller)
    try {
      // Note: Draft auto-save is handled in ChatPage with debounce
      localStorage.removeItem(`${DRAFT_KEY}_${sessionId}`)
    } catch (error) {
      console.error('Error clearing draft:', error)
    }

    // Send to API
    sendMessageMutation.mutate(message)
  }

  // Phase 4: Recover draft from localStorage
  const getDraftForSession = (sid: string): string => {
    try {
      return localStorage.getItem(`${DRAFT_KEY}_${sid}`) || ''
    } catch (error) {
      console.error('Error reading draft:', error)
      return ''
    }
  }

  // Phase 4: Save draft to localStorage (called from ChatPage)
  const saveDraft = (text: string) => {
    if (!sessionId) return
    try {
      if (text.trim()) {
        localStorage.setItem(`${DRAFT_KEY}_${sessionId}`, text)
      } else {
        localStorage.removeItem(`${DRAFT_KEY}_${sessionId}`)
      }
    } catch (error) {
      console.error('Error saving draft:', error)
    }
  }

  return {
    messages: messages.length > 0 ? messages : chatHistory,
    crisisLevel,
    isLoading: isLoadingHistory || sendMessageMutation.isPending,
    sendMessage: handleSendMessage,
    error: sendMessageMutation.error,
    getDraftForSession,
    saveDraft,
  }
}
