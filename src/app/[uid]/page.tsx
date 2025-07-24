import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/prismicio';
import { SliceZone } from '@prismicio/react';
import { components } from '@/slices';
import { PrismicRichText } from '@prismicio/react';
import { generateSEOMetadata } from '@/components/SEO';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import type { PageDocument } from '../../../prismicio-types';
import * as prismic from '@prismicio/client';

// Temporary type extension until Prismic types are regenerated
interface ExtendedPageData {
  content?: prismic.RichTextField;
}

type ExtendedPage = PageDocument & {
  data: PageDocument['data'] & ExtendedPageData;
};

type Props = {
  params: Promise<{ uid: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { uid } = await params;
  const client = createClient();

  try {
    const page = await client.getByUID('page', uid);
    const url = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/${uid}`;

    return generateSEOMetadata({
      data: page.data,
      fallbackTitle: page.data.title || 'Page',
      fallbackDescription: '',
      url,
    });
  } catch {
    return {
      title: 'Page Not Found',
      description: 'The requested page could not be found',
    };
  }
}

export async function generateStaticParams() {
  const client = createClient();
  const pages = await client.getAllByType('page');

  return pages.map((page) => ({
    uid: page.uid,
  }));
}

export default async function Page({ params }: Props) {
  const { uid } = await params;
  const client = createClient();

  let page: ExtendedPage;
  try {
    page = (await client.getByUID('page', uid)) as ExtendedPage;
  } catch {
    notFound();
  }

  return (
    <div className='min-h-screen bg-background'>
      <article className='max-w-3xl mx-auto px-6 py-16'>
        <Breadcrumb 
          items={[
            { label: 'Home', href: '/' },
            { label: page.data.title || '' }
          ]}
          className='mb-6'
        />
        
        {/* Page Header */}
        <header className='mb-12'>
          <h1 className='text-4xl md:text-5xl font-bold text-foreground mb-8'>
            {page.data.title}
          </h1>
        </header>

        {/* Page Content */}
        {page.data.content && (
          <div className='prose prose-lg dark:prose-invert max-w-none mb-12'>
            <PrismicRichText
              field={page.data.content}
              components={{
                label: ({ node, children }) => {
                  if (node.data.label === 'codespan') {
                    return (
                      <code className='bg-muted px-1.5 py-0.5 rounded text-sm font-mono'>
                        {children}
                      </code>
                    );
                  }
                  if (node.data.label === 'highlight') {
                    return (
                      <mark className='bg-yellow-200 dark:bg-yellow-900 px-1'>
                        {children}
                      </mark>
                    );
                  }
                  return <span>{children}</span>;
                },
              }}
            />
          </div>
        )}

        {/* Slices */}
        {page.data.slices && page.data.slices.length > 0 && (
          <div className='mt-12'>
            <SliceZone slices={page.data.slices} components={components} />
          </div>
        )}
      </article>
    </div>
  );
}
