import Link from 'next/link';
import Logo from '../svg/Logo';
import NavBar from '../ui/NavBar';
import ThemeToggle from '../ui/ThemeToggle';

export default function Header() {
  return (
    <header className='py-2 border-b border-border'>
      <div className='max-w-6xl mx-auto px-3 sm:px-4 flex justify-between items-center'>
        <Link href='/' className='w-[60px] sm:w-[70px] h-auto text-foreground'>
          <Logo />
        </Link>
        <div className='flex items-center gap-3 sm:gap-6'>
          <NavBar />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
