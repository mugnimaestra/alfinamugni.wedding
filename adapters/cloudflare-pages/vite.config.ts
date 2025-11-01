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
        // SSG temporarily disabled for invitation cover feature
        // The invitation cover uses client-side audio and animations
        // All pages will use SSR instead
        // TODO: Re-enable SSG after fixing serialization issues
        // ssg: {
        //   include: ['/'],
        //   origin: 'https://alfinamugni.wedding',
        // },
      }),
    ],
  };
});
