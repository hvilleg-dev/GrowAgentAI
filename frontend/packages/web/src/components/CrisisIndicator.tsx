import type { CrisisLevel } from '@/types'

interface Props {
  level: CrisisLevel
}

const crisisConfig = {
  critico: {
    color: '#dc2626',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    label: 'Critical',
    icon: '🚨',
  },
  alto: {
    color: '#f97316',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    label: 'High',
    icon: '⚠️',
  },
  medio: {
    color: '#eab308',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    label: 'Medium',
    icon: '⚡',
  },
  bajo: {
    color: '#84cc16',
    bgColor: 'bg-lime-50',
    textColor: 'text-lime-700',
    label: 'Low',
    icon: '✓',
  },
  ninguno: {
    color: '#22c55e',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    label: 'None',
    icon: '✓',
  },
}

export default function CrisisIndicator({ level }: Props) {
  const config = crisisConfig[level]

  return (
    <div className={`${config.bgColor} ${config.textColor} px-3 py-1 rounded-full flex items-center gap-1`}>
      <span>{config.icon}</span>
      <span className="text-xs font-medium">{config.label}</span>
    </div>
  )
}
