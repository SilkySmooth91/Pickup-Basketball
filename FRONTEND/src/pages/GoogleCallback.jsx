import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function GoogleCallback() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    // Potresti voler fetchare i dati utente qui, oppure riceverli già dal backend
    if (accessToken && refreshToken) {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      // (Opzionale) fetch user info, oppure reindirizza subito
      // navigate("/profile");
      window.location.href = "/profile";
    } else {
      navigate("/?google=fail");
    }
  }, [login, navigate]);

  return <div>Login con Google in corso...</div>;
}
