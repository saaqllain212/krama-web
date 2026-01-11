import { MetadataRoute } from 'next'
import { getAllSyllabusPaths } from '@/lib/syllabus-registry' // <--- 1. Import your data

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.usekrama.com'

  // 2. GET ALL DYNAMIC PATHS (The "Hidden" Pages)
  const syllabusPaths = getAllSyllabusPaths().map((route) => ({
    url: `${baseUrl}/syllabus/${route.exam}/${route.subject}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9, // High priority (These are your landing pages!)
  }))

  // 3. MERGE WITH STATIC PATHS
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/legal/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/legal/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/legal/refund`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    ...syllabusPaths, // <--- 4. SPREAD THE DYNAMIC PAGES HERE
  ]
}