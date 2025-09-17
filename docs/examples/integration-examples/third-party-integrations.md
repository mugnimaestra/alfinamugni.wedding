# Third-Party Integrations Guide

_Wedding-relevant service integrations for Alfina & Mugni's Wedding Website_

---

## Table of Contents

- [Overview](#overview)
- [Maps & Directions](#maps--directions)
- [RSVP Management](#rsvp-management)
- [Photo Gallery Services](#photo-gallery-services)
- [Communication Platforms](#communication-platforms)
- [Calendar Integration](#calendar-integration)
- [Social Media Integration](#social-media-integration)
- [Email Services](#email-services)
- [Analytics & Tracking](#analytics--tracking)
- [Payment Processing](#payment-processing)
- [Database Services](#database-services)

---

## Overview

This guide provides comprehensive examples for integrating third-party services into the wedding website. Each integration is tailored for wedding-specific use cases and includes practical implementation examples.

**Wedding Context:**

- **Couple:** Alfina & Mugni
- **Date:** November 29, 2025
- **Location:** Jakarta, Indonesia
- **Timezone:** Asia/Jakarta (UTC+7)

---

## Maps & Directions

### Google Maps Integration

```typescript
// src/integrations/maps.ts
interface VenueLocation {
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

/**
 * Google Maps integration for wedding venues
 */
export class WeddingMapsService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Generate directions URL for venue
   */
  getDirectionsUrl(venue: VenueLocation): string {
    const encodedAddress = encodeURIComponent(venue.address);
    return `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
  }

  /**
   * Embed map for venue location
   */
  getEmbedUrl(venue: VenueLocation): string {
    const { lat, lng } = venue.coordinates;
    return `https://www.google.com/maps/embed/v1/place?key=${this.apiKey}&q=${lat},${lng}&zoom=15`;
  }

  /**
   * Get estimated travel time from user location
   */
  async getTravelTime(userLocation: string, venue: VenueLocation): Promise<string> {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?` +
      `origins=${encodeURIComponent(userLocation)}&` +
      `destinations=${encodeURIComponent(venue.address)}&` +
      `key=${this.apiKey}`
    );

    const data = await response.json();
    return data.rows[0]?.elements[0]?.duration?.text || 'Unknown';
  }
}

// Usage in component
export const VenueMapSection = component$(() => {
  const weddingVenue: VenueLocation = {
    name: "Balai Kartini",
    address: "Jl. Gatot Subroto Kav. 37, Jakarta Selatan",
    coordinates: { lat: -6.2297, lng: 106.8311 }
  };

  const mapsService = new WeddingMapsService(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);

  return (
    <div class="venue-map-section">
      <h3>Wedding Venue</h3>
      <iframe
        src={mapsService.getEmbedUrl(weddingVenue)}
        width="100%"
        height="300"
        style="border:0;"
        allowfullscreen=""
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
      />
      <a
        href={mapsService.getDirectionsUrl(weddingVenue)}
        target="_blank"
        class="wedding-button"
      >
        Get Directions
      </a>
    </div>
  );
});
```

### Apple Maps Integration

```typescript
// Alternative for iOS users
export function getAppleMapsUrl(venue: VenueLocation): string {
  const { lat, lng } = venue.coordinates;
  return `https://maps.apple.com/?q=${encodeURIComponent(venue.name)}&ll=${lat},${lng}`;
}

// Cross-platform directions component
export const DirectionsButton = component$<{ venue: VenueLocation }>((props) => {
  const handleGetDirections = $(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const mapsService = new WeddingMapsService(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);

    const url = isIOS
      ? getAppleMapsUrl(props.venue)
      : mapsService.getDirectionsUrl(props.venue);

    window.open(url, '_blank');
  });

  return (
    <button onClick$={handleGetDirections} class="wedding-button">
      📍 Get Directions
    </button>
  );
});
```

---

## RSVP Management

### Airtable Integration

```typescript
// src/integrations/airtable.ts
interface AirtableConfig {
  baseId: string;
  tableName: string;
  apiKey: string;
}

export class WeddingRSVPService {
  private config: AirtableConfig;
  private baseUrl: string;

  constructor(config: AirtableConfig) {
    this.config = config;
    this.baseUrl = `https://api.airtable.com/v0/${config.baseId}/${config.tableName}`;
  }

  /**
   * Submit RSVP to Airtable
   */
  async submitRSVP(
    rsvpData: RSVPFormData,
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            Name: rsvpData.name,
            Email: rsvpData.email,
            Attending: rsvpData.attending,
            "Guest Count": rsvpData.guestCount,
            "Dietary Restrictions": rsvpData.dietaryRestrictions || "",
            Message: rsvpData.message || "",
            "Submitted At": new Date().toISOString(),
            "Wedding Date": "2025-11-29",
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, id: result.id };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get RSVP statistics
   */
  async getRSVPStats(): Promise<{
    attending: number;
    notAttending: number;
    total: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}?fields[]=Attending`, {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
        },
      });

      const data = await response.json();
      const records = data.records || [];

      const attending = records.filter(
        (r: any) => r.fields.Attending === true,
      ).length;
      const notAttending = records.filter(
        (r: any) => r.fields.Attending === false,
      ).length;

      return {
        attending,
        notAttending,
        total: records.length,
      };
    } catch (error) {
      console.error("Failed to fetch RSVP stats:", error);
      return { attending: 0, notAttending: 0, total: 0 };
    }
  }
}
```

### Google Sheets Integration

```typescript
// src/integrations/google-sheets.ts
export class GoogleSheetsRSVPService {
  private sheetId: string;
  private apiKey: string;

  constructor(sheetId: string, apiKey: string) {
    this.sheetId = sheetId;
    this.apiKey = apiKey;
  }

  /**
   * Submit RSVP to Google Sheets via Google Apps Script
   */
  async submitRSVP(
    rsvpData: RSVPFormData,
  ): Promise<{ success: boolean; error?: string }> {
    const scriptUrl = `https://script.google.com/macros/s/${import.meta.env.VITE_GOOGLE_SCRIPT_ID}/exec`;

    try {
      const response = await fetch(scriptUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "submitRSVP",
          data: {
            ...rsvpData,
            timestamp: new Date().toISOString(),
            weddingDate: "2025-11-29",
          },
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to submit RSVP",
      };
    }
  }
}

// Google Apps Script code (to be deployed separately)
/*
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    if (data.action === 'submitRSVP') {
      const sheet = SpreadsheetApp.openById('YOUR_SHEET_ID').getActiveSheet();
      
      sheet.appendRow([
        new Date(data.data.timestamp),
        data.data.name,
        data.data.email,
        data.data.attending,
        data.data.guestCount,
        data.data.dietaryRestrictions || '',
        data.data.message || ''
      ]);
      
      return ContentService
        .createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: 'Invalid action' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
*/
```

---

## Photo Gallery Services

### Cloudinary Integration

```typescript
// src/integrations/cloudinary.ts
interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

export class WeddingPhotoService {
  private config: CloudinaryConfig;

  constructor(config: CloudinaryConfig) {
    this.config = config;
  }

  /**
   * Generate optimized image URL
   */
  getOptimizedImageUrl(
    publicId: string,
    transformations: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'auto' | 'webp' | 'jpg' | 'png';
      crop?: 'fill' | 'fit' | 'scale';
    } = {}
  ): string {
    const { width, height, quality = 80, format = 'auto', crop = 'fill' } = transformations;

    let transformString = `q_${quality},f_${format}`;

    if (width || height) {
      transformString += `,c_${crop}`;
      if (width) transformString += `,w_${width}`;
      if (height) transformString += `,h_${height}`;
    }

    return `https://res.cloudinary.com/${this.config.cloudName}/image/upload/${transformString}/${publicId}`;
  }

  /**
   * Generate responsive image srcset
   */
  getResponsiveImageSrcSet(publicId: string): string {
    const breakpoints = [400, 600, 800, 1200, 1600];

    return breakpoints
      .map(width => {
        const url = this.getOptimizedImageUrl(publicId, { width, quality: 80 });
        return `${url} ${width}w`;
      })
      .join(', ');
  }

  /**
   * Upload image to Cloudinary
   */
  async uploadImage(file: File, folder: string = 'wedding-photos'): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'wedding_upload'); // Configure in Cloudinary dashboard
    formData.append('folder', folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${this.config.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    const data = await response.json();
    return data.public_id;
  }
}

// Usage in gallery component
export const CloudinaryGallery = component$(() => {
  const photoService = new WeddingPhotoService({
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
    apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
    apiSecret: import.meta.env.VITE_CLOUDINARY_API_SECRET
  });

  const galleryPhotos = [
    'wedding-photos/engagement-session-1',
    'wedding-photos/engagement-session-2',
    'wedding-photos/pre-wedding-shoot-1'
  ];

  return (
    <div class="cloudinary-gallery grid grid-cols-1 md:grid-cols-3 gap-4">
      {galleryPhotos.map((publicId) => (
        <picture key={publicId}>
          <source
            media="(min-width: 768px)"
            srcSet={photoService.getResponsiveImageSrcSet(publicId)}
          />
          <img
            src={photoService.getOptimizedImageUrl(publicId, { width: 400 })}
            alt="Wedding photo"
            class="w-full h-auto rounded-lg shadow-md hover:shadow-xl transition-shadow"
            loading="lazy"
          />
        </picture>
      ))}
    </div>
  );
});
```

### Instagram Integration

```typescript
// src/integrations/instagram.ts
export class InstagramFeedService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Fetch Instagram posts with wedding hashtag
   */
  async getWeddingPosts(hashtag: string = 'AlfinaMugniWedding'): Promise<InstagramPost[]> {
    try {
      const response = await fetch(
        `https://graph.instagram.com/me/media?fields=id,caption,media_url,thumbnail_url,media_type,permalink&access_token=${this.accessToken}`
      );

      const data = await response.json();

      // Filter posts with wedding hashtag
      return data.data
        .filter((post: any) => post.caption?.includes(`#${hashtag}`))
        .map((post: any) => ({
          id: post.id,
          caption: post.caption,
          mediaUrl: post.media_url,
          thumbnailUrl: post.thumbnail_url,
          mediaType: post.media_type,
          permalink: post.permalink
        }));
    } catch (error) {
      console.error('Failed to fetch Instagram posts:', error);
      return [];
    }
  }
}

interface InstagramPost {
  id: string;
  caption: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  permalink: string;
}

// Instagram feed component
export const InstagramFeed = component$(() => {
  const instagramPosts = useSignal<InstagramPost[]>([]);

  useTask$(async () => {
    const instagram = new InstagramFeedService(import.meta.env.VITE_INSTAGRAM_ACCESS_TOKEN);
    instagramPosts.value = await instagram.getWeddingPosts('AlfinaMugniWedding');
  });

  return (
    <section class="instagram-feed">
      <h2 class="text-3xl font-serif text-wedding-brown mb-8 text-center">
        Follow Our Journey
      </h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        {instagramPosts.value.map((post) => (
          <a
            key={post.id}
            href={post.permalink}
            target="_blank"
            class="block aspect-square bg-gray-200 rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
          >
            <img
              src={post.thumbnailUrl || post.mediaUrl}
              alt="Instagram post"
              class="w-full h-full object-cover"
              loading="lazy"
            />
          </a>
        ))}
      </div>
    </section>
  );
});
```

---

## Communication Platforms

### WhatsApp Integration

```typescript
// src/integrations/whatsapp.ts
export class WhatsAppService {
  /**
   * Generate WhatsApp contact URL
   */
  static getContactUrl(phoneNumber: string, message?: string): string {
    const cleanNumber = phoneNumber.replace(/[^\d]/g, '');
    const encodedMessage = message ? encodeURIComponent(message) : '';

    return `https://wa.me/${cleanNumber}${encodedMessage ? `?text=${encodedMessage}` : ''}`;
  }

  /**
   * Generate wedding-specific contact messages
   */
  static getWeddingContactMessage(type: 'general' | 'rsvp' | 'directions' | 'emergency'): string {
    const messages = {
      general: "Hi! I have a question about Alfina & Mugni's wedding on November 29, 2025.",
      rsvp: "Hi! I need help with my RSVP for Alfina & Mugni's wedding.",
      directions: "Hi! I need directions to the wedding venue for November 29, 2025.",
      emergency: "Hi! This is regarding an urgent matter for Alfina & Mugni's wedding."
    };

    return messages[type];
  }
}

// WhatsApp contact component
export const WhatsAppContact = component$<{
  phoneNumber: string;
  contactType: 'general' | 'rsvp' | 'directions' | 'emergency';
  label: string;
}>((props) => {
  const handleWhatsAppContact = $(() => {
    const message = WhatsAppService.getWeddingContactMessage(props.contactType);
    const url = WhatsAppService.getContactUrl(props.phoneNumber, message);
    window.open(url, '_blank');
  });

  return (
    <button
      onClick$={handleWhatsAppContact}
      class="flex items-center gap-2 wedding-button bg-green-600 hover:bg-green-700"
    >
      <span class="text-xl">💬</span>
      {props.label}
    </button>
  );
});

// Wedding contacts section
export const WeddingContacts = component$(() => {
  const contacts = [
    {
      name: "Alfina (Bride)",
      phone: "+62812345678",
      role: "For general questions"
    },
    {
      name: "Mugni (Groom)",
      phone: "+62887654321",
      role: "For technical questions"
    },
    {
      name: "Wedding Coordinator",
      phone: "+62811223344",
      role: "For event coordination"
    }
  ];

  return (
    <div class="wedding-contacts space-y-4">
      {contacts.map((contact) => (
        <div key={contact.phone} class="wedding-card">
          <h4 class="font-semibold text-wedding-brown">{contact.name}</h4>
          <p class="text-wedding-text-muted text-sm mb-3">{contact.role}</p>
          <WhatsAppContact
            phoneNumber={contact.phone}
            contactType="general"
            label="Contact via WhatsApp"
          />
        </div>
      ))}
    </div>
  );
});
```

### Telegram Integration

```typescript
// src/integrations/telegram.ts
export class TelegramService {
  private botToken: string;
  private chatId: string;

  constructor(botToken: string, chatId: string) {
    this.botToken = botToken;
    this.chatId = chatId;
  }

  /**
   * Send RSVP notification to wedding group
   */
  async sendRSVPNotification(rsvpData: RSVPFormData): Promise<boolean> {
    const message = this.formatRSVPMessage(rsvpData);

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${this.botToken}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: this.chatId,
            text: message,
            parse_mode: "Markdown",
          }),
        },
      );

      return response.ok;
    } catch (error) {
      console.error("Failed to send Telegram notification:", error);
      return false;
    }
  }

  private formatRSVPMessage(data: RSVPFormData): string {
    const emoji = data.attending ? "✅" : "❌";
    const status = data.attending ? "Will attend" : "Cannot attend";

    return `
${emoji} *New RSVP for Alfina & Mugni Wedding*

*Name:* ${data.name}
*Email:* ${data.email}
*Status:* ${status}
*Guests:* ${data.guestCount}
${data.dietaryRestrictions ? `*Dietary:* ${data.dietaryRestrictions}` : ""}
${data.message ? `*Message:* ${data.message}` : ""}

*Submitted:* ${new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })}
    `.trim();
  }
}
```

---

## Calendar Integration

### Google Calendar Integration

```typescript
// src/integrations/calendar.ts
export class CalendarService {
  /**
   * Generate Google Calendar event URL
   */
  static generateGoogleCalendarUrl(eventDetails: {
    title: string;
    startDate: Date;
    endDate: Date;
    description: string;
    location: string;
  }): string {
    const { title, startDate, endDate, description, location } = eventDetails;

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[:-]/g, '').split('.')[0] + 'Z';
    };

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
      details: description,
      location: location,
      trp: 'false'
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  /**
   * Generate iCal file content
   */
  static generateICalContent(eventDetails: {
    title: string;
    startDate: Date;
    endDate: Date;
    description: string;
    location: string;
  }): string {
    const { title, startDate, endDate, description, location } = eventDetails;

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[:-]/g, '').split('.')[0] + 'Z';
    };

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Alfina & Mugni Wedding//EN',
      'BEGIN:VEVENT',
      `DTSTART:${formatDate(startDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      `UID:alfina-mugni-wedding-${Date.now()}@wedding-website.com`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-P1D',
      'ACTION:DISPLAY',
      'DESCRIPTION:Wedding tomorrow!',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
  }

  /**
   * Download calendar file
   */
  static downloadCalendarFile(eventDetails: any, filename: string = 'wedding.ics'): void {
    const icalContent = this.generateICalContent(eventDetails);
    const blob = new Blob([icalContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Calendar integration component
export const AddToCalendar = component$(() => {
  const weddingEvent = {
    title: "Alfina & Mugni Wedding Celebration",
    startDate: new Date('2025-11-29T14:00:00+07:00'),
    endDate: new Date('2025-11-29T22:00:00+07:00'),
    description: "Join us for the wedding celebration of Alfina and Mugni! Ceremony at 2 PM, reception to follow.",
    location: "Balai Kartini, Jakarta Selatan"
  };

  const handleAddToGoogleCalendar = $(() => {
    const url = CalendarService.generateGoogleCalendarUrl(weddingEvent);
    window.open(url, '_blank');
  });

  const handleDownloadICal = $(() => {
    CalendarService.downloadCalendarFile(weddingEvent, 'alfina-mugni-wedding.ics');
  });

  return (
    <div class="add-to-calendar space-y-4">
      <h3 class="text-xl font-semibold text-wedding-brown">Save the Date</h3>
      <div class="flex flex-col sm:flex-row gap-3">
        <button
          onClick$={handleAddToGoogleCalendar}
          class="wedding-button flex items-center gap-2"
        >
          📅 Add to Google Calendar
        </button>
        <button
          onClick$={handleDownloadICal}
          class="wedding-button bg-wedding-sage text-wedding-brown flex items-center gap-2"
        >
          📥 Download Calendar File
        </button>
      </div>
    </div>
  );
});
```

---

## Social Media Integration

### Social Sharing

```typescript
// src/integrations/social-sharing.ts
export class SocialSharingService {
  private weddingUrl: string;
  private weddingTitle: string;

  constructor(url: string = window.location.href) {
    this.weddingUrl = url;
    this.weddingTitle = "Alfina & Mugni Wedding - November 29, 2025";
  }

  /**
   * Share on Facebook
   */
  shareOnFacebook(): void {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.weddingUrl)}`;
    this.openShareWindow(url);
  }

  /**
   * Share on Twitter
   */
  shareOnTwitter(customMessage?: string): void {
    const text = customMessage || `Join us for ${this.weddingTitle} 💒 #AlfinaMugniWedding`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(this.weddingUrl)}`;
    this.openShareWindow(url);
  }

  /**
   * Share on WhatsApp
   */
  shareOnWhatsApp(): void {
    const text = `${this.weddingTitle} - ${this.weddingUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    this.openShareWindow(url);
  }

  /**
   * Copy link to clipboard
   */
  async copyToClipboard(): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(this.weddingUrl);
      return true;
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = this.weddingUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    }
  }

  /**
   * Use Web Share API if available
   */
  async nativeShare(): Promise<boolean> {
    if (!navigator.share) {
      return false;
    }

    try {
      await navigator.share({
        title: this.weddingTitle,
        text: "Join us for our wedding celebration!",
        url: this.weddingUrl
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  private openShareWindow(url: string): void {
    window.open(url, 'shareWindow', 'width=600,height=400,scrollbars=yes,resizable=yes');
  }
}

// Social sharing component
export const SocialShare = component$(() => {
  const shareService = new SocialSharingService();
  const showCopySuccess = useSignal(false);

  const handleCopyLink = $(async () => {
    const success = await shareService.copyToClipboard();
    if (success) {
      showCopySuccess.value = true;
      setTimeout(() => {
        showCopySuccess.value = false;
      }, 2000);
    }
  });

  const handleNativeShare = $(async () => {
    const shared = await shareService.nativeShare();
    if (!shared) {
      // Fallback to copy to clipboard
      await handleCopyLink();
    }
  });

  return (
    <div class="social-share">
      <h3 class="text-lg font-semibold text-wedding-brown mb-4">Share Our Wedding</h3>
      <div class="flex flex-wrap gap-3">
        <button
          onClick$={() => shareService.shareOnFacebook()}
          class="social-button bg-blue-600 hover:bg-blue-700"
        >
          📘 Facebook
        </button>
        <button
          onClick$={() => shareService.shareOnTwitter()}
          class="social-button bg-sky-500 hover:bg-sky-600"
        >
          🐦 Twitter
        </button>
        <button
          onClick$={() => shareService.shareOnWhatsApp()}
          class="social-button bg-green-600 hover:bg-green-700"
        >
          💬 WhatsApp
        </button>
        <button
          onClick$={handleNativeShare}
          class="social-button bg-wedding-accent hover:bg-wedding-brown"
        >
          {showCopySuccess.value ? '✅ Copied!' : '🔗 Share'}
        </button>
      </div>
    </div>
  );
});
```

---

## Email Services

### EmailJS Integration

```typescript
// src/integrations/email.ts
import emailjs from "@emailjs/browser";

export class WeddingEmailService {
  private serviceId: string;
  private templateId: string;
  private publicKey: string;

  constructor(serviceId: string, templateId: string, publicKey: string) {
    this.serviceId = serviceId;
    this.templateId = templateId;
    this.publicKey = publicKey;

    emailjs.init(publicKey);
  }

  /**
   * Send RSVP confirmation email
   */
  async sendRSVPConfirmation(rsvpData: RSVPFormData): Promise<boolean> {
    try {
      const templateParams = {
        to_name: rsvpData.name,
        to_email: rsvpData.email,
        from_name: "Alfina & Mugni",
        wedding_date: "November 29, 2025",
        attending_status: rsvpData.attending ? "attending" : "not attending",
        guest_count: rsvpData.guestCount,
        message: rsvpData.message || "No special message",
        confirmation_number: `RSV${Date.now()}`,
        venue_address: "Balai Kartini, Jakarta Selatan",
      };

      await emailjs.send(this.serviceId, this.templateId, templateParams);
      return true;
    } catch (error) {
      console.error("Failed to send email:", error);
      return false;
    }
  }

  /**
   * Send wedding reminder email
   */
  async sendWeddingReminder(
    guestList: { name: string; email: string }[],
  ): Promise<number> {
    let successCount = 0;

    for (const guest of guestList) {
      try {
        const templateParams = {
          to_name: guest.name,
          to_email: guest.email,
          from_name: "Alfina & Mugni",
          wedding_date: "November 29, 2025",
          days_until: this.getDaysUntilWedding(),
          venue_name: "Balai Kartini",
          venue_address: "Jl. Gatot Subroto Kav. 37, Jakarta Selatan",
          ceremony_time: "2:00 PM",
          reception_time: "6:00 PM",
        };

        await emailjs.send(
          this.serviceId,
          "wedding_reminder_template",
          templateParams,
        );
        successCount++;
      } catch (error) {
        console.error(`Failed to send reminder to ${guest.email}:`, error);
      }
    }

    return successCount;
  }

  private getDaysUntilWedding(): number {
    const weddingDate = new Date("2025-11-29");
    const today = new Date();
    const timeDiff = weddingDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }
}

// Email template configuration
/*
RSVP Confirmation Template:
Subject: RSVP Confirmation - Alfina & Mugni Wedding

Dear {{to_name}},

Thank you for your RSVP! We're {{#if attending}}excited{{else}}sorry{{/if}} to confirm that you are {{attending_status}} our wedding celebration.

Wedding Details:
📅 Date: {{wedding_date}}
🕐 Time: 2:00 PM (Ceremony), 6:00 PM (Reception)
📍 Venue: {{venue_address}}
👥 Guest Count: {{guest_count}}

{{#if message}}
Your Message: "{{message}}"
{{/if}}

Confirmation Number: {{confirmation_number}}

We can't wait to celebrate with you!

With love,
Alfina & Mugni
*/
```

---

## Analytics & Tracking

### Google Analytics 4 Integration

```typescript
// src/integrations/analytics.ts
export class WeddingAnalytics {
  private measurementId: string;

  constructor(measurementId: string) {
    this.measurementId = measurementId;
    this.initializeGA4();
  }

  private initializeGA4(): void {
    // Load GA4 script
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
    document.head.appendChild(script);

    // Initialize gtag
    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(...args: any[]) {
      (window as any).dataLayer.push(args);
    }

    gtag("js", new Date());
    gtag("config", this.measurementId, {
      page_title: "Alfina & Mugni Wedding",
      page_location: window.location.href,
    });

    (window as any).gtag = gtag;
  }

  /**
   * Track RSVP submission
   */
  trackRSVPSubmission(attending: boolean, guestCount: number): void {
    if (typeof (window as any).gtag === "function") {
      (window as any).gtag("event", "rsvp_submission", {
        event_category: "Wedding",
        event_label: attending ? "Attending" : "Not Attending",
        value: guestCount,
        custom_parameters: {
          wedding_date: "2025-11-29",
          couple_names: "Alfina & Mugni",
        },
      });
    }
  }

  /**
   * Track section views
   */
  trackSectionView(sectionName: string): void {
    if (typeof (window as any).gtag === "function") {
      (window as any).gtag("event", "page_view", {
        page_title: `${sectionName} - Alfina & Mugni Wedding`,
        page_location: `${window.location.href}#${sectionName}`,
      });
    }
  }

  /**
   * Track button clicks
   */
  trackButtonClick(buttonName: string, location: string): void {
    if (typeof (window as any).gtag === "function") {
      (window as any).gtag("event", "click", {
        event_category: "Wedding Interaction",
        event_label: buttonName,
        event_action: "click",
        custom_parameters: {
          button_location: location,
        },
      });
    }
  }

  /**
   * Track photo gallery interactions
   */
  trackGalleryInteraction(
    action: "view" | "click" | "share",
    photoId: string,
  ): void {
    if (typeof (window as any).gtag === "function") {
      (window as any).gtag("event", "gallery_interaction", {
        event_category: "Wedding Gallery",
        event_action: action,
        event_label: photoId,
      });
    }
  }
}

// Usage in components
export const useWeddingAnalytics = () => {
  const analytics = new WeddingAnalytics(
    import.meta.env.VITE_GA_MEASUREMENT_ID,
  );

  // Track section views on scroll
  useVisibleTask$(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            if (sectionId) {
              analytics.trackSectionView(sectionId);
            }
          }
        });
      },
      { threshold: 0.5 },
    );

    document.querySelectorAll("section[id]").forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  });

  return analytics;
};
```

---

## Payment Processing

### Stripe Integration (for Gift Registry)

```typescript
// src/integrations/payments.ts
interface GiftItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
}

export class WeddingPaymentsService {
  private stripePublicKey: string;

  constructor(stripePublicKey: string) {
    this.stripePublicKey = stripePublicKey;
  }

  /**
   * Create payment intent for wedding gift
   */
  async createGiftPayment(gift: GiftItem, giftMessage: string): Promise<{
    clientSecret?: string;
    error?: string;
  }> {
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: gift.price * 100, // Convert to cents
          currency: 'idr',
          metadata: {
            gift_id: gift.id,
            gift_name: gift.name,
            gift_message: giftMessage,
            wedding_couple: 'Alfina & Mugni',
            wedding_date: '2025-11-29'
          }
        })
      });

      const data = await response.json();
      return { clientSecret: data.client_secret };
    } catch (error) {
      return { error: 'Failed to create payment' };
    }
  }

  /**
   * Load Stripe and create elements
   */
  async initializeStripe(): Promise<any> {
    if (typeof window === 'undefined') return null;

    // Load Stripe.js
    if (!(window as any).Stripe) {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      document.head.appendChild(script);

      await new Promise((resolve) => {
        script.onload = resolve;
      });
    }

    return (window as any).Stripe(this.stripePublicKey);
  }
}

// Gift registry component
export const GiftRegistry = component$(() => {
  const gifts: GiftItem[] = [
    {
      id: 'kitchen_set',
      name: 'Kitchen Appliance Set',
      description: 'Complete kitchen starter set for our new home',
      price: 2500000, // IDR
      image: '/images/gifts/kitchen-set.jpg'
    },
    {
      id: 'honeymoon_fund',
      name: 'Honeymoon Fund',
      description: 'Help us create magical memories on our honeymoon',
      price: 5000000, // IDR
      image: '/images/gifts/honeymoon.jpg'
    }
  ];

  const selectedGift = useSignal<GiftItem | null>(null);
  const giftMessage = useSignal('');

  const handleGiftSelect = $((gift: GiftItem) => {
    selectedGift.value = gift;
  });

  const handleProceedToPayment = $(async () => {
    if (!selectedGift.value) return;

    const paymentsService = new WeddingPaymentsService(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
    const result = await paymentsService.createGiftPayment(selectedGift.value, giftMessage.value);

    if (result.error) {
      alert('Payment failed. Please try again.');
      return;
    }

    // Redirect to Stripe checkout or handle payment
    // Implementation depends on your payment flow preference
  });

  return (
    <div class="gift-registry">
      <h2 class="text-3xl font-serif text-wedding-brown mb-8 text-center">
        Wedding Gift Registry
      </h2>

      <div class="grid md:grid-cols-2 gap-6">
        {gifts.map((gift) => (
          <div
            key={gift.id}
            class={`gift-item wedding-card cursor-pointer transition-all ${
              selectedGift.value?.id === gift.id ? 'ring-2 ring-wedding-accent' : ''
            }`}
            onClick$={() => handleGiftSelect(gift)}
          >
            {gift.image && (
              <img
                src={gift.image}
                alt={gift.name}
                class="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            <h3 class="text-xl font-semibold text-wedding-brown mb-2">{gift.name}</h3>
            <p class="text-wedding-text-muted mb-4">{gift.description}</p>
            <p class="text-2xl font-bold text-wedding-accent">
              Rp {gift.price.toLocaleString('id-ID')}
            </p>
          </div>
        ))}
      </div>

      {selectedGift.value && (
        <div class="mt-8 wedding-card">
          <h3 class="text-xl font-semibold mb-4">Gift Message (Optional)</h3>
          <textarea
            value={giftMessage.value}
            onInput$={(e) => giftMessage.value = (e.target as HTMLTextAreaElement).value}
            placeholder="Leave a special message for the couple..."
            class="w-full p-3 border border-gray-300 rounded-lg mb-4"
            rows={3}
          />
          <button
            onClick$={handleProceedToPayment}
            class="wedding-button w-full"
          >
            Proceed to Payment
          </button>
        </div>
      )}
    </div>
  );
});
```

---

## Database Services

### Firebase Integration

```typescript
// src/integrations/firebase.ts
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export class WeddingFirebaseService {
  private db: any;

  constructor() {
    const app = initializeApp(firebaseConfig);
    this.db = getFirestore(app);
  }

  /**
   * Save RSVP to Firestore
   */
  async saveRSVP(
    rsvpData: RSVPFormData,
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const docRef = await addDoc(collection(this.db, "rsvps"), {
        ...rsvpData,
        submittedAt: new Date(),
        weddingDate: "2025-11-29",
        coupleNames: "Alfina & Mugni",
      });

      return { success: true, id: docRef.id };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to save RSVP",
      };
    }
  }

  /**
   * Get all RSVPs for admin dashboard
   */
  async getAllRSVPs(): Promise<
    Array<RSVPFormData & { id: string; submittedAt: Date }>
  > {
    try {
      const q = query(
        collection(this.db, "rsvps"),
        orderBy("submittedAt", "desc"),
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt.toDate(),
      })) as Array<RSVPFormData & { id: string; submittedAt: Date }>;
    } catch (error) {
      console.error("Failed to fetch RSVPs:", error);
      return [];
    }
  }

  /**
   * Save wedding guest message
   */
  async saveGuestMessage(messageData: {
    name: string;
    message: string;
    isPublic: boolean;
  }): Promise<boolean> {
    try {
      await addDoc(collection(this.db, "guestMessages"), {
        ...messageData,
        submittedAt: new Date(),
        approved: false, // Requires admin approval
      });

      return true;
    } catch (error) {
      console.error("Failed to save message:", error);
      return false;
    }
  }

  /**
   * Get approved guest messages for display
   */
  async getApprovedMessages(): Promise<
    Array<{
      id: string;
      name: string;
      message: string;
      submittedAt: Date;
    }>
  > {
    try {
      const q = query(
        collection(this.db, "guestMessages"),
        orderBy("submittedAt", "desc"),
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs
        .filter((doc) => doc.data().approved && doc.data().isPublic)
        .map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          message: doc.data().message,
          submittedAt: doc.data().submittedAt.toDate(),
        }));
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      return [];
    }
  }
}
```

---

## Environment Configuration

### Environment Variables Template

```bash
# .env.example

# Google Services
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_GOOGLE_SCRIPT_ID=your_google_apps_script_id
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_API_KEY=your_api_key
VITE_CLOUDINARY_API_SECRET=your_api_secret

# Airtable
VITE_AIRTABLE_BASE_ID=your_base_id
VITE_AIRTABLE_TABLE_NAME=RSVPs
VITE_AIRTABLE_API_KEY=your_api_key

# Social Media
VITE_INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token

# Email Services
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key

# Telegram
VITE_TELEGRAM_BOT_TOKEN=your_bot_token
VITE_TELEGRAM_CHAT_ID=your_chat_id

# Stripe (for payments)
VITE_STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Firebase
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Wedding Specific
VITE_WEDDING_HASHTAG=AlfinaMugniWedding
VITE_WEDDING_DATE=2025-11-29
VITE_WEDDING_TIMEZONE=Asia/Jakarta
```

---

## Related Documentation

- [`../api/components-api.md`](../api/components-api.md) - Component interfaces
- [`../api/utilities-api.md`](../api/utilities-api.md) - Utility functions
- [`../deployment/deployment-guide.md`](../deployment/deployment-guide.md) - Deployment setup
- [`../development/setup-guide.md`](../development/setup-guide.md) - Development setup

---

_Documentation for Alfina & Mugni's Wedding Website - Generated on November 2025_
