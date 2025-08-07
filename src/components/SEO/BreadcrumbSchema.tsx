import { generateBreadcrumbSchema } from '@/lib/structured-data'
import type { BreadcrumbItem } from '@/components/ui/Breadcrumb'

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[]
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://100daysofcraft.com'
  const breadcrumbSchema = generateBreadcrumbSchema(items, siteUrl)

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
    />
  )
}
