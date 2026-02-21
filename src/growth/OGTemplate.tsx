import { ImageResponse } from 'next/og';

export function generateOGImage(title: string) {
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
          backgroundColor: '#f9fafb',
          position: 'relative',
        }}
      >
        {/* Subtle gradient orbs */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.1))',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            left: '-80px',
            width: '350px',
            height: '350px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(99,102,241,0.08))',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Logo area */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '40px',
            }}
          >
            <div style={{
              fontSize: '40px',
              fontWeight: 800,
              color: '#111827',
              letterSpacing: '-0.02em',
              textTransform: 'uppercase' as const,
            }}>
              KRAMA
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: '#111827',
              textAlign: 'center' as const,
              lineHeight: 1.15,
              padding: '0 60px',
              letterSpacing: '-0.03em',
              maxWidth: '900px',
            }}
          >
            {title}
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 28,
              color: '#6b7280',
              marginTop: '24px',
              fontWeight: 600,
            }}
          >
            Study Tracker for UPSC · JEE · NEET · SSC
          </div>

          {/* Bottom badges */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              marginTop: '48px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#f3f4f6',
                padding: '10px 20px',
                borderRadius: '100px',
                border: '1px solid #e5e7eb',
                fontSize: '16px',
                fontWeight: 700,
                color: '#374151',
              }}
            >
              Free to start
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#f3f4f6',
                padding: '10px 20px',
                borderRadius: '100px',
                border: '1px solid #e5e7eb',
                fontSize: '16px',
                fontWeight: 700,
                color: '#374151',
              }}
            >
              usekrama.com
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
