import { component$ } from "@builder.io/qwik";

export const HeroSectionSimple = component$(() => {
  return (
    <section
      style={{
        minHeight: "100vh",
        backgroundColor: "#f0e3d9",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 16px",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: "1024px", margin: "0 auto" }}>
        <p
          style={{
            color: "#998066",
            fontSize: "24px",
            marginBottom: "16px",
            fontWeight: "300",
          }}
        >
          We're Getting Married!
        </p>

        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "72px",
            color: "#4d3326",
            marginBottom: "24px",
            fontWeight: "300",
          }}
        >
          Alfina & Mugni
        </h1>

        <div
          style={{
            width: "128px",
            height: "2px",
            backgroundColor: "#b2804d",
            margin: "0 auto 24px",
          }}
        ></div>

        <p
          style={{
            color: "#80664d",
            fontSize: "32px",
            marginBottom: "32px",
            fontWeight: "400",
          }}
        >
          November 29, 2025
        </p>

        <p
          style={{
            color: "#998066",
            fontSize: "20px",
            marginBottom: "48px",
            maxWidth: "512px",
            margin: "0 auto",
          }}
        >
          Join us for a celebration of love
        </p>
      </div>
    </section>
  );
});
