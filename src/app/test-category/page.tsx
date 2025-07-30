import { CategoryChip } from '@/components/blog/CategoryChip'

export default function TestCategoryPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="mb-8 text-2xl font-bold">Testing Category Chip Animation</h1>

      <div className="space-y-4">
        <div>
          <p className="mb-2">Default style:</p>
          <CategoryChip name="Default Category" uid="default" />
        </div>

        <div>
          <p className="mb-2">Another category:</p>
          <CategoryChip name="Active Category" uid="active" />
        </div>

        <div>
          <p className="mb-2">Motion category:</p>
          <CategoryChip name="Motion & Interactions" uid="motion-interactions" />
        </div>
      </div>
    </div>
  )
}
