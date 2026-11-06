import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SkeletonCard, ChatSkeleton } from '../LoadingSkeleton'

describe('LoadingSkeleton', () => {
  it('renders skeleton card', () => {
    const { container } = render(<SkeletonCard />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders chat skeleton with multiple items', () => {
    const { container } = render(<ChatSkeleton />)
    const skeletons = container.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('has proper styling classes', () => {
    const { container } = render(<SkeletonCard />)
    const card = container.querySelector('.rounded-lg')
    expect(card).toHaveClass('bg-white', 'shadow')
  })
})
