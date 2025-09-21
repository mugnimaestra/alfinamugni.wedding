import { component$ } from "@builder.io/qwik";
import type { RequestHandler, DocumentHead } from "@builder.io/qwik-city";

// Redirect admin root to dashboard
export const onRequest: RequestHandler = async ({ redirect }) => {
  throw redirect(302, "/admin/dashboard");
};

export default component$(() => {
  return (
    <div class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <h2 class="text-2xl font-semibold text-gray-900 mb-2">Redirecting...</h2>
        <p class="text-gray-600">Taking you to the admin dashboard</p>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Admin Dashboard - Alfina & Mugni",
  meta: [
    {
      name: "description",
      content: "Redirecting to admin dashboard for managing wedding data",
    },
  ],
};