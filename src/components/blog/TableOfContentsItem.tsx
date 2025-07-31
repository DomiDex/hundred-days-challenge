"use client";

import { ToCHeading } from "@/lib/toc-utils";
import { cn } from "@/lib/utils";

interface TableOfContentsItemProps {
  heading: ToCHeading;
  activeId: string;
  onItemClick: (id: string) => void;
}

export function TableOfContentsItem({
  heading,
  activeId,
  onItemClick,
}: TableOfContentsItemProps) {
  const isActive = heading.id === activeId;
  const paddingLeft = (heading.level - 2) * 12;

  return (
    <>
      <li>
        <button
          onClick={() => onItemClick(heading.id)}
          className={cn(
            "block w-full text-left py-1 text-sm transition-all duration-200 hover:text-lochinvar-600 dark:hover:text-lochinvar-400",
            isActive
              ? "text-lochinvar-600 dark:text-lochinvar-400 font-medium"
              : "text-gray-600 dark:text-gray-400"
          )}
          style={{ paddingLeft: `${paddingLeft}px` }}
        >
          {heading.text}
        </button>
      </li>
      {heading.children && heading.children.length > 0 && (
        <ul>
          {heading.children.map((child) => (
            <TableOfContentsItem
              key={child.id}
              heading={child}
              activeId={activeId}
              onItemClick={onItemClick}
            />
          ))}
        </ul>
      )}
    </>
  );
}