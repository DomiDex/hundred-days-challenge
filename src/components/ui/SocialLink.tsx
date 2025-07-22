import Link from 'next/link';

interface IconProps {
  size?: number;
  className?: string;
}

interface SocialLinkProps {
  href: string;
  icon: React.ComponentType<IconProps>;
  label: string;
}

export default function SocialLink({
  href,
  icon: Icon,
  label,
}: SocialLinkProps) {
  return (
    <Link
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      className='group flex h-4 w-4 items-center justify-center '
      aria-label={label}
    >
      <Icon />
    </Link>
  );
}
