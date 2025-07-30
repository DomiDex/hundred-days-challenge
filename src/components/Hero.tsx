'use client';

import { useState } from 'react';

export function Hero() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    // TODO: Implement newsletter subscription
    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 1000);
  };

  return (
    <section className='relative min-h-[500px] flex items-start justify-center overflow-hidden'>
      {/* Vertical logo on the right side */}
      <div className='absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-[500px] w-auto text-gray-400 dark:text-gray-800 opacity-50'></div>

      <div className='relative z-10 max-w-6xl mx-auto px-6 py-16'>
        <div className='flex flex-col lg:flex-row items-center justify-between gap-12'>
          {/* Left side - Logo and content */}
          <div className='flex-1 text-center lg:text-left'>
            <h1 className='text-3xl md:text-5xl font-bold mb-6'>
              A daily journey of code, creativity, and growth
            </h1>
            <p className='text-lg md:text-xl text-gray-700 dark:text-gray-200 max-w-2xl mx-auto lg:mx-0'>
              Building something new every day for 100 days. Join me as I
              explore the intersection of code and creativity, sharing daily
              experiments, learnings, and the honest journey of continuous
              craft.
            </p>
          </div>

          {/* Right side - Newsletter form */}
          <div className='flex-1 max-w-md w-full'>
            <div className='bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700'>
              <h2 className='text-2xl font-bold mb-4'>
                Subscribe to our Newsletter
              </h2>
              <p className='text-gray-600 dark:text-gray-300 mb-6'>
                Get the latest articles and updates delivered straight to your
                inbox.
              </p>

              <form onSubmit={handleSubmit} className='space-y-4'>
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='Enter your email'
                  required
                  className='w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all'
                />

                <button
                  type='submit'
                  disabled={status === 'loading'}
                  className='hero-newsletter-button group relative w-full px-4 py-3 rounded-lg bg-lochinvar-600 dark:bg-lochinvar-500 text-white font-semibold overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {/* Darker overlay that slides up on hover */}
                  <div className='button-flair absolute inset-0 bg-lochinvar-700 dark:bg-lochinvar-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out' />

                  {/* Button content */}
                  <span className='relative z-10'>
                    {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
                  </span>
                </button>

                {status === 'success' && (
                  <p className='text-green-600 dark:text-green-400 text-sm'>
                    Successfully subscribed! Check your email for confirmation.
                  </p>
                )}

                {status === 'error' && (
                  <p className='text-red-600 dark:text-red-400 text-sm'>
                    Something went wrong. Please try again.
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
