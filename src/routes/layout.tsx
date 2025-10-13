import { component$, Slot } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';

export default component$(() => {
  return <Slot />;
});

export const head: DocumentHead = {
  title: 'Alfina & Mugni Wedding',
  meta: [
    {
      name: 'description',
      content: 'Join us in celebrating our special day - Alfina & Mugni Wedding',
    },
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1',
    },
    {
      name: 'theme-color',
      content: '#8B7355',
    },
    {
      property: 'og:title',
      content: 'Alfina & Mugni Wedding',
    },
    {
      property: 'og:description',
      content: 'Join us in celebrating our special day',
    },
    {
      property: 'og:type',
      content: 'website',
    },
    {
      name: 'twitter:card',
      content: 'summary_large_image',
    },
    {
      name: 'twitter:title',
      content: 'Alfina & Mugni Wedding',
    },
    {
      name: 'twitter:description',
      content: 'Join us in celebrating our special day',
    },
  ],
};