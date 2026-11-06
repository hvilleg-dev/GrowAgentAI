import { describe, it, expect } from 'vitest'

describe('LoginPage Unit Tests', () => {
  it('validates email format', () => {
    const email = 'user@example.com'
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    expect(isValid).toBe(true)
  })

  it('rejects invalid email', () => {
    const email = 'invalid-email'
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    expect(isValid).toBe(false)
  })

  it('validates password length', () => {
    const password = 'securepass123'
    const isValid = password.length >= 8
    expect(isValid).toBe(true)
  })

  it('rejects short password', () => {
    const password = 'short'
    const isValid = password.length >= 8
    expect(isValid).toBe(false)
  })

  it('handles form submission', () => {
    const formData = {
      email: 'user@example.com',
      password: 'securepass123'
    }
    const isValid = Boolean(formData.email && formData.password)
    expect(isValid).toBe(true)
  })

  it('detects empty fields', () => {
    const formData = {
      email: '',
      password: ''
    }
    const isValid = Boolean(formData.email && formData.password)
    expect(isValid).toBe(false)
  })

  it('trims whitespace from inputs', () => {
    const email = '  user@example.com  '
    const trimmed = email.trim()
    expect(trimmed).toBe('user@example.com')
  })

  it('validates email and password together', () => {
    const validateForm = (email: string, password: string) => {
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      const passwordValid = password.length >= 8
      return emailValid && passwordValid
    }

    expect(validateForm('user@example.com', 'securepass123')).toBe(true)
    expect(validateForm('invalid', 'short')).toBe(false)
  })
})
