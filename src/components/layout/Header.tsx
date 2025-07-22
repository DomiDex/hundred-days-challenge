import Link from 'next/link';
import Logo from '../svg/Logo';
import NavBar from '../ui/NavBar';

export default function Header() {
  return (
    <header className=' py-2 border-b border-border'>
      <div className='max-w-6xl mx-auto flex justify-between items-center'>
        <Link href='/' className='w-[70px] h-auto text-foreground'>
          <Logo />
        </Link>
        <NavBar />
      </div>
    </header>
  );
}
