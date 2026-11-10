import { useTranslation } from 'react-i18next'

interface Goal {
  id: string
  description: string
  status: 'not_started' | 'in_progress' | 'completed'
}

interface Props {
  goals: Goal[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export default function GoalsList({ goals, selectedId, onSelect }: Props) {
  const { t } = useTranslation()

  const statusConfig = {
    not_started: { label: t('goals.notStarted'), color: 'bg-gray-100 text-gray-700' },
    in_progress: { label: t('goals.inProgress'), color: 'bg-blue-100 text-blue-700' },
    completed: { label: t('goals.completed'), color: 'bg-green-100 text-green-700' },
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold dark:text-gray-100 mb-4">{t('goals.yourGoals')}</h2>
      <div className="space-y-2">
        {goals.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">{t('goals.noGoalsYet')}</p>
        ) : (
          goals.map((goal) => (
            <button
              key={goal.id}
              onClick={() => onSelect(goal.id)}
              className={`w-full text-left p-3 rounded-lg transition ${
                selectedId === goal.id
                  ? 'bg-indigo-50 dark:bg-indigo-900 border-2 border-indigo-500'
                  : 'bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                {goal.description}
              </p>
              <div className="mt-2">
                <span
                  className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                    statusConfig[goal.status].color
                  }`}
                >
                  {statusConfig[goal.status].label}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
