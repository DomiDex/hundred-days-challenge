import * as prismic from "@prismicio/client";
import type { PostDocument } from "../../prismicio-types";

/**
 * Filters posts by category ID using client-side filtering.
 * 
 * This is a workaround for Prismic's REST API limitations when filtering
 * by content relationships. The filter.at() method may throw "unexpected field"
 * errors in some configurations.
 * 
 * @param posts - Array of post documents to filter
 * @param categoryId - The category document ID to filter by
 * @returns Filtered array of posts that belong to the specified category
 */
export function filterPostsByCategory(posts: PostDocument[], categoryId: string): PostDocument[] {
  return posts.filter(post => {
    // Check if the post has a category relationship
    if (!prismic.isFilled.contentRelationship(post.data.category)) {
      return false;
    }
    
    // Compare the category ID
    return post.data.category.id === categoryId;
  });
}

/**
 * Extracts category data from a post's content relationship field.
 * 
 * @param post - The post document
 * @returns Object with category uid and name, or null if no category
 */
export function extractCategoryData(post: PostDocument): { uid: string; name: string } | null {
  if (!prismic.isFilled.contentRelationship(post.data.category)) {
    return null;
  }
  
  const categoryData = post.data.category.data;
  if (categoryData && typeof categoryData === 'object' && 'uid' in categoryData && 'name' in categoryData) {
    return {
      uid: String(categoryData.uid) || "",
      name: String(categoryData.name) || ""
    };
  }
  
  return null;
}