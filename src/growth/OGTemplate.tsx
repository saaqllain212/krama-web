import { ImageResponse } from 'next/og';

// This function draws the actual image
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
          backgroundColor: '#FBF9F6', // Your app background color
          border: '20px solid #1A1A1A', // Thick Neo-brutalism border
        }}
      >
        {/* LOGO AREA */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
          }}
        >
           <div style={{ 
             fontSize: 40, 
             background: '#000', 
             color: '#fff', 
             padding: '10px 20px',
             fontWeight: 'bold'
           }}>
             KRAMA
           </div>
        </div>

        {/* TITLE */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 900,
            color: '#1A1A1A',
            textAlign: 'center',
            lineHeight: 1.1,
            padding: '0 40px',
          }}
        >
          {title}
        </div>

        {/* TAGLINE */}
        <div
          style={{
            fontSize: 30,
            color: '#666',
            marginTop: '30px',
            fontWeight: 'bold',
          }}
        >
          Strategic Study Tracker
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}