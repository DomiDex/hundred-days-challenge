import { Metadata } from "next";
import { notFound } from "next/navigation";
import * as prismic from "@prismicio/client";
import { createClient } from "@/prismicio";
import { PrismicNextImage } from "@prismicio/next";
import { SliceZone } from "@prismicio/react";
import { components } from "@/slices";
import { RichTextRenderer } from "@/components/blog/RichTextRenderer";
import Link from "next/link";
import { PrismLoader } from "@/components/PrismLoader";
import { generateSEOMetadata } from "@/components/SEO";
import ProjectLinks from "@/components/blog/ProjectLinks";
import { AuthorCard } from "@/components/blog/AuthorCard";
import { AuthorSocialLinks } from "@/components/blog/AuthorSocialLinks";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ShareButtons } from "@/components/blog/ShareButtons";
import type { PostDocument } from "../../../../../prismicio-types";
import type { AuthorDocument } from "@/types/author-types";
import { filterPostsByCategory, extractCategoryData } from "@/lib/prismic-utils";
import { getAuthorData } from "@/lib/prismic-helpers";

// Temporary type extension until Prismic types are regenerated
interface ExtendedPostData {
  demo_link?: prismic.LinkField;
  github_link?: prismic.LinkField;
  author?: prismic.ContentRelationshipField<"author">;
}

type ExtendedPost = PostDocument & {
  data: PostDocument['data'] & ExtendedPostData;
};

// AuthorDocument already includes all fields we need
type ExtendedAuthor = AuthorDocument;

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
    const categoryData = extractCategoryData(post);
    
    return {
      category: categoryData?.uid || "",
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
      fetchLinks: ["category.name", "category.uid", "author.name", "author.role", "author.avatar", "author.bio", "author.linkedin_link", "author.x_link", "author.github_link"],
    }) as ExtendedPost;
  } catch (error) {
    console.error('Error fetching post:', error);
    notFound();
  }

  // Verify the category matches
  const categoryData = extractCategoryData(post);
  
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

  // Fetch full author data if linked
  let author: ExtendedAuthor | null = null;
  if (prismic.isFilled.contentRelationship(post.data.author)) {
    try {
      const authorResponse = await client.getByID(post.data.author.id);
      // Force cast to our known author type structure
      author = {
        ...authorResponse,
        data: authorResponse.data
      } as unknown as ExtendedAuthor;
    } catch {
      // Author not found, continue without it
    }
  }

  // Fetch related posts
  const categoryId = prismic.isFilled.contentRelationship(post.data.category) 
    ? post.data.category.id 
    : null;
    
  // Fetch all posts and filter client-side due to Prismic API limitations
  const allPosts = await client.getAllByType("post", {
    orderings: [{ field: "document.first_publication_date", direction: "desc" }],
    fetchLinks: ["category.name", "category.uid"],
  });
  
  // Filter posts from the same category (excluding current post)
  const relatedPosts = categoryId 
    ? filterPostsByCategory(allPosts, categoryId)
        .filter(p => p.id !== post.id)
        .slice(0, 3)  // Take only the first 3 related posts
    : [];

  return (
    <div className="min-h-screen bg-background">
      <PrismLoader />
      
      <article className="max-w-4xl mx-auto px-6 py-16">
        <Breadcrumb 
          items={[
            { label: 'Home', href: '/' },
            { label: 'Blog', href: '/blog' },
            { label: categoryData?.name || 'Category', href: `/blog/${category}` },
            { label: post.data.name || '' }
          ]}
          className='mb-6'
        />
        
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
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-muted-foreground mb-6">
            <time dateTime={post.data.publication_date || post.first_publication_date}>
              {publicationDate}
            </time>
            {author && (
              <>
                <span className="hidden sm:inline">•</span>
                <div className="flex items-center gap-2">
                  <span>By </span>
                  <Link 
                    href={`/authors/${author.uid}`}
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    {getAuthorData(author)?.name || ''}
                  </Link>
                </div>
              </>
            )}
          </div>
          
          {/* Project Links */}
          <ProjectLinks 
            demoLink={post.data.demo_link}
            githubLink={post.data.github_link}
          />
        </header>

        {/* Featured Image */}
        {post.data.image.url && (
          <div className="relative h-96 w-full rounded-lg overflow-hidden mb-4">
            <PrismicNextImage
              field={post.data.image}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Share Buttons */}
        <div className="flex justify-center mb-12">
          <ShareButtons 
            url={`${process.env.NEXT_PUBLIC_SITE_URL || ''}/blog/${category}/${slug}`}
            title={post.data.name || ''}
          />
        </div>

        {/* Article Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none px-6 md:px-0">
          <RichTextRenderer field={post.data.article_text} />
        </div>

        {/* Slices */}
        {post.data.slices && post.data.slices.length > 0 && (
          <div className="mt-12">
            <SliceZone slices={post.data.slices} components={components} />
          </div>
        )}

        {/* Author Info */}
        {author && (
          <section className="mt-16 pt-16 border-t border-border">
            <h2 className="text-2xl font-bold text-foreground mb-6">About the Author</h2>
            <div className="bg-card rounded-lg p-6">
              <AuthorCard author={author} variant="full" className="mb-4" />
              <AuthorSocialLinks
                linkedinLink={getAuthorData(author)?.linkedin_link}
                xLink={getAuthorData(author)?.x_link}
                githubLink={getAuthorData(author)?.github_link}
                className="mt-4"
              />
            </div>
          </section>
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
                  className="bg-white dark:bg-gray-700 rounded-2xl p-4 shadow-lg space-y-4"
                >
                  {relatedPost.data.image.url && (
                    <Link href={`/blog/${category}/${relatedPost.uid}`}>
                      <div className="relative w-full h-40 overflow-hidden rounded-md">
                        <PrismicNextImage
                          field={relatedPost.data.image}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </Link>
                  )}
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-card-foreground">
                      {relatedPost.data.name}
                    </h3>
                    {relatedPost.data.excerpt && (
                      <p className="text-sm text-gray-600 dark:text-muted-foreground line-clamp-2">
                        {relatedPost.data.excerpt}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/blog/${category}/${relatedPost.uid}`}
                    className="flex items-center gap-2 group text-sm font-medium"
                  >
                    Learn More
                    <svg className="w-4 h-4 pt-0.5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </article>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}