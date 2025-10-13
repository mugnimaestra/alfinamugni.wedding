/**
 * Advanced Email Templates for Wedding Website
 * Customizable templates with analytics tracking
 */

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  category: 'rsvp' | 'wish' | 'reminder' | 'confirmation' | 'announcement';
  analyticsEnabled: boolean;
  customStyles?: string;
}

export interface EmailVariable {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  required: boolean;
  defaultValue?: unknown;
}

export interface EmailAnalytics {
  templateId: string;
  recipientEmail: string;
  sentAt: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  bouncedAt?: Date;
  unsubscribedAt?: Date;
  trackingId: string;
}

// Base email template with Indonesian wedding context
const baseStyles = `
  <style>
    body {
      font-family: 'Georgia', serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #faf7f5;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #4d3326;
      padding-bottom: 20px;
    }
    .couple-names {
      font-size: 28px;
      color: #4d3326;
      font-weight: bold;
      margin: 10px 0;
    }
    .wedding-date {
      font-size: 18px;
      color: #666;
      font-style: italic;
    }
    .content {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #999;
      margin-top: 20px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #4d3326;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      margin: 20px 0;
    }
    .button:hover {
      background-color: #3a2518;
    }
    .signature {
      margin-top: 30px;
      font-style: italic;
    }
  </style>
`;

// RSVP Confirmation Template
export const rsvpConfirmationTemplate: EmailTemplate = {
  id: 'rsvp-confirmation',
  name: 'RSVP Confirmation',
  subject: 'Konfirmasi RSVP - Pernikahan Alfina & Mugni',
  category: 'confirmation',
  analyticsEnabled: true,
  variables: ['guestName', 'attendance', 'plusOnes', 'mealPreference', 'weddingDate', 'venue'],
  htmlContent: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Konfirmasi RSVP</title>
      ${baseStyles}
    </head>
    <body>
      <div class="header">
        <h1>Alfina & Mugni</h1>
        <div class="wedding-date">29 November 2025</div>
      </div>
      
      <div class="content">
        <h2>Konfirmasi RSVP</h2>
        <p>Terima kasih {{guestName}} telah mengkonfirmasi kehadiran Anda!</p>
        
        <p><strong>Status Kehadiran:</strong> {{attendance}}</p>
        {{#plusOnes}}
        <p><strong>Jumlah Tamu Tambahan:</strong> {{plusOnes}}</p>
        {{/plusOnes}}
        {{#mealPreference}}
        <p><strong>Preferensi Makanan:</strong> {{mealPreference}}</p>
        {{/mealPreference}}
        
        <p>Kami sangat menantikan kehadiran Anda di:</p>
        <p><strong>Tanggal:</strong> {{weddingDate}}</p>
        <p><strong>Lokasi:</strong> {{venue}}</p>
        
        <a href="{{websiteUrl}}" class="button">Lihat Undangan</a>
        
        <div class="signature">
          <p>Dengan penuh cinta,</p>
          <p>Alfina & Mugni</p>
        </div>
      </div>
      
      <div class="footer">
        <p>Email ini dikirimkan otomatis. Jangan balas email ini.</p>
        <img src="{{trackingPixel}}" alt="" width="1" height="1" style="display:none;">
      </div>
    </body>
    </html>
  `,
  textContent: `
    Konfirmasi RSVP - Pernikahan Alfina & Mugni
    
    Terima kasih {{guestName}} telah mengkonfirmasi kehadiran Anda!
    
    Status Kehadiran: {{attendance}}
    {{#plusOnes}}
    Jumlah Tamu Tambahan: {{plusOnes}}
    {{/plusOnes}}
    {{#mealPreference}}
    Preferensi Makanan: {{mealPreference}}
    {{/mealPreference}}
    
    Kami sangat menantikan kehadiran Anda di:
    Tanggal: {{weddingDate}}
    Lokasi: {{venue}}
    
    Website: {{websiteUrl}}
    
    Dengan penuh cinta,
    Alfina & Mugni
  `
};

// Wish Received Template
export const wishReceivedTemplate: EmailTemplate = {
  id: 'wish-received',
  name: 'Wish Received',
  subject: 'Ucapan Anda Diterima - Alfina & Mugni Wedding',
  category: 'wish',
  analyticsEnabled: true,
  variables: ['guestName', 'wishMessage', 'weddingDate'],
  htmlContent: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Ucapan Diterima</title>
      ${baseStyles}
    </head>
    <body>
      <div class="header">
        <h1>Alfina & Mugni</h1>
        <div class="wedding-date">29 November 2025</div>
      </div>
      
      <div class="content">
        <h2>Ucapan Anda Diterima</h2>
        <p>Terima kasih {{guestName}} atas ucapan dan doa Anda!</p>
        
        <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #4d3326; margin: 20px 0;">
          <p><em>"{{wishMessage}}"</em></p>
        </div>
        
        <p>Ucapan Anda berarti sangat banyak bagi kami. Kami akan membaca setiap doa dan harapan baik yang Anda sampaikan.</p>
        
        <a href="{{websiteUrl}}/gallery" class="button">Lihat Galeri Foto</a>
        
        <div class="signature">
          <p>Dengan rasa terima kasih,</p>
          <p>Alfina & Mugni</p>
        </div>
      </div>
      
      <div class="footer">
        <p>Email ini dikirimkan otomatis. Jangan balas email ini.</p>
        <img src="{{trackingPixel}}" alt="" width="1" height="1" style="display:none;">
      </div>
    </body>
    </html>
  `,
  textContent: `
    Ucapan Anda Diterima - Alfina & Mugni Wedding
    
    Terima kasih {{guestName}} atas ucapan dan doa Anda!
    
    "{{wishMessage}}"
    
    Ucapan Anda berarti sangat banyak bagi kami. Kami akan membaca setiap doa dan harapan baik yang Anda sampaikan.
    
    Website: {{websiteUrl}}/gallery
    
    Dengan rasa terima kasih,
    Alfina & Mugni
  `
};

// Wedding Reminder Template
export const weddingReminderTemplate: EmailTemplate = {
  id: 'wedding-reminder',
  name: 'Wedding Reminder',
  subject: 'Pengingat: 3 Hari Menuju Pernikahan Alfina & Mugni',
  category: 'reminder',
  analyticsEnabled: true,
  variables: ['guestName', 'weddingDate', 'venue', 'ceremonyTime', 'receptionTime'],
  htmlContent: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pengingat Pernikahan</title>
      ${baseStyles}
    </head>
    <body>
      <div class="header">
        <h1>Alfina & Mugni</h1>
        <div class="wedding-date">29 November 2025</div>
      </div>
      
      <div class="content">
        <h2>🎉 H-3 Menuju Hari Bahagia!</h2>
        <p>Halo {{guestName}},</p>
        
        <p>Hanya 3 hari lagi menuju hari pernikahan kami! Kami ingin mengingatkan Anda tentang detail acara:</p>
        
        <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>📅 Akad Nikah</h3>
          <p><strong>Tanggal:</strong> {{weddingDate}}</p>
          <p><strong>Waktu:</strong> {{ceremonyTime}}</p>
          <p><strong>Lokasi:</strong> {{venue}}</p>
          
          <h3>🎊 Resepsi</h3>
          <p><strong>Waktu:</strong> {{receptionTime}}</p>
          <p><strong>Lokasi:</strong> {{venue}}</p>
        </div>
        
        <p><strong>Hal-hal yang perlu dipersiapkan:</strong></p>
        <ul>
          <li>Konfirmasi ulang kehadiran Anda</li>
          <li>Siapkan pakaian terbaik Anda</li>
          <li>Atur waktu perjalanan untuk menghindari keterlambatan</li>
          <li>Bawa kamera untuk mengabadikan momen bahagia</li>
        </ul>
        
        <a href="{{websiteUrl}}" class="button">Lihat Detail Acara</a>
        
        <div class="signature">
          <p>Tak sabar bertemu Anda,</p>
          <p>Alfina & Mugni</p>
        </div>
      </div>
      
      <div class="footer">
        <p>Email ini dikirimkan otomatis. Jangan balas email ini.</p>
        <img src="{{trackingPixel}}" alt="" width="1" height="1" style="display:none;">
      </div>
    </body>
    </html>
  `,
  textContent: `
    Pengingat: 3 Hari Menuju Pernikahan Alfina & Mugni
    
    Halo {{guestName}},
    
    Hanya 3 hari lagi menuju hari pernikahan kami! Kami ingin mengingatkan Anda tentang detail acara:
    
    📅 Akad Nikah
    Tanggal: {{weddingDate}}
    Waktu: {{ceremonyTime}}
    Lokasi: {{venue}}
    
    🎊 Resepsi
    Waktu: {{receptionTime}}
    Lokasi: {{venue}}
    
    Hal-hal yang perlu dipersiapkan:
    - Konfirmasi ulang kehadiran Anda
    - Siapkan pakaian terbaik Anda
    - Atur waktu perjalanan untuk menghindari keterlambatan
    - Bawa kamera untuk mengabadikan momen bahagia
    
    Website: {{websiteUrl}}
    
    Tak sabar bertemu Anda,
    Alfina & Mugni
  `
};

// Thank You Template
export const thankYouTemplate: EmailTemplate = {
  id: 'thank-you',
  name: 'Thank You',
  subject: 'Terima Kasih Atas Kehadiriran Anda - Alfina & Mugni',
  category: 'announcement',
  analyticsEnabled: true,
  variables: ['guestName', 'weddingDate'],
  htmlContent: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Terima Kasih</title>
      ${baseStyles}
    </head>
    <body>
      <div class="header">
        <h1>Alfina & Mugni</h1>
        <div class="wedding-date">29 November 2025</div>
      </div>
      
      <div class="content">
        <h2>🙏 Terima Kasih</h2>
        <p>Halo {{guestName}},</p>
        
        <p>Terima kasih banyak atas kehadiran Anda di pernikahan kami pada {{weddingDate}}. Kehadiran Anda telah membuat hari bahagia kami menjadi lebih berarti.</p>
        
        <p>Kami berharap Anda menikmati acara tersebut dan merasakan kehangatan serta kebahagiaan yang kami rasakan.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <p style="font-size: 24px; color: #4d3326;">"Love is not about how many days, months, or years you have been together. Love is about how much you love each other every single day."</p>
        </div>
        
        <p>Foto-foto dari acara akan segera kami upload di website. Anda dapat melihatnya di:</p>
        
        <a href="{{websiteUrl}}/gallery" class="button">Lihat Foto Pernikahan</a>
        
        <div class="signature">
          <p>Dengan cinta dan terima kasih,</p>
          <p>Alfina & Mugni</p>
        </div>
      </div>
      
      <div class="footer">
        <p>Email ini dikirimkan otomatis. Jangan balas email ini.</p>
        <img src="{{trackingPixel}}" alt="" width="1" height="1" style="display:none;">
      </div>
    </body>
    </html>
  `,
  textContent: `
    Terima Kasih Atas Kehadiriran Anda - Alfina & Mugni
    
    Halo {{guestName}},
    
    Terima kasih banyak atas kehadiran Anda di pernikahan kami pada {{weddingDate}}. Kehadiran Anda telah membuat hari bahagia kami menjadi lebih berarti.
    
    Kami berharap Anda menikmati acara tersebut dan merasakan kehangatan serta kebahagiaan yang kami rasakan.
    
    "Love is not about how many days, months, or years you have been together. Love is about how much you love each other every single day."
    
    Foto-foto dari acara akan segera kami upload di website. Anda dapat melihatnya di:
    {{websiteUrl}}/gallery
    
    Dengan cinta dan terima kasih,
    Alfina & Mugni
  `
};

// Email Template Manager
export class EmailTemplateManager {
  private templates: Map<string, EmailTemplate> = new Map();
  private analytics: EmailAnalytics[] = [];

  constructor() {
    // Initialize with default templates
    this.templates.set(rsvpConfirmationTemplate.id, rsvpConfirmationTemplate);
    this.templates.set(wishReceivedTemplate.id, wishReceivedTemplate);
    this.templates.set(weddingReminderTemplate.id, weddingReminderTemplate);
    this.templates.set(thankYouTemplate.id, thankYouTemplate);
  }

  // Get template by ID
  getTemplate(id: string): EmailTemplate | undefined {
    return this.templates.get(id);
  }

  // Get all templates
  getAllTemplates(): EmailTemplate[] {
    return Array.from(this.templates.values());
  }

  // Get templates by category
  getTemplatesByCategory(category: EmailTemplate['category']): EmailTemplate[] {
    return Array.from(this.templates.values()).filter(template => template.category === category);
  }

  // Add custom template
  addTemplate(template: EmailTemplate): void {
    this.templates.set(template.id, template);
  }

  // Update template
  updateTemplate(id: string, updates: Partial<EmailTemplate>): boolean {
    const existing = this.templates.get(id);
    if (!existing) return false;

    const updated = { ...existing, ...updates };
    this.templates.set(id, updated);
    return true;
  }

  // Delete template
  deleteTemplate(id: string): boolean {
    return this.templates.delete(id);
  }

  // Process template with variables
  processTemplate(templateId: string, variables: Record<string, unknown>): {
    htmlContent: string;
    textContent: string;
    subject: string;
  } {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const processedHtml = this.replaceVariables(template.htmlContent, variables);
    const processedText = this.replaceVariables(template.textContent, variables);
    const processedSubject = this.replaceVariables(template.subject, variables);

    return {
      htmlContent: processedHtml,
      textContent: processedText,
      subject: processedSubject
    };
  }

  // Replace variables in template content
  private replaceVariables(content: string, variables: Record<string, unknown>): string {
    let processed = content;

    // Replace simple variables {{variableName}}
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, String(value || ''));
    });

    // Handle conditional blocks {{#variable}}...{{/variable}}
    processed = processed.replace(/{{#(\w+)}}([\s\S]*?){{\/\1}}/g, (match, varName, blockContent) => {
      const value = variables[varName];
      return value ? blockContent : '';
    });

    // Handle inverse blocks {{^variable}}...{{/variable}}
    processed = processed.replace(/{{\^(\w+)}}([\s\S]*?){{\/\1}}/g, (match, varName, blockContent) => {
      const value = variables[varName];
      return !value ? blockContent : '';
    });

    return processed;
  }

  // Generate tracking pixel URL
  generateTrackingPixel(trackingId: string): string {
    return `${process.env.PUBLIC_URL || ''}/api/analytics/track?event=email_open&tracking_id=${trackingId}`;
  }

  // Generate click tracking URL
  generateClickTrackingUrl(originalUrl: string, trackingId: string): string {
    return `${process.env.PUBLIC_URL || ''}/api/analytics/track?event=email_click&tracking_id=${trackingId}&url=${encodeURIComponent(originalUrl)}`;
  }

  // Record email analytics
  recordAnalytics(analytics: Omit<EmailAnalytics, 'sentAt'>): void {
    const record: EmailAnalytics = {
      ...analytics,
      sentAt: new Date()
    };
    this.analytics.push(record);
  }

  // Get analytics for template
  getTemplateAnalytics(templateId: string): EmailAnalytics[] {
    return this.analytics.filter(a => a.templateId === templateId);
  }

  // Get analytics summary
  getAnalyticsSummary(templateId: string): {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
    openRate: number;
    clickRate: number;
  } {
    const analytics = this.getTemplateAnalytics(templateId);
    
    const sent = analytics.length;
    const delivered = analytics.filter(a => a.deliveredAt).length;
    const opened = analytics.filter(a => a.openedAt).length;
    const clicked = analytics.filter(a => a.clickedAt).length;
    const bounced = analytics.filter(a => a.bouncedAt).length;
    const unsubscribed = analytics.filter(a => a.unsubscribedAt).length;

    return {
      sent,
      delivered,
      opened,
      clicked,
      bounced,
      unsubscribed,
      openRate: delivered > 0 ? (opened / delivered) * 100 : 0,
      clickRate: opened > 0 ? (clicked / opened) * 100 : 0
    };
  }
}

// Global instance
export const emailTemplateManager = new EmailTemplateManager();

// Utility functions
export function createEmailVariables(data: Record<string, unknown>): Record<string, unknown> {
  return {
    websiteUrl: process.env.PUBLIC_URL || 'https://alfina-mugni.wedding',
    weddingDate: '29 November 2025',
    venue: 'Jakarta, Indonesia',
    ceremonyTime: '09:00 WIB',
    receptionTime: '18:00 WIB',
    ...data
  };
}

export function generateTrackingId(): string {
  return `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}