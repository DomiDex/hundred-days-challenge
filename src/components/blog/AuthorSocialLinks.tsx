'use client'

import * as prismic from '@prismicio/client'
import SocialLink from '@/components/ui/SocialLink'
import LinkedInIcon from '@/components/svg/LinkedInIcon'
import XIcon from '@/components/svg/XIcon'
import GitHubIcon from '@/components/svg/GitHubIcon'
import WebsiteIcon from '@/components/svg/WebsiteIcon'

interface AuthorSocialLinksProps {
  linkedinLink?: prismic.LinkField
  xLink?: prismic.LinkField
  githubLink?: prismic.LinkField
  websiteLink?: prismic.LinkField
  className?: string
}

export function AuthorSocialLinks({
  linkedinLink,
  xLink,
  githubLink,
  websiteLink,
  className = '',
}: AuthorSocialLinksProps) {
  const socialLinks = [
    {
      link: websiteLink,
      icon: WebsiteIcon,
      label: 'Personal Website',
    },
    {
      link: linkedinLink,
      icon: LinkedInIcon,
      label: 'LinkedIn Profile',
    },
    {
      link: xLink,
      icon: XIcon,
      label: 'X (Twitter) Profile',
    },
    {
      link: githubLink,
      icon: GitHubIcon,
      label: 'GitHub Profile',
    },
  ]

  const validLinks = socialLinks.filter(({ link }) => prismic.isFilled.link(link))

  if (validLinks.length === 0) return null

  return (
    <div className={`flex gap-4 ${className}`}>
      {validLinks.map(({ link, icon, label }) => {
        if (!prismic.isFilled.link(link)) return null

        // Cast link to record to access properties safely
        const linkObj = link as Record<string, unknown>
        const url =
          linkObj.link_type === 'Web' && typeof linkObj.url === 'string' ? linkObj.url : '#'

        return (
          <SocialLink
            key={label}
            href={url || '#'}
            icon={icon}
            label={label}
            className="h-5 w-5 text-muted-foreground transition-colors hover:text-foreground"
          />
        )
      })}
    </div>
  )
}
