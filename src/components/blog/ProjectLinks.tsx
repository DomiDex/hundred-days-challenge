import Link from "next/link";
import { ExternalLink, Github } from "lucide-react";
import { LinkField, isFilled } from "@prismicio/client";

interface ProjectLinksProps {
  demoLink?: LinkField;
  githubLink?: LinkField;
  className?: string;
}

export default function ProjectLinks({ demoLink, githubLink, className = "" }: ProjectLinksProps) {
  // Check if at least one link exists
  if (!isFilled.link(demoLink) && !isFilled.link(githubLink)) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-4 ${className}`}>
      {isFilled.link(demoLink) && (
        <Link
          href={demoLink.url!}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <ExternalLink size={16} />
          <span>View Demo</span>
        </Link>
      )}
      
      {isFilled.link(githubLink) && (
        <Link
          href={githubLink.url!}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
        >
          <Github size={16} />
          <span>View on GitHub</span>
        </Link>
      )}
    </div>
  );
}