import { cn } from '@/lib/utils'
import { CategoryLink } from './CategoryLink'

interface CategoryChipProps {
  name: string
  uid: string
}

export function CategoryChip({ name, uid }: CategoryChipProps) {
  return (
    <CategoryLink uid={uid} name={name} className={cn('font-medium')}>
      {name}
    </CategoryLink>
  )
}
