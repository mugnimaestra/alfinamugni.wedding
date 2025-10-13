import { Resend } from 'resend';
import type { RsvpData, GuestWish } from './database';

// Email service configuration
export interface EmailConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
  replyToEmail?: string;
}

// Email templates and types
export type EmailType = 'rsvp_confirmation' | 'admin_notification' | 'reminder' | 'thank_you' | 'weekly_summary' | 'daily_summary';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// Email queue interface
export interface EmailQueueItem {
  id: string;
  type: EmailType;
  to: string;
  template: EmailTemplate;
  scheduledFor?: Date;
  attempts: number;
  maxAttempts: number;
  lastAttempt?: Date;
  createdAt: Date;
}

// Email delivery tracking
export interface EmailDeliveryStatus {
  messageId: string;
  status: 'sent' | 'delivered' | 'bounced' | 'complained' | 'rejected';
  timestamp: Date;
  error?: string;
}

// Admin summary data
export interface AdminSummaryData {
  totalRsvps: number;
  newRsvps: number;
  attendingCount: number;
  unableCount: number;
  pendingWishes: number;
  approvedWishes: number;
  rejectedWishes: number;
  period: 'daily' | 'weekly';
  startDate: Date;
  endDate: Date;
}

// Email service class
export class WeddingEmailService {
  private resend: Resend;
  private config: EmailConfig;
  private emailQueue: EmailQueueItem[] = [];
  private deliveryTracking: Map<string, EmailDeliveryStatus> = new Map();
  private monthlyEmailCount = 0;
  private readonly FREE_TIER_LIMIT = 3000; // Resend free tier limit

  constructor(config: EmailConfig) {
    this.config = config;
    this.resend = new Resend(config.apiKey);
  }

  // Check if we're within free tier limits
  private isWithinFreeTierLimit(emailCount: number = 1): boolean {
    return this.monthlyEmailCount + emailCount <= this.FREE_TIER_LIMIT;
  }

  // Add email to queue for batch processing
  private addToQueue(type: EmailType, to: string, template: EmailTemplate, scheduledFor?: Date): string {
    const queueItem: EmailQueueItem = {
      id: crypto.randomUUID(),
      type,
      to,
      template,
      scheduledFor,
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date()
    };

    this.emailQueue.push(queueItem);
    return queueItem.id;
  }

  // Process email queue with rate limiting
  async processEmailQueue(): Promise<{ processed: number; failed: number; errors: string[] }> {
    const now = new Date();
    const readyEmails = this.emailQueue.filter(item =>
      !item.scheduledFor || item.scheduledFor <= now
    );

    const batchSize = Math.min(readyEmails.length, 10); // Process max 10 emails at once
    const batch = readyEmails.slice(0, batchSize);
    const errors: string[] = [];
    let processed = 0;
    let failed = 0;

    for (const email of batch) {
      if (!this.isWithinFreeTierLimit()) {
        errors.push(`Free tier limit reached. Skipping email to ${email.to}`);
        failed++;
        continue;
      }

      try {
        const result = await this.sendEmail(email.to, email.template);
        
        if (result.success) {
          this.deliveryTracking.set(result.messageId!, {
            messageId: result.messageId!,
            status: 'sent',
            timestamp: new Date()
          });
          
          // Remove from queue
          this.emailQueue = this.emailQueue.filter(item => item.id !== email.id);
          this.monthlyEmailCount++;
          processed++;
        } else {
          email.attempts++;
          email.lastAttempt = new Date();
          
          if (email.attempts >= email.maxAttempts) {
            errors.push(`Failed to send email to ${email.to} after ${email.maxAttempts} attempts: ${result.error}`);
            this.emailQueue = this.emailQueue.filter(item => item.id !== email.id);
            failed++;
          }
        }
      } catch (error) {
        errors.push(`Error processing email to ${email.to}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        failed++;
      }
    }

    return { processed, failed, errors };
  }

  // Send email with tracking
  private async sendEmail(to: string, template: EmailTemplate): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const result = await this.resend.emails.send({
        from: `${this.config.fromName} <${this.config.fromEmail}>`,
        to: [to],
        replyTo: this.config.replyToEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
        tags: [
          { name: 'wedding', value: 'alfina-mugni-2025' }
        ]
      });

      if (result.error) {
        console.error('Resend error:', result.error);
        return { success: false, error: result.error.message };
      }

      return { success: true, messageId: result.data?.id };

    } catch (error) {
      console.error('Email sending error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Get email delivery status
  getDeliveryStatus(messageId: string): EmailDeliveryStatus | undefined {
    return this.deliveryTracking.get(messageId);
  }

  // Get queue status
  getQueueStatus(): { pending: number; scheduled: number; monthlyCount: number; limitRemaining: number } {
    const now = new Date();
    const pending = this.emailQueue.filter(item => !item.scheduledFor || item.scheduledFor <= now).length;
    const scheduled = this.emailQueue.filter(item => item.scheduledFor && item.scheduledFor > now).length;
    
    return {
      pending,
      scheduled,
      monthlyCount: this.monthlyEmailCount,
      limitRemaining: this.FREE_TIER_LIMIT - this.monthlyEmailCount
    };
  }

  // Send RSVP confirmation email to guest (immediate)
  async sendRsvpConfirmation(rsvpData: RsvpData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const template = this.generateRsvpConfirmationTemplate(rsvpData);

      if (!this.isWithinFreeTierLimit()) {
        // Add to queue if over limit
        const queueId = this.addToQueue('rsvp_confirmation', rsvpData.email, template);
        return { success: false, error: `Added to queue due to rate limit. Queue ID: ${queueId}` };
      }

      const result = await this.sendEmail(rsvpData.email, template);
      
      if (result.success) {
        this.deliveryTracking.set(result.messageId!, {
          messageId: result.messageId!,
          status: 'sent',
          timestamp: new Date()
        });
        this.monthlyEmailCount++;
      }

      return result;

    } catch (error) {
      console.error('Email sending error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Send admin notification for new RSVP (immediate)
  async sendAdminNotification(rsvpData: RsvpData, adminEmail: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const template = this.generateAdminNotificationTemplate(rsvpData);

      if (!this.isWithinFreeTierLimit()) {
        // Add to queue if over limit
        const queueId = this.addToQueue('admin_notification', adminEmail, template);
        return { success: false, error: `Added to queue due to rate limit. Queue ID: ${queueId}` };
      }

      const result = await this.sendEmail(adminEmail, template);
      
      if (result.success) {
        this.deliveryTracking.set(result.messageId!, {
          messageId: result.messageId!,
          status: 'sent',
          timestamp: new Date()
        });
        this.monthlyEmailCount++;
      }

      return result;

    } catch (error) {
      console.error('Admin email error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Send RSVP reminder email (1 week before)
  async sendRsvpReminder(rsvpData: RsvpData, reminderType: 'one_week' | 'day_before'): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const template = this.generateRsvpReminderTemplate(rsvpData, reminderType);
      
      // Schedule reminders to be sent in batches
      const scheduledFor = reminderType === 'one_week'
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        : new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day from now

      const queueId = this.addToQueue('reminder', rsvpData.email, template, scheduledFor);
      
      return { success: true, messageId: queueId };

    } catch (error) {
      console.error('Reminder email error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Send admin summary email (daily/weekly)
  async sendAdminSummary(summaryData: AdminSummaryData, adminEmail: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const template = this.generateAdminSummaryTemplate(summaryData);
      
      // Add to queue for batch processing
      const queueId = this.addToQueue(
        summaryData.period === 'daily' ? 'daily_summary' : 'weekly_summary',
        adminEmail,
        template
      );
      
      return { success: true, messageId: queueId };

    } catch (error) {
      console.error('Admin summary email error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Generate RSVP confirmation email template
  private generateRsvpConfirmationTemplate(rsvpData: RsvpData): EmailTemplate {
    const isAttending = rsvpData.attending !== 'unable';
    const totalGuests = isAttending ? 1 + rsvpData.plus_one_count : 0;

    const subject = `RSVP Konfirmasi - Pernikahan Alfina & Mugni`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RSVP Konfirmasi</title>
  <style>
    body { font-family: 'Georgia', serif; line-height: 1.6; color: #4d3326; margin: 0; padding: 0; background-color: #faf7f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; }
    .header { background-color: #d9e5e0; padding: 40px 20px; text-align: center; }
    .header h1 { color: #4d3326; font-size: 28px; margin: 0; font-weight: normal; }
    .header p { color: #666; font-size: 16px; margin: 10px 0 0 0; }
    .content { padding: 40px 20px; }
    .rsvp-details { background-color: #f0e3d9; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .detail-row { margin: 10px 0; }
    .detail-label { font-weight: bold; color: #4d3326; }
    .wedding-details { border-top: 2px solid #d9e5e0; padding-top: 30px; margin-top: 30px; }
    .footer { background-color: #4d3326; color: white; padding: 20px; text-align: center; font-size: 14px; }
    .highlight { color: #b2804d; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Terima Kasih, ${rsvpData.guest_name}!</h1>
      <p>RSVP Anda telah kami terima</p>
    </div>

    <div class="content">
      <p>Dear ${rsvpData.guest_name},</p>

      <p>Terima kasih telah merespon undangan pernikahan kami. Berikut adalah detail RSVP Anda:</p>

      <div class="rsvp-details">
        <div class="detail-row">
          <span class="detail-label">Nama:</span> ${rsvpData.guest_name}
        </div>
        <div class="detail-row">
          <span class="detail-label">Email:</span> ${rsvpData.email}
        </div>
        <div class="detail-row">
          <span class="detail-label">Kehadiran:</span>
          <span class="highlight">
            ${rsvpData.attending === 'both' ? 'Kedua Acara (Akad & Resepsi)' :
              rsvpData.attending === 'akad' ? 'Akad Nikah Saja' :
              rsvpData.attending === 'reception' ? 'Resepsi Saja' : 'Tidak Dapat Hadir'}
          </span>
        </div>
        ${rsvpData.plus_one_count > 0 ? `
        <div class="detail-row">
          <span class="detail-label">Jumlah Tamu:</span> ${totalGuests} orang (termasuk pendamping)
        </div>
        ` : ''}
        ${rsvpData.plus_one_name ? `
        <div class="detail-row">
          <span class="detail-label">Nama Pendamping:</span> ${rsvpData.plus_one_name}
        </div>
        ` : ''}
        ${rsvpData.meal_preference ? `
        <div class="detail-row">
          <span class="detail-label">Pilihan Makanan:</span> ${this.getMealPreferenceName(rsvpData.meal_preference)}
        </div>
        ` : ''}
        ${rsvpData.special_requests ? `
        <div class="detail-row">
          <span class="detail-label">Permintaan Khusus:</span> ${rsvpData.special_requests}
        </div>
        ` : ''}
      </div>

      ${isAttending ? `
      <div class="wedding-details">
        <h3 style="color: #4d3326; border-bottom: 1px solid #d9e5e0; padding-bottom: 10px;">Detail Acara</h3>

        <div style="margin: 20px 0;">
          <h4 style="color: #b2804d; margin-bottom: 10px;">Akad Nikah</h4>
          <p><strong>Tanggal:</strong> Jumat, 29 November 2025<br>
          <strong>Waktu:</strong> 10:00 WIB<br>
          <strong>Tempat:</strong> [Venue Akad - akan diupdate]</p>
        </div>

        <div style="margin: 20px 0;">
          <h4 style="color: #b2804d; margin-bottom: 10px;">Resepsi</h4>
          <p><strong>Tanggal:</strong> Jumat, 29 November 2025<br>
          <strong>Waktu:</strong> 18:00 WIB<br>
          <strong>Tempat:</strong> [Venue Resepsi - akan diupdate]</p>
        </div>

        <div style="background-color: #e0d9e5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px;"><strong>Catatan:</strong> Mohon datang tepat waktu. Kode berpakaian: Formal (hindari warna putih/krem).</p>
        </div>
      </div>
      ` : `
      <p>Meskipun Anda tidak dapat hadir, kehadiran Anda dalam doa dan dukungan sangat berarti bagi kami. Terima kasih atas perhatian dan doanya.</p>
      `}

      <p>Jika ada perubahan atau pertanyaan, silakan hubungi kami melalui website atau WhatsApp.</p>

      <p style="margin-top: 30px;">Dengan cinta,<br>
      <span class="highlight">Alfina & Mugni</span></p>
    </div>

    <div class="footer">
      <p>Pernikahan Alfina & Mugni | 29 November 2025 | Jakarta, Indonesia</p>
      <p>Website: <a href="https://alfinamugni.wedding" style="color: #d9e5e0;">alfinamugni.wedding</a></p>
    </div>
  </div>
</body>
</html>`;

    const text = `
Terima Kasih, ${rsvpData.guest_name}!

RSVP Anda telah kami terima dengan detail sebagai berikut:

Nama: ${rsvpData.guest_name}
Email: ${rsvpData.email}
Kehadiran: ${rsvpData.attending === 'both' ? 'Kedua Acara (Akad & Resepsi)' :
             rsvpData.attending === 'akad' ? 'Akad Nikah Saja' :
             rsvpData.attending === 'reception' ? 'Resepsi Saja' : 'Tidak Dapat Hadir'}
${rsvpData.plus_one_count > 0 ? `Jumlah Tamu: ${totalGuests} orang (termasuk pendamping)\n` : ''}
${rsvpData.plus_one_name ? `Nama Pendamping: ${rsvpData.plus_one_name}\n` : ''}
${rsvpData.meal_preference ? `Pilihan Makanan: ${this.getMealPreferenceName(rsvpData.meal_preference)}\n` : ''}
${rsvpData.special_requests ? `Permintaan Khusus: ${rsvpData.special_requests}\n` : ''}

${isAttending ? `
DETAIL ACARA:

Akad Nikah
Tanggal: Jumat, 29 November 2025
Waktu: 10:00 WIB
Tempat: [Venue Akad - akan diupdate]

Resepsi
Tanggal: Jumat, 29 November 2025
Waktu: 18:00 WIB
Tempat: [Venue Resepsi - akan diupdate]

Catatan: Mohon datang tepat waktu. Kode berpakaian: Formal (hindari warna putih/krem).
` : `
Meskipun Anda tidak dapat hadir, kehadiran Anda dalam doa dan dukungan sangat berarti bagi kami. Terima kasih atas perhatian dan doanya.
`}

Jika ada perubahan atau pertanyaan, silakan hubungi kami melalui website atau WhatsApp.

Dengan cinta,
Alfina & Mugni

---
Pernikahan Alfina & Mugni | 29 November 2025 | Jakarta, Indonesia
Website: https://alfinamugni.wedding
`;

    return { subject, html, text };
  }

  // Send wish moderation notification to admin
  async sendWishModerationNotification(wishData: GuestWish, adminEmail: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const template = this.generateWishModerationTemplate(wishData);

      const result = await this.resend.emails.send({
        from: `${this.config.fromName} <${this.config.fromEmail}>`,
        to: [adminEmail],
        replyTo: this.config.replyToEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
        tags: [
          { name: 'type', value: 'wish_moderation' },
          { name: 'wedding', value: 'alfina-mugni-2025' }
        ]
      });

      if (result.error) {
        console.error('Resend error:', result.error);
        return { success: false, error: result.error.message };
      }

      return { success: true, messageId: result.data?.id };

    } catch (error) {
      console.error('Wish moderation email error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Generate wish moderation notification template
  private generateWishModerationTemplate(wishData: GuestWish): EmailTemplate {
    const subject = `[WEDDING ADMIN] Guest Wish Requires Moderation: ${wishData.guest_name}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Wish Moderation Required</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; border: 1px solid #ddd; }
    .header { background-color: #e0d9e5; color: #4d3326; padding: 20px; }
    .header h1 { margin: 0; font-size: 20px; }
    .content { padding: 20px; }
    .wish-details { background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 5px; padding: 15px; margin: 15px 0; }
    .message-box { background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 15px 0; }
    .actions { background-color: #e8f4fd; border: 1px solid #bee5eb; border-radius: 5px; padding: 15px; margin: 15px 0; }
    .detail-row { margin: 8px 0; padding: 5px 0; border-bottom: 1px solid #eee; }
    .detail-row:last-child { border-bottom: none; }
    .label { font-weight: bold; color: #495057; width: 150px; display: inline-block; }
    .btn { background-color: #4d3326; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-right: 10px; display: inline-block; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💌 Guest Wish Requires Review</h1>
    </div>

    <div class="content">
      <p>A new guest wish has been submitted and requires moderation before it can be displayed on the website.</p>

      <div class="wish-details">
        <div class="detail-row">
          <span class="label">Guest Name:</span>
          <strong>${wishData.guest_name}</strong>
        </div>
        <div class="detail-row">
          <span class="label">Email:</span>
          ${wishData.email || 'Not provided'}
        </div>
        <div class="detail-row">
          <span class="label">Submitted:</span>
          ${new Date(wishData.created_at || '').toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}
        </div>
        <div class="detail-row">
          <span class="label">IP Address:</span>
          ${wishData.ip_address || 'Unknown'}
        </div>
      </div>

      <div class="message-box">
        <h4 style="margin-top: 0; color: #856404;">Guest Message:</h4>
        <p style="font-style: italic; margin-bottom: 0;">"${wishData.message}"</p>
      </div>

      <div class="actions">
        <h4 style="margin-top: 0; color: #0c5460;">Quick Actions:</h4>
        <p>Review this wish in the admin dashboard:</p>
        <a href="https://alfinamugni.wedding/admin/wishes" class="btn">View Admin Dashboard</a>
      </div>

      <p style="font-size: 12px; color: #6c757d; margin-top: 20px;">
        This wish was flagged for manual review. Please approve or reject it through the admin dashboard.
      </p>
    </div>
  </div>
</body>
</html>`;

    const text = `
Guest Wish Requires Review

A new guest wish has been submitted and requires moderation before it can be displayed on the website.

Guest Name: ${wishData.guest_name}
Email: ${wishData.email || 'Not provided'}
Submitted: ${new Date(wishData.created_at || '').toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}
IP Address: ${wishData.ip_address || 'Unknown'}

Guest Message:
"${wishData.message}"

Review this wish in the admin dashboard: https://alfinamugni.wedding/admin/wishes

This wish was flagged for manual review. Please approve or reject it through the admin dashboard.
`;

    return { subject, html, text };
  }

  // Generate admin notification template
  private generateAdminNotificationTemplate(rsvpData: RsvpData): EmailTemplate {
    const isAttending = rsvpData.attending !== 'unable';
    const totalGuests = isAttending ? 1 + rsvpData.plus_one_count : 0;

    const subject = `[WEDDING ADMIN] New RSVP: ${rsvpData.guest_name} - ${rsvpData.attending.toUpperCase()}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New RSVP Notification</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; border: 1px solid #ddd; }
    .header { background-color: #4d3326; color: white; padding: 20px; }
    .header h1 { margin: 0; font-size: 20px; }
    .content { padding: 20px; }
    .rsvp-details { background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 5px; padding: 15px; margin: 15px 0; }
    .status-attending { color: #28a745; font-weight: bold; }
    .status-not-attending { color: #dc3545; font-weight: bold; }
    .detail-row { margin: 8px 0; padding: 5px 0; border-bottom: 1px solid #eee; }
    .detail-row:last-child { border-bottom: none; }
    .label { font-weight: bold; color: #495057; width: 150px; display: inline-block; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 New RSVP Received</h1>
    </div>

    <div class="content">
      <div class="rsvp-details">
        <div class="detail-row">
          <span class="label">Guest Name:</span>
          <strong>${rsvpData.guest_name}</strong>
        </div>
        <div class="detail-row">
          <span class="label">Email:</span>
          ${rsvpData.email}
        </div>
        <div class="detail-row">
          <span class="label">Phone:</span>
          ${rsvpData.phone || 'Not provided'}
        </div>
        <div class="detail-row">
          <span class="label">Attendance:</span>
          <span class="${isAttending ? 'status-attending' : 'status-not-attending'}">
            ${rsvpData.attending === 'both' ? 'Both Events' :
              rsvpData.attending === 'akad' ? 'Akad Only' :
              rsvpData.attending === 'reception' ? 'Reception Only' : 'Unable to Attend'}
          </span>
        </div>
        ${rsvpData.plus_one_count > 0 ? `
        <div class="detail-row">
          <span class="label">Total Guests:</span>
          ${totalGuests} (including plus-ones)
        </div>
        ` : ''}
        ${rsvpData.plus_one_name ? `
        <div class="detail-row">
          <span class="label">Plus-one Name:</span>
          ${rsvpData.plus_one_name}
        </div>
        ` : ''}
        ${rsvpData.meal_preference ? `
        <div class="detail-row">
          <span class="label">Meal Preference:</span>
          ${this.getMealPreferenceName(rsvpData.meal_preference)}
        </div>
        ` : ''}
        ${rsvpData.plus_one_meal ? `
        <div class="detail-row">
          <span class="label">Plus-one Meal:</span>
          ${this.getMealPreferenceName(rsvpData.plus_one_meal)}
        </div>
        ` : ''}
        <div class="detail-row">
          <span class="label">Accommodation:</span>
          ${rsvpData.accommodation_needed ? 'Requested' : 'Not needed'}
        </div>
        ${rsvpData.special_requests ? `
        <div class="detail-row">
          <span class="label">Special Requests:</span>
          ${rsvpData.special_requests}
        </div>
        ` : ''}
        ${rsvpData.dietary_restrictions ? `
        <div class="detail-row">
          <span class="label">Dietary Restrictions:</span>
          ${rsvpData.dietary_restrictions}
        </div>
        ` : ''}
        <div class="detail-row">
          <span class="label">Submitted:</span>
          ${new Date(rsvpData.created_at || '').toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}
        </div>
        <div class="detail-row">
          <span class="label">IP Address:</span>
          ${rsvpData.ip_address || 'Unknown'}
        </div>
      </div>

      <p><a href="https://alfinamugni.wedding/admin" style="background-color: #4d3326; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Admin Dashboard</a></p>
    </div>
  </div>
</body>
</html>`;

    const text = `
New RSVP Received

Guest Name: ${rsvpData.guest_name}
Email: ${rsvpData.email}
Phone: ${rsvpData.phone || 'Not provided'}
Attendance: ${rsvpData.attending === 'both' ? 'Both Events' :
             rsvpData.attending === 'akad' ? 'Akad Only' :
             rsvpData.attending === 'reception' ? 'Reception Only' : 'Unable to Attend'}
${rsvpData.plus_one_count > 0 ? `Total Guests: ${totalGuests} (including plus-ones)\n` : ''}
${rsvpData.plus_one_name ? `Plus-one Name: ${rsvpData.plus_one_name}\n` : ''}
${rsvpData.meal_preference ? `Meal Preference: ${this.getMealPreferenceName(rsvpData.meal_preference)}\n` : ''}
${rsvpData.plus_one_meal ? `Plus-one Meal: ${this.getMealPreferenceName(rsvpData.plus_one_meal)}\n` : ''}
Accommodation: ${rsvpData.accommodation_needed ? 'Requested' : 'Not needed'}
${rsvpData.special_requests ? `Special Requests: ${rsvpData.special_requests}\n` : ''}
${rsvpData.dietary_restrictions ? `Dietary Restrictions: ${rsvpData.dietary_restrictions}\n` : ''}
Submitted: ${new Date(rsvpData.created_at || '').toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}
IP Address: ${rsvpData.ip_address || 'Unknown'}

View Admin Dashboard: https://alfinamugni.wedding/admin
`;

    return { subject, html, text };
  }

  // Generate RSVP reminder template
  private generateRsvpReminderTemplate(rsvpData: RsvpData, reminderType: 'one_week' | 'day_before'): EmailTemplate {
    const isOneWeek = reminderType === 'one_week';
    const isAttending = rsvpData.attending !== 'unable';
    
    const subject = isOneWeek
      ? '📅 Pengingat 1 Minggu - Pernikahan Alfina & Mugni'
      : '🎉 Besok Hari-H! - Pernikahan Alfina & Mugni';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: 'Georgia', serif; line-height: 1.6; color: #4d3326; margin: 0; padding: 0; background-color: #faf7f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; }
    .header { background-color: #d9e5e0; padding: 40px 20px; text-align: center; }
    .header h1 { color: #4d3326; font-size: 28px; margin: 0; font-weight: normal; }
    .header p { color: #666; font-size: 16px; margin: 10px 0 0 0; }
    .content { padding: 40px 20px; }
    .reminder-box { background-color: #e0d9e5; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
    .countdown { font-size: 24px; font-weight: bold; color: #b2804d; margin: 10px 0; }
    .wedding-details { background-color: #f0e3d9; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .event-section { margin: 20px 0; }
    .event-title { color: #b2804d; font-size: 18px; font-weight: bold; margin-bottom: 10px; }
    .footer { background-color: #4d3326; color: white; padding: 20px; text-align: center; font-size: 14px; }
    .highlight { color: #b2804d; font-weight: bold; }
    .btn { background-color: #4d3326; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${isOneWeek ? '1 Minggu Menuju Hari Bahagia!' : 'Besok Hari-H!'}</h1>
      <p>Pernikahan Alfina & Mugni</p>
    </div>

    <div class="content">
      <p>Dear ${rsvpData.guest_name},</p>

      <div class="reminder-box">
        <div class="countdown">
          ${isOneWeek ? '⏰ 7 hari lagi' : '🎉 Besok!'}
        </div>
        <p style="margin: 0; font-size: 18px;">
          ${isOneWeek
            ? 'Satu minggu lagi menuju hari bahagia kami!'
            : 'Hari ini adalah hari yang kami tunggu-tunggu!'}
        </p>
      </div>

      ${isAttending ? `
      <p>Kami sangat menantikan kehadiran Anda di acara pernikahan kami. Berikut adalah detail acara:</p>

      <div class="wedding-details">
        <div class="event-section">
          <div class="event-title">🕌 Akad Nikah</div>
          <p><strong>Tanggal:</strong> Jumat, 29 November 2025<br>
          <strong>Waktu:</strong> 10:00 WIB<br>
          <strong>Tempat:</strong> [Venue Akad - akan diupdate]</p>
        </div>

        <div class="event-section">
          <div class="event-title">🎉 Resepsi</div>
          <p><strong>Tanggal:</strong> Jumat, 29 November 2025<br>
          <strong>Waktu:</strong> 18:00 WIB<br>
          <strong>Tempat:</strong> [Venue Resepsi - akan diupdate]</p>
        </div>

        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px;"><strong>💡 Tips:</strong> ${isOneWeek
            ? 'Siapkan pakaian terbaik Anda dan pastikan tiba tepat waktu. Hindari warna putih/krem.'
            : 'Jangan lupa membawa undangan dan datang 15 menit sebelum acara dimulai.'}</p>
        </div>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://alfinamugni.wedding" class="btn">Lihat Website Pernikahan</a>
      </div>
      ` : `
      <p>Meskipun Anda tidak dapat hadir, doa dan dukungan Anda sangat berarti bagi kami. Terima kasih atas perhatian Anda.</p>
      
      <p>Anda masih dapat mengirimkan ucapan melalui website kami:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://alfinamugni.wedding#wishes" class="btn">Kirim Ucapan</a>
      </div>
      `}

      <p style="margin-top: 30px;">Dengan cinta dan harapan,<br>
      <span class="highlight">Alfina & Mugni</span></p>
    </div>

    <div class="footer">
      <p>Pernikahan Alfina & Mugni | 29 November 2025 | Jakarta, Indonesia</p>
      <p>Website: <a href="https://alfinamugni.wedding" style="color: #d9e5e0;">alfinamugni.wedding</a></p>
    </div>
  </div>
</body>
</html>`;

    const text = `
${isOneWeek ? '1 Minggu Menuju Hari Bahagia!' : 'Besok Hari-H!'}
Pernikahan Alfina & Mugni

Dear ${rsvpData.guest_name},

${isOneWeek ? 'Satu minggu lagi menuju hari bahagia kami!' : 'Hari ini adalah hari yang kami tunggu-tunggu!'}

${isAttending ? `
Kami sangat menantikan kehadiran Anda di acara pernikahan kami. Berikut adalah detail acara:

🕌 Akad Nikah
Tanggal: Jumat, 29 November 2025
Waktu: 10:00 WIB
Tempat: [Venue Akad - akan diupdate]

🎉 Resepsi
Tanggal: Jumat, 29 November 2025
Waktu: 18:00 WIB
Tempat: [Venue Resepsi - akan diupdate]

💡 Tips: ${isOneWeek
  ? 'Siapkan pakaian terbaik Anda dan pastikan tiba tepat waktu. Hindari warna putih/krem.'
  : 'Jangan lupa membawa undangan dan datang 15 menit sebelum acara dimulai.'}

Lihat website pernikahan: https://alfinamugni.wedding
` : `
Meskipun Anda tidak dapat hadir, doa dan dukungan Anda sangat berarti bagi kami. Terima kasih atas perhatian Anda.

Anda masih dapat mengirimkan ucapan melalui website kami:
https://alfinamugni.wedding#wishes
`}

Dengan cinta dan harapan,
Alfina & Mugni

---
Pernikahan Alfina & Mugni | 29 November 2025 | Jakarta, Indonesia
Website: https://alfinamugni.wedding
`;

    return { subject, html, text };
  }

  // Generate admin summary template
  private generateAdminSummaryTemplate(summaryData: AdminSummaryData): EmailTemplate {
    const periodText = summaryData.period === 'daily' ? 'Harian' : 'Mingguan';
    const subject = `[WEDDING ADMIN] Laporan ${periodText} - ${summaryData.startDate.toLocaleDateString('id-ID')}`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; border: 1px solid #ddd; }
    .header { background-color: #4d3326; color: white; padding: 20px; }
    .header h1 { margin: 0; font-size: 20px; }
    .content { padding: 20px; }
    .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
    .summary-card { background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 5px; padding: 15px; text-align: center; }
    .summary-number { font-size: 24px; font-weight: bold; color: #4d3326; }
    .summary-label { font-size: 14px; color: #666; margin-top: 5px; }
    .wishes-stats { background-color: #e0d9e5; border-radius: 5px; padding: 15px; margin: 20px 0; }
    .wishes-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-top: 10px; }
    .wish-stat { text-align: center; }
    .actions { background-color: #e8f4fd; border: 1px solid #bee5eb; border-radius: 5px; padding: 15px; margin: 20px 0; }
    .btn { background-color: #4d3326; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-right: 10px; display: inline-block; }
    .period-info { background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 10px; margin: 15px 0; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Laporan ${periodText} Pernikahan</h1>
    </div>

    <div class="content">
      <div class="period-info">
        <strong>Periode:</strong> ${summaryData.startDate.toLocaleDateString('id-ID')} - ${summaryData.endDate.toLocaleDateString('id-ID')}
      </div>

      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-number">${summaryData.totalRsvps}</div>
          <div class="summary-label">Total RSVP</div>
        </div>
        <div class="summary-card">
          <div class="summary-number">${summaryData.newRsvps}</div>
          <div class="summary-label">RSVP Baru</div>
        </div>
        <div class="summary-card">
          <div class="summary-number">${summaryData.attendingCount}</div>
          <div class="summary-label">Akan Hadir</div>
        </div>
        <div class="summary-card">
          <div class="summary-number">${summaryData.unableCount}</div>
          <div class="summary-label">Tidak Hadir</div>
        </div>
      </div>

      <div class="wishes-stats">
        <h4 style="margin-top: 0; color: #4d3326;">Statistik Ucapan</h4>
        <div class="wishes-grid">
          <div class="wish-stat">
            <div style="font-size: 18px; font-weight: bold; color: #28a745;">${summaryData.approvedWishes}</div>
            <div style="font-size: 12px; color: #666;">Disetujui</div>
          </div>
          <div class="wish-stat">
            <div style="font-size: 18px; font-weight: bold; color: #ffc107;">${summaryData.pendingWishes}</div>
            <div style="font-size: 12px; color: #666;">Menunggu</div>
          </div>
          <div class="wish-stat">
            <div style="font-size: 18px; font-weight: bold; color: #dc3545;">${summaryData.rejectedWishes}</div>
            <div style="font-size: 12px; color: #666;">Ditolak</div>
          </div>
        </div>
      </div>

      <div class="actions">
        <h4 style="margin-top: 0; color: #0c5460;">Aksi Cepat:</h4>
        <a href="https://alfinamugni.wedding/admin" class="btn">Dashboard Admin</a>
        <a href="https://alfinamugni.wedding/admin/rsvps" class="btn">Kelola RSVP</a>
        <a href="https://alfinamugni.wedding/admin/wishes" class="btn">Moderasi Ucapan</a>
      </div>

      <p style="font-size: 12px; color: #6c757d; margin-top: 20px;">
        Laporan ini dibuat otomatis pada ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}.
      </p>
    </div>
  </div>
</body>
</html>`;

    const text = `
Laporan ${periodText} Pernikahan Alfina & Mugni

Periode: ${summaryData.startDate.toLocaleDateString('id-ID')} - ${summaryData.endDate.toLocaleDateString('id-ID')}

RINGKASAN RSVP:
- Total RSVP: ${summaryData.totalRsvps}
- RSVP Baru: ${summaryData.newRsvps}
- Akan Hadir: ${summaryData.attendingCount}
- Tidak Hadir: ${summaryData.unableCount}

STATISTIK UCAPAN:
- Disetujui: ${summaryData.approvedWishes}
- Menunggu Moderasi: ${summaryData.pendingWishes}
- Ditolak: ${summaryData.rejectedWishes}

AKSI CEPAT:
- Dashboard Admin: https://alfinamugni.wedding/admin
- Kelola RSVP: https://alfinamugni.wedding/admin/rsvps
- Moderasi Ucapan: https://alfinamugni.wedding/admin/wishes

Laporan ini dibuat otomatis pada ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}.
`;

    return { subject, html, text };
  }

  // Helper function to get meal preference display name
  private getMealPreferenceName(preference: string): string {
    const preferences: { [key: string]: string } = {
      'chicken': 'Ayam (Ayam Betutu)',
      'beef': 'Daging Sapi (Rendang)',
      'fish': 'Ikan (Ikan Bakar)',
      'vegetarian': 'Vegetarian',
      'vegan': 'Vegan'
    };
    return preferences[preference] || preference;
  }
}

// Helper function to create email service instance
export function createEmailService(apiKey: string): WeddingEmailService {
  return new WeddingEmailService({
    apiKey,
    fromEmail: 'noreply@alfinamugni.wedding',
    fromName: 'Alfina & Mugni Wedding',
    replyToEmail: 'hello@alfinamugni.wedding'
  });
}