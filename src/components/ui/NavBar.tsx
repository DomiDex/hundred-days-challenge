import NavLink from './NavLink';
import SocialLink from './SocialLink';
import { Linkedin, Github } from 'lucide-react';

// Custom X (Twitter) icon since Lucide doesn't have the new X logo - smaller size
const XIcon = ({ className }: { size?: number; className?: string }) => (
  <svg
    width={16}
    height={16}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2.5'
    strokeLinecap='round'
    strokeLinejoin='round'
    className={className}
  >
    <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
  </svg>
);

const navLinks = [
  { href: '/', text: 'Home' },
  { href: '/about', text: 'About' },
  { href: 'mailto:domidex01@gmail.com', text: 'Contact' },
];

const socialLinks = [
  {
    href: 'https://linkedin.com/in/your-profile',
    icon: Linkedin,
    label: 'LinkedIn',
  },
  { href: 'https://x.com/your-handle', icon: XIcon, label: 'X (Twitter)' },
  { href: 'https://github.com/your-username', icon: Github, label: 'GitHub' },
];

export default function NavBar() {
  return (
    <nav className='flex items-center justify-end w-full space-x-4'>
      {/* Navigation Links */}
      <div className='flex gap-6'>
        {navLinks.map((link) => (
          <NavLink key={link.text} href={link.href} text={link.text} />
        ))}
      </div>

      {/* Social Links */}
      <div className='flex gap-3'>
        {socialLinks.map((social) => (
          <SocialLink
            key={social.label}
            href={social.href}
            icon={social.icon}
            label={social.label}
          />
        ))}
      </div>
    </nav>
  );
}
