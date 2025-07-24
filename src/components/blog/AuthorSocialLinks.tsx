'use client';

import * as prismic from '@prismicio/client';
import SocialLink from '@/components/ui/SocialLink';
import LinkedInIcon from '@/components/svg/LinkedInIcon';
import XIcon from '@/components/svg/XIcon';
import GitHubIcon from '@/components/svg/GitHubIcon';

interface AuthorSocialLinksProps {
  linkedinLink?: prismic.LinkField;
  xLink?: prismic.LinkField;
  githubLink?: prismic.LinkField;
  className?: string;
}

export function AuthorSocialLinks({ 
  linkedinLink, 
  xLink, 
  githubLink,
  className = ''
}: AuthorSocialLinksProps) {
  const socialLinks = [
    {
      link: linkedinLink,
      icon: LinkedInIcon,
      label: 'LinkedIn Profile'
    },
    {
      link: xLink,
      icon: XIcon,
      label: 'X (Twitter) Profile'
    },
    {
      link: githubLink,
      icon: GitHubIcon,
      label: 'GitHub Profile'
    }
  ];

  const validLinks = socialLinks.filter(({ link }) => 
    prismic.isFilled.link(link)
  );

  if (validLinks.length === 0) return null;

  return (
    <div className={`flex gap-4 ${className}`}>
      {validLinks.map(({ link, icon, label }) => {
        if (!prismic.isFilled.link(link)) return null;
        
        const url = link.link_type === 'Web' ? link.url : '#';
        
        return (
          <SocialLink
            key={label}
            href={url || '#'}
            icon={icon}
            label={label}
            className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors"
          />
        );
      })}
    </div>
  );
}