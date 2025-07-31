'use client'

import { useState, useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

interface NewsletterState {
  status: 'idle' | 'loading' | 'success' | 'error'
  message?: string
}

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [state, setState] = useState<NewsletterState>({ status: 'idle' })
  const formRef = useRef<HTMLFormElement>(null)

  useGSAP(
    () => {
      // Set up hover animation for the subscribe button
      const button = formRef.current?.querySelector('.newsletter-button')
      const flair = button?.querySelector('.button-flair')

      if (button && flair) {
        // Set initial state - flair is hidden below
        gsap.set(flair, { yPercent: 100 })

        // Mouse enter animation
        button.addEventListener('mouseenter', () => {
          gsap.to(flair, {
            yPercent: 0,
            duration: 0.5,
            ease: 'power3.out',
          })
        })

        // Mouse leave animation
        button.addEventListener('mouseleave', () => {
          gsap.to(flair, {
            yPercent: 100,
            duration: 0.4,
            ease: 'power3.inOut',
          })
        })
      }
    },
    { scope: formRef }
  )

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
          tags: ['footer-signup'],
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setState({
          status: 'success',
          message: data.message || 'Successfully subscribed!',
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
          message: data.error || 'Something went wrong',
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
    <div>
      <h3 className="text-limed-spruce-900 dark:text-limed-spruce-100 mb-4 text-lg font-semibold">
        Newsletter
      </h3>
      <p className="text-limed-spruce-600 dark:text-limed-spruce-400 mb-4 text-sm">
        Subscribe to get the latest posts and updates.
      </p>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="First Name (optional)"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="border-limed-spruce-300 dark:border-limed-spruce-700 dark:bg-limed-spruce-900 text-limed-spruce-900 dark:text-limed-spruce-100 focus:ring-limed-spruce-500 w-full rounded-md border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2"
          disabled={state.status === 'loading'}
        />

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="border-limed-spruce-300 dark:border-limed-spruce-700 dark:bg-limed-spruce-900 text-limed-spruce-900 dark:text-limed-spruce-100 focus:ring-limed-spruce-500 w-full rounded-md border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2"
          required
          disabled={state.status === 'loading'}
        />

        <button
          type="submit"
          disabled={state.status === 'loading'}
          className="newsletter-button relative w-full overflow-hidden rounded-md bg-lochinvar-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-lochinvar-500"
        >
          {/* Darker overlay that slides up on hover */}
          <div className="button-flair absolute inset-0 bg-lochinvar-700 dark:bg-lochinvar-600" />

          {/* Button content */}
          <span className="relative z-10">
            {state.status === 'loading' ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Subscribing...
              </span>
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

      <p className="mt-3 text-xs text-muted-foreground">
        We respect your privacy. Unsubscribe at any time.
      </p>
    </div>
  )
}
