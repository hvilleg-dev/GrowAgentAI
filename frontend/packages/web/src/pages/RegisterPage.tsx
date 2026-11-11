import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { AppDispatch, RootState } from '@/store'
import { register as registerAction } from '@/store/slices/authSlice'
import PasswordInputRegister from '@/components/PasswordInputRegister'

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state: RootState) => state.auth)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null)
    const result = await dispatch(
      registerAction({
        email: data.email,
        password: data.password,
        name: data.name,
      }),
    )
    if (registerAction.fulfilled.match(result)) {
      navigate('/')
    } else {
      setServerError('Registration failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-gray-800 dark:text-gray-100">
          GrowAgentAI
        </h1>
        <p className="text-center text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-8">Create your account</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded text-sm sm:text-base">
              {serverError}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <input
              {...register('name')}
              placeholder="John Doe"
              autoComplete="name"
              className="w-full px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base md:text-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            />
            {errors.name && (
              <p className="text-red-500 dark:text-red-400 text-xs sm:text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base md:text-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            />
            {errors.email && (
              <p className="text-red-500 dark:text-red-400 text-xs sm:text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <PasswordInputRegister
            label="Password"
            placeholder="••••••••"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />

          {/* Confirm Password */}
          <PasswordInputRegister
            label="Confirm Password"
            placeholder="••••••••"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center">
            After registering, complete your Coaching Profile in Settings.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-base sm:text-lg min-h-12"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
