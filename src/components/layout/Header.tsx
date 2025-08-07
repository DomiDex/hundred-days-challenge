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
    <header className="border-b border-border py-2" role="banner">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-3 sm:px-4">
        <Link
          href="/"
          className="h-auto w-[60px] text-foreground sm:w-[70px]"
          aria-label="100 Days of Craft - Home"
        >
          <Logo />
        </Link>
        <nav
          className="flex items-center gap-3 sm:gap-6"
          role="navigation"
          aria-label="Main navigation"
        >
          <NavBar categories={categories} />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}
