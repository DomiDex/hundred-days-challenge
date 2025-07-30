// Temporary Author types until Prismic types are regenerated
import type * as prismic from '@prismicio/client'

export type AuthorDocumentData = {
  uid: prismic.KeyTextField
  name: prismic.KeyTextField
  role: prismic.KeyTextField
  avatar: prismic.ImageField
  bio: prismic.RichTextField
  linkedin_link: prismic.LinkField
  x_link: prismic.LinkField
  github_link: prismic.LinkField
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

export type AuthorDocument<Lang extends string = string> = prismic.PrismicDocumentWithUID<
  {
    type: 'author'
    data: AuthorDocumentData
  },
  'author',
  Lang
>
