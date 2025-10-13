/**
 * Sitemap Generator for Wedding Website
 * Dynamic sitemap generation for SEO
 */

import { routeLoader$ } from '@builder.io/qwik-city';

export interface SitemapEntry {
  url: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export const useGET = routeLoader$(({ url }) => {
  const baseUrl = url.origin;
  
  // Define all pages for the wedding website
  const pages: SitemapEntry[] = [
    {
      url: '/',
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: 1.0
    },
    {
      url: '/#rsvp',
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 0.9
    },
    {
      url: '/#gallery',
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.8
    },
    {
      url: '/#details',
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: 0.7
    },
    {
      url: '/#contact',
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: 0.6
    },
    {
      url: '/gallery',
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.8
    },
    {
      url: '/auth/signin',
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: 0.3
    }
  ];

  // Generate XML sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority.toFixed(1)}</priority>
    ${page.url.includes('#') ? `<xhtml:link rel="alternate" href="${baseUrl}${page.url}" hreflang="id" />` : ''}
  </url>`).join('\n')}
</urlset>`;

  // Return XML response
  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
});