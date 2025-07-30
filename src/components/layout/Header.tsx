import Link from 'next/link'
import { createClient } from '@/prismicio'
import Logo from '../svg/Logo'
import NavBar from '../ui/NavBar'
import ThemeToggle from '../ui/ThemeToggle'

export default async function Header() {
  const client = createClient()

  const categories = await client.getAllByType('category', {
    orderings: [{ field: 'my.category.name', direction: 'asc' }],
  })

  return (
    <header className="border-b border-border py-2">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-3 sm:px-4">
        <Link href="/" className="h-auto w-[60px] text-foreground sm:w-[70px]">
          <Logo />
        </Link>
        <div className="flex items-center gap-3 sm:gap-6">
          <NavBar categories={categories} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
