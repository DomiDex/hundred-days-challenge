import Link from 'next/link';
import { createClient } from '@/prismicio';
import Logo from '../svg/Logo';
import NavBar from '../ui/NavBar';
import ThemeToggle from '../ui/ThemeToggle';

export default async function Header() {
  const client = createClient();
  
  const categories = await client.getAllByType('category', {
    orderings: [{ field: 'my.category.name', direction: 'asc' }],
  });

  return (
    <header className='py-2 border-b border-border'>
      <div className='max-w-6xl mx-auto px-3 sm:px-4 flex justify-between items-center'>
        <Link href='/' className='w-[60px] sm:w-[70px] h-auto text-foreground'>
          <Logo />
        </Link>
        <div className='flex items-center gap-3 sm:gap-6'>
          <NavBar categories={categories} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
