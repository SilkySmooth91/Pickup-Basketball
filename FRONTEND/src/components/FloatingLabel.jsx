import React from "react";

// Minimal FloatingLabel component placeholder
export default function FloatingLabel({ label, children, ...props }) {
  return (
    <label style={{ display: "block", marginBottom: "1rem" }}>
      <span style={{ display: "block", fontWeight: "bold" }}>{label}</span>
      {children}
    </label>
  );
}
