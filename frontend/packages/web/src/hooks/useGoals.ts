import { useState, useEffect } from 'react'
import { apiClient } from '@/services/apiClient'
import type { Goal } from '@/types'

export function useGoals(userId: string | null) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return

    const fetchGoals = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await apiClient.get(`/api/goals/${userId}`)
        setGoals(Array.isArray(response.data) ? response.data : response.data.data || [])
      } catch (err: any) {
        setError(err?.response?.data?.error || 'Failed to fetch goals')
      } finally {
        setIsLoading(false)
      }
    }

    fetchGoals()
  }, [userId])

  return { goals, isLoading, error }
}
