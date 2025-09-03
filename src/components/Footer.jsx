//Location - src/components/Footer.jsx
//file name - Footer.jsx

"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer
      style={{
        marginTop: "3rem",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        overflow: "hidden",
        boxShadow: "0 -2px 0 #d7d7d7",
        background:
          "radial-gradient(120% 160% at 10% 0%, #F4E7F7 0%, #CDB4E7 45%, #9D8FC2 100%)",
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "1.75rem 1rem 2rem",
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr 1fr 1.4fr",
          gap: "1.25rem",
        }}
      >
        {/* Brand */}
        <div>
          <div
            style={{
              fontWeight: 800,
              fontSize: "1.25rem",
              color: "#1d133f",
              letterSpacing: 0.2,
            }}
          >
            Sleeping AI
          </div>
        </div>

        {/* Details */}
        <nav aria-label="Footer – Details">
          <h4 style={headingStyle}>Details</h4>
          <ul style={listStyle}>
            <li><Link href="/" style={linkStyle}>Home</Link></li>
            <li><Link href="/generate" style={linkStyle}>Generate</Link></li>
            <li><Link href="/community" style={linkStyle}>Community portal</Link></li>
            <li><Link href="/profile" style={linkStyle}>Profile</Link></li>
          </ul>
        </nav>

        {/* Contact */}
        <nav aria-label="Footer – Contact">
          <h4 style={headingStyle}>Contact</h4>
          <ul style={listStyle}>
            <li><Link href="/contact" style={linkStyle}>Contact Us</Link></li>
            <li><Link href="https://www.linkedin.com" target="_blank" rel="noopener" style={linkStyle}>LinkedIn</Link></li>
            <li><Link href="https://www.instagram.com" target="_blank" rel="noopener" style={linkStyle}>Instagram</Link></li>
            <li><Link href="https://twitter.com" target="_blank" rel="noopener" style={linkStyle}>Twitter</Link></li>
          </ul>
        </nav>

        {/* Newsletter */}
        <div>
          <h4 style={headingStyle}>Join our newsletter</h4>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const email = new FormData(e.currentTarget).get("email");
              alert(`Thanks! We’ll keep you posted: ${email}`);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 0,
              background: "#563f99",
              borderRadius: 999,
              padding: 6,
              boxShadow: "inset 0 0 0 2px rgba(0,0,0,0.1)",
              maxWidth: 460,
            }}
          >
            <input
              name="email"
              type="email"
              required
              placeholder="Email Address"
              aria-label="Email Address"
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "rgba(255,255,255,0.9)",
                padding: "0.7rem 1rem",
                fontSize: 16,
                fontStyle: "italic",
              }}
            />
            <button
              type="submit"
              style={{
                background: "#98A66C", // olive-ish
                color: "#1d133f",
                fontWeight: 700,
                border: "none",
                borderRadius: 999,
                padding: "0.6rem 1.1rem",
                marginLeft: 6,
                minWidth: 92,
                cursor: "pointer",
                boxShadow: "0 2px 0 rgba(0,0,0,0.15)",
              }}
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </footer>
  );
}

const headingStyle = {
  margin: "0 0 0.5rem 0",
  color: "#1d133f",
  fontWeight: 700,
};

const listStyle = {
  listStyle: "none",
  padding: 0,
  margin: 0,
  display: "grid",
  gap: 6,
};

const linkStyle = {
  color: "#1d133f",
  textDecoration: "none",
};
