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

const statusConfig = {
  not_started: { label: 'Not Started', color: 'bg-gray-100 text-gray-700' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700' },
}

export default function GoalsList({ goals, selectedId, onSelect }: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Your Goals</h2>
      <div className="space-y-2">
        {goals.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No goals yet</p>
        ) : (
          goals.map((goal) => (
            <button
              key={goal.id}
              onClick={() => onSelect(goal.id)}
              className={`w-full text-left p-3 rounded-lg transition ${
                selectedId === goal.id
                  ? 'bg-indigo-50 border-2 border-indigo-500'
                  : 'bg-gray-50 border-2 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <p className="font-medium text-sm text-gray-900 truncate">
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
