export function RSSIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M3.429 5.1v2.4c7.248 0 13.114 5.864 13.114 13.1h2.4C18.943 12.654 11.389 5.1 3.429 5.1z" />
      <path d="M3.429 10.5v2.4c4.104 0 7.714 3.61 7.714 7.7h2.4c0-5.59-4.524-10.1-10.114-10.1z" />
      <circle cx="4.629" cy="19.4" r="1.8" />
    </svg>
  )
}
