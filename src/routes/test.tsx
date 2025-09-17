import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { HeroSectionSimple } from "../components/hero-section-simple";

export default component$(() => {
  return (
    <>
      <HeroSectionSimple />
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          backgroundColor: "#ffffff",
        }}
      >
        <h2
          style={{ color: "#4d3326", fontSize: "48px", marginBottom: "20px" }}
        >
          Wedding Invitation Test
        </h2>
        <p style={{ color: "#80664d", fontSize: "18px" }}>
          This is a test page to verify the wedding invitation is working
          properly.
        </p>
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "Test - Wedding Invitation",
  meta: [
    {
      name: "description",
      content: "Test page for wedding invitation",
    },
  ],
};
