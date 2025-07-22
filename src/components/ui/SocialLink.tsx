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
      className='group relative flex h-8 w-8 items-center justify-center rounded-md text-limed-spruce-600 transition-all duration-300 hover:text-limed-spruce-50 dark:text-limed-spruce-400 dark:hover:text-limed-spruce-100'
      aria-label={label}
    >
      {/* Background that slides up on hover */}
      <div className='absolute inset-0 rounded-md bg-limed-spruce-600 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:-translate-y-0.5 dark:bg-limed-spruce-500' />

      <Icon
        size={20}
        className='relative z-10 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:drop-shadow-sm'
      />
    </Link>
  );
}
