import { Metadata } from "next";
import { createClient } from "@/prismicio";
import { PrismicNextImage } from "@prismicio/next";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Blog | Your Site Name",
    description: "Read our latest blog posts",
  };
}

export default async function BlogPage() {
  const client = createClient();

  // Fetch all blog posts
  const posts = await client.getAllByType("post", {
    orderings: [
      { field: "my.post.publication_date", direction: "desc" },
      { field: "document.first_publication_date", direction: "desc" },
    ],
    fetchLinks: ["category.name", "category.uid"],
  });

  // Fetch all categories
  const categories = await client.getAllByType("category", {
    orderings: [{ field: "my.category.name", direction: "asc" }],
  });

  if (!posts || posts.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-7xl mx-auto px-6 py-16">
          <h1 className="text-4xl font-bold text-foreground mb-8">Blog</h1>
          <p className="text-muted-foreground">No blog posts found.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-foreground mb-12">Blog</h1>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-4">Categories</h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/blog"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                All Posts
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/blog/${category.uid}`}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
                >
                  {category.data.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => {
            const category = post.data.category.data;
            const categoryUid = post.data.category.uid;

            return (
              <article
                key={post.id}
                className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {post.data.image.url && (
                  <Link href={`/blog/${categoryUid}/${post.uid}`}>
                    <div className="relative h-48 w-full">
                      <PrismicNextImage
                        field={post.data.image}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </Link>
                )}
                <div className="p-6">
                  {category && (
                    <Link
                      href={`/blog/${categoryUid}`}
                      className="text-sm text-primary hover:text-primary/80 font-medium"
                    >
                      {category.name}
                    </Link>
                  )}
                  <h2 className="text-xl font-semibold text-card-foreground mt-2 mb-2">
                    <Link
                      href={`/blog/${categoryUid}/${post.uid}`}
                      className="hover:text-primary transition-colors"
                    >
                      {post.data.name}
                    </Link>
                  </h2>
                  {post.data.excerpt && (
                    <p className="text-muted-foreground line-clamp-3">
                      {post.data.excerpt}
                    </p>
                  )}
                  <div className="mt-4 text-sm text-muted-foreground">
                    {new Date(
                      post.data.publication_date || post.first_publication_date
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}