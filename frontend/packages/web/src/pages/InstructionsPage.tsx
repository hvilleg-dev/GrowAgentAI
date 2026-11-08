import { Link } from 'react-router-dom'

export default function InstructionsPage() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">How to Get Started</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">Follow these steps to get the best experience with your AI coach.</p>

      {/* Step 0: Complete Profile — REQUIRED */}
      <div className="mb-10 bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-red-500">
        <div className="flex items-center mb-4">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-red-500 text-white font-bold mr-4 shrink-0">0</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Complete Your Coaching Profile <span className="text-red-500 text-base font-semibold ml-2">— Required</span></h2>
        </div>
        <div className="ml-14 space-y-3 text-gray-700 dark:text-gray-300">
          <p>Before chatting, go to <Link to="/settings" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Settings → Coaching Profile</Link> and fill in:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Age</strong> — helps the coach use the right context and perspective</li>
            <li><strong>Gender</strong> — allows for personalized communication</li>
            <li><strong>Occupation</strong> (optional) — adds professional context to coaching</li>
            <li><strong>Coaching Style</strong> — controls how the AI coach interacts with you</li>
          </ul>
          <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded p-3 text-sm text-amber-800 dark:text-amber-200">
            Without a complete profile, your AI coach will not be fully personalized. Take 1 minute to complete it before your first session.
          </div>
        </div>
      </div>

      {/* Coaching Styles Explained */}
      <div className="mb-10 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Coaching Styles — Choose the Right One for You</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20">
            <h3 className="font-bold text-indigo-800 dark:text-indigo-200 mb-1">Supportive — Empathetic and encouraging</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm">The coach provides warmth, validation, and positive reinforcement. Ideal if you need encouragement and emotional support while working toward your goals. The coach celebrates small wins and helps you stay motivated during setbacks.</p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 font-medium">Best for: people new to coaching, going through difficult transitions, or who need confidence building.</p>
          </div>

          <div className="p-4 rounded-lg border border-orange-200 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20">
            <h3 className="font-bold text-orange-800 dark:text-orange-200 mb-1">Directive — Direct, action-oriented and results-focused</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm">The coach gives clear recommendations, sets deadlines, and challenges you to take action immediately. Less discussion, more execution. Ideal if you prefer concrete advice, fast results, and dislike lengthy reflection.</p>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-2 font-medium">Best for: goal-oriented professionals, people who want clear next steps, or those who tend to overthink.</p>
          </div>

          <div className="p-4 rounded-lg border border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20">
            <h3 className="font-bold text-purple-800 dark:text-purple-200 mb-1">Socratic — Deep questions to guide self-discovery</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm">The coach rarely tells you what to do — instead, it asks powerful questions that guide you to find your own answers. This builds self-awareness and critical thinking. Coaching feels like guided exploration.</p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 font-medium">Best for: people who want to develop judgment and autonomy, reflective thinkers, or long-term personal development.</p>
          </div>

          <div className="p-4 rounded-lg border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20">
            <h3 className="font-bold text-green-800 dark:text-green-200 mb-1">Collaborative — Partnership, exploring together</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm">The coach works as a thinking partner, co-creating solutions with you. It contributes ideas while also inviting yours, and the dynamic feels like a peer conversation. Good balance between guidance and autonomy.</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">Best for: people who like to think out loud, brainstorm, and work through problems together rather than alone.</p>
          </div>
        </div>
      </div>

      {/* Step 1: Create a Goal */}
      <div className="mb-10 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-600 text-white font-bold mr-4 shrink-0">1</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Your Goal</h2>
        </div>
        <div className="ml-14 space-y-3 text-gray-700 dark:text-gray-300">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border-l-4 border-blue-500 text-sm text-blue-900 dark:text-blue-100 font-medium mb-3">
            Recommended: Start here BEFORE your first chat session
          </div>
          <p>Go to the <strong>Goals</strong> tab and create a goal using the GROW framework:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Goal</strong>: What do you want to achieve? Be specific and measurable.</li>
            <li><strong>Reality</strong>: Where are you now? What is the current situation?</li>
            <li><strong>Options</strong>: What are possible approaches to reach your goal?</li>
            <li><strong>Will</strong>: What is your commitment? What action will you take first?</li>
          </ul>
          <p className="mt-3 text-sm italic text-gray-500 dark:text-gray-400">Example: Goal "Improve my leadership" → Reality "I struggle with quick decisions" → Options "Take a course, find a mentor" → Will "Dedicate 2 hours weekly starting Monday"</p>
        </div>
      </div>

      {/* Step 2: Start a Chat Session */}
      <div className="mb-10 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-600 text-white font-bold mr-4 shrink-0">2</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create a Chat Session</h2>
        </div>
        <div className="ml-14 space-y-2 text-gray-700 dark:text-gray-300">
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Go to the <strong>Chat</strong> tab and click <strong>"+ New Session"</strong></li>
            <li><strong>Select a goal</strong> from the dropdown — the coach will have full GROW context</li>
            <li>Without a goal selected, the coach still works but with less personalization</li>
          </ul>
        </div>
      </div>

      {/* Step 3: Chat */}
      <div className="mb-10 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-600 text-white font-bold mr-4 shrink-0">3</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Chat with Your AI Coach</h2>
        </div>
        <div className="ml-14 space-y-2 text-gray-700 dark:text-gray-300">
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>The coach will guide you through GROW stages based on your goal</li>
            <li>Be honest and detailed — the more context you share, the better</li>
            <li>You can create multiple sessions per goal to explore different angles</li>
          </ul>
          <p className="mt-3 font-semibold text-indigo-600 dark:text-indigo-400 text-sm">Tip: The more sessions you have for a goal, the deeper the coaching becomes</p>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-lg text-white">
        <h2 className="text-xl font-bold mb-3">Ready to begin?</h2>
        <ol className="space-y-1 ml-4 list-decimal text-sm">
          <li>Complete your <strong>Coaching Profile</strong> in Settings (required)</li>
          <li>Create your first <strong>Goal</strong></li>
          <li>Open <strong>Chat</strong>, link the goal, and start your session</li>
        </ol>
      </div>
    </div>
  )
}
