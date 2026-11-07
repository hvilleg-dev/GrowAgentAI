import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const goalSchema = z.object({
  description: z.string().min(1, 'Description required'),
  goal: z.string().min(1, 'Goal required'),
  reality: z.string().min(1, 'Reality required'),
  option1: z.string().min(1, 'Option 1 required'),
  option2: z.string().min(1, 'Option 2 required'),
  option3: z.string().min(1, 'Option 3 required'),
  will: z.string().min(1, 'Will/Commitment required'),
})

type GoalFormData = z.infer<typeof goalSchema>

interface Props {
  onClose: () => void
  onSubmit?: (data: GoalFormData) => void
}

export default function GoalForm(props: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  console.log('GoalForm rendered, onSubmit:', props.onSubmit ? 'exists' : 'undefined')
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
  })

  const onSubmit = async (data: GoalFormData) => {
    console.log('Form submitted with data:', data)
    setIsSubmitting(true)
    try {
      if (props.onSubmit) {
        console.log('Calling props.onSubmit with data')
        props.onSubmit(data)
      } else {
        console.log('Goal created:', data)
      }
      console.log('Closing form')
      props.onClose()
    } catch (err) {
      console.error('Error in onSubmit:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h3 className="text-lg font-semibold">Create New Goal</h3>

      {/* Goal Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Goal Description
        </label>
        <input
          {...register('description')}
          placeholder="e.g., Improve productivity"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {errors.description && (
          <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
        )}
      </div>

      {/* GROW Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            🎯 Goal (What do you want to achieve?)
          </label>
          <textarea
            {...register('goal')}
            placeholder="Specific goal..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20"
          />
          {errors.goal && <p className="text-red-500 text-xs mt-1">{errors.goal.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            📊 Reality (Where are you now?)
          </label>
          <textarea
            {...register('reality')}
            placeholder="Current situation..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20"
          />
          {errors.reality && (
            <p className="text-red-500 text-xs mt-1">{errors.reality.message}</p>
          )}
        </div>
      </div>

      {/* Options */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          🔄 Options (What are your choices?)
        </label>
        <div className="space-y-2">
          <input
            {...register('option1')}
            placeholder="Option 1..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            {...register('option2')}
            placeholder="Option 2..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            {...register('option3')}
            placeholder="Option 3..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Will */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          💪 Will (What will you do?)
        </label>
        <textarea
          {...register('will')}
          placeholder="Your commitment and action steps..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20"
        />
        {errors.will && <p className="text-red-500 text-xs mt-1">{errors.will.message}</p>}
      </div>

      {/* Buttons */}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Creating...' : 'Create Goal'}
        </button>
      </div>
    </form>
  )
}
