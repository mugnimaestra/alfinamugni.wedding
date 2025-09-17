# Deployment Guide

This guide covers the deployment process for the Qwik wedding website, including build optimization, hosting, and production configuration.

## 🚀 Build Process

### Development Build

```bash
# Start development server
npm run dev
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Build Optimization

The production build includes:

- **Code Splitting**: Automatic chunking for optimal loading
- **Minification**: JavaScript and CSS minification
- **Tree Shaking**: Removal of unused code
- **Image Optimization**: Automatic image compression
- **Font Optimization**: Self-hosted fonts with preloading

### Build Output

```
dist/
├── build/                 # JavaScript chunks
│   ├── q-main-*.js       # Main application chunk
│   ├── q-*.js            # Component chunks (lazy-loaded)
│   └── q-manifest.json   # Build manifest
├── assets/               # Static assets
│   └── *.css            # Optimized CSS
├── favicon.svg          # Favicon
├── manifest.json        # Web app manifest
├── robots.txt          # Search engine crawling
└── index.html          # Entry point
```

## 🏗️ Hosting Options

### 1. Vercel (Recommended)

**Why Vercel?**
- Optimized for Qwik applications
- Automatic deployments from Git
- Global CDN
- Serverless functions support
- Free tier available

**Setup Steps:**

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Login to Vercel
   vercel login

   # Deploy (from project root)
   vercel
   ```

2. **Vercel Configuration**
   ```json
   // vercel.json
   {
     "framework": "qwik",
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

3. **Environment Variables**
   ```bash
   # Set environment variables
   vercel env add NODE_ENV
   vercel env add VITE_API_URL
   ```

### 2. Netlify

**Setup Steps:**

1. **Connect Repository**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli

   # Login to Netlify
   netlify login

   # Deploy
   netlify deploy --prod --dir=dist
   ```

2. **Netlify Configuration**
   ```toml
   # netlify.toml
   [build]
     command = "npm run build"
     publish = "dist"

   [build.environment]
     NODE_VERSION = "18"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

### 3. Cloudflare Pages

**Setup Steps:**

1. **Connect Repository**
   ```bash
   # Install Wrangler CLI
   npm install -g wrangler

   # Login to Cloudflare
   wrangler auth login

   # Deploy
   wrangler pages deploy dist
   ```

2. **Wrangler Configuration**
   ```toml
   # wrangler.toml
   name = "wedding-website"
   compatibility_date = "2024-01-01"

   [pages_build_output_dir]
   dir = "dist"
   ```

### 4. Traditional Hosting

For traditional hosting providers:

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Upload the `dist` folder** to your web server

3. **Configure server for SPA routing** (handle 404s by serving index.html)

   **Apache (.htaccess):**
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

   **Nginx:**
   ```nginx
   server {
     listen 80;
     server_name your-domain.com;
     root /path/to/dist;
     index index.html;

     location / {
       try_files $uri $uri/ /index.html;
     }
   }
   ```

## ⚙️ Production Configuration

### Environment Variables

Create `.env.production` file:

```bash
# Application
NODE_ENV=production
VITE_APP_TITLE="Alfina & Mugni's Wedding"

# API Configuration
VITE_API_BASE_URL=https://api.your-domain.com
VITE_RSVP_ENDPOINT=/api/rsvp
VITE_CONTACT_ENDPOINT=/api/contact

# Analytics (Optional)
VITE_GA_TRACKING_ID=GA_MEASUREMENT_ID
VITE_MIXPANEL_TOKEN=your_mixpanel_token

# Email Service (for RSVP confirmations)
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_USER_ID=your_user_id
```

### Build Configuration

Update `vite.config.ts` for production:

```typescript
import { defineConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { qwikCity } from '@builder.io/qwik-city/vite';

export default defineConfig(({ mode }) => ({
  plugins: [qwikCity(), qwikVite()],
  build: {
    target: 'esnext',
    minify: mode === 'production',
    sourcemap: mode === 'development',
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
}));
```

### Performance Optimization

#### 1. Image Optimization

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { imagetools } from 'vite-imagetools';

export default defineConfig({
  plugins: [
    imagetools({
      defaultDirectives: new URLSearchParams({
        format: 'webp',
        quality: '80',
        width: '400;800;1200',
      }),
    }),
  ],
});
```

#### 2. Bundle Analysis

```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist/stats.html
```

#### 3. Compression

Enable gzip/brotli compression on your server:

**Nginx:**
```nginx
server {
  gzip on;
  gzip_types text/css application/javascript application/json;
  brotli on;
  brotli_types text/css application/javascript application/json;
}
```

## 🔍 Monitoring & Analytics

### Performance Monitoring

```typescript
// src/utils/performance.ts
export const measurePerformance = () => {
  // Core Web Vitals
  if (typeof window !== 'undefined') {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(console.log);
      getFID(console.log);
      getFCP(console.log);
      getLCP(console.log);
      getTTFB(console.log);
    });
  }
};

// src/root.tsx
import { measurePerformance } from '~/utils/performance';

export default component$(() => {
  useVisibleTask$(() => {
    measurePerformance();
  });

  return <Slot />;
});
```

### Error Tracking

```typescript
// src/utils/error-tracking.ts
export const initErrorTracking = () => {
  window.addEventListener('error', (event) => {
    // Send to error tracking service
    console.error('Global error:', event.error);
  });

  window.addEventListener('unhandledrejection', (event) => {
    // Send to error tracking service
    console.error('Unhandled promise rejection:', event.reason);
  });
};
```

### Analytics Integration

```typescript
// src/utils/analytics.ts
export const initAnalytics = () => {
  // Google Analytics
  if (import.meta.env.VITE_GA_TRACKING_ID) {
    // Initialize GA
  }

  // Custom events
  const trackEvent = (event: string, data?: any) => {
    // Send to analytics service
  };

  return { trackEvent };
};
```

## 🔒 Security Considerations

### Content Security Policy

```html
<!-- index.html -->
<meta
  http-equiv="Content-Security-Policy"
  content="
    default-src 'self';
    script-src 'self' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self';
    connect-src 'self' https://api.your-domain.com;
  "
/>
```

### HTTPS Configuration

Ensure HTTPS is enabled:

```nginx
server {
  listen 443 ssl http2;
  server_name your-domain.com;

  ssl_certificate /path/to/cert.pem;
  ssl_certificate_key /path/to/key.pem;

  # SSL configuration
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
  ssl_prefer_server_ciphers off;
}
```

### Environment Variable Security

Never commit sensitive data:

```bash
# .gitignore
.env
.env.local
.env.production
.env.staging
```

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] Run `npm run build` successfully
- [ ] Test production build with `npm run preview`
- [ ] Verify all environment variables are set
- [ ] Check bundle size is reasonable
- [ ] Test all routes and functionality
- [ ] Verify responsive design on different devices
- [ ] Check accessibility with automated tools

### Deployment Steps

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Deploy to Hosting Provider**
   ```bash
   # Vercel
   vercel --prod

   # Netlify
   netlify deploy --prod --dir=dist

   # Manual
   rsync -avz dist/ user@server:/path/to/website/
   ```

3. **Configure Domain**
   - Point domain to hosting provider
   - Set up SSL certificate
   - Configure DNS settings

4. **Post-Deployment Verification**
   - Check website loads correctly
   - Verify all links work
   - Test forms and interactions
   - Monitor performance metrics
   - Check console for errors

### Monitoring

- [ ] Set up uptime monitoring
- [ ] Configure error tracking
- [ ] Enable performance monitoring
- [ ] Set up analytics tracking
- [ ] Monitor Core Web Vitals

## 🐛 Troubleshooting

### Common Issues

#### Build Failures

```bash
# Clear cache and rebuild
rm -rf node_modules/.cache
npm run build
```

#### Routing Issues

Ensure server is configured to handle SPA routing:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

#### Performance Issues

1. **Large Bundle Size**
   ```bash
   # Analyze bundle
   npx vite-bundle-analyzer dist
   ```

2. **Slow Loading**
   - Enable compression
   - Optimize images
   - Use CDN for assets
   - Implement lazy loading

#### Environment Variables

```bash
# Check environment variables
console.log(import.meta.env);
```

## 📊 Performance Benchmarks

### Expected Performance Metrics

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms
- **Bundle Size**: < 200KB (gzipped)

### Monitoring Tools

- **Lighthouse**: Built-in Chrome DevTools
- **WebPageTest**: Online performance testing
- **Google PageSpeed Insights**: Performance scoring
- **Bundle Analyzer**: Bundle size analysis

## 🎯 Success Metrics

### Technical Metrics
- ✅ 95+ Lighthouse Performance Score
- ✅ < 3 second page load time
- ✅ < 100KB initial bundle size
- ✅ 100% accessibility score

### User Experience Metrics
- ✅ Fast loading on mobile devices
- ✅ Smooth animations and transitions
- ✅ Intuitive navigation
- ✅ Accessible to all users

### Business Metrics
- ✅ RSVP form completion rate > 80%
- ✅ Mobile user engagement > 60%
- ✅ Positive user feedback
- ✅ Low bounce rate

This deployment guide ensures your Qwik wedding website is production-ready with optimal performance, security, and user experience.
