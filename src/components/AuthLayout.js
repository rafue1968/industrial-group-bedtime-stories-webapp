"use client";

export default function AuthLayout({ title, subtitle, illustrationSrc, illustrationAlt, children }) {
  return (
    <main
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "'Poppins', sans-serif",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F9F6FB",
      }}
    >
      {/* Centered Card */}
      <div
        style={{
          display: "flex",
          backgroundColor: "white",
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          overflow: "hidden",
          maxWidth: "900px",
          width: "100%",
        }}
      >
        {/* Left side with illustration */}
        <div
          style={{
            flex: 1,
            background: "linear-gradient(135deg, #EDE1F6, #D2B6F0, #B99DD0)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "2rem",
            textAlign: "center",
            color: "#3E1D84",
          }}
        >
          <h1 style={{ marginBottom: "0.2rem", fontSize: "1.8rem", fontWeight: "bold" }}>{title}</h1>
          <p style={{ marginBottom: "1.5rem", fontSize: "1rem" }}>{subtitle}</p>
          {illustrationSrc && (
            <img
              src={illustrationSrc}
              alt={illustrationAlt || "Illustration"}
              style={{ maxWidth: "250px", height: "auto" }}
            />
          )}
        </div>

        {/* Right side with login form */}
        <div
          style={{
            flex: 1,
            padding: "3rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {children}
        </div>
      </div>
    </main>
  );
}