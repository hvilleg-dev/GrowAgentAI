import { useQuery, useMutation } from '@tanstack/react-query'
import { useDispatch, useSelector } from 'react-redux'
import { apiClient } from '@/services/apiClient'
import { addMessage, setCrisisLevel, setLoading } from '@/store/slices/chatSlice'
import type { AppDispatch, RootState } from '@/store'
import type { ChatRequest, ChatResponse, Message } from '@/types'

export function useChat(sessionId: string) {
  const dispatch = useDispatch<AppDispatch>()
  const { messages, crisisLevel } = useSelector((state: RootState) => state.chat)
  const { user } = useSelector((state: RootState) => state.auth)

  // Load chat history
  const { data: chatHistory = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ['chat', sessionId],
    queryFn: async () => {
      try {
        const response = await apiClient.get<Message[]>(
          `/chat/${sessionId}`,
        )
        return response.data
      } catch (error) {
        return []
      }
    },
    enabled: !!sessionId,
  })

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const request: ChatRequest = {
        sessionId,
        userId: user?.id || '',
        message,
      }
      const response = await apiClient.post<ChatResponse>('/api/chat', request)
      return response.data
    },
    onSuccess: (response) => {
      const assistantMessage: Message = {
        id: response.id,
        sessionId,
        role: 'assistant',
        content: response.content,
        crisisLevel: response.crisisLevel as any,
        timestamp: response.timestamp,
      }
      dispatch(addMessage(assistantMessage))
      if (response.crisisLevel) {
        dispatch(setCrisisLevel(response.crisisLevel as any))
      }
    },
    onSettled: () => {
      dispatch(setLoading(false))
    },
  })

  const handleSendMessage = (message: string) => {
    // Add user message immediately
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      sessionId,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    }
    dispatch(addMessage(userMessage))
    dispatch(setLoading(true))

    // Send to API
    sendMessageMutation.mutate(message)
  }

  return {
    messages: messages.length > 0 ? messages : chatHistory,
    crisisLevel,
    isLoading: isLoadingHistory || sendMessageMutation.isPending,
    sendMessage: handleSendMessage,
    error: sendMessageMutation.error,
  }
}
