import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { apiClient } from '@/services/apiClient'
import type { RootState } from '@/store'
import GrowCard from '@/components/goals/GrowCard'
import GoalsList from '@/components/goals/GoalsList'
import GoalForm from '@/components/goals/GoalForm'

export default function GoalsPage() {
  const { t } = useTranslation()
  const [showForm, setShowForm] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null)
  const { user } = useSelector((state: RootState) => state.auth)

  const { data: goals = [], isLoading, refetch } = useQuery({
    queryKey: ['goals', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      const response = await apiClient.get(`/api/goals/${user.id}`)
      return response.data
    },
    enabled: !!user?.id,
  })

  const createGoalMutation = useMutation({
    mutationFn: async (goalData: any) => {
      const response = await apiClient.post('/api/goals', {
        usuarioId: user?.id,
        description: goalData.description,
        goal: goalData.goal,
        reality: goalData.reality,
        options: [goalData.option1, goalData.option2, goalData.option3],
        will: goalData.will,
      })
      return response.data
    },
    onSuccess: (newGoal) => {
      refetch()
      setSelectedGoal(newGoal.id)
      setShowForm(false)
    },
  })

  const handleAddGoal = (newGoal: any) => {
    createGoalMutation.mutate(newGoal)
  }

  const selectedGoalData = goals.find((g) => g.id === selectedGoal)

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{t('goals.title')}</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full sm:w-auto bg-indigo-600 text-white px-4 py-3 sm:py-2 rounded-lg hover:bg-indigo-700 font-medium text-base sm:text-sm min-h-12 sm:min-h-10"
          >
            {showForm ? t('common.cancel') : `+ ${t('goals.create')}`}
          </button>
        </div>

        {/* New Goal Form */}
        {showForm && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
            <GoalForm onClose={() => setShowForm(false)} onSubmit={handleAddGoal} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Goals List */}
          <div className="lg:col-span-1">
            <GoalsList
              goals={goals}
              selectedId={selectedGoal}
              onSelect={setSelectedGoal}
            />
          </div>

          {/* GROW Framework Display */}
          <div className="lg:col-span-2">
            {selectedGoalData ? (
              <div className="space-y-4">
                <GrowCard
                  title={t('chat.goal')}
                  icon="🎯"
                  content={selectedGoalData.goal}
                  color="bg-blue-50"
                />
                <GrowCard
                  title={t('chat.reality')}
                  icon="📊"
                  content={selectedGoalData.reality}
                  color="bg-purple-50"
                />
                <GrowCard
                  title={t('chat.options')}
                  icon="🔄"
                  items={selectedGoalData.options}
                  color="bg-green-50"
                />
                <GrowCard
                  title={t('chat.will')}
                  icon="💪"
                  content={selectedGoalData.will}
                  color="bg-orange-50"
                />
                <GrowCard
                  title={t('goals.followUp')}
                  icon="📅"
                  content={selectedGoalData.followUp}
                  color="bg-red-50"
                />
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sm:p-8 text-center">
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">{t('goals.selectGoalDetails')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
