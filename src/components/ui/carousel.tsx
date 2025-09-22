import { component$, type QwikIntrinsicElements, Slot } from "@builder.io/qwik";
import { cn } from "~/lib/utils";

type CarouselProps = QwikIntrinsicElements["div"];

export const Carousel = component$<CarouselProps>(({ class: className, ...props }) => {
  return (
    <div
      role="region"
      aria-roledescription="carousel"
      class={cn("relative", className)}
      {...props}
    >
      <Slot />
    </div>
  );
});

export const CarouselContent = component$(() => {
  return (
    <div class="flex overflow-hidden">
      <Slot />
    </div>
  );
});

export const CarouselItem = component$(() => {
  return (
    <div role="group" aria-roledescription="slide" class="min-w-full">
      <Slot />
    </div>
  );
});

export const CarouselPrevious = component$(() => {
  return (
    <button
      type="button"
      class="absolute h-8 w-8 rounded-full bg-background border shadow-md left-4 top-1/2 -translate-y-1/2"
    >
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      <span class="sr-only">Previous slide</span>
    </button>
  );
});

export const CarouselNext = component$(() => {
  return (
    <button
      type="button"
      class="absolute h-8 w-8 rounded-full bg-background border shadow-md right-4 top-1/2 -translate-y-1/2"
    >
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <span class="sr-only">Next slide</span>
    </button>
  );
});
