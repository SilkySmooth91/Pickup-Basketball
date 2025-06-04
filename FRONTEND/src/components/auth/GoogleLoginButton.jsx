// Componente GoogleLoginButton.jsx
import React from "react";

export default function GoogleLoginButton({ className = "", children }) {
  const handleGoogleLogin = () => {
    // L'endpoint del backend che avvia l'OAuth flow
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <button
      type="button"
      className={className}
      onClick={handleGoogleLogin}
    >
      {children}
    </button>
  );
}
