import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import CrisisIndicator from '../CrisisIndicator'
import type { CrisisLevel } from '@/types'

describe('CrisisIndicator', () => {
  const levels: CrisisLevel[] = ['critico', 'alto', 'medio', 'bajo', 'ninguno']

  it.each(levels)('renders %s level correctly', (level) => {
    render(<CrisisIndicator level={level} />)
    const container = screen.getByText((content, element) => {
      return element?.className.includes('px-3') || false
    })
    expect(container).toBeInTheDocument()
  })

  it('renders critical level with red styling', () => {
    const { container } = render(<CrisisIndicator level="critico" />)
    expect(container.querySelector('.bg-red-50')).toBeInTheDocument()
    expect(container.querySelector('.text-red-700')).toBeInTheDocument()
  })

  it('renders green for no crisis', () => {
    const { container } = render(<CrisisIndicator level="ninguno" />)
    expect(container.querySelector('.bg-green-50')).toBeInTheDocument()
    expect(container.querySelector('.text-green-700')).toBeInTheDocument()
  })

  it('displays correct icon for level', () => {
    const { container } = render(<CrisisIndicator level="critico" />)
    expect(container.textContent).toContain('🚨')
  })
})
