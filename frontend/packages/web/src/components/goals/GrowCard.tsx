interface Props {
  title: string
  icon: string
  content?: string
  items?: string[]
  color: string
}

export default function GrowCard({ title, icon, content, items, color }: Props) {
  return (
    <div className={`${color} dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition`}>
      <div className="flex items-center gap-2 sm:gap-3 mb-3">
        <span className="text-2xl flex-shrink-0">{icon}</span>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      </div>

      {content ? (
        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{content}</p>
      ) : items ? (
        <ul className="space-y-1 sm:space-y-2">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
              <span className="text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
