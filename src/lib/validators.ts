import { z } from 'zod';

// Enhanced validation schemas for form inputs with Indonesian context

// Base schemas for common fields
const NameSchema = z.string()
  .min(2, 'Nama harus minimal 2 karakter')
  .max(100, 'Nama terlalu panjang')
  .regex(/^[a-zA-Z\s\u00C0-\u017F]+$/, 'Nama hanya boleh mengandung huruf dan spasi');

const EmailSchema = z.string()
  .email('Silakan masukkan alamat email yang valid')
  .max(254, 'Email terlalu panjang')
  .transform(email => email.toLowerCase().trim());

const PhoneSchema = z.string()
  .optional()
  .transform(phone => phone ? phone.replace(/[^\d+]/g, '') : undefined);

// RSVP validation schema with enhanced validation
export const RsvpSchema = z.object({
  guest_name: NameSchema,
  email: EmailSchema,
  phone: PhoneSchema,
  attending: z.enum(['both', 'akad', 'reception', 'unable'], {
    message: 'Silakan pilih opsi kehadiran Anda'
  }),
  plus_one_count: z.number()
    .int('Jumlah plus one harus bilangan bulat')
    .min(0, 'Jumlah plus one tidak boleh negatif')
    .max(5, 'Maksimal 5 plus one yang diizinkan'),
  plus_one_name: z.string()
    .max(100, 'Nama plus one terlalu panjang')
    .optional(),
  meal_preference: z.enum(['chicken', 'beef', 'fish', 'vegetarian', 'vegan'], {
    message: 'Silakan pilih preferensi makanan'
  }).optional(),
  plus_one_meal: z.enum(['chicken', 'beef', 'fish', 'vegetarian', 'vegan'], {
    message: 'Silakan pilih preferensi makanan plus one'
  }).optional(),
  accommodation_needed: z.boolean().default(false),
  special_requests: z.string()
    .max(500, 'Permintaan khusus terlalu panjang')
    .optional(),
  dietary_restrictions: z.string()
    .max(300, 'Restriksi diet terlalu panjang')
    .optional(),
}).refine((data) => {
  // Custom validation: if attending is 'unable', other fields should be minimal
  if (data.attending === 'unable') {
    return data.plus_one_count === 0 && !data.plus_one_name && !data.meal_preference && !data.plus_one_meal;
  }
  return true;
}, {
  message: 'Jika tidak bisa hadir, tidak perlu mengisi data plus one dan makanan',
  path: ['attending']
}).refine((data) => {
  // Custom validation: plus one name required if plus one count > 0
  if (data.plus_one_count > 0 && !data.plus_one_name) {
    return false;
  }
  return true;
}, {
  message: 'Nama plus one wajib diisi jika membawa tamu',
  path: ['plus_one_name']
}).refine((data) => {
  // Custom validation: plus one meal required if plus one count > 0 and meal preference is set
  if (data.plus_one_count > 0 && data.meal_preference && !data.plus_one_meal) {
    return false;
  }
  return true;
}, {
  message: 'Preferensi makanan plus one wajib diisi jika ada plus one',
  path: ['plus_one_meal']
});

// Guest wish validation schema with enhanced validation
export const GuestWishSchema = z.object({
  guest_name: NameSchema,
  email: EmailSchema.optional(),
  message: z.string()
    .min(10, 'Pesan harus minimal 10 karakter')
    .max(1000, 'Pesan terlalu panjang (maksimal 1000 karakter)')
    .refine(message => {
      // Check for excessive whitespace
      const trimmed = message.trim();
      return trimmed.length > 0 && trimmed.split(/\s+/).length >= 2;
    }, {
      message: 'Pesan harus mengandung setidaknya 2 kata'
    }),
});

// Photo upload validation schema
export const PhotoUploadSchema = z.object({
  filename: z.string().min(1, 'Nama file wajib diisi'),
  original_name: z.string().min(1, 'Nama asli file wajib diisi'),
  file_size: z.number()
    .int('Ukuran file harus bilangan bulat')
    .positive('Ukuran file harus positif')
    .max(10 * 1024 * 1024, 'File terlalu besar (maksimal 10MB)'),
  content_type: z.string()
    .regex(/^image\/(jpeg|jpg|png|webp|gif)$/, 'Format gambar tidak valid'),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  uploader_name: NameSchema.optional(),
  uploader_email: EmailSchema.optional(),
  bucket_path: z.string().min(1, 'Path bucket wajib diisi'),
  r2_key: z.string().min(1, 'R2 key wajib diisi'),
  category: z.enum(['ceremony', 'reception', 'guests', 'professional'], {
    message: 'Silakan pilih kategori foto'
  }),
  description: z.string()
    .max(300, 'Deskripsi terlalu panjang')
    .optional(),
});

// Admin user validation schema
export const AdminUserSchema = z.object({
  username: z.string()
    .min(3, 'Username minimal 3 karakter')
    .max(50, 'Username terlalu panjang')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username hanya boleh mengandung huruf, angka, underscore, dan dash'),
  email: EmailSchema,
  role: z.enum(['admin', 'moderator', 'viewer'], {
    message: 'Silakan pilih role yang valid'
  }),
  active: z.boolean().default(true),
});

// Settings validation schema
export const SettingsSchema = z.object({
  key: z.string()
    .min(1, 'Key setting wajib diisi')
    .max(100, 'Key setting terlalu panjang')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Key hanya boleh mengandung huruf, angka, underscore, dan dash'),
  value: z.string()
    .min(1, 'Value setting wajib diisi')
    .max(1000, 'Value setting terlalu panjang'),
  description: z.string()
    .max(500, 'Deskripsi terlalu panjang')
    .optional(),
});

// API request/response schemas
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional(),
  timestamp: z.string().datetime().optional(),
});

// Pagination schema
export const PaginationSchema = z.object({
  limit: z.number()
    .int('Limit harus bilangan bulat')
    .min(1, 'Limit minimal 1')
    .max(100, 'Limit maksimal 100'),
  offset: z.number()
    .int('Offset harus bilangan bulat')
    .min(0, 'Offset tidak boleh negatif'),
  total: z.number().int().nonnegative(),
  hasMore: z.boolean(),
});

// Search query schema
export const SearchQuerySchema = z.object({
  query: z.string()
    .min(1, 'Query pencarian minimal 1 karakter')
    .max(100, 'Query pencarian terlalu panjang'),
  limit: z.number().int().min(1).max(100).default(10),
  offset: z.number().int().min(0).default(0),
  filters: z.record(z.string(), z.any()).optional(),
});

// RSVP statistics schema
export const RsvpStatsSchema = z.object({
  total: z.number().nonnegative(),
  confirmed: z.number().nonnegative(),
  declined: z.number().nonnegative(),
  pending: z.number().nonnegative(),
  attendingBoth: z.number().nonnegative(),
  attendingAkad: z.number().nonnegative(),
  attendingReception: z.number().nonnegative(),
  plusOnes: z.number().nonnegative(),
  accommodationNeeded: z.number().nonnegative(),
  mealPreferences: z.record(z.string(), z.number().nonnegative()),
});

// Wish statistics schema
export const WishStatsSchema = z.object({
  total: z.number().nonnegative(),
  approved: z.number().nonnegative(),
  pending: z.number().nonnegative(),
  rejected: z.number().nonnegative(),
  recentActivity: z.number().nonnegative(),
});

// Export validation schema
export const ExportRequestSchema = z.object({
  format: z.enum(['csv', 'json'], {
    message: 'Format export harus csv atau json'
  }),
  type: z.enum(['rsvps', 'wishes', 'photos'], {
    message: 'Tipe export harus rsvps, wishes, atau photos'
  }),
  filters: z.record(z.string(), z.any()).optional(),
  dateRange: z.object({
    start: z.string().datetime().optional(),
    end: z.string().datetime().optional(),
  }).optional(),
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