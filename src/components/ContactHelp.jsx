import React from "react";

const ContactHelp = () => {
  return (
    <div style={{ maxWidth: 500, margin: "4rem auto", padding: "2rem", background: "#1F2937", borderRadius: 12, color: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1.5rem", background: "linear-gradient(90deg, #3B82F6, #A855F7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Contact Us / Help</h1>
      <p style={{ marginBottom: "1.5rem" }}>
        Need help or want to contact us? Fill out the form below or email us at <a href="mailto:support@recallrai.com" style={{ color: "#3B82F6" }}>support@recallrai.com</a>.
      </p>
      <form onSubmit={e => { e.preventDefault(); alert('Message sent!'); }}>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="email" style={{ display: "block", marginBottom: 4 }}>Your Email</label>
          <input id="email" type="email" required style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #374151", background: "#111827", color: "#fff" }} />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="message" style={{ display: "block", marginBottom: 4 }}>Message</label>
          <textarea id="message" required rows={5} style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #374151", background: "#111827", color: "#fff" }} />
        </div>
        <button type="submit" style={{ background: "#3B82F6", color: "#fff", border: "none", borderRadius: 6, padding: "0.7rem 1.5rem", fontWeight: 600, fontSize: "1rem", cursor: "pointer" }}>Send Message</button>
      </form>
    </div>
  );
};

export default ContactHelp; 