/**
 * SEO Head Component for Wedding Website
 * Comprehensive meta tags for search engines and social media
 */

import { component$ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';

export interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  url?: string;
  type?: 'website' | 'article';
  siteName?: string;
  locale?: string;
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  noIndex?: boolean;
  canonicalUrl?: string;
  structuredData?: Record<string, unknown>;
}

export const SEOHead = component$((props: SEOHeadProps) => {
  const location = useLocation();
  const currentUrl = props.url || location.url.href;
  const canonicalUrl = props.canonicalUrl || currentUrl;

  // Default wedding information
  const defaultTitle = 'Alfina & Mugni Wedding - November 29, 2025';
  const defaultDescription = 'Join us in celebrating the wedding of Alfina and Mugni on November 29, 2025 in Jakarta, Indonesia. Find event details, RSVP, and share your wishes.';
  const defaultImage = '/images/wedding-couple-share.jpg';
  const siteName = 'Alfina & Mugni Wedding';

  const title = props.title || defaultTitle;
  const description = props.description || defaultDescription;
  const image = props.image || defaultImage;
  const imageAlt = props.imageAlt || 'Alfina & Mugni Wedding Invitation';

  // Generate structured data for wedding events
  const weddingStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Wedding',
    name: title,
    description: description,
    url: canonicalUrl,
    image: [image],
    startDate: '2025-11-29T09:00:00+07:00',
    endDate: '2025-11-29T21:00:00+07:00',
    location: {
      '@type': 'Place',
      name: 'Jakarta, Indonesia',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Jakarta',
        addressCountry: 'ID',
        addressRegion: 'DKI Jakarta'
      }
    },
    organizer: {
      '@type': 'Person',
      name: 'Alfina & Mugni'
    },
    performer: [
      {
        '@type': 'Person',
        name: 'Alfina'
      },
      {
        '@type': 'Person',
        name: 'Mugni'
      }
    ],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'IDR',
      availability: 'https://schema.org/InStock'
    },
    ...props.structuredData
  };

  // Event structured data for wedding ceremony
  const ceremonyStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: 'Akad Nikah - Alfina & Mugni',
    description: 'Akad Nikah ceremony for Alfina and Mugni',
    startDate: '2025-11-29T09:00:00+07:00',
    endDate: '2025-11-29T11:00:00+07:00',
    location: {
      '@type': 'Place',
      name: 'Jakarta, Indonesia',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Jakarta',
        addressCountry: 'ID'
      }
    },
    organizer: {
      '@type': 'Person',
      name: 'Alfina & Mugni'
    }
  };

  // Event structured data for wedding reception
  const receptionStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: 'Resepsi Pernikahan - Alfina & Mugni',
    description: 'Wedding reception for Alfina and Mugni',
    startDate: '2025-11-29T18:00:00+07:00',
    endDate: '2025-11-29T21:00:00+07:00',
    location: {
      '@type': 'Place',
      name: 'Jakarta, Indonesia',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Jakarta',
        addressCountry: 'ID'
      }
    },
    organizer: {
      '@type': 'Person',
      name: 'Alfina & Mugni'
    }
  };

  // Breadcrumb structured data
  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: canonicalUrl
      },
      ...(props.section ? [{
        '@type': 'ListItem',
        position: 2,
        name: props.section,
        item: canonicalUrl
      }] : [])
    ]
  };

  return (
    <>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={(props.keywords || [
        'wedding', 'pernikahan', 'Alfina', 'Mugni', 'Jakarta', 'Indonesia',
        'undangan pernikahan', 'wedding invitation', 'November 2025'
      ]).join(', ')} />
      <meta name="author" content={props.author || 'Alfina & Mugni'} />
      <meta name="robots" content={props.noIndex ? 'noindex,nofollow' : 'index,follow'} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={props.type || 'website'} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content={imageAlt} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={props.locale || 'id_ID'} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={imageAlt} />
      <meta name="twitter:creator" content="@alfinamugni" />
      <meta name="twitter:site" content="@alfinamugni" />
      
      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#4d3326" />
      <meta name="msapplication-TileColor" content="#4d3326" />
      <meta name="application-name" content={siteName} />
      <meta name="apple-mobile-web-app-title" content={siteName} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Article specific meta tags */}
      {props.type === 'article' && (
        <>
          {props.publishedTime && (
            <meta property="article:published_time" content={props.publishedTime} />
          )}
          {props.modifiedTime && (
            <meta property="article:modified_time" content={props.modifiedTime} />
          )}
          {props.section && (
            <meta property="article:section" content={props.section} />
          )}
          {props.tags && props.tags.map(tag => (
            <meta property="article:tag" content={tag} key={tag} />
          ))}
          <meta property="article:author" content={props.author || 'Alfina & Mugni'} />
        </>
      )}
      
      {/* Indonesian-specific meta tags */}
      <meta name="geo.region" content="ID-JK" />
      <meta name="geo.placename" content="Jakarta" />
      <meta name="geo.position" content="-6.2088;106.8456" />
      <meta name="ICBM" content="-6.2088,106.8456" />
      <meta name="language" content="Indonesian" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={JSON.stringify(weddingStructuredData)}
      />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={JSON.stringify(ceremonyStructuredData)}
      />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={JSON.stringify(receptionStructuredData)}
      />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={JSON.stringify(breadcrumbStructuredData)}
      />
      
      {/* Additional structured data if provided */}
      {props.structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={JSON.stringify(props.structuredData)}
        />
      )}
      
      {/* DNS Prefetch for performance */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//www.googletagmanager.com" />
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      <link rel="dns-prefetch" href="//cloudflare.com" />
      
      {/* Preconnect for critical resources */}
      <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      
      {/* Favicon and app icons */}
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="mask-icon" href="/safari-pinned-tab.svg" />
      
      {/* Manifest for PWA */}
      <link rel="manifest" href="/manifest.json" />
    </>
  );
});

// Convenience components for specific pages
export const HomeSEOHead = component$(() => {
  return (
    <SEOHead
      title="Alfina & Mugni Wedding - November 29, 2025"
      description="Join us in celebrating the wedding of Alfina and Mugni on November 29, 2025 in Jakarta, Indonesia. Find event details, RSVP, and share your wishes."
      keywords={['wedding', 'pernikahan', 'Alfina', 'Mugni', 'Jakarta', 'Indonesia', 'undangan pernikahan']}
      section="Home"
    />
  );
});

export const RSVPSEOHead = component$(() => {
  return (
    <SEOHead
      title="RSVP - Alfina & Mugni Wedding"
      description="RSVP for Alfina and Mugni's wedding on November 29, 2025. Confirm your attendance and meal preferences."
      keywords={['RSVP', 'wedding RSVP', 'pernikahan', 'konfirmasi kehadiran']}
      section="RSVP"
    />
  );
});

export const GallerySEOHead = component$(() => {
  return (
    <SEOHead
      title="Photo Gallery - Alfina & Mugni Wedding"
      description="View and share photos from Alfina and Mugni's wedding celebration. Upload your memories and wishes."
      keywords={['wedding photos', 'galeri foto', 'wedding gallery', 'pernikahan']}
      section="Gallery"
    />
  );
});

export const DetailsSEOHead = component$(() => {
  return (
    <SEOHead
      title="Wedding Details - Alfina & Mugni Wedding"
      description="Complete wedding details for Alfina and Mugni's celebration on November 29, 2025 in Jakarta, Indonesia."
      keywords={['wedding details', 'informasi pernikahan', 'wedding venue', 'wedding schedule']}
      section="Details"
    />
  );
});