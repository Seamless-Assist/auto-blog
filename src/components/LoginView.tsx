"use strict";
import React, { useState, FormEvent } from "react";
import { KeyRound, ShieldAlert, Sparkles, Terminal } from "lucide-react";

interface LoginViewProps {
  onLoginSuccess: () => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onLoginSuccess();
      } else {
        setError(data.error || "Authentication failed. Try again.");
      }
    } catch (err) {
      setError("Unable to connect to the authentication service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      background: "radial-gradient(circle at center, rgba(77, 37, 51, 0.4) 0%, #120d0f 70%)"
    }}>
      <div className="glass-panel animate-slide-in" style={{ maxWidth: "440px", width: "100%", padding: "40px" }}>
        
        {/* Branding */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ 
            width: "56px", 
            height: "56px", 
            borderRadius: "16px", 
            background: "linear-gradient(135deg, var(--primary-maroon), var(--accent-gold))", 
            display: "inline-flex", 
            alignItems: "center", 
            justifyContent: "center",
            fontWeight: "900",
            fontSize: "24px",
            color: "#fff",
            marginBottom: "16px",
            boxShadow: "0 0 24px rgba(77, 37, 51, 0.6)"
          }}>
            SA
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#fff", marginBottom: "4px" }}>Seamless Assist</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>SEO & Blog Automation Command Portal</p>
        </div>

        {/* Security Warning Fallback Indicator */}
        <div style={{ 
          background: "rgba(212, 175, 55, 0.05)", 
          border: "1px solid rgba(212, 175, 55, 0.2)", 
          borderRadius: "12px", 
          padding: "12px 16px", 
          display: "flex", 
          gap: "12px", 
          alignItems: "center",
          marginBottom: "24px"
        }}>
          <Sparkles size={18} style={{ color: "var(--accent-gold)", flexShrink: 0 }} />
          <span style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.4" }}>
            Connecting sandbox session credentials. Default pass is <b style={{ color: "var(--accent-gold)" }}>admin123</b>.
          </span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "8px", letterSpacing: "0.05em" }}>
              Username
            </label>
            <input
              type="text"
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "8px", letterSpacing: "0.05em" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                style={{ paddingLeft: "44px" }}
              />
              <KeyRound size={18} style={{ position: "absolute", left: "16px", top: "15px", color: "var(--text-muted)" }} />
            </div>
          </div>

          {error && (
            <div style={{ 
              background: "rgba(245, 108, 108, 0.1)", 
              border: "1px solid rgba(245, 108, 108, 0.3)", 
              borderRadius: "8px", 
              padding: "12px", 
              display: "flex", 
              gap: "8px", 
              alignItems: "center",
              color: "var(--error-red)",
              fontSize: "13px"
            }}>
              <ShieldAlert size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%", marginTop: "8px", height: "48px" }}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Unlock Command Console</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
