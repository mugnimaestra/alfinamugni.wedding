import { cloudflarePagesAdapter } from '@builder.io/qwik-city/adapters/cloudflare-pages/vite';
import { extendConfig } from '@builder.io/qwik-city/vite';
import baseConfig from '../../vite.config';

export default extendConfig(baseConfig, () => {
  return {
    build: {
      ssr: true,
      rollupOptions: {
        input: ['src/entry.cloudflare-pages.tsx', '@qwik-city-plan'],
      },
    },
    plugins: [
      cloudflarePagesAdapter({
        // Enable Static Site Generation for main public pages only
        // Gallery, admin, and auth pages are dynamic (SSR) because they need:
        // - User authentication (admin/auth)
        // - Dynamic photo loading (gallery)
        // - Database access
        ssg: {
          include: ['/'],  // Only pre-generate the homepage (has all main content)
          origin: 'https://alfinamugni.wedding', // Your production domain
        },
      }),
    ],
  };
});
