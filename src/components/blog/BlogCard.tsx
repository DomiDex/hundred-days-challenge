import Link from "next/link";
import { PrismicNextImage } from "@prismicio/next";
import { ImageField, KeyTextField, DateField } from "@prismicio/client";

interface BlogCardProps {
  uid: string;
  title: KeyTextField;
  excerpt?: KeyTextField;
  image: ImageField;
  category: {
    uid: string;
    name: KeyTextField;
  };
  date: DateField | string;
}

export function BlogCard({ uid, title, excerpt, image, category, date }: BlogCardProps) {
  const formattedDate = new Date(date || "").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {image.url && (
        <Link href={`/blog/${category.uid}/${uid}`}>
          <div className="relative h-48 w-full">
            <PrismicNextImage
              field={image}
              fill
              className="object-cover"
            />
          </div>
        </Link>
      )}
      <div className="p-6">
        {category && (
          <Link
            href={`/blog/${category.uid}`}
            className="text-sm text-primary hover:text-primary/80 font-medium"
          >
            {category.name}
          </Link>
        )}
        <h2 className="text-xl font-semibold text-card-foreground mt-2 mb-2">
          <Link
            href={`/blog/${category.uid}/${uid}`}
            className="hover:text-primary transition-colors"
          >
            {title}
          </Link>
        </h2>
        {excerpt && (
          <p className="text-muted-foreground line-clamp-3">
            {excerpt}
          </p>
        )}
        <div className="mt-4 text-sm text-muted-foreground">
          {formattedDate}
        </div>
      </div>
    </article>
  );
}