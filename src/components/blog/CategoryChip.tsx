import Link from "next/link";
import { cn } from "@/lib/utils";

interface CategoryChipProps {
  name: string;
  uid: string;
  isActive?: boolean;
  className?: string;
}

export function CategoryChip({ name, uid, isActive = false, className }: CategoryChipProps) {
  return (
    <Link
      href={`/blog/${uid}`}
      className={cn(
        "px-4 py-2 rounded-lg transition-colors",
        isActive
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "bg-secondary text-secondary-foreground hover:bg-secondary/90",
        className
      )}
    >
      {name}
    </Link>
  );
}