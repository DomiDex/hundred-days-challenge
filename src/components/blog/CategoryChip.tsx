import Link from 'next/link';
import { cn } from '@/lib/utils';

interface CategoryChipProps {
  name: string;
  uid: string;
}

export function CategoryChip({ name, uid }: CategoryChipProps) {
  return (
    <Link href={`/blog/${uid}`} className={cn('font-medium ')}>
      {name}
    </Link>
  );
}
