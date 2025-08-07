'use client'

import Link from 'next/link'
import { useAnalytics } from '@/hooks/useAnalytics'

interface CategoryLinkProps {
  uid: string
  name: string
  className?: string
  children?: React.ReactNode
}

export const CategoryLink: React.FC<CategoryLinkProps> = ({ uid, name, className, children }) => {
  const { trackCategoryClick } = useAnalytics()

  const handleClick = () => {
    trackCategoryClick(name)
  }

  return (
    <Link href={`/blog/${uid}`} className={className} onClick={handleClick}>
      {children || name}
    </Link>
  )
}
