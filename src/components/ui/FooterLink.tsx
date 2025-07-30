import Link from 'next/link';

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
}

export default function FooterLink({ href, children }: FooterLinkProps) {
  return (
    <Link
      href={href}
      className='text-sm text-limed-spruce-600 hover:text-limed-spruce-900 dark:text-limed-spruce-400 dark:hover:text-limed-spruce-100 transition-colors'
    >
      {children}
    </Link>
  );
}