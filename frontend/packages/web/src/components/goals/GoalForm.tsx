import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'

type GoalFormData = {
  description: string
  goal: string
  reality: string
  option1?: string
  option2?: string
  option3?: string
  will?: string
}

interface Props {
  onClose: () => void
  onSubmit?: (data: GoalFormData) => void
}

export default function GoalForm(props: Props) {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const goalSchema = z.object({
    description: z.string().min(1, t('goals.descriptionRequired')),
    goal: z.string().min(1, t('goals.goalRequired')),
    reality: z.string().min(1, t('goals.realityRequired')),
    option1: z.string().optional(),
    option2: z.string().optional(),
    option3: z.string().optional(),
    will: z.string().optional(),
  })

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
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">{t('goals.createNewGoal')}</h3>

      {/* Goal Description */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('goals.goalDescription')}
        </label>
        <input
          {...register('description')}
          placeholder={t('goals.descriptionPlaceholder')}
          className="w-full px-3 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100 min-h-[44px]"
        />
        {errors.description && (
          <p className="text-red-500 dark:text-red-400 text-xs sm:text-sm mt-1">{errors.description.message}</p>
        )}
      </div>

      {/* GROW Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('goals.goal')}
          </label>
          <textarea
            {...register('goal')}
            placeholder={t('goals.goalPlaceholder')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20 dark:bg-gray-700 dark:text-gray-100"
          />
          {errors.goal && <p className="text-red-500 dark:text-red-400 text-xs sm:text-sm mt-1">{errors.goal.message}</p>}
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('goals.reality')}
          </label>
          <textarea
            {...register('reality')}
            placeholder={t('goals.realityPlaceholder')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20 dark:bg-gray-700 dark:text-gray-100"
          />
          {errors.reality && (
            <p className="text-red-500 dark:text-red-400 text-xs sm:text-sm mt-1">{errors.reality.message}</p>
          )}
        </div>
      </div>

      {/* Options */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('goals.options')} <span className="text-xs text-gray-500 dark:text-gray-400">{t('goals.optionsLabel')}</span>
        </label>
        <div className="space-y-2">
          <input
            {...register('option1')}
            placeholder={t('goals.option1')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100"
          />
          <input
            {...register('option2')}
            placeholder={t('goals.option2')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100"
          />
          <input
            {...register('option3')}
            placeholder={t('goals.option3')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-100"
          />
        </div>
      </div>

      {/* Will */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('goals.will')} <span className="text-xs text-gray-500 dark:text-gray-400">{t('goals.willLabel')}</span>
        </label>
        <textarea
          {...register('will')}
          placeholder={t('goals.willPlaceholder')}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20 dark:bg-gray-700 dark:text-gray-100"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={props.onClose}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSubmitting ? t('goals.creating') : t('goals.create')}
        </button>
      </div>
    </form>
  )
}
