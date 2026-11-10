import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDispatch, useSelector } from 'react-redux'
import { apiClient } from '@/services/apiClient'
import { setSessions, addSession, setCurrentSession } from '@/store/slices/sessionsSlice'
import type { AppDispatch, RootState } from '@/store'
import type { Session, CreateSessionRequest } from '@/types'

export function useSessions() {
  const dispatch = useDispatch<AppDispatch>()
  const queryClient = useQueryClient()
  const { user } = useSelector((state: RootState) => state.auth)

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      const response = await apiClient.get<Session[]>(`/api/sessions/usuario/${user.id}`)
      dispatch(setSessions(response.data))
      return response.data
    },
    enabled: !!user?.id,
  })

  const createSessionMutation = useMutation({
    mutationFn: async (request: CreateSessionRequest) => {
      const response = await apiClient.post<Session>('/api/sessions', request)
      return response.data
    },
    onSuccess: (session) => {
      dispatch(addSession(session))
      dispatch(setCurrentSession(session))
      queryClient.invalidateQueries({ queryKey: ['sessions', user?.id] })
    },
  })

  return {
    sessions,
    isLoading,
    createSession: createSessionMutation.mutate,
    isCreating: createSessionMutation.isPending,
  }
}
