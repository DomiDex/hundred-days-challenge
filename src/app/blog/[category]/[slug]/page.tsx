import { Metadata } from "next";
import { notFound } from "next/navigation";
import * as prismic from "@prismicio/client";
import { createClient } from "@/prismicio";
import { PrismicNextImage } from "@prismicio/next";
import { SliceZone } from "@prismicio/react";
import { components } from "@/slices";
import { PrismicRichText } from "@prismicio/react";
import Link from "next/link";
import { PrismLoader } from "@/components/PrismLoader";
import { generateSEOMetadata } from "@/components/SEO";
import ProjectLinks from "@/components/blog/ProjectLinks";
import type { PostDocument } from "../../../../../prismicio-types";

// Temporary type extension until Prismic types are regenerated
interface ExtendedPostData {
  demo_link?: prismic.LinkField;
  github_link?: prismic.LinkField;
}

type ExtendedPost = PostDocument & {
  data: PostDocument['data'] & ExtendedPostData;
};

type Props = {
  params: Promise<{ category: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  const client = createClient();
  
  try {
    const post = await client.getByUID("post", slug);
    const url = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/blog/${category}/${slug}`;
    
    return generateSEOMetadata({
      data: post.data,
      fallbackTitle: post.data.name || "Blog Post",
      fallbackDescription: post.data.excerpt || "",
      url,
      publishedTime: post.data.publication_date || post.first_publication_date,
      modifiedTime: post.last_publication_date,
    });
  } catch {
    return {
      title: "Post Not Found",
      description: "The requested blog post could not be found",
    };
  }
}

export async function generateStaticParams() {
  const client = createClient();
  const posts = await client.getAllByType("post", {
    fetchLinks: ["category.uid"],
  });

  return posts.map((post) => {
    // Type guard to check if the category is filled and has data
    let categoryUid = "";
    
    if (prismic.isFilled.contentRelationship(post.data.category)) {
      const categoryData = post.data.category.data;
      if (categoryData && typeof categoryData === 'object' && 'uid' in categoryData) {
        categoryUid = String(categoryData.uid) || "";
      }
    }
    
    return {
      category: categoryUid,
      slug: post.uid,
    };
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { category, slug } = await params;
  const client = createClient();

  // Fetch the post
  let post: ExtendedPost;
  try {
    post = await client.getByUID("post", slug, {
      fetchLinks: ["category.name", "category.uid"],
    }) as ExtendedPost;
  } catch {
    notFound();
  }

  // Verify the category matches
  const categoryData = prismic.isFilled.contentRelationship(post.data.category) && 
                      post.data.category.data
                      ? post.data.category.data as { uid?: string; name?: string }
                      : null;
  
  if (!categoryData?.uid || categoryData.uid !== category) {
    notFound();
  }
  const publicationDate = new Date(
    post.data.publication_date || post.first_publication_date
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Fetch related posts
  const categoryId = prismic.isFilled.contentRelationship(post.data.category) 
    ? post.data.category.id 
    : null;
    
  const relatedPosts = categoryId 
    ? await client.getAllByType("post", {
        filters: [
          prismic.filter.at("my.post.category", categoryId)
        ],
        limit: 3,
        orderings: [{ field: "document.first_publication_date", direction: "desc" }],
      }).then(posts => posts.filter(p => p.id !== post.id))
    : [];

  return (
    <div className="min-h-screen bg-background">
      <PrismLoader />
      
      <article className="max-w-4xl mx-auto px-6 py-16">
        {/* Post Header */}
        <header className="mb-12">
          {categoryData && (
            <Link
              href={`/blog/${category}`}
              className="text-primary hover:text-primary/80 font-medium mb-4 inline-block"
            >
              {categoryData.name}
            </Link>
          )}
          
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {post.data.name}
          </h1>
          
          {post.data.excerpt && (
            <p className="text-xl text-muted-foreground mb-6">
              {post.data.excerpt}
            </p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
            <time dateTime={post.data.publication_date || post.first_publication_date}>
              {publicationDate}
            </time>
          </div>
          
          {/* Project Links */}
          <ProjectLinks 
            demoLink={post.data.demo_link}
            githubLink={post.data.github_link}
          />
        </header>

        {/* Featured Image */}
        {post.data.image.url && (
          <div className="relative h-96 w-full rounded-lg overflow-hidden mb-12">
            <PrismicNextImage
              field={post.data.image}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Article Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <PrismicRichText 
            field={post.data.article_text}
            components={{
              label: ({ node, children }) => {
                if (node.data.label === "codespan") {
                  return (
                    <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">
                      {children}
                    </code>
                  );
                }
                if (node.data.label === "highlight") {
                  return (
                    <mark className="bg-yellow-200 dark:bg-yellow-900 px-1">
                      {children}
                    </mark>
                  );
                }
                return <span>{children}</span>;
              },
            }}
          />
        </div>

        {/* Slices */}
        {post.data.slices && post.data.slices.length > 0 && (
          <div className="mt-12">
            <SliceZone slices={post.data.slices} components={components} />
          </div>
        )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-16 pt-16 border-t border-border">
            <h2 className="text-2xl font-bold text-foreground mb-8">
              Related Posts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <article
                  key={relatedPost.id}
                  className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {relatedPost.data.image.url && (
                    <Link href={`/blog/${category}/${relatedPost.uid}`}>
                      <div className="relative h-40 w-full">
                        <PrismicNextImage
                          field={relatedPost.data.image}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </Link>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-card-foreground mb-2">
                      <Link
                        href={`/blog/${category}/${relatedPost.uid}`}
                        className="hover:text-primary transition-colors"
                      >
                        {relatedPost.data.name}
                      </Link>
                    </h3>
                    {relatedPost.data.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {relatedPost.data.excerpt}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}