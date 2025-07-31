'use client'

import { useState } from 'react'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

interface NewsletterState {
  status: 'idle' | 'loading' | 'success' | 'error'
  message?: string
}

export function Hero() {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [state, setState] = useState<NewsletterState>({ status: 'idle' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setState({ status: 'loading' })

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          firstName,
          tags: ['hero-signup', 'homepage'],
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setState({
          status: 'success',
          message: data.message || 'Successfully subscribed! Check your email for updates.',
        })
        setEmail('')
        setFirstName('')

        // Reset after 5 seconds
        setTimeout(() => {
          setState({ status: 'idle' })
        }, 5000)
      } else {
        setState({
          status: 'error',
          message: data.error || 'Something went wrong. Please try again.',
        })
      }
    } catch {
      setState({
        status: 'error',
        message: 'Network error. Please try again.',
      })
    }
  }

  return (
    <section className="relative flex min-h-[500px] items-start justify-center overflow-hidden">
      {/* Vertical logo on the right side */}
      <div className="absolute right-0 top-1/2 h-[500px] w-auto -translate-y-1/2 translate-x-1/2 text-gray-400 opacity-50 dark:text-gray-800"></div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col items-center justify-between gap-12 lg:flex-row">
          {/* Left side - Logo and content */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="mb-6 text-3xl font-bold md:text-5xl">
              A daily journey of code, creativity, and growth
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-gray-700 dark:text-gray-200 md:text-xl lg:mx-0">
              Building something new every day for 100 days. Join me as I explore the intersection
              of code and creativity, sharing daily experiments, learnings, and the honest journey
              of continuous craft.
            </p>
          </div>

          {/* Right side - Newsletter form */}
          <div className="w-full max-w-md flex-1">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-2xl font-bold">Subscribe to our Newsletter</h2>
              <p className="mb-6 text-gray-600 dark:text-gray-300">
                Get the latest articles and updates delivered straight to your inbox.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name (optional)"
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary"
                  disabled={state.status === 'loading'}
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary"
                  disabled={state.status === 'loading'}
                />

                <button
                  type="submit"
                  disabled={state.status === 'loading'}
                  className="hero-newsletter-button group relative w-full overflow-hidden rounded-lg bg-lochinvar-600 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-lochinvar-500"
                >
                  {/* Darker overlay that slides up on hover */}
                  <div className="button-flair absolute inset-0 translate-y-full bg-lochinvar-700 transition-transform duration-500 ease-out group-hover:translate-y-0 dark:bg-lochinvar-600" />

                  {/* Button content */}
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {state.status === 'loading' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Subscribing...
                      </>
                    ) : (
                      'Subscribe'
                    )}
                  </span>
                </button>

                {state.status === 'success' && (
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-4 w-4" />
                    {state.message}
                  </div>
                )}

                {state.status === 'error' && (
                  <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    {state.message}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
