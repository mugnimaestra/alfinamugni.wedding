import { z } from 'zod';

// Validation schemas for form inputs
export const RsvpSchema = z.object({
  guest_name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  attending: z.enum(['both', 'akad', 'reception', 'unable'], {
    message: 'Please select your attendance option'
  }),
  plus_one_count: z.number().int().min(0).max(5, 'Maximum 5 plus ones allowed'),
  plus_one_name: z.string().max(100, 'Name too long').optional(),
  meal_preference: z.enum(['chicken', 'beef', 'fish', 'vegetarian', 'vegan']).optional(),
  plus_one_meal: z.enum(['chicken', 'beef', 'fish', 'vegetarian', 'vegan']).optional(),
  accommodation_needed: z.boolean().default(false),
  special_requests: z.string().max(500, 'Special requests too long').optional(),
  dietary_restrictions: z.string().max(300, 'Dietary restrictions too long').optional(),
});

export const GuestWishSchema = z.object({
  guest_name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  email: z.string().email('Please enter a valid email address').optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message too long'),
});

export const PhotoUploadSchema = z.object({
  filename: z.string().min(1, 'Filename required'),
  original_name: z.string().min(1, 'Original name required'),
  file_size: z.number().int().positive('File size must be positive').max(10 * 1024 * 1024, 'File too large (max 10MB)'),
  content_type: z.string().regex(/^image\/(jpeg|jpg|png|webp|gif)$/, 'Invalid image format'),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  uploader_name: z.string().max(100, 'Name too long').optional(),
  uploader_email: z.string().email('Invalid email').optional(),
  bucket_path: z.string().min(1, 'Bucket path required'),
  r2_key: z.string().min(1, 'R2 key required'),
  category: z.enum(['ceremony', 'reception', 'guests', 'professional']),
  description: z.string().max(300, 'Description too long').optional(),
});

// Input sanitization utilities
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/[\p{Cc}]/gu, '') // Remove control characters
    .substring(0, 1000); // Limit length
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export function sanitizePhone(phone: string): string {
  // Remove all non-digit characters except + at the beginning
  return phone.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
}

// Validation utility functions
export function validateRsvpData(data: unknown): z.ZodSafeParseResult<z.infer<typeof RsvpSchema>> {
  return RsvpSchema.safeParse(data);
}

export function validateGuestWish(data: unknown): z.ZodSafeParseResult<z.infer<typeof GuestWishSchema>> {
  return GuestWishSchema.safeParse(data);
}

export function validatePhotoUpload(data: unknown): z.ZodSafeParseResult<z.infer<typeof PhotoUploadSchema>> {
  return PhotoUploadSchema.safeParse(data);
}

// Content filtering utilities
const SPAM_KEYWORDS = [
  'viagra', 'cialis', 'lottery', 'winner', 'million dollars', 'inheritance',
  'click here', 'act now', 'limited time', 'urgent', 'congratulations',
  'casino', 'gambling', 'bitcoin', 'investment opportunity'
];

const INAPPROPRIATE_KEYWORDS = [
  'fuck', 'shit', 'damn', 'hell', 'bitch', 'ass', 'crap',
  // Add more as needed, considering Indonesian context
];

export function containsSpam(text: string): boolean {
  const lowerText = text.toLowerCase();
  return SPAM_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

export function containsInappropriateContent(text: string): boolean {
  const lowerText = text.toLowerCase();
  return INAPPROPRIATE_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

export function moderateContent(text: string): {
  isAppropriate: boolean;
  containsSpam: boolean;
  moderatedText: string;
  reasons: string[];
} {
  const reasons: string[] = [];
  let moderatedText = text;

  const hasSpam = containsSpam(text);
  const hasInappropriate = containsInappropriateContent(text);

  if (hasSpam) {
    reasons.push('Contains spam keywords');
  }

  if (hasInappropriate) {
    reasons.push('Contains inappropriate content');
    // Replace inappropriate words with asterisks
    INAPPROPRIATE_KEYWORDS.forEach(word => {
      const regex = new RegExp(word, 'gi');
      moderatedText = moderatedText.replace(regex, '*'.repeat(word.length));
    });
  }

  return {
    isAppropriate: !hasSpam && !hasInappropriate,
    containsSpam: hasSpam,
    moderatedText,
    reasons
  };
}

// Indonesian phone number validation
export function validateIndonesianPhone(phone: string): boolean {
  if (!phone) return true; // Optional field

  // Remove all non-digit characters except + at the beginning
  const cleanPhone = sanitizePhone(phone);

  // Indonesian phone patterns:
  // +62 (country code) followed by area code and number
  // 08xx (mobile prefix) followed by 8-12 digits
  // 021, 022, etc. (landline area codes) followed by 7-8 digits
  const patterns = [
    /^\+628\d{8,11}$/, // Mobile with country code
    /^08\d{8,11}$/, // Mobile without country code
    /^\+6221\d{7,8}$/, // Jakarta landline with country code
    /^021\d{7,8}$/, // Jakarta landline
    /^\+6222\d{7,8}$/, // Bandung landline with country code
    /^022\d{7,8}$/, // Bandung landline
    // Add more area codes as needed
  ];

  return patterns.some(pattern => pattern.test(cleanPhone));
}

// Email normalization for Indonesian context
export function normalizeIndonesianEmail(email: string): string {
  const normalized = sanitizeEmail(email);

  // Handle common Indonesian email providers
  const commonDomains = {
    'gmial.com': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
    'outlok.com': 'outlook.com'
  };

  let result = normalized;
  Object.entries(commonDomains).forEach(([typo, correct]) => {
    if (result.endsWith(typo)) {
      result = result.replace(typo, correct);
    }
  });

  return result;
}

// Form data sanitization wrapper
export function sanitizeRsvpData(rawData: Record<string, unknown>): Record<string, unknown> {
  return {
    ...rawData,
    guest_name: sanitizeString(String(rawData.guest_name || '')),
    email: normalizeIndonesianEmail(String(rawData.email || '')),
    phone: rawData.phone ? sanitizePhone(String(rawData.phone)) : undefined,
    plus_one_name: rawData.plus_one_name ? sanitizeString(String(rawData.plus_one_name)) : undefined,
    special_requests: rawData.special_requests ? sanitizeString(String(rawData.special_requests)) : undefined,
    dietary_restrictions: rawData.dietary_restrictions ? sanitizeString(String(rawData.dietary_restrictions)) : undefined,
  };
}

export function sanitizeWishData(rawData: Record<string, unknown>): Record<string, unknown> {
  const moderated = moderateContent(String(rawData.message || ''));

  return {
    ...rawData,
    guest_name: sanitizeString(String(rawData.guest_name || '')),
    email: rawData.email ? normalizeIndonesianEmail(String(rawData.email)) : undefined,
    message: moderated.moderatedText,
    auto_approved: moderated.isAppropriate,
    moderation_notes: moderated.reasons.length > 0 ? moderated.reasons.join(', ') : undefined
  };
}