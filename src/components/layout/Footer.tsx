import FooterLink from '@/components/ui/FooterLink'
import Newsletter from '@/components/ui/Newsletter'
import FooterLogo from '@/components/svg/FooterLogo'

const categories = [
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Blog' },
  { href: '/tutorials', label: 'Tutorials' },
  { href: '/resources', label: 'Resources' },
]

const importantLinks = [
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Service' },
]

export default function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="max-w-4xl px-12 py-12">
        <div className="ml-0 grid grid-cols-1 gap-8 md:ml-[5rem] md:grid-cols-3">
          <div>
            <h3 className="text-limed-spruce-900 dark:text-limed-spruce-100 mb-4 text-lg font-semibold">
              Categories
            </h3>
            <ul className="space-y-2">
              {categories.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-limed-spruce-900 dark:text-limed-spruce-100 mb-4 text-lg font-semibold">
              Important Links
            </h3>
            <ul className="space-y-2">
              {importantLinks.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Newsletter />
          </div>
        </div>
      </div>

      <div className="w-full px-8">
        <div className="text-limed-spruce-200 dark:text-limed-spruce-700 mx-auto max-w-7xl">
          <FooterLogo />
        </div>
      </div>
    </footer>
  )
}
