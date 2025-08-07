'use client'

import Link from 'next/link'
import { useAnalytics } from '@/hooks/useAnalytics'
import { usePathname } from 'next/navigation'

interface AuthorLinkProps {
  uid: string
  name: string
  className?: string
}

export const AuthorLink: React.FC<AuthorLinkProps> = ({ uid, name, className }) => {
  const { trackAuthorClick } = useAnalytics()
  const pathname = usePathname()

  const handleClick = () => {
    trackAuthorClick(name, pathname)
  }

  return (
    <Link href={`/authors/${uid}`} className={className} onClick={handleClick}>
      {name}
    </Link>
  )
}
