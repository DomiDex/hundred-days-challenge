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
      className='group flex h-8 w-8 items-center justify-center rounded-sm border border-transparent text-limed-spruce-500 transition-all duration-300 hover:border-limed-spruce-400 dark:text-limed-spruce-400 dark:hover:border-limed-spruce-500'
      aria-label={label}
    >
      <Icon
        size={20}
        className='transition-all duration-300 group-hover:-translate-y-0.5 group-hover:drop-shadow-sm'
      />
    </Link>
  );
}
