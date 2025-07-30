import { Metadata } from 'next';
import { createClient } from '@/prismicio';
import { CategoryCard } from '@/components/blog/CategoryCard';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { getCategoryData } from '@/lib/prismic-helpers';

export const metadata: Metadata = {
  title: '100 Days of Craft | All Projects by Category | ',
  description:
    'Explore 100 days of web development craft: 85+ projects across Motion & Animation, Developer Tools, Full-Stack Apps, and Webflow experiments. Code included.',
};

export default async function CategoriesPage() {
  const client = createClient();

  // Fetch all categories
  const categories = await client.getAllByType('category', {
    orderings: [{ field: 'my.category.name', direction: 'asc' }],
  });

  // Fetch all posts to count posts per category
  const posts = await client.getAllByType('post', {
    fetchLinks: ['category.uid'],
  });

  // Count posts per category
  const postCountByCategory = new Map<string, number>();
  posts.forEach((post) => {
    if (post.data.category && 'id' in post.data.category) {
      const categoryId = post.data.category.id;
      postCountByCategory.set(
        categoryId,
        (postCountByCategory.get(categoryId) || 0) + 1
      );
    }
  });

  return (
    <div className='min-h-screen bg-background'>
      <main className='max-w-5xl mx-auto px-6 py-16'>
        <Breadcrumb
          items={[{ label: 'Home', href: '/' }, { label: 'Categories' }]}
          className='mb-6'
        />
        <div className='mb-12'>
          <h1 className='text-4xl font-bold text-foreground mb-4'>
            Blog Categories
          </h1>
          <p className='text-xl text-muted-foreground'>
            Explore our content organized by topics
          </p>
        </div>

        {categories.length === 0 ? (
          <p className='text-muted-foreground'>No categories found.</p>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {categories.map((category) => {
              const categoryData = getCategoryData(category);
              if (!categoryData) return null;
              return (
                <CategoryCard
                  key={category.id}
                  uid={category.uid}
                  name={categoryData.name}
                  description={categoryData.description}
                  image={categoryData.image}
                  postCount={postCountByCategory.get(category.id) || 0}
                />
              );
            })}
          </div>
        )}

        {/* SEO Content Section */}
        <section className='mt-16 pt-16 border-t border-border'>
          <div className='prose prose-lg dark:prose-invert max-w-none'>
            <h2 className='text-2xl font-bold text-foreground mb-4'>
              A Journey Through 100 Days of Web Development Innovation
            </h2>

            <p className='text-muted-foreground mb-4'>
              Welcome to 100 Days of Craft – an ambitious personal challenge
              that transformed into a comprehensive showcase of modern web
              development techniques, creative coding experiments, and
              innovative digital solutions. This collection represents over 100
              meticulously crafted projects, each born from a daily commitment
              to push boundaries, explore new technologies, and share knowledge
              with the developer community.
            </p>

            <p className='text-muted-foreground mb-4'>
              What started as a simple challenge to code every day for 100 days
              evolved into something much more profound: a living portfolio
              demonstrating the intersection of creativity and technology, a
              learning resource for fellow developers, and a testament to the
              power of consistent practice in mastering web development craft.
            </p>

            <h2 className='text-2xl font-bold text-foreground mt-8 mb-4'>
              The Philosophy Behind 100 Days of Craft
            </h2>

            <p className='text-muted-foreground mb-4'>
              Every project in this collection embodies three core principles:
            </p>

            <p className='text-muted-foreground mb-2'>
              <strong className='text-foreground'>
                Learning Through Building
              </strong>
              : Each day presented an opportunity to explore unfamiliar
              territories – whether diving deep into advanced GSAP animation
              techniques, architecting complex TypeScript utilities, or pushing
              Webflow beyond its intended boundaries. The constraint of daily
              creation forced rapid iteration and creative problem-solving.
            </p>

            <p className='text-muted-foreground mb-2'>
              <strong className='text-foreground'>Open Source First</strong>:
              Every line of code, every technique discovered, and every solution
              crafted is freely available. This collection serves as both
              portfolio and educational resource, with detailed documentation,
              live demos, and source code for developers at all skill levels.
            </p>

            <p className='text-muted-foreground mb-4'>
              <strong className='text-foreground'>Practical Innovation</strong>:
              While experimentation was encouraged, each project maintains
              practical applicability. These aren&apos;t just tech demos –
              they&apos;re real solutions to real problems, tools that enhance
              workflows, and components ready for production use.
            </p>

            <h2 className='text-2xl font-bold text-foreground mt-8 mb-4'>
              Explore Four Distinct Categories of Web Craft
            </h2>

            <p className='text-muted-foreground mb-6'>
              The 100+ projects are organized into four carefully curated
              categories, each representing a different facet of modern web
              development expertise:
            </p>

            <h3 className='text-xl font-semibold text-foreground mb-3'>
              Motion & Animation
            </h3>

            <p className='text-muted-foreground mb-3'>
              <strong className='text-foreground'>
                Bringing the Web to Life Through Dynamic Visual Experiences
              </strong>
            </p>

            <p className='text-muted-foreground mb-3'>
              The Motion & Animation category showcases the art of web animation
              at its finest. With over 35 projects heavily leveraging GSAP
              (GreenSock Animation Platform), modern CSS techniques, and vanilla
              JavaScript, this collection demonstrates how thoughtful motion
              design can transform static interfaces into engaging, memorable
              experiences.
            </p>

            <p className='text-muted-foreground mb-3'>
              These projects explore every aspect of web animation:
            </p>

            <ul className='list-disc list-inside text-muted-foreground space-y-2 mb-4'>
              <li>
                <strong className='text-foreground'>
                  Scroll-Triggered Animations
                </strong>
                : Complex scroll-based narratives that respond to user
                interaction, creating immersive storytelling experiences
              </li>
              <li>
                <strong className='text-foreground'>
                  Performance-Optimized Transitions
                </strong>
                : Smooth, 60fps animations that maintain performance across
                devices
              </li>
              <li>
                <strong className='text-foreground'>
                  Interactive Motion Graphics
                </strong>
                : Responsive animations that react to mouse movement, device
                orientation, and user input
              </li>
              <li>
                <strong className='text-foreground'>
                  Timeline-Based Sequences
                </strong>
                : Choreographed animation sequences demonstrating advanced
                timing and easing techniques
              </li>
              <li>
                <strong className='text-foreground'>
                  SVG Morphing & Manipulation
                </strong>
                : Dynamic SVG animations pushing the boundaries of vector
                graphics on the web
              </li>
              <li>
                <strong className='text-foreground'>
                  WebGL & Canvas Experiments
                </strong>
                : Hardware-accelerated graphics for stunning visual effects
              </li>
              <li>
                <strong className='text-foreground'>Micro-Interactions</strong>:
                Subtle animations that enhance user experience and provide
                delightful feedback
              </li>
            </ul>

            <p className='text-muted-foreground mb-6'>
              Each animation project includes comprehensive documentation
              covering performance considerations, browser compatibility,
              accessibility features, and implementation best practices. Whether
              you&apos;re looking to add subtle polish to interfaces or create
              show-stopping animated experiences, these projects provide both
              inspiration and practical implementation guides.
            </p>

            <h3 className='text-xl font-semibold text-foreground mb-3'>
              Developer Tools
            </h3>

            <p className='text-muted-foreground mb-3'>
              <strong className='text-foreground'>
                Enhancing Developer Workflows with Purpose-Built Utilities
              </strong>
            </p>

            <p className='text-muted-foreground mb-3'>
              The Developer Tools category features over 25 TypeScript-powered
              utilities designed to solve real problems developers face daily.
              Built with modern development practices, these tools emphasize
              type safety, extensibility, and developer experience.
            </p>

            <p className='text-muted-foreground mb-3'>
              This comprehensive toolkit includes:
            </p>

            <ul className='list-disc list-inside text-muted-foreground space-y-2 mb-4'>
              <li>
                <strong className='text-foreground'>Code Generators</strong>:
                Automated tools for scaffolding components, generating
                boilerplate, and maintaining consistency across codebases
              </li>
              <li>
                <strong className='text-foreground'>
                  Build Process Optimizers
                </strong>
                : Utilities that streamline webpack configurations, optimize
                bundle sizes, and improve build times
              </li>
              <li>
                <strong className='text-foreground'>
                  Development Environment Enhancers
                </strong>
                : Tools for better debugging, logging, and development server
                capabilities
              </li>
              <li>
                <strong className='text-foreground'>Testing Utilities</strong>:
                Helpers for unit testing, integration testing, and automated
                testing workflows
              </li>
              <li>
                <strong className='text-foreground'>
                  Documentation Generators
                </strong>
                : Automated tools for creating and maintaining project
                documentation
              </li>
              <li>
                <strong className='text-foreground'>
                  Performance Analyzers
                </strong>
                : Utilities for identifying bottlenecks and optimizing
                application performance
              </li>
              <li>
                <strong className='text-foreground'>Code Quality Tools</strong>:
                Linters, formatters, and code analysis tools tailored for
                specific use cases
              </li>
              <li>
                <strong className='text-foreground'>
                  API Development Helpers
                </strong>
                : Tools for mocking APIs, generating types from schemas, and
                testing endpoints
              </li>
              <li>
                <strong className='text-foreground'>CLI Applications</strong>:
                Command-line tools that automate repetitive tasks and enhance
                terminal workflows
              </li>
            </ul>

            <p className='text-muted-foreground mb-6'>
              Each tool is battle-tested, thoroughly documented, and designed
              with extensibility in mind. They showcase advanced TypeScript
              patterns, modern Node.js capabilities, and best practices for
              creating developer-focused software. Many have evolved based on
              community feedback and real-world usage, making them reliable
              additions to any development toolkit.
            </p>

            <h3 className='text-xl font-semibold text-foreground mb-3'>
              Full-Stack Projects
            </h3>

            <p className='text-muted-foreground mb-3'>
              <strong className='text-foreground'>
                Complete Applications Demonstrating End-to-End Development
                Mastery
              </strong>
            </p>

            <p className='text-muted-foreground mb-3'>
              While fewer in number, the Full-Stack Projects category contains
              the most comprehensive demonstrations of modern web application
              development. These five projects showcase complete,
              production-ready applications built from the ground up, each
              highlighting different aspects of full-stack architecture.
            </p>

            <p className='text-muted-foreground mb-3'>
              These applications demonstrate:
            </p>

            <ul className='list-disc list-inside text-muted-foreground space-y-2 mb-4'>
              <li>
                <strong className='text-foreground'>
                  Modern Database Design
                </strong>
                : Utilizing PostgreSQL, MongoDB, and modern ORMs to create
                efficient, scalable data layers
              </li>
              <li>
                <strong className='text-foreground'>
                  RESTful & GraphQL APIs
                </strong>
                : Well-architected backend services following industry best
                practices for security and performance
              </li>
              <li>
                <strong className='text-foreground'>
                  Authentication & Authorization
                </strong>
                : Implementing secure user authentication with JWT tokens, OAuth
                integration, and role-based access control
              </li>
              <li>
                <strong className='text-foreground'>Real-time Features</strong>:
                WebSocket integration for live updates, collaborative features,
                and instant messaging
              </li>
              <li>
                <strong className='text-foreground'>
                  Microservices Architecture
                </strong>
                : Demonstrating service separation, inter-service communication,
                and distributed system patterns
              </li>
              <li>
                <strong className='text-foreground'>Cloud Deployment</strong>:
                Complete deployment guides for AWS, Vercel, and other modern
                hosting platforms
              </li>
              <li>
                <strong className='text-foreground'>CI/CD Pipelines</strong>:
                Automated testing and deployment workflows ensuring code quality
                and reliability
              </li>
              <li>
                <strong className='text-foreground'>
                  Performance Optimization
                </strong>
                : Server-side rendering, caching strategies, and database query
                optimization
              </li>
              <li>
                <strong className='text-foreground'>
                  Security Best Practices
                </strong>
                : Input validation, SQL injection prevention, and secure API
                design
              </li>
            </ul>

            <p className='text-muted-foreground mb-6'>
              Each full-stack project includes comprehensive documentation
              covering system architecture, design decisions, deployment
              procedures, and scaling considerations. These projects serve as
              reference implementations for developers building similar
              applications or learning full-stack development.
            </p>

            <h3 className='text-xl font-semibold text-foreground mb-3'>
              Webflow Lab
            </h3>

            <p className='text-muted-foreground mb-3'>
              <strong className='text-foreground'>
                Pushing No-Code Boundaries with Advanced Webflow Experiments
              </strong>
            </p>

            <p className='text-muted-foreground mb-3'>
              The Webflow Lab represents a unique exploration of hybrid
              development – combining Webflow&apos;s visual development
              capabilities with custom code to create solutions that transcend
              typical no-code limitations. With over 20 innovative projects,
              this category demonstrates how Webflow can be extended and
              enhanced for professional web development.
            </p>

            <p className='text-muted-foreground mb-3'>
              These experiments include:
            </p>

            <ul className='list-disc list-inside text-muted-foreground space-y-2 mb-4'>
              <li>
                <strong className='text-foreground'>
                  Advanced Interactions
                </strong>
                : Complex interaction chains and state management beyond
                Webflow&apos;s native capabilities
              </li>
              <li>
                <strong className='text-foreground'>CMS Innovations</strong>:
                Creative uses of Webflow&apos;s CMS including dynamic filtering,
                advanced search, and data relationships
              </li>
              <li>
                <strong className='text-foreground'>Custom Components</strong>:
                Reusable component libraries that extend Webflow&apos;s built-in
                elements
              </li>
              <li>
                <strong className='text-foreground'>
                  Performance Optimizations
                </strong>
                : Techniques for improving Webflow site performance through
                custom code
              </li>
              <li>
                <strong className='text-foreground'>
                  Third-party Integrations
                </strong>
                : Connecting Webflow to external APIs, databases, and services
              </li>
              <li>
                <strong className='text-foreground'>
                  E-commerce Enhancements
                </strong>
                : Custom checkout flows, dynamic pricing, and inventory
                management solutions
              </li>
              <li>
                <strong className='text-foreground'>
                  Accessibility Improvements
                </strong>
                : Adding ARIA labels, keyboard navigation, and screen reader
                support
              </li>
              <li>
                <strong className='text-foreground'>Animation Libraries</strong>
                : Integrating GSAP, Lottie, and other animation libraries within
                Webflow
              </li>
              <li>
                <strong className='text-foreground'>
                  Custom Form Handling
                </strong>
                : Advanced form validation, multi-step forms, and custom
                submission logic
              </li>
              <li>
                <strong className='text-foreground'>
                  Dynamic Content Loading
                </strong>
                : Implementing infinite scroll, lazy loading, and AJAX content
                updates
              </li>
            </ul>

            <p className='text-muted-foreground mb-6'>
              Each Webflow Lab project includes cloneable links, detailed
              tutorials, and code snippets ready for implementation. These
              projects prove that Webflow can be a powerful tool for
              professional developers when combined with custom code expertise.
            </p>

            <h2 className='text-2xl font-bold text-foreground mt-8 mb-4'>
              Why This Collection Matters
            </h2>

            <h3 className='text-xl font-semibold text-foreground mb-3'>
              For Developers Seeking Inspiration
            </h3>

            <p className='text-muted-foreground mb-4'>
              The diversity of projects provides endless inspiration for your
              own work. Whether you&apos;re stuck on a particular animation
              challenge, looking for elegant solutions to common problems, or
              simply wanting to explore new techniques, this collection offers
              practical examples with working code.
            </p>

            <h3 className='text-xl font-semibold text-foreground mb-3'>
              For Teams Evaluating Technologies
            </h3>

            <p className='text-muted-foreground mb-4'>
              Each project serves as a proof of concept for different
              technologies and approaches. Teams can explore real
              implementations of GSAP animations, TypeScript patterns, Webflow
              capabilities, and full-stack architectures before committing to
              technology choices.
            </p>

            <h3 className='text-xl font-semibold text-foreground mb-3'>
              For Learners on Their Journey
            </h3>

            <p className='text-muted-foreground mb-4'>
              With complete source code, detailed documentation, and progressive
              complexity across projects, this collection serves as a self-paced
              curriculum for web development. Start with simpler animations and
              work your way up to complex full-stack applications.
            </p>

            <h3 className='text-xl font-semibold text-foreground mb-3'>
              For the Open Source Community
            </h3>

            <p className='text-muted-foreground mb-6'>
              Every project is open source, encouraging collaboration,
              improvement, and adaptation. The code is licensed permissively,
              allowing both personal and commercial use while fostering a
              culture of shared learning and growth.
            </p>

            <h2 className='text-2xl font-bold text-foreground mt-8 mb-4'>
              Technical Excellence Across All Projects
            </h2>

            <h3 className='text-xl font-semibold text-foreground mb-3'>
              Code Quality Standards
            </h3>

            <p className='text-muted-foreground mb-3'>
              Every project in the 100 Days of Craft collection adheres to
              strict quality standards:
            </p>

            <ul className='list-disc list-inside text-muted-foreground space-y-2 mb-4'>
              <li>
                <strong className='text-foreground'>TypeScript First</strong>:
                Where applicable, projects use TypeScript for type safety and
                better developer experience
              </li>
              <li>
                <strong className='text-foreground'>Modern JavaScript</strong>:
                Utilizing ES6+ features, async/await patterns, and modern API
                usage
              </li>
              <li>
                <strong className='text-foreground'>
                  Performance Optimized
                </strong>
                : Each project is optimized for performance, with lazy loading,
                code splitting, and efficient rendering
              </li>
              <li>
                <strong className='text-foreground'>
                  Accessible by Design
                </strong>
                : Following WCAG guidelines to ensure projects are usable by
                everyone
              </li>
              <li>
                <strong className='text-foreground'>
                  Responsive Implementation
                </strong>
                : Every project works seamlessly across desktop, tablet, and
                mobile devices
              </li>
              <li>
                <strong className='text-foreground'>
                  Cross-browser Compatible
                </strong>
                : Tested across modern browsers with appropriate fallbacks
              </li>
              <li>
                <strong className='text-foreground'>Well-Documented</strong>:
                Comprehensive README files, inline comments, and usage examples
              </li>
            </ul>

            <h3 className='text-xl font-semibold text-foreground mb-3'>
              Development Practices
            </h3>

            <p className='text-muted-foreground mb-3'>
              The collection showcases modern development practices including:
            </p>

            <ul className='list-disc list-inside text-muted-foreground space-y-2 mb-6'>
              <li>
                <strong className='text-foreground'>
                  Component-Based Architecture
                </strong>
                : Reusable, modular code organization
              </li>
              <li>
                <strong className='text-foreground'>
                  State Management Patterns
                </strong>
                : Demonstrating various approaches to managing application state
              </li>
              <li>
                <strong className='text-foreground'>Testing Strategies</strong>:
                Unit tests, integration tests, and end-to-end testing examples
              </li>
              <li>
                <strong className='text-foreground'>
                  Version Control Best Practices
                </strong>
                : Clear commit history and branching strategies
              </li>
              <li>
                <strong className='text-foreground'>
                  Continuous Integration
                </strong>
                : Automated testing and deployment workflows
              </li>
              <li>
                <strong className='text-foreground'>
                  Security Considerations
                </strong>
                : Input validation, sanitization, and secure coding practices
              </li>
            </ul>

            <h2 className='text-2xl font-bold text-foreground mt-8 mb-4'>
              Learning Resources and Documentation
            </h2>

            <h3 className='text-xl font-semibold text-foreground mb-3'>
              Comprehensive Project Documentation
            </h3>

            <p className='text-muted-foreground mb-3'>Each project includes:</p>

            <ul className='list-disc list-inside text-muted-foreground space-y-2 mb-4'>
              <li>
                <strong className='text-foreground'>Live Demo Links</strong>:
                See the project in action before diving into code
              </li>
              <li>
                <strong className='text-foreground'>Installation Guides</strong>
                : Step-by-step setup instructions for local development
              </li>
              <li>
                <strong className='text-foreground'>Usage Examples</strong>:
                Clear examples showing how to implement and customize
              </li>
              <li>
                <strong className='text-foreground'>API Documentation</strong>:
                For tools and utilities, complete API references
              </li>
              <li>
                <strong className='text-foreground'>
                  Architecture Diagrams
                </strong>
                : Visual representations of system design for complex projects
              </li>
              <li>
                <strong className='text-foreground'>Performance Metrics</strong>
                : Benchmarks and optimization notes
              </li>
              <li>
                <strong className='text-foreground'>
                  Browser Support Tables
                </strong>
                : Compatibility information for different browsers
              </li>
              <li>
                <strong className='text-foreground'>
                  Known Issues & Roadmap
                </strong>
                : Transparent communication about limitations and future plans
              </li>
            </ul>

            <h3 className='text-xl font-semibold text-foreground mb-3'>
              Educational Value
            </h3>

            <p className='text-muted-foreground mb-3'>
              Beyond the code itself, projects include:
            </p>

            <ul className='list-disc list-inside text-muted-foreground space-y-2 mb-6'>
              <li>
                <strong className='text-foreground'>
                  Technical Blog Posts
                </strong>
                : Deep dives into specific techniques and discoveries
              </li>
              <li>
                <strong className='text-foreground'>Video Walkthroughs</strong>:
                Screen recordings explaining complex implementations
              </li>
              <li>
                <strong className='text-foreground'>Code Comments</strong>:
                Extensive inline documentation explaining the &quot;why&quot;
                behind decisions
              </li>
              <li>
                <strong className='text-foreground'>
                  Alternative Approaches
                </strong>
                : Discussion of different ways to solve the same problem
              </li>
              <li>
                <strong className='text-foreground'>Learning Paths</strong>:
                Suggested project sequences for learning specific skills
              </li>
            </ul>

            <h2 className='text-2xl font-bold text-foreground mt-8 mb-4'>
              Community and Collaboration
            </h2>

            <h3 className='text-xl font-semibold text-foreground mb-3'>
              Contributing to Projects
            </h3>

            <p className='text-muted-foreground mb-3'>
              The 100 Days of Craft collection welcomes contributions:
            </p>

            <ul className='list-disc list-inside text-muted-foreground space-y-2 mb-4'>
              <li>
                <strong className='text-foreground'>Bug Reports</strong>: Help
                improve projects by reporting issues
              </li>
              <li>
                <strong className='text-foreground'>Feature Requests</strong>:
                Suggest enhancements and new capabilities
              </li>
              <li>
                <strong className='text-foreground'>Pull Requests</strong>:
                Contribute code improvements and fixes
              </li>
              <li>
                <strong className='text-foreground'>
                  Documentation Updates
                </strong>
                : Help improve clarity and completeness
              </li>
              <li>
                <strong className='text-foreground'>Translations</strong>: Make
                projects accessible to non-English speakers
              </li>
              <li>
                <strong className='text-foreground'>
                  Examples & Tutorials
                </strong>
                : Share how you&apos;ve used projects in your own work
              </li>
            </ul>

            <h3 className='text-xl font-semibold text-foreground mb-3'>
              Connect and Share
            </h3>

            <p className='text-muted-foreground mb-3'>
              Join the growing community around 100 Days of Craft:
            </p>

            <ul className='list-disc list-inside text-muted-foreground space-y-2 mb-6'>
              <li>
                <strong className='text-foreground'>GitHub Discussions</strong>:
                Ask questions and share insights
              </li>
              <li>
                <strong className='text-foreground'>Social Media</strong>: Tag
                projects when sharing your implementations
              </li>
              <li>
                <strong className='text-foreground'>Blog Posts</strong>: Write
                about your experience using these tools
              </li>
              <li>
                <strong className='text-foreground'>Conference Talks</strong>:
                Present techniques learned from the collection
              </li>
            </ul>

            <h2 className='text-2xl font-bold text-foreground mt-8 mb-4'>
              The Future of 100 Days of Craft
            </h2>

            <p className='text-muted-foreground mb-3'>
              While the initial 100-day challenge is complete, this collection
              continues to evolve:
            </p>

            <ul className='list-disc list-inside text-muted-foreground space-y-2 mb-6'>
              <li>
                <strong className='text-foreground'>Regular Updates</strong>:
                Projects receive maintenance updates and improvements
              </li>
              <li>
                <strong className='text-foreground'>New Features</strong>: Based
                on community feedback, projects gain new capabilities
              </li>
              <li>
                <strong className='text-foreground'>Technology Updates</strong>:
                Keeping pace with evolving web standards and best practices
              </li>
              <li>
                <strong className='text-foreground'>
                  Expanded Documentation
                </strong>
                : Continuously improving learning resources
              </li>
              <li>
                <strong className='text-foreground'>Community Showcases</strong>
                : Highlighting how others use these projects
              </li>
            </ul>

            <h2 className='text-2xl font-bold text-foreground mt-8 mb-4'>
              Start Exploring Today
            </h2>

            <p className='text-muted-foreground mb-4'>
              Whether you&apos;re a seasoned developer looking for inspiration,
              a team evaluating new technologies, or someone beginning their web
              development journey, the 100 Days of Craft collection offers
              something valuable. Each project represents not just a day of
              coding, but a step in the continuous journey of mastering web
              development craft.
            </p>

            <p className='text-muted-foreground mb-4'>
              Dive into any category that interests you, explore the code,
              experiment with the demos, and most importantly – use these
              projects as a springboard for your own creative endeavors. The web
              is our canvas, and these 100+ projects demonstrate just how much
              we can create when we commit to continuous learning and
              experimentation.
            </p>

            <p className='text-muted-foreground mb-6'>
              Remember: great developers aren&apos;t born, they&apos;re crafted
              – one project, one line of code, one day at a time.
            </p>

            <hr className='my-8 border-border' />

            <p className='text-muted-foreground italic'>
              All projects are open source and available on GitHub. Live demos
              are hosted and accessible for immediate exploration. Join
              thousands of developers who have already discovered inspiration,
              learned new techniques, and enhanced their projects with tools
              from the 100 Days of Craft collection.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
