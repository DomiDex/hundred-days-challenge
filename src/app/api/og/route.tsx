import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    // Get params
    const title = searchParams.get('title') || '100 Days of Craft'
    const description = searchParams.get('description') || 'A daily Next.js coding challenge'
    const category = searchParams.get('category')
    const author = searchParams.get('author')
    const date = searchParams.get('date')

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1a1a1a',
            backgroundImage: 'linear-gradient(to bottom right, #1a1a1a, #2d2d2d)',
          }}
        >
          {/* Pattern overlay */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `radial-gradient(circle at 1px 1px, rgb(139 92 246 / 0.1) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />

          {/* Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'center',
              padding: '60px',
              maxWidth: '1000px',
              height: '100%',
            }}
          >
            {/* Category */}
            {category && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#8b5cf6',
                    color: 'white',
                    padding: '8px 20px',
                    borderRadius: '9999px',
                    fontSize: '24px',
                    fontWeight: '600',
                  }}
                >
                  {category}
                </div>
              </div>
            )}

            {/* Title */}
            <h1
              style={{
                fontSize: '72px',
                fontWeight: '800',
                color: 'white',
                lineHeight: 1.1,
                marginBottom: '30px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {title}
            </h1>

            {/* Description */}
            {description && (
              <p
                style={{
                  fontSize: '28px',
                  color: '#a1a1aa',
                  lineHeight: 1.4,
                  marginBottom: '40px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {description}
              </p>
            )}

            {/* Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                marginTop: 'auto',
              }}
            >
              {/* Author and date */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {author && <span style={{ fontSize: '24px', color: '#8b5cf6' }}>{author}</span>}
                {author && date && <span style={{ fontSize: '24px', color: '#6b7280' }}>•</span>}
                {date && <span style={{ fontSize: '24px', color: '#6b7280' }}>{date}</span>}
              </div>

              {/* Logo/Brand */}
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#8b5cf6',
                }}
              >
                100 Days of Craft
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e) {
    console.error('OG Image generation failed:', e)
    return new Response('Failed to generate image', { status: 500 })
  }
}
