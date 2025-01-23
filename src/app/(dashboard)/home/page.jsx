"use client";

import React from "react";

export default function Page() {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", lineHeight: "1.6" }}>
      {/* Hero Section */}
      <header
        style={{
          background: "linear-gradient(to right, #1e88e5, #64b5f6)",
          color: "#fff",
          padding: "50px 20px",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "2.5rem", margin: "0" }}>ISMS Platform</h1>
        <p style={{ fontSize: "1.2rem", marginTop: "10px" }}>
          Simplify ISO 27001:2022 Compliance with Confidence
        </p>
        <button
          style={{
            background: "#fff",
            color: "#1e88e5",
            padding: "10px 20px",
            fontSize: "1rem",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginTop: "20px",
          }}
        >
          Get Started
        </button>
      </header>

      {/* About Section */}
      <section style={{ padding: "40px 20px", textAlign: "center" }}>
        <h2>What is ISMS Platform?</h2>
        <p>
          The ISMS Platform is your trusted solution to assess and verify
          compliance with ISO 27001:2022 standards. Upload your company’s
          information, and let our experts handle the rest.
        </p>
      </section>

      {/* Features Section */}
      <section style={{ backgroundColor: "#f5f5f5", padding: "40px 20px" }}>
        <h2 style={{ textAlign: "center" }}>Key Features</h2>
        <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap" }}>
          <div style={{ flex: "0 1 300px", margin: "20px" }}>
            <h3>Easy to Use</h3>
            <p>Our platform is designed for simplicity and efficiency.</p>
          </div>
          <div style={{ flex: "0 1 300px", margin: "20px" }}>
            <h3>Accurate Assessments</h3>
            <p>Get detailed reports tailored to your company’s compliance needs.</p>
          </div>
          <div style={{ flex: "0 1 300px", margin: "20px" }}>
            <h3>Expert Review</h3>
            <p>Our certified professionals ensure precise evaluations.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ padding: "40px 20px", textAlign: "center" }}>
        <h2>How It Works</h2>
        <ol style={{ textAlign: "left", maxWidth: "600px", margin: "0 auto" }}>
          <li>Sign up and log in to your account.</li>
          <li>Upload your company’s documents for review.</li>
          <li>Receive detailed feedback and compliance reports.</li>
          <li>Work with our experts to address any gaps.</li>
        </ol>
      </section>

      {/* Testimonials Section */}
      <section style={{ backgroundColor: "#e3f2fd", padding: "40px 20px" }}>
        <h2 style={{ textAlign: "center" }}>What Our Clients Say</h2>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <blockquote
            style={{
              fontStyle: "italic",
              background: "#fff",
              padding: "20px",
              borderRadius: "5px",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
              marginTop: "20px",
            }}
          >
            The ISMS Platform made our ISO 27001 journey seamless and stress-free.
            Highly recommend it! - Jane Doe, CTO of SecureTech
          </blockquote>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: "#1e88e5",
          color: "#fff",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <p>&copy; 2025 ISMS Platform. All rights reserved.</p>
        <p>
          Follow us on{" "}
          <a
            href="#"
            style={{ color: "#fff", textDecoration: "underline" }}
          >
            LinkedIn
          </a>{" "}
          |{" "}
          <a
            href="#"
            style={{ color: "#fff", textDecoration: "underline" }}
          >
            Twitter
          </a>
        </p>
      </footer>
    </div>
  );
}
