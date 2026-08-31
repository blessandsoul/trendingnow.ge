import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

function clamp(value: string, fallback: string, max = 96): string {
  const text = value.trim() || fallback;
  return text.length > max ? `${text.slice(0, max - 1).trim()}...` : text;
}

export function GET(request: NextRequest): ImageResponse {
  const { searchParams } = new URL(request.url);
  const title = clamp(searchParams.get('title') ?? '', 'Continuum GE');
  const date = clamp(searchParams.get('date') ?? '', '', 32);
  const tags = (searchParams.get('tags') ?? '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 4);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#07152A',
          color: '#FFFFFF',
          position: 'relative',
          fontFamily: 'Inter, Arial, sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, rgba(253,195,2,0.95) 0%, rgba(253,195,2,0.82) 26%, rgba(23,74,152,0.88) 58%, rgba(7,21,42,1) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 72,
            right: 72,
            top: 58,
            bottom: 58,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                fontSize: 30,
                fontWeight: 900,
                letterSpacing: '-0.02em',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  background: '#FFFFFF',
                  color: '#07152A',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                }}
              >
                C
              </div>
              Continuum GE
            </div>
            {date && (
              <div style={{ fontSize: 24, fontWeight: 800, opacity: 0.86 }}>
                {date}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div
              style={{
                maxWidth: 940,
                fontSize: title.length > 64 ? 60 : 72,
                lineHeight: 1.02,
                fontWeight: 950,
                letterSpacing: '-0.025em',
                textWrap: 'balance',
              }}
            >
              {title}
            </div>
            {tags.length > 0 && (
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {tags.map((tag) => (
                  <div
                    key={tag}
                    style={{
                      borderRadius: 999,
                      background: 'rgba(255,255,255,0.18)',
                      border: '1px solid rgba(255,255,255,0.28)',
                      padding: '10px 18px',
                      fontSize: 22,
                      fontWeight: 800,
                    }}
                  >
                    {tag}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
