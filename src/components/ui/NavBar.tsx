import NavLink from './NavLink';

const navLinks = [
  { href: '/', text: 'Home' },
  { href: '/about', text: 'About' },
  { href: 'mailto:domidex01@gmail.com', text: 'Contact' },
];

export default function NavBar() {
  return (
    <nav className='flex gap-6'>
      {navLinks.map((link) => (
        <NavLink key={link.text} href={link.href} text={link.text} />
      ))}
    </nav>
  );
}
