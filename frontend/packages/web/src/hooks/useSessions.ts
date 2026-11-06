import { useQuery, useMutation } from '@tanstack/react-query'
import { useDispatch } from 'react-redux'
import { apiClient } from '@/services/apiClient'
import { setSessions, addSession, setCurrentSession } from '@/store/slices/sessionsSlice'
import type { AppDispatch } from '@/store'
import type { Session, CreateSessionRequest } from '@/types'

export function useSessions() {
  const dispatch = useDispatch<AppDispatch>()

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const response = await apiClient.get<Session[]>('/api/sessions')
      dispatch(setSessions(response.data))
      return response.data
    },
  })

  const createSessionMutation = useMutation({
    mutationFn: async (request: CreateSessionRequest) => {
      const response = await apiClient.post<Session>('/api/sessions', request)
      return response.data
    },
    onSuccess: (session) => {
      dispatch(addSession(session))
      dispatch(setCurrentSession(session))
    },
  })

  return {
    sessions,
    isLoading,
    createSession: createSessionMutation.mutate,
    isCreating: createSessionMutation.isPending,
  }
}
