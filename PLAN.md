# 💍 Wedding Website Transformation Plan
## Comprehensive Cloudflare-Powered Platform for Alfina & Mugni's Wedding

**Target Date:** November 29, 2025 | **Location:** Jakarta, Indonesia | **Expected Guests:** ~200

---

## 🎯 EXECUTIVE SUMMARY

### Current State Analysis
**✅ COMPLETED (70% Frontend)**
- 40+ Qwik UI components fully implemented
- All wedding sections (Hero, Story, Gallery, RSVP, Details, Contact, Wishes, QR Code)
- Modern tech stack: Qwik 1.14.1, TypeScript 5.4.5, Tailwind CSS 3.4.14
- Testing infrastructure with Vitest
- PWA package (@qwikdev/pwa) installed
- Authentication framework (@auth/qwik) installed
- Dependencies ready: Resend, Sharp, Bcryptjs, Zod, Wrangler

**❌ MISSING (30% Backend Infrastructure)**
- No Cloudflare configuration (wrangler.toml)
- No D1 database schema or migrations
- No R2 storage setup
- No functional API endpoints
- No email templates or workflows
- No authentication implementation
- No photo upload functionality
- No admin dashboard backend
- No production deployment configuration

### Target State
🚀 **Full-stack wedding platform** with:
- Cloudflare D1 database for RSVPs, wishes, and admin data
- Cloudflare R2 storage for guest photos (zero egress fees)
- Auth.js-powered admin authentication
- Resend email notifications (RSVP confirmations, reminders)
- Mobile-optimized PWA with offline functionality
- Indonesian network optimizations (Telkomsel, Indosat, XL support)
- Production deployment on Cloudflare Pages
- Cost target: $0-$25/month (wedding scale)

### Implementation Timeline
- **Phase 1 (Weeks 1-2):** Infrastructure & Database Foundation
- **Phase 2 (Weeks 3-4):** Authentication & Backend APIs
- **Phase 3 (Weeks 5-6):** Email Integration & Admin Dashboard
- **Phase 4 (Weeks 7-8):** Mobile PWA & Indonesian Optimizations
- **Phase 5 (Weeks 9-10):** Security, Performance & Production Deployment
- **Buffer (2 weeks):** Testing, refinement, content population
- **Total:** 10-12 weeks to production-ready | 13 months until wedding day

### Success Metrics
- **Performance:** LCP < 2.5s, INP < 200ms, CLS < 0.1 (Core Web Vitals)
- **Reliability:** 99.9% uptime, zero data loss during traffic spikes
- **User Experience:** 95%+ RSVP completion rate, 90%+ mobile form completion
- **Email Delivery:** 99%+ delivery rate for notifications
- **Cost Efficiency:** Stay within $0-$25/month budget
- **Mobile Optimization:** < 3s load time on Indonesian 3G networks
- **Offline Capability:** Core wedding info accessible without internet

---

## 🏗️ TECHNOLOGY STACK RATIONALE

### Why Cloudflare Ecosystem?

**Cost Advantage:**
- **R2 Storage:** $0 egress fees (vs AWS S3's $0.09/GB) → Save $50-100/month on photo serving
- **D1 Database:** 25M reads/month free (wedding needs ~100K reads/month)
- **Pages Hosting:** Unlimited requests, 500 builds/month, global CDN - FREE
- **Workers:** 100K requests/day free (wedding traffic: ~5K-15K requests/day)
- **Total Estimated Cost:** $0-$5/month (vs $85-$280/month traditional stack)

**Performance Benefits:**
- 330+ global data centers with strong Asia-Pacific coverage (Jakarta, Singapore)
- Edge computing reduces latency for Indonesian guests (< 50ms vs 200-300ms)
- Automatic DDoS protection (critical for wedding day traffic spikes)
- Built-in SSL, CDN, and caching (no configuration needed)

**Developer Experience:**
- Native Qwik integration via Vite adapter
- Single vendor (simplified operations)
- Unified dashboard for monitoring
- Wrangler CLI for development/deployment
- TypeScript support throughout

### Why Qwik for Wedding Sites?

**Resumability Architecture:**
- No hydration overhead → Instant interactivity (critical for mobile users)
- Lazy loading → Components load only when needed (data plan friendly)
- Small initial bundle → Fast First Contentful Paint on slow networks

**Qwik City Patterns:**
```typescript
// routeLoader$ - Server-side data loading before render (SEO-friendly)
export const useRSVPs = routeLoader$(async (requestEv) => {
  const db = requestEv.platform.env.DB  // D1 database binding
  const rsvps = await db.prepare('SELECT * FROM rsvps ORDER BY created_at DESC').all()
  return rsvps.results
})

// routeAction$ - Server-side form handling and mutations
export const useRSVPSubmit = routeAction$(async (data, requestEv) => {
  const db = requestEv.platform.env.DB
  await db.prepare('INSERT INTO rsvps (name, email, attending) VALUES (?, ?, ?)')
    .bind(data.name, data.email, data.attending)
    .run()
  // Send confirmation email
  await sendEmail({ to: data.email, template: 'rsvp-confirmation' })
  return { success: true }
})
```

**Wedding-Specific Benefits:**
- **File-based routing:** Easy to add pages (e.g., `/gallery`, `/admin`, `/thank-you`)
- **SSR by default:** Google can crawl wedding details for SEO
- **Resumable:** Guests with slow connections still get working forms
- **Small bundle:** Critical for Indonesian mobile users (avg 26.1 Mbps)

### Indonesian Market Considerations

**Network Landscape (2025):**
- **5G rollout:** Ongoing in Jakarta metro area (Telkomsel, XL Axiata)
- **4G dominant:** 95%+ availability, avg speeds 20-30 Mbps
- **3G fallback:** Still common in congested areas or during peak hours
- **Carriers:** Telkomsel (50% market share), Indosat, XL, Tri
- **Peak congestion:** 7-9 AM, 12-1 PM, 6-8 PM Jakarta time (WIB)
- **Data plans:** Limited data common (~2-5GB/month for budget users)

**Optimization Strategy:**
```typescript
// Network-aware image loading
export const useNetworkOptimizedImages = $(() => {
  const connection = (navigator as any).connection
  const effectiveType = connection?.effectiveType || '4g'
  
  return {
    quality: effectiveType === 'slow-2g' || effectiveType === '2g' ? 40 :
             effectiveType === '3g' ? 60 : 80,
    format: 'webp',  // 30% smaller than JPEG
    maxWidth: effectiveType === '3g' ? 800 : 1200
  }
})

// Time-based optimization for Jakarta peak hours
export const isJakartaPeakHour = $(() => {
  const now = new Date()
  const jakartaHour = now.getUTCHours() + 7  // WIB = UTC+7
  return (jakartaHour >= 7 && jakartaHour < 9) || 
         (jakartaHour >= 12 && jakartaHour < 13) ||
         (jakartaHour >= 18 && jakartaHour < 20)
})
```

**Cultural Considerations:**
- **Muslim wedding timing:** Avoid prayer times (Dzuhur, Ashar, Maghrib, Isya)
- **Ramadan consideration:** If wedding near Ramadan, optimize for fasting hours
- **Indonesian language:** Forms and errors in Bahasa Indonesia
- **Local etiquette:** Photography consent, modest dress code information
- **Family-centric:** Plus-one handling, child accommodations

---

## 📊 DETAILED CURRENT STATE AUDIT

### Existing Assets (Package Analysis)

**Core Framework:**
```json
"@builder.io/qwik": "^1.14.1",
"@builder.io/qwik-city": "^1.14.1",
"typescript": "5.4.5",
"vite": "5.3.5"
```
✅ Modern Qwik setup with latest stable releases

**UI Components (40+ implemented):**
```
src/components/ui/
├── button.tsx, input.tsx, label.tsx, card.tsx
├── dialog.tsx, sheet.tsx, tabs.tsx, accordion.tsx
├── select.tsx, checkbox.tsx, textarea.tsx, switch.tsx
├── toast.tsx, badge.tsx, avatar.tsx, carousel.tsx
├── table.tsx, calendar.tsx, navigation-menu.tsx
└── ...36 more components
```
✅ Complete shadcn/ui-style component library adapted for Qwik

**Wedding Sections:**
```
src/components/
├── hero-section.tsx (with countdown)
├── story-section.tsx (couple's journey)
├── details-section.tsx (venue, schedule)
├── rsvp-section.tsx (NEEDS BACKEND)
├── gallery-section.tsx (NEEDS R2 INTEGRATION)
├── gallery-upload-section.tsx (NEEDS IMPLEMENTATION)
├── wishes-section.tsx (NEEDS BACKEND)
├── gift-section.tsx (registry info)
├── qr-code-section.tsx (mobile sharing)
├── contact-section.tsx
└── footer-section.tsx
```
✅ All UI complete | ❌ Backend connections missing

**Dependencies Already Installed:**
```json
"@auth/qwik": "^0.8.0",           // ✅ Auth framework
"@auth/core": "^0.40.0",          // ✅ Auth core
"@qwikdev/pwa": "^0.0.4",         // ✅ PWA plugin
"@cloudflare/workers-types": "^4.20250921.0",  // ✅ CF types
"wrangler": "^4.38.0",            // ✅ CF CLI
"resend": "^6.1.0",               // ✅ Email service
"sharp": "^0.34.4",               // ✅ Image processing
"bcryptjs": "^3.0.2",             // ✅ Password hashing
"zod": "^4.1.5",                  // ✅ Validation
"@modular-forms/qwik": "^0.29.1"  // ✅ Form handling
```
✅ All necessary packages installed | ❌ Not configured

**Testing Infrastructure:**
```json
"vitest": "^3.2.4",
"@vitest/ui": "^3.2.4",
"@vitest/coverage-v8": "^3.2.4",
"@testing-library/jest-dom": "^6.8.0"
```
✅ Comprehensive testing setup ready

**Existing Routes:**
```
src/routes/
├── index.tsx (homepage - complete)
├── admin/index.tsx (empty placeholder)
├── gallery/index.tsx (empty placeholder)
├── components-test/index.tsx (UI testing page)
└── test.tsx (dev testing)
```
✅ File structure started | ❌ Admin and gallery routes empty

**Existing Services:**
```
src/services/
└── gallery-service.ts (local state management only)
```
❌ No API integration yet

### Missing Infrastructure (Critical Path)

**1. Cloudflare Configuration**
```
❌ wrangler.toml (bindings for D1, R2, KV, secrets)
❌ .dev.vars (local development environment variables)
❌ .env.production (production secrets)
```

**2. Database Layer**
```
❌ src/database/schema.sql (table definitions)
❌ migrations/ (versioned schema changes)
❌ src/lib/db.ts (connection utilities, query helpers)
❌ src/lib/validators.ts (Zod schemas for data validation)
```

**3. API Routes**
```
❌ src/routes/api/rsvp/index.ts
❌ src/routes/api/wishes/index.ts
❌ src/routes/api/gallery/upload/index.ts
❌ src/routes/api/gallery/list/index.ts
❌ src/routes/api/admin/login/index.ts
❌ src/routes/api/admin/rsvps/index.ts
```

**4. Authentication Implementation**
```
❌ src/routes/plugin@auth.ts (Auth.js configuration)
❌ src/middleware/auth.ts (route protection)
❌ src/lib/auth-config.ts (OAuth providers, credentials)
```

**5. Email System**
```
❌ src/lib/email/resend-client.ts (Resend configuration)
❌ src/lib/email/templates/rsvp-confirmation.html
❌ src/lib/email/templates/admin-notification.html
❌ src/lib/email/templates/reminder.html
❌ src/lib/email/send.ts (email sending utilities)
```

**6. Storage Integration**
```
❌ src/lib/storage/r2-client.ts (R2 SDK configuration)
❌ src/lib/storage/upload.ts (signed URL generation)
❌ src/lib/storage/image-processing.ts (Sharp integration)
```

**7. Admin Dashboard**
```
❌ src/routes/admin/layout.tsx (admin layout with auth)
❌ src/routes/admin/rsvps/index.tsx
❌ src/routes/admin/gallery/index.tsx
❌ src/routes/admin/settings/index.tsx
```

**8. PWA Configuration**
```
❌ vite.config.ts PWA plugin setup
❌ Service worker strategy configuration
❌ Offline fallback pages
❌ IndexedDB for offline form queue
```

---

## 🚀 PHASE 1: INFRASTRUCTURE FOUNDATION (Weeks 1-2)

### Objectives
- Set up Cloudflare Workers, D1 database, R2 storage
- Create database schema and migration system
- Configure local development environment
- Establish project file structure for backend

### Prerequisites
- Cloudflare account with Workers Paid plan ($5/month minimum)
- Domain registered and DNS pointed to Cloudflare
- Resend account created (free tier)
- Wrangler CLI authenticated (`wrangler login`)

---

### Task 1.1: Create `wrangler.toml` Configuration

**File:** `/wrangler.toml`

```toml
name = "alfinamugni-wedding"
main = "src/entry.preview.tsx"
compatibility_date = "2025-01-15"
compatibility_flags = ["nodejs_compat"]

# D1 Database bindings
[[d1_databases]]
binding = "DB"  # Accessible as env.DB in code
database_name = "wedding-production"
database_id = "YOUR_DATABASE_ID"  # Get from: wrangler d1 create wedding-production
preview_database_id = "YOUR_PREVIEW_DB_ID"  # For local dev

# R2 Storage bindings
[[r2_buckets]]
binding = "WEDDING_PHOTOS"
bucket_name = "wedding-photos-production"
preview_bucket_name = "wedding-photos-preview"

# KV Namespaces (for sessions, cache)
[[kv_namespaces]]
binding = "KV"
id = "YOUR_KV_ID"
preview_id = "YOUR_PREVIEW_KV_ID"

# Environment variables (non-secret)
[vars]
ENVIRONMENT = "production"
WEDDING_DATE = "2025-11-29"
WEDDING_TIMEZONE = "Asia/Jakarta"
MAX_UPLOAD_SIZE_MB = 5
MAX_PHOTOS_PER_GUEST = 20

# Secrets (set via: wrangler secret put SECRET_NAME)
# - AUTH_SECRET (generate with: openssl rand -base64 32)
# - RESEND_API_KEY
# - ADMIN_PASSWORD_HASH
# - CLOUDFLARE_ACCOUNT_ID
# - CLOUDFLARE_API_TOKEN

[build]
command = "npm run build"

[site]
bucket = "./dist"

# Routes configuration
[[routes]]
pattern = "alfinamugni.wedding/*"
custom_domain = true

[[routes]]
pattern = "www.alfinamugni.wedding/*"
custom_domain = true

# Development configuration
[dev]
ip = "0.0.0.0"
port = 5173
local_protocol = "http"

# Observability
[observability]
enabled = true
head_sampling_rate = 1
```

**Setup Commands:**
```bash
# 1. Create D1 database
wrangler d1 create wedding-production
wrangler d1 create wedding-preview

# 2. Create R2 buckets
wrangler r2 bucket create wedding-photos-production
wrangler r2 bucket create wedding-photos-preview

# 3. Create KV namespace
wrangler kv:namespace create "KV"
wrangler kv:namespace create "KV" --preview

# 4. Set secrets
echo "Generating AUTH_SECRET..."
openssl rand -base64 32 | wrangler secret put AUTH_SECRET

echo "Enter Resend API key:"
wrangler secret put RESEND_API_KEY

echo "Enter admin password (will be hashed):"
node -e "console.log(require('bcryptjs').hashSync(process.argv[1], 10))" "YOUR_PASSWORD" | wrangler secret put ADMIN_PASSWORD_HASH

# 5. Update wrangler.toml with IDs from above commands
```

---

### Task 1.2: Database Schema Design

**File:** `migrations/0001_initial_schema.sql`

```sql
-- ============================================================================
-- WEDDING WEBSITE DATABASE SCHEMA
-- Cloudflare D1 (SQLite)
-- Migration: 0001_initial_schema.sql
-- Created: 2025-01-XX
-- ============================================================================

-- RSVPs Table
CREATE TABLE IF NOT EXISTS rsvps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Guest Information
    guest_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    
    -- Attendance Details
    attending BOOLEAN NOT NULL DEFAULT 0,
    plus_one_count INTEGER DEFAULT 0,
    plus_one_names TEXT,  -- JSON array of names
    
    -- Event-Specific Attendance
    attending_ceremony BOOLEAN DEFAULT 1,
    attending_reception BOOLEAN DEFAULT 1,
    
    -- Dietary & Special Requests
    dietary_restrictions TEXT,  -- Vegetarian, Halal, Allergies, etc.
    special_requests TEXT,
    accommodation_needed BOOLEAN DEFAULT 0,
    
    -- Additional Info
    song_request TEXT,
    message TEXT,
    
    -- Metadata
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP,
    
    -- Admin
    admin_notes TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'declined', 'waitlist'))
);

-- Create indexes for common queries
CREATE INDEX idx_rsvps_email ON rsvps(email);
CREATE INDEX idx_rsvps_attending ON rsvps(attending);
CREATE INDEX idx_rsvps_status ON rsvps(status);
CREATE INDEX idx_rsvps_created_at ON rsvps(created_at DESC);

-- ============================================================================
-- Guest Wishes/Messages Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS wishes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Guest Information
    guest_name TEXT NOT NULL,
    email TEXT,
    
    -- Message Content
    message TEXT NOT NULL,
    
    -- Moderation
    approved BOOLEAN DEFAULT 0,
    approved_at TIMESTAMP,
    approved_by TEXT,
    rejected BOOLEAN DEFAULT 0,
    rejection_reason TEXT,
    
    -- Metadata
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Display Priority
    featured BOOLEAN DEFAULT 0,
    display_order INTEGER DEFAULT 0
);

CREATE INDEX idx_wishes_approved ON wishes(approved);
CREATE INDEX idx_wishes_created_at ON wishes(created_at DESC);
CREATE INDEX idx_wishes_featured ON wishes(featured, display_order);

-- ============================================================================
-- Photo Gallery Metadata
-- ============================================================================
CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Storage Information
    r2_key TEXT UNIQUE NOT NULL,  -- Path in R2 bucket
    r2_bucket TEXT NOT NULL,
    file_size_bytes INTEGER,
    original_filename TEXT,
    
    -- Image Properties
    width INTEGER,
    height INTEGER,
    format TEXT,  -- jpeg, png, webp, heic
    
    -- Upload Information
    uploaded_by_name TEXT,
    uploaded_by_email TEXT,
    ip_address TEXT,
    
    -- Categorization
    category TEXT DEFAULT 'guest' CHECK(category IN ('ceremony', 'reception', 'guest', 'professional')),
    tags TEXT,  -- JSON array
    
    -- Moderation
    approved BOOLEAN DEFAULT 0,
    approved_at TIMESTAMP,
    approved_by TEXT,
    rejected BOOLEAN DEFAULT 0,
    rejection_reason TEXT,
    
    -- Display
    featured BOOLEAN DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    caption TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- EXIF data (optional)
    camera_make TEXT,
    camera_model TEXT,
    taken_at TIMESTAMP,
    location TEXT  -- Venue name or GPS coords if allowed
);

CREATE INDEX idx_photos_r2_key ON photos(r2_key);
CREATE INDEX idx_photos_category ON photos(category);
CREATE INDEX idx_photos_approved ON photos(approved);
CREATE INDEX idx_photos_featured ON photos(featured, display_order);
CREATE INDEX idx_photos_created_at ON photos(created_at DESC);

-- ============================================================================
-- Admin Users
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Credentials
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    
    -- Profile
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'admin' CHECK(role IN ('super_admin', 'admin', 'moderator')),
    
    -- Security
    last_login_at TIMESTAMP,
    last_login_ip TEXT,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    
    -- Status
    active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_users_email ON admin_users(email);

-- ============================================================================
-- Admin Activity Log
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Admin
    admin_id INTEGER REFERENCES admin_users(id),
    admin_email TEXT,
    
    -- Action
    action TEXT NOT NULL,  -- 'approve_photo', 'approve_wish', 'update_rsvp', etc.
    resource_type TEXT,    -- 'photo', 'wish', 'rsvp'
    resource_id INTEGER,
    
    -- Details
    description TEXT,
    metadata TEXT,  -- JSON with additional context
    
    -- Request Info
    ip_address TEXT,
    user_agent TEXT,
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_activity_admin_id ON admin_activity_log(admin_id);
CREATE INDEX idx_admin_activity_created_at ON admin_activity_log(created_at DESC);

-- ============================================================================
-- Settings/Configuration
-- ============================================================================
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    value_type TEXT DEFAULT 'string' CHECK(value_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT
);

-- Insert default settings
INSERT OR IGNORE INTO settings (key, value, value_type, description) VALUES
('rsvp_deadline', '2025-11-15T23:59:59+07:00', 'string', 'RSVP deadline (ISO 8601 with Jakarta timezone)'),
('rsvp_open', 'true', 'boolean', 'Are RSVPs currently accepted?'),
('photo_upload_enabled', 'true', 'boolean', 'Can guests upload photos?'),
('max_photos_per_guest', '20', 'number', 'Maximum photos each guest can upload'),
('max_file_size_mb', '5', 'number', 'Maximum file size per photo in MB'),
('auto_approve_wishes', 'false', 'boolean', 'Auto-approve guest wishes without moderation?'),
('maintenance_mode', 'false', 'boolean', 'Is site in maintenance mode?'),
('wedding_ceremony_start', '2025-11-29T10:00:00+07:00', 'string', 'Ceremony start time'),
('wedding_reception_start', '2025-11-29T18:00:00+07:00', 'string', 'Reception start time');

-- ============================================================================
-- Email Queue (for async processing)
-- ============================================================================
CREATE TABLE IF NOT EXISTS email_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Recipient
    to_email TEXT NOT NULL,
    to_name TEXT,
    
    -- Email Content
    template TEXT NOT NULL,  -- 'rsvp-confirmation', 'reminder', etc.
    subject TEXT NOT NULL,
    html_body TEXT NOT NULL,
    text_body TEXT,
    
    -- Template Data
    template_data TEXT,  -- JSON with variables for template
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'sending', 'sent', 'failed')),
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    
    -- Error Tracking
    last_error TEXT,
    last_attempt_at TIMESTAMP,
    
    -- Resend Info
    resend_email_id TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP
);

CREATE INDEX idx_email_queue_status ON email_queue(status);
CREATE INDEX idx_email_queue_created_at ON email_queue(created_at DESC);

-- ============================================================================
-- Analytics/Metrics (optional, for tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS page_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Page Info
    path TEXT NOT NULL,
    referrer TEXT,
    
    -- User Info
    ip_address TEXT,
    user_agent TEXT,
    country TEXT,
    
    -- Timestamp
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_page_views_path ON page_views(path);
CREATE INDEX idx_page_views_viewed_at ON page_views(viewed_at DESC);
```

**Apply Migration:**
```bash
# Local development
wrangler d1 migrations apply wedding-preview --local

# Production (after testing)
wrangler d1 migrations apply wedding-production --remote
```

---

### Task 1.3: Database Utilities Library

**File:** `src/lib/db.ts`

```typescript
/**
 * Database utilities for Cloudflare D1
 * Provides type-safe query builders and helpers
 */

import type { D1Database, D1Result } from '@cloudflare/workers-types'

// ============================================================================
// Types
// ============================================================================

export interface RSVP {
  id: number
  guest_name: string
  email: string
  phone?: string
  attending: boolean
  plus_one_count: number
  plus_one_names?: string
  attending_ceremony: boolean
  attending_reception: boolean
  dietary_restrictions?: string
  special_requests?: string
  accommodation_needed: boolean
  song_request?: string
  message?: string
  ip_address?: string
  user_agent?: string
  created_at: string
  updated_at: string
  confirmed_at?: string
  admin_notes?: string
  status: 'pending' | 'confirmed' | 'declined' | 'waitlist'
}

export interface Wish {
  id: number
  guest_name: string
  email?: string
  message: string
  approved: boolean
  approved_at?: string
  approved_by?: string
  rejected: boolean
  rejection_reason?: string
  ip_address?: string
  user_agent?: string
  created_at: string
  featured: boolean
  display_order: number
}

export interface Photo {
  id: number
  r2_key: string
  r2_bucket: string
  file_size_bytes: number
  original_filename: string
  width?: number
  height?: number
  format: string
  uploaded_by_name?: string
  uploaded_by_email?: string
  ip_address?: string
  category: 'ceremony' | 'reception' | 'guest' | 'professional'
  tags?: string
  approved: boolean
  approved_at?: string
  approved_by?: string
  rejected: boolean
  rejection_reason?: string
  featured: boolean
  display_order: number
  caption?: string
  created_at: string
  updated_at: string
}

// ============================================================================
// Database Client
// ============================================================================

export class WeddingDB {
  constructor(private db: D1Database) {}

  // --------------------------------------------------------------------------
  // RSVP Methods
  // --------------------------------------------------------------------------

  async createRSVP(data: Partial<RSVP>): Promise<RSVP> {
    const result = await this.db
      .prepare(`
        INSERT INTO rsvps (
          guest_name, email, phone, attending, plus_one_count, plus_one_names,
          attending_ceremony, attending_reception, dietary_restrictions,
          special_requests, accommodation_needed, song_request, message,
          ip_address, user_agent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING *
      `)
      .bind(
        data.guest_name,
        data.email,
        data.phone || null,
        data.attending ? 1 : 0,
        data.plus_one_count || 0,
        data.plus_one_names ? JSON.stringify(data.plus_one_names) : null,
        data.attending_ceremony !== false ? 1 : 0,
        data.attending_reception !== false ? 1 : 0,
        data.dietary_restrictions || null,
        data.special_requests || null,
        data.accommodation_needed ? 1 : 0,
        data.song_request || null,
        data.message || null,
        data.ip_address || null,
        data.user_agent || null
      )
      .first<RSVP>()

    if (!result) throw new Error('Failed to create RSVP')
    return result
  }

  async getRSVPByEmail(email: string): Promise<RSVP | null> {
    return await this.db
      .prepare('SELECT * FROM rsvps WHERE email = ? LIMIT 1')
      .bind(email)
      .first<RSVP>()
  }

  async getAllRSVPs(filters?: {
    attending?: boolean
    status?: string
    limit?: number
    offset?: number
  }): Promise<RSVP[]> {
    let query = 'SELECT * FROM rsvps WHERE 1=1'
    const bindings: any[] = []

    if (filters?.attending !== undefined) {
      query += ' AND attending = ?'
      bindings.push(filters.attending ? 1 : 0)
    }

    if (filters?.status) {
      query += ' AND status = ?'
      bindings.push(filters.status)
    }

    query += ' ORDER BY created_at DESC'

    if (filters?.limit) {
      query += ' LIMIT ?'
      bindings.push(filters.limit)
    }

    if (filters?.offset) {
      query += ' OFFSET ?'
      bindings.push(filters.offset)
    }

    const result = await this.db.prepare(query).bind(...bindings).all<RSVP>()
    return result.results || []
  }

  async getRSVPStats(): Promise<{
    total: number
    attending: number
    declined: number
    pending: number
    total_guests: number
  }> {
    const stats = await this.db
      .prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN attending = 1 THEN 1 ELSE 0 END) as attending,
          SUM(CASE WHEN attending = 0 THEN 1 ELSE 0 END) as declined,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
          SUM(CASE WHEN attending = 1 THEN 1 + plus_one_count ELSE 0 END) as total_guests
        FROM rsvps
      `)
      .first<any>()

    return {
      total: stats?.total || 0,
      attending: stats?.attending || 0,
      declined: stats?.declined || 0,
      pending: stats?.pending || 0,
      total_guests: stats?.total_guests || 0,
    }
  }

  // --------------------------------------------------------------------------
  // Wish Methods
  // --------------------------------------------------------------------------

  async createWish(data: Partial<Wish>): Promise<Wish> {
    const result = await this.db
      .prepare(`
        INSERT INTO wishes (guest_name, email, message, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?)
        RETURNING *
      `)
      .bind(
        data.guest_name,
        data.email || null,
        data.message,
        data.ip_address || null,
        data.user_agent || null
      )
      .first<Wish>()

    if (!result) throw new Error('Failed to create wish')
    return result
  }

  async getApprovedWishes(limit = 50): Promise<Wish[]> {
    const result = await this.db
      .prepare(`
        SELECT * FROM wishes 
        WHERE approved = 1 AND rejected = 0
        ORDER BY featured DESC, display_order ASC, created_at DESC
        LIMIT ?
      `)
      .bind(limit)
      .all<Wish>()

    return result.results || []
  }

  async getPendingWishes(): Promise<Wish[]> {
    const result = await this.db
      .prepare(`
        SELECT * FROM wishes 
        WHERE approved = 0 AND rejected = 0
        ORDER BY created_at ASC
      `)
      .all<Wish>()

    return result.results || []
  }

  async approveWish(id: number, approvedBy: string): Promise<void> {
    await this.db
      .prepare(`
        UPDATE wishes 
        SET approved = 1, approved_at = CURRENT_TIMESTAMP, approved_by = ?
        WHERE id = ?
      `)
      .bind(approvedBy, id)
      .run()
  }

  // --------------------------------------------------------------------------
  // Photo Methods
  // --------------------------------------------------------------------------

  async createPhoto(data: Partial<Photo>): Promise<Photo> {
    const result = await this.db
      .prepare(`
        INSERT INTO photos (
          r2_key, r2_bucket, file_size_bytes, original_filename,
          width, height, format, uploaded_by_name, uploaded_by_email,
          ip_address, category, tags
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING *
      `)
      .bind(
        data.r2_key,
        data.r2_bucket,
        data.file_size_bytes,
        data.original_filename,
        data.width || null,
        data.height || null,
        data.format,
        data.uploaded_by_name || null,
        data.uploaded_by_email || null,
        data.ip_address || null,
        data.category || 'guest',
        data.tags ? JSON.stringify(data.tags) : null
      )
      .first<Photo>()

    if (!result) throw new Error('Failed to create photo record')
    return result
  }

  async getApprovedPhotos(category?: string, limit = 100): Promise<Photo[]> {
    let query = `
      SELECT * FROM photos 
      WHERE approved = 1 AND rejected = 0
    `
    const bindings: any[] = []

    if (category) {
      query += ' AND category = ?'
      bindings.push(category)
    }

    query += ' ORDER BY featured DESC, display_order ASC, created_at DESC LIMIT ?'
    bindings.push(limit)

    const result = await this.db.prepare(query).bind(...bindings).all<Photo>()
    return result.results || []
  }

  // --------------------------------------------------------------------------
  // Settings Methods
  // --------------------------------------------------------------------------

  async getSetting(key: string): Promise<any> {
    const result = await this.db
      .prepare('SELECT value, value_type FROM settings WHERE key = ?')
      .bind(key)
      .first<{ value: string; value_type: string }>()

    if (!result) return null

    // Parse value based on type
    switch (result.value_type) {
      case 'boolean':
        return result.value === 'true'
      case 'number':
        return parseFloat(result.value)
      case 'json':
        return JSON.parse(result.value)
      default:
        return result.value
    }
  }

  async updateSetting(key: string, value: any, updatedBy: string): Promise<void> {
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value)
    
    await this.db
      .prepare(`
        UPDATE settings 
        SET value = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ?
        WHERE key = ?
      `)
      .bind(stringValue, updatedBy, key)
      .run()
  }
}

// ============================================================================
// Helper function to get DB instance
// ============================================================================

export function getDB(env: any): WeddingDB {
  if (!env.DB) {
    throw new Error('D1 database binding (DB) not found in environment')
  }
  return new WeddingDB(env.DB)
}
```

---

### Task 1.4: Zod Validation Schemas

**File:** `src/lib/validators.ts`

```typescript
/**
 * Zod validation schemas for wedding website
 * Used for type-safe form validation and API request validation
 */

import { z } from 'zod'

// ============================================================================
// RSVP Validation
// ============================================================================

export const RSVPSchema = z.object({
  guest_name: z.string()
    .min(2, 'Nama minimal 2 karakter')
    .max(100, 'Nama maksimal 100 karakter')
    .regex(/^[a-zA-Z\s.'-]+$/, 'Nama hanya boleh huruf, spasi, dan tanda baca'),
  
  email: z.string()
    .email('Email tidak valid')
    .toLowerCase()
    .trim(),
  
  phone: z.string()
    .regex(/^(\+62|62|0)[0-9]{9,12}$/, 'Nomor telepon Indonesia tidak valid')
    .optional()
    .transform(val => val?.replace(/^0/, '+62')), // Normalize to +62
  
  attending: z.boolean(),
  
  plus_one_count: z.number()
    .int()
    .min(0, 'Jumlah tamu tidak boleh negatif')
    .max(5, 'Maksimal 5 tamu tambahan')
    .default(0),
  
  plus_one_names: z.array(z.string()).optional(),
  
  attending_ceremony: z.boolean().default(true),
  attending_reception: z.boolean().default(true),
  
  dietary_restrictions: z.string()
    .max(500, 'Pembatasan diet maksimal 500 karakter')
    .optional(),
  
  special_requests: z.string()
    .max(1000, 'Permintaan khusus maksimal 1000 karakter')
    .optional(),
  
  accommodation_needed: z.boolean().default(false),
  
  song_request: z.string()
    .max(200, 'Permintaan lagu maksimal 200 karakter')
    .optional(),
  
  message: z.string()
    .max(500, 'Pesan maksimal 500 karakter')
    .optional(),
})

export type RSVPInput = z.infer<typeof RSVPSchema>

// ============================================================================
// Wish Validation
// ============================================================================

export const WishSchema = z.object({
  guest_name: z.string()
    .min(2, 'Nama minimal 2 karakter')
    .max(100, 'Nama maksimal 100 karakter'),
  
  email: z.string()
    .email('Email tidak valid')
    .toLowerCase()
    .optional(),
  
  message: z.string()
    .min(10, 'Ucapan minimal 10 karakter')
    .max(1000, 'Ucapan maksimal 1000 karakter')
    .refine(
      msg => !containsSpam(msg),
      'Pesan mengandung konten yang tidak pantas'
    ),
})

export type WishInput = z.infer<typeof WishSchema>

// Spam detection helper
function containsSpam(text: string): boolean {
  const spamKeywords = [
    'viagra', 'casino', 'lottery', 'bitcoin', 'cryptocurrency',
    'http://', 'https://', 'www.', '.com', '.net', '.org',
    'click here', 'buy now', 'limited offer'
  ]
  
  const lowerText = text.toLowerCase()
  return spamKeywords.some(keyword => lowerText.includes(keyword))
}

// ============================================================================
// Photo Upload Validation
// ============================================================================

export const PhotoUploadSchema = z.object({
  uploaded_by_name: z.string()
    .min(2, 'Nama minimal 2 karakter')
    .max(100, 'Nama maksimal 100 karakter'),
  
  uploaded_by_email: z.string()
    .email('Email tidak valid')
    .toLowerCase()
    .optional(),
  
  category: z.enum(['ceremony', 'reception', 'guest', 'professional'])
    .default('guest'),
  
  caption: z.string()
    .max(500, 'Caption maksimal 500 karakter')
    .optional(),
})

export type PhotoUploadInput = z.infer<typeof PhotoUploadSchema>

// ============================================================================
// Admin Login Validation
// ============================================================================

export const AdminLoginSchema = z.object({
  email: z.string()
    .email('Email tidak valid')
    .toLowerCase(),
  
  password: z.string()
    .min(8, 'Password minimal 8 karakter'),
})

export type AdminLoginInput = z.infer<typeof AdminLoginSchema>

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '')  // Remove < and >
    .replace(/javascript:/gi, '')  // Remove javascript: protocol
    .replace(/on\w+=/gi, '')  // Remove event handlers
}

/**
 * Validate Indonesian phone number and normalize format
 */
export function validateIndonesianPhone(phone: string): string | null {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Check for valid Indonesian phone patterns
  if (/^(62|0)8\d{8,11}$/.test(cleaned)) {
    // Normalize to +62 format
    return '+62' + cleaned.replace(/^(62|0)/, '')
  }
  
  return null
}

/**
 * Check if email domain is valid (basic check)
 */
export function isValidEmailDomain(email: string): boolean {
  const commonDomains = [
    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
    'icloud.com', 'protonmail.com', 'zoho.com'
  ]
  
  const domain = email.split('@')[1]?.toLowerCase()
  
  // Check for common domains or valid Indonesian domains
  return commonDomains.includes(domain) || 
         domain.endsWith('.co.id') || 
         domain.endsWith('.id')
}
```

---

## ⚡ Continue with remaining phases...

Due to length constraints, the full PLAN.md includes:

- **Phase 2:** API Routes Implementation (routeLoader$, routeAction$ patterns)
- **Phase 3:** Email Integration (Resend, SPF/DKIM/DMARC setup)
- **Phase 4:** Admin Dashboard (protected routes, CRUD operations)
- **Phase 5:** PWA & Offline (service worker, IndexedDB queue)
- **Phase 6:** R2 Photo Storage (signed URLs, Sharp processing)
- **Phase 7:** Security Hardening (CSP, rate limiting, CORS)
- **Phase 8:** Performance Optimization (Core Web Vitals)
- **Phase 9:** Production Deployment (Cloudflare Pages)
- **Phase 10:** Monitoring & Analytics

---

## 📋 IMMEDIATE NEXT STEPS (This Week)

1. **Create Cloudflare Resources** (30 minutes)
   ```bash
   wrangler login
   wrangler d1 create wedding-production
   wrangler r2 bucket create wedding-photos-production
   ```

2. **Set Up wrangler.toml** (15 minutes)
   - Copy configuration from Task 1.1 above
   - Update database_id and bucket names from step 1

3. **Apply Database Schema** (10 minutes)
   ```bash
   wrangler d1 migrations apply wedding-production --remote
   ```

4. **Configure Environment Variables** (20 minutes)
   ```bash
   wrangler secret put AUTH_SECRET
   wrangler secret put RESEND_API_KEY
   wrangler secret put ADMIN_PASSWORD_HASH
   ```

5. **Create First API Route** (45 minutes)
   - Implement `src/routes/api/rsvp/index.ts` with routeAction$
   - Test with Postman or curl

6. **Test Local Development** (30 minutes)
   ```bash
   npm run dev
   # Visit http://localhost:5173
   ```

**Total Time:** ~2.5 hours to complete infrastructure foundation

---

## 💰 COST TRACKING & OPTIMIZATION

### Monthly Cost Breakdown (Expected)

| Service | Free Tier | Expected Usage | Cost |
|---------|-----------|----------------|------|
| Cloudflare Pages | Unlimited | 100% coverage | $0 |
| D1 Database | 25M reads, 5GB | ~100K reads, 50MB | $0 |
| R2 Storage | 10GB, unlimited egress | 2-4GB photos | $0 |
| Workers | 100K req/day | ~5-15K req/day | $0 |
| Resend Email | 3K emails/month | ~650 emails | $0 |
| Domain (annual) | - | - | $1/month |
| **TOTAL** | | | **$0-1/month** |

### Scaling Scenarios

**Scenario 1: Viral Wedding (10x traffic)**
- Pages: Still free
- D1: ~$2/month (1M reads @ $0.50/M)
- R2: ~$3/month (20GB storage)
- Workers: ~$5/month (1M requests @ $0.50/M)
- **Total: ~$10/month**

**Scenario 2: Professional Features**
- Add Cloudflare Images ($5/month for optimization)
- Add Enhanced Analytics ($5/month)
- **Total: ~$10-15/month**

---

## ✅ SUCCESS CRITERIA CHECKLIST

### Phase 1 Complete When:
- [ ] Cloudflare account set up with Workers Paid plan
- [ ] wrangler.toml configured with D1, R2, KV bindings
- [ ] Database schema applied to production D1
- [ ] Local development environment working
- [ ] First API endpoint responds successfully
- [ ] Environment secrets configured

### Project Complete When:
- [ ] 95%+ RSVP completion rate achieved
- [ ] Core Web Vitals: LCP <2.5s, INP <200ms, CLS <0.1
- [ ] 99%+ email delivery rate
- [ ] Zero critical security vulnerabilities
- [ ] < $25/month operating cost
- [ ] Mobile-first design tested on Indonesian networks
- [ ] Offline functionality working
- [ ] Admin dashboard fully functional
- [ ] All tests passing (unit, integration, E2E)
- [ ] Monitoring and alerting configured

---

## 🚨 RISK MITIGATION

| Risk | Probability | Impact | Mitigation |
|------|-------------|---------|------------|
| Traffic spike crashes site | Medium | High | Cloudflare's auto-scaling, CDN caching, rate limiting |
| Data loss during migration | Low | Critical | Database backups before each migration, test in preview first |
| Email deliverability issues | Medium | High | SPF/DKIM/DMARC setup, domain warming, Resend's infrastructure |
| Indonesian network too slow | High | Medium | Aggressive caching, PWA offline mode, WebP images, adaptive quality |
| Cost overruns | Low | Medium | Billing alerts at $10/$25/$50, free tier monitoring |
| Security breach | Low | Critical | CSP headers, rate limiting, input sanitization, audit logging |
| Timeline delays | Medium | Medium | 2-week buffer, prioritize MVP features, parallel development |

---

**This plan is a living document. Update weekly as implementation progresses.**

**Last Updated:** January 2025 | **Next Review:** February 2025