import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { GalleryUploadSection } from "../../components/gallery-upload-section";

export default component$(() => {
  return (
    <>
      <GalleryUploadSection />
    </>
  );
});

export const head: DocumentHead = {
  title: "Wedding Gallery - Alfina & Mugni",
  meta: [
    {
      name: "description",
      content: "Share and view wedding moments from Alfina & Mugni's special day.",
    },
    {
      property: "og:title",
      content: "Wedding Gallery - Alfina & Mugni",
    },
    {
      property: "og:description",
      content: "Share and view wedding moments from Alfina & Mugni's special day.",
    },
    {
      property: "og:type",
      content: "website",
    },
  ],
};