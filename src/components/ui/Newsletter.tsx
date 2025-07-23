'use client';

import { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  return (
    <div>
      <h3 className='text-lg font-semibold mb-4 text-limed-spruce-900 dark:text-limed-spruce-100'>
        Newsletter
      </h3>
      <p className='text-sm text-limed-spruce-600 dark:text-limed-spruce-400 mb-4'>
        Subscribe to our newsletter for updates and news.
      </p>
      <form onSubmit={handleSubmit} className='space-y-2'>
        <input
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder='Enter your email'
          className='w-full px-3 py-2 text-sm border border-limed-spruce-300 dark:border-limed-spruce-700 rounded-md bg-white dark:bg-limed-spruce-900 text-limed-spruce-900 dark:text-limed-spruce-100 focus:outline-none focus:ring-2 focus:ring-limed-spruce-500'
          required
        />
        <button
          type='submit'
          className='w-full px-4 py-2 text-sm font-medium text-white bg-lochinvar-600 hover:bg-lochinvar-700 dark:bg-lochinvar-500 dark:hover:bg-lochinvar-600 rounded-md transition-colors'
        >
          Subscribe
        </button>
      </form>
    </div>
  );
}