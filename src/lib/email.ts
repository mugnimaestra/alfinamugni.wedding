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
export type EmailType = 'rsvp_confirmation' | 'admin_notification' | 'reminder' | 'thank_you';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// Email service class
export class WeddingEmailService {
  private resend: Resend;
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
    this.resend = new Resend(config.apiKey);
  }

  // Send RSVP confirmation email to guest
  async sendRsvpConfirmation(rsvpData: RsvpData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const template = this.generateRsvpConfirmationTemplate(rsvpData);

      const result = await this.resend.emails.send({
        from: `${this.config.fromName} <${this.config.fromEmail}>`,
        to: [rsvpData.email],
        replyTo: this.config.replyToEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
        tags: [
          { name: 'type', value: 'rsvp_confirmation' },
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

  // Send admin notification for new RSVP
  async sendAdminNotification(rsvpData: RsvpData, adminEmail: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const template = this.generateAdminNotificationTemplate(rsvpData);

      const result = await this.resend.emails.send({
        from: `${this.config.fromName} <${this.config.fromEmail}>`,
        to: [adminEmail],
        replyTo: this.config.replyToEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
        tags: [
          { name: 'type', value: 'admin_notification' },
          { name: 'wedding', value: 'alfina-mugni-2025' }
        ]
      });

      if (result.error) {
        console.error('Resend error:', result.error);
        return { success: false, error: result.error.message };
      }

      return { success: true, messageId: result.data?.id };

    } catch (error) {
      console.error('Admin email error:', error);
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