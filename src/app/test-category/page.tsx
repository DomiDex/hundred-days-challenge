import { CategoryChip } from "@/components/blog/CategoryChip";

export default function TestCategoryPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-bold mb-8">Testing Category Chip Animation</h1>
      
      <div className="space-y-4">
        <div>
          <p className="mb-2">Default style:</p>
          <CategoryChip name="Default Category" uid="default" />
        </div>
        
        <div>
          <p className="mb-2">Active style:</p>
          <CategoryChip name="Active Category" uid="active" isActive />
        </div>
        
        <div>
          <p className="mb-2">Lochinvar style (like in blog post):</p>
          <CategoryChip 
            name="Motion & Interactions" 
            uid="motion-interactions"
            className="bg-lochinvar-600 text-white hover:bg-lochinvar-700"
          />
        </div>
      </div>
    </div>
  );
}