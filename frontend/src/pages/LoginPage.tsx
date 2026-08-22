import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate("/");
    } else {
      setError(res.error || "Invalid credentials.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0d0d0d",
        color: "#ffffff",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          backgroundColor: "#171717",
          padding: "36px 32px",
          borderRadius: "12px",
          border: "1px solid #262626",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontSize: "36px", marginBottom: "8px" }}>⚡</div>
          <h1 style={{ margin: "0 0 6px 0", fontSize: "24px", fontWeight: "700" }}>
            Welcome Back
          </h1>
          <p style={{ color: "#888", fontSize: "14px", margin: 0 }}>
            Sign in to access your projects and collaborate
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              border: "1px solid #ef4444",
              color: "#fca5a5",
              padding: "10px 14px",
              borderRadius: "6px",
              fontSize: "13px",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#aaa", marginBottom: "6px" }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                backgroundColor: "#262626",
                border: "1px solid #404040",
                borderRadius: "6px",
                color: "#ffffff",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#aaa", marginBottom: "6px" }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                backgroundColor: "#262626",
                border: "1px solid #404040",
                borderRadius: "6px",
                color: "#ffffff",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px",
              fontSize: "14px",
              fontWeight: "600",
              color: "#ffffff",
              backgroundColor: "#2563eb",
              border: "none",
              borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "8px",
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "24px", fontSize: "13px", color: "#888" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#3b82f6", textDecoration: "none", fontWeight: "600" }}>
            Sign Up
          </Link>
        </div>

        <div style={{ textAlign: "center", marginTop: "12px" }}>
          <Link to="/" style={{ color: "#666", fontSize: "12px", textDecoration: "none" }}>
            ← Continue as Guest
          </Link>
        </div>
      </div>
    </div>
  );
}
