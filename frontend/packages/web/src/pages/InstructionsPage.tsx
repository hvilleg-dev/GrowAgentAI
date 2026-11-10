import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function InstructionsPage() {
  const { t } = useTranslation()
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{t('instructions.howToUse')}</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">Follow these steps to get the best experience with your AI coach.</p>

      {/* Step 0: Complete Profile — REQUIRED */}
      <div className="mb-10 bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-red-500">
        <div className="flex items-center mb-4">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-red-500 text-white font-bold mr-4 shrink-0">0</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('instructions.completeProfileRequired')}</h2>
        </div>
        <div className="ml-14 space-y-3 text-gray-700 dark:text-gray-300">
          <p>{t('instructions.beforeChatting')} <Link to="/settings" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Settings → Coaching Profile</Link> {t('instructions.andFillIn')}</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Age</strong> {t('instructions.helpsCoachContext')}</li>
            <li><strong>Gender</strong> {t('instructions.allowsPersonalized')}</li>
            <li><strong>Occupation</strong> {t('instructions.occupationOptional')}</li>
            <li><strong>Coaching Style</strong> {t('instructions.controlsCoachStyle')}</li>
          </ul>
          <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded p-3 text-sm text-amber-800 dark:text-amber-200">
            {t('instructions.withoutProfile')}
          </div>
        </div>
      </div>

      {/* Coaching Styles Explained */}
      <div className="mb-10 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('instructions.coachingStylesExplained')}</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20">
            <h3 className="font-bold text-indigo-800 dark:text-indigo-200 mb-1">{t('instructions.supportiveTitle')}</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm">{t('instructions.supportiveDesc')}</p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 font-medium">{t('instructions.supportiveBestFor')}</p>
          </div>

          <div className="p-4 rounded-lg border border-orange-200 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20">
            <h3 className="font-bold text-orange-800 dark:text-orange-200 mb-1">{t('instructions.directiveTitle')}</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm">{t('instructions.directiveDesc')}</p>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-2 font-medium">{t('instructions.directiveBestFor')}</p>
          </div>

          <div className="p-4 rounded-lg border border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20">
            <h3 className="font-bold text-purple-800 dark:text-purple-200 mb-1">{t('instructions.socraticTitle')}</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm">{t('instructions.socraticDesc')}</p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 font-medium">{t('instructions.socraticBestFor')}</p>
          </div>

          <div className="p-4 rounded-lg border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20">
            <h3 className="font-bold text-green-800 dark:text-green-200 mb-1">{t('instructions.collaborativeTitle')}</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm">{t('instructions.collaborativeDesc')}</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">{t('instructions.collaborativeBestFor')}</p>
          </div>
        </div>
      </div>

      {/* Step 1: Create a Goal */}
      <div className="mb-10 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-600 text-white font-bold mr-4 shrink-0">1</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('instructions.createYourGoal')}</h2>
        </div>
        <div className="ml-14 space-y-3 text-gray-700 dark:text-gray-300">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border-l-4 border-blue-500 text-sm text-blue-900 dark:text-blue-100 font-medium mb-3">
            {t('instructions.recommendedStartHere')}
          </div>
          <p>{t('instructions.goToGoalsTab')}</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Goal</strong>: {t('instructions.goalQuestion')}</li>
            <li><strong>Reality</strong>: {t('instructions.realityQuestion')}</li>
            <li><strong>Options</strong>: {t('instructions.optionsQuestion')}</li>
            <li><strong>Will</strong>: {t('instructions.willQuestion')}</li>
          </ul>
          <p className="mt-3 text-sm italic text-gray-500 dark:text-gray-400">{t('instructions.example')}</p>
        </div>
      </div>

      {/* Step 2: Start a Chat Session */}
      <div className="mb-10 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-600 text-white font-bold mr-4 shrink-0">2</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('instructions.createChatSession')}</h2>
        </div>
        <div className="ml-14 space-y-2 text-gray-700 dark:text-gray-300">
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>{t('instructions.goToChatTab')}</li>
            <li>{t('instructions.selectGoalDropdown')}</li>
            <li>{t('instructions.withoutGoalSelected')}</li>
          </ul>
        </div>
      </div>

      {/* Step 3: Chat */}
      <div className="mb-10 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-600 text-white font-bold mr-4 shrink-0">3</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('instructions.chatWithCoach')}</h2>
        </div>
        <div className="ml-14 space-y-2 text-gray-700 dark:text-gray-300">
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>{t('instructions.coachGuideGrow')}</li>
            <li>{t('instructions.beHonestDetailed')}</li>
            <li>{t('instructions.multipleSessions')}</li>
          </ul>
          <p className="mt-3 font-semibold text-indigo-600 dark:text-indigo-400 text-sm">{t('instructions.tipMoreSessions')}</p>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-lg text-white">
        <h2 className="text-xl font-bold mb-3">{t('instructions.readyToBegin')}</h2>
        <ol className="space-y-1 ml-4 list-decimal text-sm">
          <li>{t('instructions.completeProfileRequired2')}</li>
          <li>{t('instructions.createFirstGoal')}</li>
          <li>{t('instructions.openChatLinkGoal')}</li>
        </ol>
      </div>
    </div>
  )
}
