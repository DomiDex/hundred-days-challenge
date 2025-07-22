import NavLink from './NavLink';
import SocialLink from './SocialLink';
import GitHubIcon from '../svg/GitHubIcon';
import LinkedInIcon from '../svg/LinkedInIcon';
import XIcon from '../svg/XIcon';

const navLinks = [
  { href: '/', text: 'Home' },
  { href: '/about', text: 'About' },
  { href: 'mailto:domidex01@gmail.com', text: 'Contact' },
];

const socialLinks = [
  {
    href: 'https://www.linkedin.com/in/domidex/',
    icon: LinkedInIcon,
    label: 'LinkedIn',
  },
  { href: 'https://x.com/domidexdesign', icon: XIcon, label: 'X (Twitter)' },
  { href: 'https://github.com/DomiDex', icon: GitHubIcon, label: 'GitHub' },
];

export default function NavBar() {
  return (
    <nav className='flex items-center justify-end w-full space-x-5'>
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
