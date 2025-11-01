/**
 * GDPR Compliance Utilities
 * Data privacy and protection features
 */

import type { Env } from "./database"

export interface DataRetentionPolicy {
  rsvps: number // days
  wishes: number // days
  photos: number // days
  sessions: number // days
  analytics: number // days
}

// Data retention policy: 1 year post-wedding
export const DATA_RETENTION_POLICY: DataRetentionPolicy = {
  rsvps: 365, // 1 year
  wishes: 365, // 1 year
  photos: 730, // 2 years (memories)
  sessions: 365, // 1 year
  analytics: 90, // 3 months (anonymized after this)
}

/**
 * Anonymize personal data in RSVP
 */
export const anonymizeRSVP = (rsvp: any) => {
  return {
    ...rsvp,
    guest_name: "Anonymized User",
    email: `user-${rsvp.id}@anonymized.local`,
    phone: null,
    plus_one_name: null,
    ip_address: null,
    user_agent: null,
  }
}

/**
 * Anonymize personal data in wish
 */
export const anonymizeWish = (wish: any) => {
  return {
    ...wish,
    guest_name: "Anonim",
    email: null,
    ip_address: null,
  }
}

/**
 * Delete user data (Right to Deletion)
 */
export async function deleteUserData(
  env: Env,
  email: string,
): Promise<{ success: boolean; message: string; deletedItems: number }> {
  try {
    let deletedItems = 0

    // Delete RSVPs
    const rsvpResult = await env.DB.prepare(
      "DELETE FROM rsvps WHERE email = ?",
    )
      .bind(email)
      .run()
    deletedItems += rsvpResult.meta.changes || 0

    // Delete wishes
    const wishResult = await env.DB.prepare(
      "DELETE FROM guest_wishes WHERE email = ?",
    )
      .bind(email)
      .run()
    deletedItems += wishResult.meta.changes || 0

    // Delete photos uploaded by user
    const photoResult = await env.DB.prepare(
      "DELETE FROM photo_uploads WHERE uploader_email = ?",
    )
      .bind(email)
      .run()
    deletedItems += photoResult.meta.changes || 0

    return {
      success: true,
      message: `Data berhasil dihapus. Total ${deletedItems} item dihapus.`,
      deletedItems,
    }
  } catch (error) {
    console.error("Error deleting user data:", error)
    return {
      success: false,
      message: "Terjadi kesalahan saat menghapus data.",
      deletedItems: 0,
    }
  }
}

/**
 * Export user data (Right to Data Portability)
 */
export async function exportUserData(
  env: Env,
  email: string,
): Promise<{ success: boolean; data?: any; message: string }> {
  try {
    // Get RSVPs
    const rsvps = await env.DB.prepare(
      "SELECT * FROM rsvps WHERE email = ?",
    ).bind(email).all()

    // Get wishes
    const wishes = await env.DB.prepare(
      "SELECT * FROM guest_wishes WHERE email = ?",
    ).bind(email).all()

    // Get photos
    const photos = await env.DB.prepare(
      "SELECT id, filename, original_name, file_size, upload_date, uploader_name FROM photo_uploads WHERE uploader_email = ?",
    ).bind(email).all()

    const userData = {
      email,
      exportDate: new Date().toISOString(),
      rsvps: rsvps.results || [],
      wishes: wishes.results || [],
      photos: photos.results || [],
    }

    return {
      success: true,
      data: userData,
      message: "Data berhasil diekspor.",
    }
  } catch (error) {
    console.error("Error exporting user data:", error)
    return {
      success: false,
      message: "Terjadi kesalahan saat mengekspor data.",
    }
  }
}

/**
 * Clean up old data based on retention policy
 */
export async function cleanupOldData(env: Env): Promise<{
  success: boolean
  message: string
  deletedCounts: {
    rsvps: number
    wishes: number
    photos: number
    sessions: number
  }
}> {
  try {
    const deletedCounts = {
      rsvps: 0,
      wishes: 0,
      photos: 0,
      sessions: 0,
    }

    // Calculate cutoff dates
    const rsvpCutoff = new Date()
    rsvpCutoff.setDate(rsvpCutoff.getDate() - DATA_RETENTION_POLICY.rsvps)

    const wishCutoff = new Date()
    wishCutoff.setDate(wishCutoff.getDate() - DATA_RETENTION_POLICY.wishes)

    const photoCutoff = new Date()
    photoCutoff.setDate(photoCutoff.getDate() - DATA_RETENTION_POLICY.photos)

    const sessionCutoff = new Date()
    sessionCutoff.setDate(
      sessionCutoff.getDate() - DATA_RETENTION_POLICY.sessions,
    )

    // Delete old RSVPs
    const rsvpResult = await env.DB.prepare(
      "DELETE FROM rsvps WHERE created_at < ?",
    )
      .bind(rsvpCutoff.toISOString())
      .run()
    deletedCounts.rsvps = rsvpResult.meta.changes || 0

    // Delete old wishes
    const wishResult = await env.DB.prepare(
      "DELETE FROM guest_wishes WHERE created_at < ?",
    )
      .bind(wishCutoff.toISOString())
      .run()
    deletedCounts.wishes = wishResult.meta.changes || 0

    // Delete old photos
    const photoResult = await env.DB.prepare(
      "DELETE FROM photo_uploads WHERE upload_date < ?",
    )
      .bind(photoCutoff.toISOString())
      .run()
    deletedCounts.photos = photoResult.meta.changes || 0

    // Delete old sessions
    const sessionResult = await env.DB.prepare(
      "DELETE FROM gallery_sessions WHERE created_at < ?",
    )
      .bind(sessionCutoff.toISOString())
      .run()
    deletedCounts.sessions = sessionResult.meta.changes || 0

    return {
      success: true,
      message: "Data lama berhasil dibersihkan.",
      deletedCounts,
    }
  } catch (error) {
    console.error("Error cleaning up old data:", error)
    return {
      success: false,
      message: "Terjadi kesalahan saat membersihkan data.",
      deletedCounts: {
        rsvps: 0,
        wishes: 0,
        photos: 0,
        sessions: 0,
      },
    }
  }
}

/**
 * Cookie consent management
 */
export interface CookieConsent {
  necessary: boolean // Always true
  analytics: boolean
  marketing: boolean
  preferences: boolean
}

export const DEFAULT_CONSENT: CookieConsent = {
  necessary: true,
  analytics: false,
  marketing: false,
  preferences: false,
}

export function getConsentFromCookie(cookieHeader?: string): CookieConsent {
  if (!cookieHeader) return DEFAULT_CONSENT

  try {
    const cookies = cookieHeader.split(";").reduce(
      (acc, cookie) => {
        const [key, value] = cookie.trim().split("=")
        acc[key] = value
        return acc
      },
      {} as Record<string, string>,
    )

    if (cookies["cookie-consent"]) {
      return JSON.parse(decodeURIComponent(cookies["cookie-consent"]))
    }
  } catch (error) {
    console.error("Error parsing consent cookie:", error)
  }

  return DEFAULT_CONSENT
}

export function setConsentCookie(consent: CookieConsent): string {
  const value = encodeURIComponent(JSON.stringify(consent))
  const maxAge = 365 * 24 * 60 * 60 // 1 year
  return `cookie-consent=${value}; Max-Age=${maxAge}; Path=/; SameSite=Strict; Secure`
}
