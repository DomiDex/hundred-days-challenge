// Temporary Category types until Prismic types are regenerated
import type * as prismic from '@prismicio/client'

export type ExtendedCategoryDocumentData = {
  uid: prismic.KeyTextField
  name: prismic.KeyTextField
  description: prismic.KeyTextField
  image: prismic.ImageField
  meta_title: prismic.KeyTextField
  meta_description: prismic.KeyTextField
  og_title: prismic.KeyTextField
  og_description: prismic.KeyTextField
  og_image: prismic.ImageField
  twitter_card: prismic.SelectField<'summary' | 'summary_large_image'>
  canonical_url: prismic.KeyTextField
  robots: prismic.SelectField<
    'index,follow' | 'noindex,follow' | 'index,nofollow' | 'noindex,nofollow'
  >
}

export type ExtendedCategoryDocument<Lang extends string = string> = prismic.PrismicDocumentWithUID<
  {
    type: 'category'
    data: ExtendedCategoryDocumentData
  },
  'category',
  Lang
>
