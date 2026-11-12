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
    refetchInterval: 30_000, // poll every 30s to detect device takeover and session changes
  })

  const createSessionMutation = useMutation({
    mutationFn: async (request: CreateSessionRequest) => {
      let deviceId = localStorage.getItem('device_id')
      if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem('device_id', deviceId)
      }
      const response = await apiClient.post<Session>('/api/sessions', {
        ...request,
        deviceId
      })
      return response.data
    },
    onSuccess: (session) => {
      dispatch(addSession(session))
      dispatch(setCurrentSession(session))
      localStorage.setItem('current_session_id', session.id) // track for takeover detection
      queryClient.invalidateQueries({ queryKey: ['sessions', user?.id] })
    },
  })

  return {
    sessions,
    isLoading,
    createSession: createSessionMutation.mutate,
    createSessionMutation,
    isCreating: createSessionMutation.isPending,
  }
}
