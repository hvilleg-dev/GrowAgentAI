import { useState } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
import GrowCard from '@/components/goals/GrowCard'
import GoalsList from '@/components/goals/GoalsList'
import GoalForm from '@/components/goals/GoalForm'

export default function GoalsPage() {
  const [showForm, setShowForm] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null)
  const [goals, setGoals] = useState([
    {
      id: '1',
      description: 'Improve productivity',
      status: 'in_progress' as const,
      goal: 'Complete 3 major projects this quarter',
      reality: 'Currently completing 1 project per month',
      options: [
        'Dedicate 2 hours daily to focused work',
        'Use Pomodoro technique',
        'Eliminate distractions during work hours',
      ],
      will: 'Start tomorrow with 2-hour deep work blocks',
      followUp: 'Check progress weekly on Fridays',
    },
    {
      id: '2',
      description: 'Learn new skill',
      status: 'not_started' as const,
      goal: 'Become proficient in machine learning',
      reality: 'Have basic Python knowledge',
      options: [
        'Take online course (Coursera, Udemy)',
        'Build personal projects',
        'Join ML community',
      ],
      will: 'Enroll in course by end of week',
      followUp: 'Complete 1 module per week',
    },
  ])

  const handleAddGoal = (newGoal: any) => {
    const goal = {
      id: String(Date.now()),
      description: newGoal.description,
      status: 'not_started' as const,
      goal: newGoal.goal,
      reality: newGoal.reality,
      options: [newGoal.option1, newGoal.option2, newGoal.option3],
      will: newGoal.will,
      followUp: 'Set follow-up date',
    }
    setGoals([goal, ...goals])
    setSelectedGoal(goal.id)
    setShowForm(false)
  }

  const selectedGoalData = goals.find((g) => g.id === selectedGoal)

  return (
    <div className="h-full bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Goals & Growth</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            {showForm ? 'Cancel' : '+ New Goal'}
          </button>
        </div>

        {/* New Goal Form */}
        {showForm && (
          <div className="mb-6 bg-white rounded-lg shadow p-6">
            <GoalForm onClose={() => setShowForm(false)} onSubmit={handleAddGoal} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                  title="Goal"
                  icon="🎯"
                  content={selectedGoalData.goal}
                  color="bg-blue-50"
                />
                <GrowCard
                  title="Reality"
                  icon="📊"
                  content={selectedGoalData.reality}
                  color="bg-purple-50"
                />
                <GrowCard
                  title="Options"
                  icon="🔄"
                  items={selectedGoalData.options}
                  color="bg-green-50"
                />
                <GrowCard
                  title="Will"
                  icon="💪"
                  content={selectedGoalData.will}
                  color="bg-orange-50"
                />
                <GrowCard
                  title="Follow-up"
                  icon="📅"
                  content={selectedGoalData.followUp}
                  color="bg-red-50"
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500">Select a goal to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
