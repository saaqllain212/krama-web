import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.usekrama.com'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',  // PRIVATE: User data lives here
        '/admin/',      // PRIVATE: Your control center
        '/api/',        // PRIVATE: Backend logic
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}